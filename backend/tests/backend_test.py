"""Backend integration tests for Crescent Loom.

Covers:
- Products listing/filters/detail
- Auth (me, bearer)
- Wishlist (add/get/remove)
- Admin product CRUD
- Payments config + demo-mode order create + demo-complete
- Orders listing (user + admin)
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("BACKEND_BASE_URL", "https://artisan-crescent.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

# Test session token injected into Mongo before running this suite
TOKEN = os.environ.get("TEST_SESSION_TOKEN", "test_session_1780844518417")

AUTH = {"Authorization": f"Bearer {TOKEN}"}


# ---------------- Products ----------------
class TestProducts:
    def test_list_returns_seeded_products(self):
        r = requests.get(f"{API}/products", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 8
        p = data[0]
        for field in ["id", "name", "slug", "category", "price", "images", "sizes", "material", "featured", "new_arrival"]:
            assert field in p, f"missing field {field}"

    @pytest.mark.parametrize("cat", ["outerwear", "tops", "bottoms", "accessories"])
    def test_filter_category(self, cat):
        r = requests.get(f"{API}/products", params={"category": cat}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        assert all(p["category"] == cat for p in data)

    def test_filter_featured(self):
        r = requests.get(f"{API}/products", params={"featured": "true"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert all(p["featured"] is True for p in data)
        assert len(data) >= 1

    def test_filter_new_arrival(self):
        r = requests.get(f"{API}/products", params={"new_arrival": "true"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert all(p["new_arrival"] is True for p in data)

    def test_search_q(self):
        r = requests.get(f"{API}/products", params={"q": "Crescent"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert any("crescent" in p["name"].lower() for p in data)

    def test_get_product_by_slug(self):
        r = requests.get(f"{API}/products/crescent-coat", timeout=30)
        assert r.status_code == 200
        p = r.json()
        assert p["slug"] == "crescent-coat"
        assert p["name"] == "Crescent Coat"

    def test_get_product_invalid_slug(self):
        r = requests.get(f"{API}/products/does-not-exist-xyz", timeout=30)
        assert r.status_code == 404


# ---------------- Payments config ----------------
class TestPaymentsConfig:
    def test_config_demo_mode(self):
        r = requests.get(f"{API}/payments/config", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "key_id" in data
        assert "enabled" in data
        assert data["enabled"] is False  # Razorpay env empty


# ---------------- Auth ----------------
class TestAuth:
    def test_me_unauthenticated(self):
        r = requests.get(f"{API}/auth/me", timeout=30)
        assert r.status_code == 401

    def test_me_with_bearer(self):
        r = requests.get(f"{API}/auth/me", headers=AUTH, timeout=30)
        assert r.status_code == 200
        u = r.json()
        assert u["email"] == "test.curator@crescentloom.com"
        assert u["is_admin"] is True


# ---------------- Wishlist ----------------
class TestWishlist:
    def test_wishlist_unauth(self):
        r = requests.get(f"{API}/wishlist", timeout=30)
        assert r.status_code == 401

    def test_wishlist_add_get_remove(self):
        # Get a product id
        r = requests.get(f"{API}/products/crescent-coat", timeout=30)
        assert r.status_code == 200
        pid = r.json()["id"]

        # Add
        r = requests.post(f"{API}/wishlist/{pid}", headers=AUTH, timeout=30)
        assert r.status_code == 200
        assert r.json().get("ok") is True

        # Get
        r = requests.get(f"{API}/wishlist", headers=AUTH, timeout=30)
        assert r.status_code == 200
        items = r.json()
        assert any(it["id"] == pid for it in items)

        # Remove
        r = requests.delete(f"{API}/wishlist/{pid}", headers=AUTH, timeout=30)
        assert r.status_code == 200

        # Confirm removed
        r = requests.get(f"{API}/wishlist", headers=AUTH, timeout=30)
        items = r.json()
        assert not any(it["id"] == pid for it in items)


# ---------------- Admin product CRUD ----------------
class TestAdminProducts:
    created_id = None

    def test_create_requires_auth(self):
        r = requests.post(f"{API}/admin/products", json={
            "name": "T", "slug": "t", "category": "tops", "price": 1, "description": "x"
        }, timeout=30)
        assert r.status_code == 401

    def test_create_product(self):
        slug = f"test-prod-{uuid.uuid4().hex[:6]}"
        payload = {
            "name": "TEST_Product", "slug": slug, "category": "tops",
            "price": 999.0, "description": "Test product",
            "images": ["https://example.com/x.jpg"],
            "sizes": ["S", "M"], "colors": ["Ivory"],
            "material": "Test", "featured": False, "new_arrival": True,
        }
        r = requests.post(f"{API}/admin/products", json=payload, headers=AUTH, timeout=30)
        assert r.status_code == 200, r.text
        prod = r.json()
        assert prod["name"] == "TEST_Product"
        assert prod["slug"] == slug
        assert "id" in prod
        TestAdminProducts.created_id = prod["id"]

        # Verify via GET by slug
        g = requests.get(f"{API}/products/{slug}", timeout=30)
        assert g.status_code == 200
        assert g.json()["id"] == prod["id"]

    def test_update_product(self):
        assert TestAdminProducts.created_id is not None
        pid = TestAdminProducts.created_id
        payload = {
            "name": "TEST_Product_Updated", "slug": f"test-updated-{uuid.uuid4().hex[:6]}",
            "category": "tops", "price": 1500.0, "description": "Updated",
            "images": [], "sizes": ["S"], "colors": [], "material": "Cotton",
            "featured": True, "new_arrival": False,
        }
        r = requests.put(f"{API}/admin/products/{pid}", json=payload, headers=AUTH, timeout=30)
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_Product_Updated"
        assert r.json()["price"] == 1500.0

    def test_delete_product(self):
        assert TestAdminProducts.created_id is not None
        pid = TestAdminProducts.created_id
        r = requests.delete(f"{API}/admin/products/{pid}", headers=AUTH, timeout=30)
        assert r.status_code == 200


# ---------------- Checkout / Orders demo flow ----------------
class TestCheckoutDemo:
    order_id = None

    def test_create_order_demo_mode(self):
        # Pull a product
        prods = requests.get(f"{API}/products", timeout=30).json()
        p = prods[0]
        body = {
            "items": [{
                "product_id": p["id"], "name": p["name"], "price": p["price"],
                "quantity": 1, "size": "M", "image": p["images"][0] if p["images"] else None
            }],
            "shipping": {
                "full_name": "Test Curator", "phone": "9999999999",
                "address_line": "1 Test Lane", "city": "Mumbai",
                "state": "MH", "pincode": "400001", "country": "India"
            }
        }
        r = requests.post(f"{API}/payments/create-order", json=body, headers=AUTH, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["demo_mode"] is True
        assert data["razorpay_order"] is None
        assert "order" in data and "id" in data["order"]
        assert data["order"]["status"] == "pending"
        TestCheckoutDemo.order_id = data["order"]["id"]

    def test_demo_complete(self):
        assert TestCheckoutDemo.order_id is not None
        r = requests.post(f"{API}/payments/demo-complete/{TestCheckoutDemo.order_id}", timeout=30)
        assert r.status_code == 200
        order = r.json()["order"]
        assert order["status"] == "paid"

    def test_list_my_orders(self):
        r = requests.get(f"{API}/orders", headers=AUTH, timeout=30)
        assert r.status_code == 200
        orders = r.json()
        assert any(o["id"] == TestCheckoutDemo.order_id for o in orders)

    def test_admin_orders(self):
        r = requests.get(f"{API}/admin/orders", headers=AUTH, timeout=30)
        assert r.status_code == 200
        orders = r.json()
        assert isinstance(orders, list)
        assert len(orders) >= 1

    def test_admin_orders_unauth(self):
        r = requests.get(f"{API}/admin/orders", timeout=30)
        assert r.status_code == 401
