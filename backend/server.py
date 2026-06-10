from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Cookie, Header, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import httpx
import hmac
import hashlib
import requests
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Optional Razorpay client
try:
    import razorpay
    RZP_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
    RZP_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
    razorpay_client = razorpay.Client(auth=(RZP_KEY_ID, RZP_KEY_SECRET)) if RZP_KEY_ID and RZP_KEY_SECRET else None
except Exception:
    razorpay_client = None
    RZP_KEY_ID = ''
    RZP_KEY_SECRET = ''

EMERGENT_AUTH_URL = os.environ.get('EMERGENT_AUTH_URL', 'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data')
ADMIN_EMAILS = {e.strip().lower() for e in os.environ.get('ADMIN_EMAILS', '').split(',') if e.strip()}

import notifications as notif

# ====================== Customer email/password auth helpers ==================
import bcrypt as _bcrypt
import jwt as _jwt
import re as _re

CUSTOMER_JWT_ALGO = "HS256"
CUSTOMER_JWT_TTL = timedelta(days=30)
CUSTOMER_LOCKOUT_THRESHOLD = 5
CUSTOMER_LOCKOUT_WINDOW = timedelta(minutes=15)
EMAIL_RE = _re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")


def _hash_pw(p: str) -> str:
    return _bcrypt.hashpw(p.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")


def _check_pw(p: str, h: str) -> bool:
    try:
        return _bcrypt.checkpw(p.encode("utf-8"), h.encode("utf-8"))
    except Exception:
        return False


def _customer_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "customer_access",
        "exp": datetime.now(timezone.utc) + CUSTOMER_JWT_TTL,
        "iat": datetime.now(timezone.utc),
    }
    return _jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=CUSTOMER_JWT_ALGO)


def _set_customer_cookie(response: Response, token: str):
    response.set_cookie(
        key="customer_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=int(CUSTOMER_JWT_TTL.total_seconds()),
    )


async def _customer_from_jwt(request: Request) -> Optional[dict]:
    token = request.cookies.get("customer_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        return None
    try:
        payload = _jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[CUSTOMER_JWT_ALGO])
        if payload.get("type") != "customer_access":
            return None
        return await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    except (_jwt.ExpiredSignatureError, _jwt.InvalidTokenError):
        return None
    except Exception:
        return None


# ====================== Object Storage ======================
# Local filesystem storage — portable to any host (Render, Railway, etc).
# For ephemeral hosts, mount a persistent disk at STORAGE_DIR or switch to S3.
APP_NAME = os.environ.get("APP_NAME", "crescent-loom")
STORAGE_DIR = Path(os.environ.get("STORAGE_DIR", str(ROOT_DIR / "uploads")))
STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def init_storage() -> str:
    return str(STORAGE_DIR)


def storage_put(path: str, data: bytes, content_type: str) -> dict:
    full = STORAGE_DIR / path
    full.parent.mkdir(parents=True, exist_ok=True)
    full.write_bytes(data)
    return {"path": path, "size": len(data)}


def storage_get(path: str):
    full = STORAGE_DIR / path
    if not full.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    return full.read_bytes(), "application/octet-stream"

MIME_BY_EXT = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp",
}

# ====================== Models ======================
class Variant(BaseModel):
    id: str = Field(default_factory=lambda: f"v_{uuid.uuid4().hex[:8]}")
    name: str  # e.g. "Black", "Print 01"
    color_hex: Optional[str] = None
    images: List[str] = []
    in_stock: bool = True

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    category: str  # tops, bottoms, outerwear, accessories
    price: float
    description: str
    images: List[str] = []  # fallback / hero images when no variants
    sizes: List[str] = ["XS", "S", "M", "L", "XL"]
    colors: List[str] = []
    variants: List[Variant] = []
    material: Optional[str] = None
    in_stock: bool = True
    featured: bool = False
    new_arrival: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProductCreate(BaseModel):
    name: str
    slug: str
    category: str
    price: float
    description: str
    images: List[str] = []
    sizes: List[str] = ["XS", "S", "M", "L", "XL"]
    colors: List[str] = []
    variants: List[Variant] = []
    material: Optional[str] = None
    featured: bool = False
    new_arrival: bool = False

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_admin: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class WishlistItem(BaseModel):
    user_id: str
    product_id: str
    added_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    size: Optional[str] = None
    image: Optional[str] = None

class ShippingAddress(BaseModel):
    full_name: str
    phone: str
    address_line: str
    city: str
    state: str
    pincode: str
    country: str = "India"

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    email: str
    items: List[OrderItem]
    shipping: ShippingAddress
    subtotal: float
    loom_credits_redeemed: int = 0
    loom_credits_discount: float = 0.0
    total: float
    currency: str = "INR"
    status: str = "pending"  # pending, paid, shipped, delivered, cancelled
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CreatePaymentOrderReq(BaseModel):
    items: List[OrderItem]
    shipping: ShippingAddress
    loom_credits_redeemed: int = 0

class VerifyPaymentReq(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

# ====================== Loom Credits ======================
LOOM_CREDIT_VALUE_INR = 5
LOOM_CREDIT_MIN_REDEEM = 3

class LoomCreditTxn(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    order_id: Optional[str] = None
    change: int  # +1 earned, -N redeemed, +/- admin adjust
    reason: str  # "earned" | "redeemed" | "admin_adjust"
    note: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

async def loom_balance(user_id: str) -> int:
    pipe = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": None, "total": {"$sum": "$change"}}},
    ]
    cur = db.loom_credit_txns.aggregate(pipe)
    docs = await cur.to_list(1)
    return int(docs[0]["total"]) if docs else 0

async def loom_award_for_order(user_id: str, order_id: str):
    # Idempotent: only award if no earned txn exists for this order
    existing = await db.loom_credit_txns.find_one({"order_id": order_id, "reason": "earned"})
    if existing:
        return
    txn = LoomCreditTxn(user_id=user_id, order_id=order_id, change=1, reason="earned",
                        note="Loom Credit Card included with order").model_dump()
    await db.loom_credit_txns.insert_one(txn)

# ====================== Auth helpers ======================
async def get_current_user(request: Request) -> Optional[dict]:
    # 1) Customer JWT (email/password sign-in)
    user = await _customer_from_jwt(request)
    if user:
        return user
    # 2) Legacy Emergent Google OAuth session_token cookie
    token = request.cookies.get('session_token')
    if not token:
        auth = request.headers.get('Authorization', '')
        if auth.startswith('Bearer '):
            token = auth[7:]
    if not token:
        return None
    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        return None
    expires_at = sess.get('expires_at')
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    user = await db.users.find_one({"user_id": sess['user_id']}, {"_id": 0, "password_hash": 0})
    return user

async def require_user(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(request: Request) -> dict:
    """Admin guard — accepts the new email/password admin JWT OR a legacy Google-OAuth user with is_admin=True."""
    # Try new admin auth first
    from admin_auth import get_current_admin
    admin = await get_current_admin(request, db)
    if admin:
        return {"user_id": admin["id"], "email": admin["email"], "name": admin.get("name", "Admin"), "is_admin": True, "_admin": True}
    # Fallback to existing Google-OAuth admin
    user = await get_current_user(request)
    if user and user.get("is_admin"):
        return user
    raise HTTPException(status_code=403, detail="Admin access required")

# ====================== Auth routes ======================
@api_router.post("/auth/session")
async def auth_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get('session_id')
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    async with httpx.AsyncClient() as hc:
        r = await hc.get(EMERGENT_AUTH_URL, headers={"X-Session-ID": session_id}, timeout=15.0)
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    data = r.json()
    email = data['email'].lower()
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing['user_id']
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data['name'], "picture": data.get('picture')}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        is_admin = (email in ADMIN_EMAILS) or (await db.users.count_documents({}) == 0)
        user_doc = User(
            user_id=user_id,
            email=email,
            name=data['name'],
            picture=data.get('picture'),
            is_admin=is_admin,
        ).model_dump()
        await db.users.insert_one(user_doc)
    session_token = data['session_token']
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60,
    )
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user

@api_router.get("/auth/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get('session_token')
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    response.delete_cookie("customer_token", path="/")
    return {"ok": True}


# --- Email + password customer auth ------------------------------------------
class CustomerRegisterReq(BaseModel):
    email: str
    password: str
    name: Optional[str] = None


class CustomerLoginReq(BaseModel):
    email: str
    password: str


async def _customer_locked_out(identifier: str) -> bool:
    since = datetime.now(timezone.utc) - CUSTOMER_LOCKOUT_WINDOW
    count = await db.customer_login_attempts.count_documents({
        "identifier": identifier,
        "success": False,
        "ts": {"$gte": since},
    })
    return count >= CUSTOMER_LOCKOUT_THRESHOLD


async def _record_customer_attempt(identifier: str, success: bool):
    await db.customer_login_attempts.insert_one({
        "identifier": identifier,
        "success": success,
        "ts": datetime.now(timezone.utc),
    })


@api_router.post("/auth/register")
async def auth_register(body: CustomerRegisterReq, response: Response):
    email = (body.email or "").strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address")
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists. Try signing in.")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    name = (body.name or "").strip() or email.split("@")[0]
    is_admin = (email in ADMIN_EMAILS) or (await db.users.count_documents({}) == 0)
    doc = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": None,
        "is_admin": is_admin,
        "password_hash": _hash_pw(body.password),
        "auth_provider": "password",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = _customer_token(user_id, email)
    _set_customer_cookie(response, token)
    return {
        "user_id": user_id, "email": email, "name": name, "picture": None,
        "is_admin": is_admin, "token": token,
    }


@api_router.post("/auth/login")
async def auth_login_password(body: CustomerLoginReq, request: Request, response: Response):
    email = (body.email or "").strip().lower()
    ip = request.client.host if request.client else "?"
    identifier = f"{ip}:{email}"
    if await _customer_locked_out(identifier):
        raise HTTPException(status_code=429, detail="Too many failed attempts. Please try again in 15 minutes.")
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not _check_pw(body.password, user["password_hash"]):
        await _record_customer_attempt(identifier, False)
        # Distinct hint when account exists via Google only
        if user and not user.get("password_hash"):
            raise HTTPException(status_code=401, detail="This account was created with Google. Use 'Continue with Google'.")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await _record_customer_attempt(identifier, True)
    token = _customer_token(user["user_id"], email)
    _set_customer_cookie(response, token)
    return {
        "user_id": user["user_id"], "email": user["email"], "name": user.get("name", ""),
        "picture": user.get("picture"), "is_admin": bool(user.get("is_admin")), "token": token,
    }

# ====================== Admin Auth (email + password) ======================
import admin_auth as adm

@api_router.post("/admin-auth/login")
async def admin_login(body: adm.AdminLoginReq, request: Request, response: Response):
    return await adm.login(db, request, response, body)

@api_router.get("/admin-auth/me")
async def admin_me(request: Request):
    admin = await adm.get_current_admin(request, db)
    if not admin:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return admin

@api_router.post("/admin-auth/logout")
async def admin_logout(response: Response):
    adm.logout_cookie(response)
    return {"ok": True}

@api_router.post("/admin-auth/change-password")
async def admin_change_password(body: adm.ChangePasswordReq, admin=Depends(require_admin)):
    return await adm.change_password(db, admin, body)

# ====================== Products ======================
@api_router.get("/products")
async def list_products(category: Optional[str] = None, featured: Optional[bool] = None, new_arrival: Optional[bool] = None, q: Optional[str] = None):
    query = {}
    if category and category != "all":
        query['category'] = category
    if featured is not None:
        query['featured'] = featured
    if new_arrival is not None:
        query['new_arrival'] = new_arrival
    if q:
        query['name'] = {"$regex": q, "$options": "i"}
    items = await db.products.find(query, {"_id": 0}).to_list(500)
    return items

@api_router.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p

@api_router.post("/admin/products")
async def create_product(body: ProductCreate, admin=Depends(require_admin)):
    prod = Product(**body.model_dump()).model_dump()
    await db.products.insert_one(prod)
    prod.pop('_id', None)
    return prod

@api_router.put("/admin/products/{product_id}")
async def update_product(product_id: str, body: ProductCreate, admin=Depends(require_admin)):
    update = body.model_dump()
    result = await db.products.update_one({"id": product_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return await db.products.find_one({"id": product_id}, {"_id": 0})

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin=Depends(require_admin)):
    await db.products.delete_one({"id": product_id})
    return {"ok": True}

# ====================== Wishlist ======================
@api_router.get("/wishlist")
async def get_wishlist(user=Depends(require_user)):
    items = await db.wishlist.find({"user_id": user['user_id']}, {"_id": 0}).to_list(500)
    product_ids = [it['product_id'] for it in items]
    if not product_ids:
        return []
    products = await db.products.find({"id": {"$in": product_ids}}, {"_id": 0}).to_list(500)
    return products

@api_router.post("/wishlist/{product_id}")
async def add_wishlist(product_id: str, user=Depends(require_user)):
    existing = await db.wishlist.find_one({"user_id": user['user_id'], "product_id": product_id})
    if not existing:
        await db.wishlist.insert_one(WishlistItem(user_id=user['user_id'], product_id=product_id).model_dump())
    return {"ok": True}

@api_router.delete("/wishlist/{product_id}")
async def remove_wishlist(product_id: str, user=Depends(require_user)):
    await db.wishlist.delete_one({"user_id": user['user_id'], "product_id": product_id})
    return {"ok": True}

# ====================== Payments / Orders ======================
@api_router.get("/payments/config")
async def payments_config():
    return {"key_id": RZP_KEY_ID, "enabled": bool(razorpay_client)}

@api_router.post("/payments/create-order")
async def create_payment_order(body: CreatePaymentOrderReq, request: Request):
    user = await get_current_user(request)
    subtotal = sum(it.price * it.quantity for it in body.items)

    # Loom Credits redemption (logged-in users only)
    cards = max(0, int(body.loom_credits_redeemed or 0))
    discount = 0.0
    if cards > 0:
        if not user:
            raise HTTPException(status_code=400, detail="Sign in to redeem Loom Credits")
        if cards < LOOM_CREDIT_MIN_REDEEM:
            raise HTTPException(status_code=400, detail=f"Minimum {LOOM_CREDIT_MIN_REDEEM} Loom Credit Cards required to redeem")
        bal = await loom_balance(user['user_id'])
        if cards > bal:
            raise HTTPException(status_code=400, detail=f"You only have {bal} Loom Credit Cards")
        discount = float(cards * LOOM_CREDIT_VALUE_INR)

    total = max(0.0, subtotal - discount)
    amount_paise = int(round(total * 100))
    if amount_paise < 100:
        raise HTTPException(status_code=400, detail="Order total must be at least ₹1 after discount")

    order = Order(
        user_id=user['user_id'] if user else None,
        email=user['email'] if user else "guest@crescentloom.com",
        items=body.items,
        shipping=body.shipping,
        subtotal=subtotal,
        loom_credits_redeemed=cards,
        loom_credits_discount=discount,
        total=total,
    )
    rzp_order = None
    if razorpay_client:
        try:
            rzp_order = razorpay_client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "payment_capture": 1,
                "receipt": order.id[:40],
            })
            order.razorpay_order_id = rzp_order['id']
        except Exception as e:
            logger.error(f"Razorpay order create failed: {e}")
            raise HTTPException(status_code=500, detail=f"Payment gateway error: {str(e)}")
    doc = order.model_dump()
    await db.orders.insert_one(doc)

    # Record redemption transaction immediately so balance reflects pending redemption
    if cards > 0 and user:
        await db.loom_credit_txns.insert_one(LoomCreditTxn(
            user_id=user['user_id'],
            order_id=order.id,
            change=-cards,
            reason="redeemed",
            note=f"Redeemed {cards} cards · ₹{int(discount)} off order {order.id[:8]}"
        ).model_dump())
        notif.fire_and_forget(notif.notify_loom_redeem(doc))

    notif.fire_and_forget(notif.notify_new_order(doc))

    return {
        "order": {k: v for k, v in doc.items() if k != '_id'},
        "razorpay_order": rzp_order,
        "razorpay_key_id": RZP_KEY_ID,
        "demo_mode": razorpay_client is None,
    }

@api_router.post("/payments/verify")
async def verify_payment(body: VerifyPaymentReq):
    if not RZP_KEY_SECRET:
        raise HTTPException(status_code=400, detail="Razorpay not configured")
    msg = f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode()
    expected = hmac.new(RZP_KEY_SECRET.encode(), msg, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, body.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
    await db.orders.update_one(
        {"razorpay_order_id": body.razorpay_order_id},
        {"$set": {"status": "paid", "razorpay_payment_id": body.razorpay_payment_id}}
    )
    order = await db.orders.find_one({"razorpay_order_id": body.razorpay_order_id}, {"_id": 0})
    if order and order.get("user_id"):
        await loom_award_for_order(order["user_id"], order["id"])
    if order:
        notif.fire_and_forget(notif.notify_payment(order, True))
    return {"ok": True, "order": order}

@api_router.post("/payments/demo-complete/{order_id}")
async def demo_complete(order_id: str):
    """Marks an order as paid in demo mode (when Razorpay isn't configured)."""
    if razorpay_client is not None:
        raise HTTPException(status_code=400, detail="Demo mode disabled")
    await db.orders.update_one({"id": order_id}, {"$set": {"status": "paid"}})
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if order and order.get("user_id"):
        await loom_award_for_order(order["user_id"], order["id"])
    if order:
        notif.fire_and_forget(notif.notify_payment(order, True))
    return {"ok": True, "order": order}

@api_router.get("/orders")
async def list_my_orders(user=Depends(require_user)):
    items = await db.orders.find({"user_id": user['user_id']}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items

@api_router.get("/admin/orders")
async def list_all_orders(admin=Depends(require_admin)):
    items = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

# ====================== Loom Credits API ======================
@api_router.get("/loom-credits/me")
async def my_loom_credits(user=Depends(require_user)):
    bal = await loom_balance(user['user_id'])
    txns = await db.loom_credit_txns.find({"user_id": user['user_id']}, {"_id": 0}).sort("created_at", -1).to_list(500)
    needed = max(0, LOOM_CREDIT_MIN_REDEEM - bal)
    return {
        "balance": bal,
        "value_inr": bal * LOOM_CREDIT_VALUE_INR,
        "per_card_inr": LOOM_CREDIT_VALUE_INR,
        "min_redeem": LOOM_CREDIT_MIN_REDEEM,
        "can_redeem": bal >= LOOM_CREDIT_MIN_REDEEM,
        "cards_needed_to_redeem": needed,
        "history": txns,
    }

@api_router.get("/admin/loom-credits")
async def admin_loom_credits(admin=Depends(require_admin)):
    # Aggregate per user
    pipe = [
        {"$group": {
            "_id": "$user_id",
            "balance": {"$sum": "$change"},
            "earned": {"$sum": {"$cond": [{"$eq": ["$reason", "earned"]}, "$change", 0]}},
            "redeemed": {"$sum": {"$cond": [{"$eq": ["$reason", "redeemed"]}, "$change", 0]}},
            "adjusted": {"$sum": {"$cond": [{"$eq": ["$reason", "admin_adjust"]}, "$change", 0]}},
        }},
    ]
    rows = await db.loom_credit_txns.aggregate(pipe).to_list(2000)
    out = []
    for r in rows:
        uid = r["_id"]
        if not uid:
            continue
        u = await db.users.find_one({"user_id": uid}, {"_id": 0, "user_id": 1, "name": 1, "email": 1})
        if not u:
            continue
        out.append({
            "user_id": uid,
            "name": u.get("name", ""),
            "email": u.get("email", ""),
            "balance": int(r["balance"]),
            "total_earned": int(r["earned"]),
            "total_redeemed": int(-r["redeemed"]),  # convert from negative
            "total_adjusted": int(r["adjusted"]),
        })
    out.sort(key=lambda x: x["balance"], reverse=True)
    return out

@api_router.get("/admin/loom-credits/summary")
async def admin_loom_summary(admin=Depends(require_admin)):
    pipe = [
        {"$group": {
            "_id": None,
            "issued": {"$sum": {"$cond": [{"$eq": ["$reason", "earned"]}, "$change", 0]}},
            "redeemed": {"$sum": {"$cond": [{"$eq": ["$reason", "redeemed"]}, "$change", 0]}},
            "adjusted": {"$sum": {"$cond": [{"$eq": ["$reason", "admin_adjust"]}, "$change", 0]}},
        }},
    ]
    docs = await db.loom_credit_txns.aggregate(pipe).to_list(1)
    if not docs:
        return {"issued": 0, "redeemed": 0, "outstanding": 0, "discount_given_inr": 0, "adjusted": 0}
    d = docs[0]
    issued = int(d["issued"])
    redeemed = int(-d["redeemed"])  # convert negative to positive count
    adjusted = int(d["adjusted"])
    outstanding = issued + adjusted - redeemed
    return {
        "issued": issued,
        "redeemed": redeemed,
        "adjusted": adjusted,
        "outstanding": outstanding,
        "discount_given_inr": redeemed * LOOM_CREDIT_VALUE_INR,
    }

class AdminAdjustReq(BaseModel):
    user_id: str
    change: int  # may be positive or negative
    note: Optional[str] = None

@api_router.post("/admin/loom-credits/adjust")
async def admin_loom_adjust(body: AdminAdjustReq, admin=Depends(require_admin)):
    if body.change == 0:
        raise HTTPException(status_code=400, detail="Change must be non-zero")
    user = await db.users.find_one({"user_id": body.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Don't allow balance to go negative via admin adjust
    if body.change < 0:
        bal = await loom_balance(body.user_id)
        if bal + body.change < 0:
            raise HTTPException(status_code=400, detail=f"Cannot deduct {-body.change} — user only has {bal}")
    await db.loom_credit_txns.insert_one(LoomCreditTxn(
        user_id=body.user_id,
        change=body.change,
        reason="admin_adjust",
        note=body.note or f"Admin adjustment by {admin['email']}",
    ).model_dump())
    new_bal = await loom_balance(body.user_id)
    return {"ok": True, "balance": new_bal}

@api_router.get("/admin/loom-credits/orders")
async def admin_redeemed_orders(admin=Depends(require_admin)):
    """Orders where Loom Credits were redeemed."""
    items = await db.orders.find(
        {"loom_credits_redeemed": {"$gt": 0}}, {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    return items

# ====================== Admin: Order Status Workflow ======================
ORDER_STATUSES = ["pending", "placed", "paid", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"]

class StatusUpdateReq(BaseModel):
    status: str

@api_router.patch("/admin/orders/{order_id}/status")
async def admin_update_order_status(order_id: str, body: StatusUpdateReq, admin=Depends(require_admin)):
    if body.status not in ORDER_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {ORDER_STATUSES}")
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    await db.orders.update_one({"id": order_id}, {"$set": {"status": body.status, "updated_at": datetime.now(timezone.utc).isoformat()}})
    updated = await db.orders.find_one({"id": order_id}, {"_id": 0})
    notif.fire_and_forget(notif.notify_status_update(updated, body.status))
    return {"ok": True, "order": updated}

@api_router.post("/payments/notify-failure")
async def notify_payment_failure(request: Request):
    """Called by frontend when Razorpay returns an error so admin gets alerted."""
    body = await request.json()
    order_id = body.get("order_id")
    if order_id:
        order = await db.orders.find_one({"id": order_id}, {"_id": 0})
        if order:
            notif.fire_and_forget(notif.notify_payment(order, False))
    return {"ok": True}

# ====================== Admin: Dashboard Stats ======================
def _day_start(dt: datetime) -> datetime:
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)

@api_router.get("/admin/dashboard/stats")
async def admin_dashboard_stats(admin=Depends(require_admin)):
    now = datetime.now(timezone.utc)
    today = _day_start(now)
    week_start = today - timedelta(days=now.weekday())
    month_start = today.replace(day=1)

    async def count_and_sum(since_iso: str):
        pipe = [
            {"$match": {"created_at": {"$gte": since_iso}, "status": {"$ne": "cancelled"}}},
            {"$group": {"_id": None, "count": {"$sum": 1}, "revenue": {"$sum": "$total"}}},
        ]
        docs = await db.orders.aggregate(pipe).to_list(1)
        if docs:
            return int(docs[0]["count"]), float(docs[0]["revenue"])
        return 0, 0.0

    today_count, today_rev = await count_and_sum(today.isoformat())
    week_count, week_rev = await count_and_sum(week_start.isoformat())
    month_count, month_rev = await count_and_sum(month_start.isoformat())

    pending_count = await db.orders.count_documents({"status": {"$in": ["pending", "placed", "paid", "packed", "shipped", "out_for_delivery"]}})
    customers_count = await db.users.count_documents({})

    # Most-selling product (across all paid+ orders)
    pipe = [
        {"$match": {"status": {"$in": ["paid", "packed", "shipped", "out_for_delivery", "delivered"]}}},
        {"$unwind": "$items"},
        {"$group": {"_id": "$items.name", "qty": {"$sum": "$items.quantity"}}},
        {"$sort": {"qty": -1}},
        {"$limit": 1},
    ]
    docs = await db.orders.aggregate(pipe).to_list(1)
    top_product = {"name": docs[0]["_id"], "qty": int(docs[0]["qty"])} if docs else None

    # Loom credit totals
    pipe2 = [
        {"$group": {
            "_id": None,
            "issued": {"$sum": {"$cond": [{"$eq": ["$reason", "earned"]}, "$change", 0]}},
            "redeemed": {"$sum": {"$cond": [{"$eq": ["$reason", "redeemed"]}, "$change", 0]}},
        }},
    ]
    lc = await db.loom_credit_txns.aggregate(pipe2).to_list(1)
    loom = {"issued": int(lc[0]["issued"]) if lc else 0, "redeemed": int(-lc[0]["redeemed"]) if lc else 0}

    return {
        "today": {"orders": today_count, "revenue": today_rev},
        "week": {"orders": week_count, "revenue": week_rev},
        "month": {"orders": month_count, "revenue": month_rev},
        "pending_orders": pending_count,
        "total_customers": customers_count,
        "top_product": top_product,
        "loom_credits": loom,
    }

@api_router.get("/admin/dashboard/revenue")
async def admin_revenue_series(window: str = "week", admin=Depends(require_admin)):
    """Returns a time series of revenue. window = day(24h hourly) | week(7d daily) | month(30d daily)."""
    now = datetime.now(timezone.utc)
    if window == "day":
        bucket_size = timedelta(hours=1)
        num_buckets = 24
        fmt = "%H:00"
    elif window == "month":
        bucket_size = timedelta(days=1)
        num_buckets = 30
        fmt = "%b %d"
    else:  # week
        bucket_size = timedelta(days=1)
        num_buckets = 7
        fmt = "%a"
    start = now - bucket_size * num_buckets
    cursor = db.orders.find(
        {"created_at": {"$gte": start.isoformat()}, "status": {"$ne": "cancelled"}},
        {"_id": 0, "created_at": 1, "total": 1},
    )
    orders = await cursor.to_list(5000)
    buckets = []
    for i in range(num_buckets):
        b_start = now - bucket_size * (num_buckets - i)
        buckets.append({"label": b_start.strftime(fmt), "ts": b_start.isoformat(), "revenue": 0.0, "orders": 0})
    for o in orders:
        try:
            t = datetime.fromisoformat(o["created_at"])
            if t.tzinfo is None:
                t = t.replace(tzinfo=timezone.utc)
        except Exception:
            continue
        delta = now - t
        bucket_index = num_buckets - int(delta.total_seconds() / bucket_size.total_seconds()) - 1
        if 0 <= bucket_index < num_buckets:
            buckets[bucket_index]["revenue"] += float(o.get("total", 0))
            buckets[bucket_index]["orders"] += 1
    return buckets

# ====================== Admin: Customers ======================
@api_router.get("/admin/customers")
async def admin_customers(admin=Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "user_id": 1, "name": 1, "email": 1, "picture": 1, "created_at": 1}).to_list(2000)
    out = []
    for u in users:
        uid = u["user_id"]
        pipe = [
            {"$match": {"user_id": uid, "status": {"$ne": "cancelled"}}},
            {"$group": {"_id": None, "orders": {"$sum": 1}, "spent": {"$sum": "$total"}}},
        ]
        agg = await db.orders.aggregate(pipe).to_list(1)
        orders_count = int(agg[0]["orders"]) if agg else 0
        spent = float(agg[0]["spent"]) if agg else 0.0
        bal = await loom_balance(uid)
        phone = ""
        last_o = await db.orders.find_one({"user_id": uid}, {"_id": 0, "shipping": 1}, sort=[("created_at", -1)])
        if last_o and last_o.get("shipping"):
            phone = last_o["shipping"].get("phone", "")
        out.append({**u, "orders_count": orders_count, "total_spent": spent, "loom_balance": bal, "phone": phone})
    out.sort(key=lambda x: x["total_spent"], reverse=True)
    return out

@api_router.get("/admin/customers/{user_id}")
async def admin_customer_detail(user_id: str, admin=Depends(require_admin)):
    u = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not u:
        raise HTTPException(status_code=404, detail="Customer not found")
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    txns = await db.loom_credit_txns.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    bal = await loom_balance(user_id)
    spent = sum(o.get("total", 0) for o in orders if o.get("status") != "cancelled")
    return {"user": u, "orders": orders, "loom_balance": bal, "loom_history": txns, "total_spent": spent, "orders_count": len([o for o in orders if o.get("status") != "cancelled"])}

# ====================== Admin: Orders (filter/search/export) ======================
@api_router.get("/admin/orders/search")
async def admin_orders_search(
    admin=Depends(require_admin),
    window: str = "all",  # today | week | month | all
    q: Optional[str] = None,
    status: Optional[str] = None,
):
    query: dict = {}
    now = datetime.now(timezone.utc)
    if window == "today":
        query["created_at"] = {"$gte": _day_start(now).isoformat()}
    elif window == "week":
        query["created_at"] = {"$gte": (_day_start(now) - timedelta(days=now.weekday())).isoformat()}
    elif window == "month":
        query["created_at"] = {"$gte": _day_start(now).replace(day=1).isoformat()}
    if status and status != "all":
        query["status"] = status
    if q:
        # Search by order id prefix OR customer name (case-insensitive)
        query["$or"] = [
            {"id": {"$regex": f"^{q}", "$options": "i"}},
            {"shipping.full_name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
        ]
    items = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return items

@api_router.get("/admin/orders.csv")
async def admin_orders_csv(admin=Depends(require_admin)):
    import csv, io
    items = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["Order ID", "Created", "Status", "Customer", "Email", "Phone", "Address", "City", "State", "Pincode",
                "Items", "Sizes", "Quantity", "Subtotal", "Loom Discount", "Total", "Razorpay Order", "Razorpay Payment"])
    for o in items:
        s = o.get("shipping", {}) or {}
        items_str = "; ".join(f"{i.get('name','')} (x{i.get('quantity',1)})" for i in o.get("items", []))
        sizes_str = ", ".join(filter(None, [i.get("size") for i in o.get("items", [])]))
        qty = sum(i.get("quantity", 0) for i in o.get("items", []))
        w.writerow([
            o.get("id",""), o.get("created_at",""), o.get("status",""),
            s.get("full_name",""), o.get("email",""), s.get("phone",""),
            s.get("address_line",""), s.get("city",""), s.get("state",""), s.get("pincode",""),
            items_str, sizes_str, qty,
            o.get("subtotal", 0), o.get("loom_credits_discount", 0), o.get("total", 0),
            o.get("razorpay_order_id",""), o.get("razorpay_payment_id",""),
        ])
    csv_data = buf.getvalue()
    return Response(content=csv_data, media_type="text/csv",
                    headers={"Content-Disposition": f"attachment; filename=crescent-loom-orders-{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"})

# ====================== File Upload ======================
class FileRef(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    storage_path: str
    original_filename: Optional[str] = None
    content_type: str
    size: int = 0
    uploaded_by: Optional[str] = None
    is_deleted: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

@api_router.post("/admin/upload")
async def upload_file(file: UploadFile = File(...), admin=Depends(require_admin)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename")
    ext = (file.filename.rsplit(".", 1)[-1] or "bin").lower()
    if ext not in MIME_BY_EXT:
        raise HTTPException(status_code=400, detail="Only jpg/jpeg/png/gif/webp are supported")
    content_type = file.content_type or MIME_BY_EXT[ext]
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:  # 10MB cap
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    file_id = str(uuid.uuid4())
    path = f"{APP_NAME}/products/{file_id}.{ext}"
    result = storage_put(path, data, content_type)
    ref = FileRef(
        id=file_id,
        storage_path=result["path"],
        original_filename=file.filename,
        content_type=content_type,
        size=result.get("size", len(data)),
        uploaded_by=admin["user_id"],
    ).model_dump()
    await db.files.insert_one(ref)
    backend_base = os.environ.get("PUBLIC_BACKEND_URL", "")
    public_url = f"/api/files/{file_id}"
    return {"id": file_id, "url": public_url, "content_type": content_type, "size": ref["size"]}

@api_router.get("/files/{file_id}")
async def serve_file(file_id: str):
    ref = await db.files.find_one({"id": file_id, "is_deleted": False}, {"_id": 0})
    if not ref:
        raise HTTPException(status_code=404, detail="File not found")
    data, ct = storage_get(ref["storage_path"])
    return Response(content=data, media_type=ref.get("content_type", ct), headers={"Cache-Control": "public, max-age=31536000, immutable"})

# ====================== Seed ======================
SEED_PRODUCTS = [
    {
        "name": "Textured Polo Tee",
        "slug": "textured-polo-tee",
        "category": "polo",
        "price": 399,
        "description": "A structured polo tee in a soft textured weave. Six tonal variants, cut for a quiet, modern silhouette.",
        "sizes": ["M", "L", "XL"],
        "material": "Cotton-Polyester blend, structured weave",
        "featured": True,
        "new_arrival": True,
        "images": [],
        "variants": [
            {"id": f"v_{uuid.uuid4().hex[:8]}", "name": f"Variant 0{i+1}", "color_hex": None, "images": []}
            for i in range(6)
        ],
    },
    {
        "name": "Prism Wear Tee",
        "slug": "prism-wear-tee",
        "category": "designer",
        "price": 349,
        "description": "Ten designer prints across a single relaxed tee silhouette. Each print is a numbered, limited edition.",
        "sizes": ["L", "XL"],
        "material": "100% Cotton, soft-handle jersey",
        "featured": True,
        "new_arrival": True,
        "images": [],
        "variants": [
            {"id": f"v_{uuid.uuid4().hex[:8]}", "name": f"Print {i+1:02d}", "color_hex": None, "images": []}
            for i in range(10)
        ],
    },
    {
        "name": "Essential Tee",
        "slug": "essential-tee",
        "category": "basics",
        "price": 299,
        "description": "Our quiet everyday tee. Heavyweight cotton, clean shoulders, washed for softness.",
        "sizes": ["M", "XL"],
        "material": "100% Heavyweight Cotton",
        "featured": True,
        "new_arrival": True,
        "images": [],
        "variants": [
            {"id": f"v_{uuid.uuid4().hex[:8]}", "name": "Black", "color_hex": "#0B0E1A", "images": []},
            {"id": f"v_{uuid.uuid4().hex[:8]}", "name": "White", "color_hex": "#F5F0E8", "images": []},
        ],
    },
]

@app.on_event("startup")
async def startup_tasks():
    init_storage()
    await adm.ensure_indexes(db)
    await adm.seed_admin(db)
    count = await db.products.count_documents({})
    if count == 0:
        docs = [Product(**p).model_dump() for p in SEED_PRODUCTS]
        await db.products.insert_many(docs)
        logger.info(f"Seeded {len(docs)} products")
        # Add these to server.py after the existing models section

class ReviewCreate(BaseModel):
    product_slug: str
    rating: int  # 1-5
    title: Optional[str] = None
    body: str
    reviewer_name: str

class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_slug: str
    rating: int
    title: Optional[str] = None
    body: str
    reviewer_name: str
    user_id: Optional[str] = None
    verified: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Add these routes to server.py

@api_router.get("/reviews/{product_slug}")
async def get_reviews(product_slug: str):
    reviews = await db.reviews.find(
        {"product_slug": product_slug},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    total = len(reviews)
    avg = round(sum(r["rating"] for r in reviews) / total, 1) if total else 0
    return {"reviews": reviews, "total": total, "average": avg}

@api_router.post("/reviews")
async def create_review(body: ReviewCreate, request: Request):
    if not (1 <= body.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    if len(body.body.strip()) < 10:
        raise HTTPException(status_code=400, detail="Review must be at least 10 characters")
    user = await get_current_user(request)
    verified = False
    if user:
        order = await db.orders.find_one({
            "user_id": user["user_id"],
            "status": {"$in": ["paid", "shipped", "delivered"]},
            "items.name": {"$regex": body.product_slug.replace("-", " "), "$options": "i"}
        })
        verified = order is not None
    review = Review(
        product_slug=body.product_slug,
        rating=body.rating,
        title=body.title,
        body=body.body,
        reviewer_name=body.reviewer_name,
        user_id=user["user_id"] if user else None,
        verified=verified,
    ).model_dump()
    await db.reviews.insert_one(review)
    return {k: v for k, v in review.items() if k != "_id"}

@api_router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str, admin=Depends(require_admin)):
    await db.reviews.delete_one({"id": review_id})
    return {"ok": True}


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
