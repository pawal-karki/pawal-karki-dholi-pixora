import requests
import uuid

BASE_URL = "http://localhost:3000"
AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZGY0YWJhNi1iMGFlLTQ4MTUtYWQ0Mi02Mzk1NWM2NTQzMDciLCJlbWFpbCI6InRlc3RfcGF3YWxAeW9wbWFpbC5jb20iLCJyb2xlIjoiQUdFTkNZX09XTkVSIiwiaWF0IjoxNzc0Njg4MjU1LCJleHAiOjE3NzUyOTMwNTV9.LFtQEgaHNMtNyMuaVMA6aEj92lbRUs6UPJy0y4I3BI0"
COOKIES = {'auth_token': AUTH_TOKEN}
HEADERS = {'Content-Type': 'application/json'}
TIMEOUT = 30

def test_post_api_stripe_products_crud_create_product():
    # 1) Test POST /api/stripe/products with valid subAccountId, name, price => Expect 200 with product data
    # 2) Test POST /api/stripe/products missing required fields => Expect 400
    # 3) Test GET /api/stripe/products?subAccountId=xxx returns product list including created product
    
    sub_account_id = f"subacct-{uuid.uuid4().hex[:8]}"
    product_name = f"Test Product {uuid.uuid4().hex[:6]}"
    product_price = 1500  # price as number per API spec

    product_id = None
    try:
        # Create product (valid)
        payload = {
            "subAccountId": sub_account_id,
            "name": product_name,
            "price": product_price
        }
        resp = requests.post(
            f"{BASE_URL}/api/stripe/products",
            json=payload,
            cookies=COOKIES,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}, response: {resp.text}"
        product_data = resp.json()
        # Validate product data contains fields
        assert "name" in product_data and product_data["name"] == product_name
        assert "price" in product_data and product_data["price"] == product_price
        assert "subAccountId" in product_data and product_data["subAccountId"] == sub_account_id
        assert "id" in product_data
        product_id = product_data["id"]

        # POST with missing required fields: missing name
        payload_missing_name = {
            "subAccountId": sub_account_id,
            "price": product_price
        }
        resp_missing_name = requests.post(
            f"{BASE_URL}/api/stripe/products",
            json=payload_missing_name,
            cookies=COOKIES,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp_missing_name.status_code == 400, f"Expected 400 for missing name, got {resp_missing_name.status_code}"

        # POST with missing required fields: missing price
        payload_missing_price = {
            "subAccountId": sub_account_id,
            "name": product_name
        }
        resp_missing_price = requests.post(
            f"{BASE_URL}/api/stripe/products",
            json=payload_missing_price,
            cookies=COOKIES,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp_missing_price.status_code == 400, f"Expected 400 for missing price, got {resp_missing_price.status_code}"

        # POST with missing required fields: missing subAccountId
        payload_missing_subaccount = {
            "name": product_name,
            "price": product_price
        }
        resp_missing_subaccount = requests.post(
            f"{BASE_URL}/api/stripe/products",
            json=payload_missing_subaccount,
            cookies=COOKIES,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp_missing_subaccount.status_code == 400, f"Expected 400 for missing subAccountId, got {resp_missing_subaccount.status_code}"

        # Test GET /api/stripe/products?subAccountId=xxx returns product list including created product
        resp_get = requests.get(
            f"{BASE_URL}/api/stripe/products",
            params={"subAccountId": sub_account_id},
            cookies=COOKIES,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp_get.status_code == 200, f"Expected 200 on GET products, got {resp_get.status_code}"
        products = resp_get.json()
        # Expect products to be a list or iterable containing the created product
        assert isinstance(products, list), f"Expected list of products, got {type(products)}"
        # Check that created product ID is in the list
        product_ids = [p.get("id") for p in products if "id" in p]
        assert product_id in product_ids, "Created product not found in GET /api/stripe/products response"
    finally:
        # Clean up - delete created product if exists
        if product_id:
            try:
                resp_del = requests.delete(
                    f"{BASE_URL}/api/stripe/products",
                    json={"productId": product_id},
                    cookies=COOKIES,
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
                assert resp_del.status_code == 200, f"Expected 200 on delete product, got {resp_del.status_code}"
                resp_del_json = resp_del.json()
                assert "success" in resp_del_json and resp_del_json["success"] is True, "Delete product response missing success:true"
            except Exception:
                pass

test_post_api_stripe_products_crud_create_product()
