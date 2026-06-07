"""Admin Dashboard end-to-end backend tests for Crescent Loom.

Covers admin-auth, admin endpoints (orders/customers/loom credits/dashboard/CSV),
storefront public endpoints, and demo-mode payment create-order flow.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://1cbba4b7-2509-43bd-b0c1-479d433dac22.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "crescent.looom@gmail.com"
ADMIN_PASSWORD = "Crescentloom@2026"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/admin-auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and data["token"]
    return data["token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- Admin Auth ----------
class TestAdminAuth:
    def test_login_success(self):
        r = requests.post(f"{API}/admin-auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert "id" in data and data["id"].startswith("admin_")
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
        # cookie
        assert "admin_token" in r.cookies

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/admin-auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-pw"}, timeout=20)
        assert r.status_code == 401

    def test_login_wrong_email(self):
        r = requests.post(f"{API}/admin-auth/login", json={"email": "nope@crescentloom.com", "password": "whatever"}, timeout=20)
        assert r.status_code == 401

    def test_me_with_bearer(self, auth_headers):
        r = requests.get(f"{API}/admin-auth/me", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL

    def test_me_without_token(self):
        r = requests.get(f"{API}/admin-auth/me", timeout=20)
        assert r.status_code == 401


# ---------- Auth guard on admin endpoints ----------
ADMIN_ENDPOINTS = [
    ("GET", "/admin/orders"),
    ("GET", "/admin/customers"),
    ("GET", "/admin/loom-credits"),
    ("GET", "/admin/loom-credits/summary"),
    ("GET", "/admin/loom-credits/orders"),
    ("GET", "/admin/dashboard/stats"),
    ("GET", "/admin/dashboard/revenue?window=week"),
    ("GET", "/admin/orders.csv"),
    ("GET", "/admin/orders/search?window=all"),
]


class TestAdminAuthGuard:
    @pytest.mark.parametrize("method,path", ADMIN_ENDPOINTS)
    def test_endpoint_requires_auth(self, method, path):
        r = requests.request(method, f"{API}{path}", timeout=20)
        assert r.status_code in (401, 403), f"{path} returned {r.status_code} without auth"


# ---------- Dashboard ----------
class TestDashboard:
    def test_stats_shape(self, auth_headers):
        r = requests.get(f"{API}/admin/dashboard/stats", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        d = r.json()
        for key in ["today", "week", "month", "pending_orders", "total_customers", "top_product", "loom_credits"]:
            assert key in d
        for k in ["today", "week", "month"]:
            assert "orders" in d[k] and "revenue" in d[k]
        assert "issued" in d["loom_credits"] and "redeemed" in d["loom_credits"]

    @pytest.mark.parametrize("window,expected", [("day", 24), ("week", 7), ("month", 30)])
    def test_revenue_series(self, auth_headers, window, expected):
        r = requests.get(f"{API}/admin/dashboard/revenue?window={window}", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        assert len(arr) == expected
        for b in arr:
            assert "label" in b and "revenue" in b and "orders" in b


# ---------- Orders ----------
class TestOrders:
    @pytest.mark.parametrize("window", ["today", "week", "month", "all"])
    def test_search_window(self, auth_headers, window):
        r = requests.get(f"{API}/admin/orders/search?window={window}", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_search_with_q_and_status(self, auth_headers):
        r = requests.get(f"{API}/admin/orders/search?window=all&q=test&status=pending", headers=auth_headers, timeout=20)
        assert r.status_code == 200

    def test_status_update_invalid(self, auth_headers):
        r = requests.patch(f"{API}/admin/orders/non-existent/status", json={"status": "bogus"}, headers=auth_headers, timeout=20)
        # invalid status returns 400
        assert r.status_code == 400

    def test_status_update_missing_order(self, auth_headers):
        r = requests.patch(f"{API}/admin/orders/non-existent-id/status", json={"status": "packed"}, headers=auth_headers, timeout=20)
        assert r.status_code == 404

    def test_csv_export(self, auth_headers):
        r = requests.get(f"{API}/admin/orders.csv", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        cd = r.headers.get("content-disposition", "")
        assert "attachment" in cd and "crescent-loom-orders" in cd
        # header row present
        assert b"Order ID" in r.content


# ---------- Customers ----------
class TestCustomers:
    def test_list(self, auth_headers):
        r = requests.get(f"{API}/admin/customers", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)

    def test_detail_404(self, auth_headers):
        r = requests.get(f"{API}/admin/customers/nope-user", headers=auth_headers, timeout=20)
        assert r.status_code == 404


# ---------- Loom Credits ----------
class TestLoomCredits:
    def test_summary_shape(self, auth_headers):
        r = requests.get(f"{API}/admin/loom-credits/summary", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        d = r.json()
        for k in ["issued", "redeemed", "outstanding", "discount_given_inr"]:
            assert k in d

    def test_per_user(self, auth_headers):
        r = requests.get(f"{API}/admin/loom-credits", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_redeemed_orders(self, auth_headers):
        r = requests.get(f"{API}/admin/loom-credits/orders", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_adjust_user_not_found(self, auth_headers):
        r = requests.post(f"{API}/admin/loom-credits/adjust", json={"user_id": "no-such-user", "change": 2}, headers=auth_headers, timeout=20)
        assert r.status_code == 404

    def test_adjust_zero_rejected(self, auth_headers):
        r = requests.post(f"{API}/admin/loom-credits/adjust", json={"user_id": "no-such-user", "change": 0}, headers=auth_headers, timeout=20)
        assert r.status_code == 400


# ---------- Storefront (public) ----------
class TestStorefront:
    def test_products_list(self):
        r = requests.get(f"{API}/products", timeout=20)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        assert len(arr) >= 1

    def test_payments_config_demo_mode(self):
        r = requests.get(f"{API}/payments/config", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d.get("enabled") is False  # demo mode

    def test_create_payment_order_guest_demo(self):
        # Pick a real product
        prods = requests.get(f"{API}/products", timeout=20).json()
        assert prods, "no products seeded"
        p = prods[0]
        payload = {
            "items": [{
                "product_id": p["id"],
                "name": p["name"],
                "price": p["price"],
                "quantity": 1,
                "size": (p.get("sizes") or ["M"])[0],
            }],
            "shipping": {
                "full_name": "TEST_Buyer",
                "phone": "9999999999",
                "address_line": "1 Test Lane",
                "city": "Bengaluru",
                "state": "KA",
                "pincode": "560001",
                "country": "India",
            },
            "loom_credits_redeemed": 0,
        }
        r = requests.post(f"{API}/payments/create-order", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("demo_mode") is True
        assert d.get("razorpay_order") is None
        assert d["order"]["total"] == p["price"]
        assert d["order"]["status"] == "pending"
        return d["order"]["id"]


# ---------- E2E: create order then admin updates status ----------
class TestE2EOrderFlow:
    def test_create_then_update_status(self, auth_headers):
        prods = requests.get(f"{API}/products", timeout=20).json()
        p = prods[0]
        payload = {
            "items": [{"product_id": p["id"], "name": p["name"], "price": p["price"], "quantity": 1, "size": "M"}],
            "shipping": {"full_name": "TEST_Workflow", "phone": "9000000000", "address_line": "Wf", "city": "BLR", "state": "KA", "pincode": "560002"},
            "loom_credits_redeemed": 0,
        }
        r = requests.post(f"{API}/payments/create-order", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        oid = r.json()["order"]["id"]

        # update status valid transition
        r2 = requests.patch(f"{API}/admin/orders/{oid}/status", json={"status": "packed"}, headers=auth_headers, timeout=20)
        assert r2.status_code == 200
        assert r2.json()["order"]["status"] == "packed"

        # verify via GET search
        r3 = requests.get(f"{API}/admin/orders/search?window=all", headers=auth_headers, timeout=20)
        assert r3.status_code == 200
        ids = [o["id"] for o in r3.json()]
        assert oid in ids

        # CSV contains it
        rcsv = requests.get(f"{API}/admin/orders.csv", headers=auth_headers, timeout=30)
        assert oid.encode() in rcsv.content
