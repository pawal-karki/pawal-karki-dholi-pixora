import requests

BASE_URL = "http://localhost:3000"
SIGNIN_URL = f"{BASE_URL}/api/auth/signin"
DELETE_PRODUCT_URL = f"{BASE_URL}/api/stripe/products"

AUTH_EMAIL = "test_pawal@yopmail.com"
AUTH_PASSWORD = "Wlink123"

def get_auth_token():
    try:
        resp = requests.post(
            SIGNIN_URL,
            json={"email": AUTH_EMAIL, "password": AUTH_PASSWORD},
            timeout=30
        )
        resp.raise_for_status()
        data = resp.json()
        token = data.get("token")
        assert token, "No token in signin response"
        return token
    except Exception as e:
        raise RuntimeError(f"Failed to get auth token: {e}")

def test_delete_api_stripe_products_delete_validation():
    token = get_auth_token()
    cookies = {"auth_token": token}
    headers = {"Content-Type": "application/json"}

    # Test DELETE /api/stripe/products without productId query param -> Expect 400
    try:
        resp_no_param = requests.delete(
            DELETE_PRODUCT_URL,
            cookies=cookies,
            timeout=30
        )
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert resp_no_param.status_code == 400, \
        f"Expected 400 for DELETE without productId, got {resp_no_param.status_code}"

    # Test DELETE /api/stripe/products?productId=nonexistent-id -> Expect 404 or 400
    try:
        resp_nonexistent = requests.delete(
            DELETE_PRODUCT_URL,
            params={"productId": "nonexistent-id"},
            cookies=cookies,
            timeout=30
        )
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert resp_nonexistent.status_code in (400, 404), \
        f"Expected 400 or 404 for DELETE with nonexistent productId, got {resp_nonexistent.status_code}"

test_delete_api_stripe_products_delete_validation()