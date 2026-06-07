"""Email + password admin authentication for Crescent Loom dashboard.
Separate from the existing Emergent Google OAuth user system.
"""
import os
import bcrypt
import jwt
import uuid
import logging
from datetime import datetime, timezone, timedelta
from fastapi import Request, HTTPException, Response
from pydantic import BaseModel
from typing import Optional

logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_TTL = timedelta(days=7)
LOCKOUT_THRESHOLD = 5
LOCKOUT_WINDOW = timedelta(minutes=15)


def jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def make_token(admin_id: str, email: str) -> str:
    payload = {
        "sub": admin_id,
        "email": email,
        "type": "admin_access",
        "exp": datetime.now(timezone.utc) + ACCESS_TOKEN_TTL,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, jwt_secret(), algorithms=[JWT_ALGORITHM])


async def seed_admin(db):
    email = (os.environ.get("ADMIN_EMAIL") or "").lower().strip()
    password = os.environ.get("ADMIN_PASSWORD") or ""
    if not (email and password):
        logger.warning("ADMIN_EMAIL or ADMIN_PASSWORD not set — admin login will not work")
        return
    existing = await db.admin_users.find_one({"email": email})
    if not existing:
        await db.admin_users.insert_one({
            "id": f"admin_{uuid.uuid4().hex[:12]}",
            "email": email,
            "name": "Atelier Admin",
            "password_hash": hash_password(password),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user: %s", email)
    elif not verify_password(password, existing["password_hash"]):
        # Env password changed → update hash (so user can recover by editing .env)
        await db.admin_users.update_one(
            {"email": email},
            {"$set": {"password_hash": hash_password(password)}}
        )
        logger.info("Admin password updated from env: %s", email)


async def ensure_indexes(db):
    await db.admin_users.create_index("email", unique=True)
    await db.admin_login_attempts.create_index([("identifier", 1), ("ts", -1)])


async def get_current_admin(request: Request, db) -> Optional[dict]:
    token = request.cookies.get("admin_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        return None
    try:
        payload = decode_token(token)
        if payload.get("type") != "admin_access":
            return None
        admin = await db.admin_users.find_one({"id": payload["sub"], "is_active": True}, {"_id": 0, "password_hash": 0})
        return admin
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception:
        return None


async def admin_required(request: Request, db) -> dict:
    admin = await get_current_admin(request, db)
    if not admin:
        raise HTTPException(status_code=401, detail="Admin authentication required")
    return admin


class AdminLoginReq(BaseModel):
    email: str
    password: str


class ChangePasswordReq(BaseModel):
    current_password: str
    new_password: str


async def _record_attempt(db, identifier: str, success: bool):
    await db.admin_login_attempts.insert_one({
        "identifier": identifier,
        "success": success,
        "ts": datetime.now(timezone.utc),
    })


async def _is_locked_out(db, identifier: str) -> bool:
    since = datetime.now(timezone.utc) - LOCKOUT_WINDOW
    count = await db.admin_login_attempts.count_documents({
        "identifier": identifier,
        "success": False,
        "ts": {"$gte": since},
    })
    return count >= LOCKOUT_THRESHOLD


async def login(db, request: Request, response: Response, body: AdminLoginReq) -> dict:
    ip = request.client.host if request.client else "?"
    identifier = f"{ip}:{body.email.lower()}"
    if await _is_locked_out(db, identifier):
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
    admin = await db.admin_users.find_one({"email": body.email.lower().strip(), "is_active": True})
    if not admin or not verify_password(body.password, admin["password_hash"]):
        await _record_attempt(db, identifier, False)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await _record_attempt(db, identifier, True)
    token = make_token(admin["id"], admin["email"])
    response.set_cookie(
        key="admin_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=int(ACCESS_TOKEN_TTL.total_seconds()),
    )
    return {
        "id": admin["id"],
        "email": admin["email"],
        "name": admin.get("name", "Admin"),
        "token": token,
    }


async def change_password(db, admin: dict, body: ChangePasswordReq) -> dict:
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    full = await db.admin_users.find_one({"id": admin["id"]})
    if not full or not verify_password(body.current_password, full["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    await db.admin_users.update_one({"id": admin["id"]}, {"$set": {"password_hash": hash_password(body.new_password)}})
    return {"ok": True}


def logout_cookie(response: Response):
    response.delete_cookie("admin_token", path="/")
