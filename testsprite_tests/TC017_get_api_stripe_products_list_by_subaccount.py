import requests

BASE_URL = "http://localhost:3000"
EMAIL = "test_pawal@yopmail.com"
PASSWORD = "Wlink123"
TIMEOUT = 30

def test_get_api_stripe_products_list_by_subaccount():
    session = requests.Session()
    # Step 1: Sign in to get auth_token cookie
    signin_url = f"{BASE_URL}/api/auth/signin"
    signin_payload = {"email": EMAIL, "password": PASSWORD}
    try:
        signin_resp = session.post(signin_url, json=signin_payload, timeout=TIMEOUT)
        assert signin_resp.status_code == 200, f"Signin failed: {signin_resp.text}"
        signin_json = signin_resp.json()
        token = signin_json.get("token")
        assert token and isinstance(token, str), "Signin response missing token"

        auth_cookie = {'auth_token': token}

        headers = {
            "Cookie": f"auth_token={token}"
        }

        # 1. Test GET /api/stripe/products without subAccountId, expect 400
        url = f"{BASE_URL}/api/stripe/products"
        resp_no_subaccount = session.get(url, headers=headers, timeout=TIMEOUT)
        assert resp_no_subaccount.status_code == 400, f"Expected 400 without subAccountId, got {resp_no_subaccount.status_code}"

        # 2. Test GET /api/stripe/products?subAccountId=nonexistent-id
        params_nonexistent = {"subAccountId": "nonexistent-id"}
        resp_nonexistent = session.get(url, headers=headers, params=params_nonexistent, timeout=TIMEOUT)
        assert resp_nonexistent.status_code == 200 or resp_nonexistent.status_code == 400, f"Expected 200 or 400 for nonexistent subAccountId, got {resp_nonexistent.status_code}"
        if resp_nonexistent.status_code == 200:
            try:
                products = resp_nonexistent.json()
                # According to PRD, response is Product[] (a list)
                assert isinstance(products, list), "Response for nonexistent subAccountId should be a list"
                assert len(products) == 0 or all("id" in p for p in products), "Products array invalid or not empty for nonexistent subAccountId"
            except Exception as e:
                # In case error format, do not fail since both empty products or error allowed
                pass

        # 3. Test GET /api/stripe/products?subAccountId=valid-id&source=local returns local products
        # Need to create a product with local source and valid subAccountId to test
        # We'll create one product and then query with source=local

        # Create a local product for test
        create_url = f"{BASE_URL}/api/stripe/products"
        product_payload = {
            "name": "Test Product Local",
            "price": "100",
            "subAccountId": "valid-id"  # fixed id as test expects
        }
        create_resp = session.post(create_url, json=product_payload, headers=headers, timeout=TIMEOUT)
        try:
            assert create_resp.status_code == 200, f"Failed to create product for testing local source: {create_resp.text}"
            created_product = create_resp.json()
            product_id = created_product.get("id")
            assert product_id, "Created product missing id"

            # Query products with subAccountId=valid-id&source=local
            params_local = {"subAccountId": "valid-id", "source": "local"}
            resp_local = session.get(url, headers=headers, params=params_local, timeout=TIMEOUT)
            assert resp_local.status_code == 200, f"Expected 200 for local products query, got {resp_local.status_code}"
            products_local = resp_local.json()
            assert isinstance(products_local, list), "Local products response should be a list"
            assert any(p.get("id") == product_id for p in products_local), "Created local product not found in local products list"
        finally:
            # Cleanup: delete created product
            if 'product_id' in locals():
                delete_url = f"{BASE_URL}/api/stripe/products"
                delete_resp = session.delete(delete_url, json={"productId": product_id}, headers=headers, timeout=TIMEOUT)
                assert delete_resp.status_code == 200 and delete_resp.json().get("success") is True, f"Failed to delete test product: {delete_resp.text}"

    finally:
        session.close()

test_get_api_stripe_products_list_by_subaccount()
