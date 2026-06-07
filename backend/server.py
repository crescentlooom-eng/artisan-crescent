from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Cookie, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import httpx
import hmac
import hashlib
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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

# ====================== Models ======================
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    category: str  # tops, bottoms, outerwear, accessories
    price: float
    description: str
    images: List[str] = []
    sizes: List[str] = ["XS", "S", "M", "L", "XL"]
    colors: List[str] = []
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
    total: float
    currency: str = "INR"
    status: str = "pending"  # pending, paid, shipped, delivered, cancelled
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CreatePaymentOrderReq(BaseModel):
    items: List[OrderItem]
    shipping: ShippingAddress

class VerifyPaymentReq(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

# ====================== Auth helpers ======================
async def get_current_user(request: Request) -> Optional[dict]:
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
    user = await db.users.find_one({"user_id": sess['user_id']}, {"_id": 0})
    return user

async def require_user(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(request: Request) -> dict:
    user = await require_user(request)
    if not user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

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
    return {"ok": True}

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
    total = subtotal  # no taxes/shipping for now
    amount_paise = int(round(total * 100))
    order = Order(
        user_id=user['user_id'] if user else None,
        email=user['email'] if user else "guest@crescentloom.com",
        items=body.items,
        shipping=body.shipping,
        subtotal=subtotal,
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
    return {"ok": True, "order": order}

@api_router.post("/payments/demo-complete/{order_id}")
async def demo_complete(order_id: str):
    """Marks an order as paid in demo mode (when Razorpay isn't configured)."""
    if razorpay_client is not None:
        raise HTTPException(status_code=400, detail="Demo mode disabled")
    await db.orders.update_one({"id": order_id}, {"$set": {"status": "paid"}})
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return {"ok": True, "order": order}

@api_router.get("/orders")
async def list_my_orders(user=Depends(require_user)):
    items = await db.orders.find({"user_id": user['user_id']}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items

@api_router.get("/admin/orders")
async def list_all_orders(admin=Depends(require_admin)):
    items = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

# ====================== Seed ======================
SEED_PRODUCTS = [
    {
        "name": "Crescent Coat", "slug": "crescent-coat", "category": "outerwear",
        "price": 18500, "description": "A long-line wool blend coat cut to fall like water. Hand-finished seams. Made in limited numbers.",
        "images": [
            "https://images.pexels.com/photos/20425010/pexels-photo-20425010.jpeg",
            "https://images.unsplash.com/photo-1762605135012-56a59a059e60?crop=entropy&cs=srgb&fm=jpg",
        ],
        "sizes": ["XS", "S", "M", "L"], "colors": ["Ivory", "Midnight"], "material": "80% Wool, 20% Cashmere",
        "featured": True, "new_arrival": True,
    },
    {
        "name": "Loom Linen Trousers", "slug": "loom-linen-trousers", "category": "bottoms",
        "price": 7200, "description": "High-rise linen trousers in a relaxed silhouette. Naturally wrinkled, intentionally worn.",
        "images": [
            "https://images.unsplash.com/photo-1762605135012-56a59a059e60?crop=entropy&cs=srgb&fm=jpg",
            "https://images.pexels.com/photos/29879990/pexels-photo-29879990.jpeg",
        ],
        "sizes": ["XS", "S", "M", "L", "XL"], "colors": ["Sand", "Slate"], "material": "100% European Linen",
        "featured": True, "new_arrival": True,
    },
    {
        "name": "Waxing Shirt", "slug": "waxing-shirt", "category": "tops",
        "price": 6400, "description": "An oversized button-down in waxed cotton poplin. Falls with weight, ages with intention.",
        "images": [
            "https://images.pexels.com/photos/29879990/pexels-photo-29879990.jpeg",
            "https://images.unsplash.com/photo-1607300110506-273ab1cf41f8?crop=entropy&cs=srgb&fm=jpg",
        ],
        "sizes": ["S", "M", "L", "XL"], "colors": ["Bone", "Slate"], "material": "Waxed Cotton Poplin",
        "featured": False, "new_arrival": True,
    },
    {
        "name": "Eclipse Wrap", "slug": "eclipse-wrap", "category": "accessories",
        "price": 9800, "description": "A floor-grazing silk wrap in deep cocoa. Worn over the shoulders or twisted at the waist.",
        "images": [
            "https://images.pexels.com/photos/35392914/pexels-photo-35392914.jpeg",
            "https://images.unsplash.com/photo-1607300110506-273ab1cf41f8?crop=entropy&cs=srgb&fm=jpg",
        ],
        "sizes": ["One Size"], "colors": ["Cocoa", "Midnight"], "material": "100% Mulberry Silk",
        "featured": True, "new_arrival": False,
    },
    {
        "name": "Moonlight Knit", "slug": "moonlight-knit", "category": "tops",
        "price": 8900, "description": "A weighty merino knit, ribbed and slow. The kind of sweater you reach for at dusk.",
        "images": [
            "https://images.unsplash.com/photo-1609062757924-6c2d01b3b422?crop=entropy&cs=srgb&fm=jpg",
            "https://images.pexels.com/photos/20425010/pexels-photo-20425010.jpeg",
        ],
        "sizes": ["XS", "S", "M", "L"], "colors": ["Ivory", "Ash"], "material": "100% Merino Wool",
        "featured": False, "new_arrival": False,
    },
    {
        "name": "Silken Tide Skirt", "slug": "silken-tide-skirt", "category": "bottoms",
        "price": 11200, "description": "A bias-cut silk skirt that catches the light like still water.",
        "images": [
            "https://images.pexels.com/photos/35392914/pexels-photo-35392914.jpeg",
            "https://images.pexels.com/photos/20425010/pexels-photo-20425010.jpeg",
        ],
        "sizes": ["XS", "S", "M", "L"], "colors": ["Pearl", "Midnight"], "material": "100% Silk Charmeuse",
        "featured": True, "new_arrival": True,
    },
    {
        "name": "Veil Cashmere Scarf", "slug": "veil-cashmere-scarf", "category": "accessories",
        "price": 5400, "description": "A weightless cashmere scarf, woven in narrow Italian looms.",
        "images": [
            "https://images.unsplash.com/photo-1607300110506-273ab1cf41f8?crop=entropy&cs=srgb&fm=jpg",
        ],
        "sizes": ["One Size"], "colors": ["Ivory", "Slate"], "material": "100% Cashmere",
        "featured": False, "new_arrival": True,
    },
    {
        "name": "Penumbra Trench", "slug": "penumbra-trench", "category": "outerwear",
        "price": 22500, "description": "A traditional trench rebuilt in cotton-linen canvas. Soft armor for the in-between months.",
        "images": [
            "https://images.unsplash.com/photo-1762605135012-56a59a059e60?crop=entropy&cs=srgb&fm=jpg",
            "https://images.pexels.com/photos/20425010/pexels-photo-20425010.jpeg",
        ],
        "sizes": ["S", "M", "L", "XL"], "colors": ["Stone", "Midnight"], "material": "Cotton-Linen Canvas",
        "featured": True, "new_arrival": False,
    },
]

@app.on_event("startup")
async def seed_products():
    count = await db.products.count_documents({})
    if count == 0:
        docs = [Product(**p).model_dump() for p in SEED_PRODUCTS]
        await db.products.insert_many(docs)
        logger.info(f"Seeded {len(docs)} products")

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
