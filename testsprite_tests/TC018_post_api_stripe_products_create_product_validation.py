import requests

BASE_URL = "http://localhost:3000"
SIGNIN_URL = f"{BASE_URL}/api/auth/signin"
PRODUCTS_URL = f"{BASE_URL}/api/stripe/products"

EMAIL = "test_pawal@yopmail.com"
PASSWORD = "Wlink123"
TIMEOUT = 30


def test_post_api_stripe_products_create_product_validation():
    # Step 1: Authenticate and get auth_token cookie
    signin_payload = {"email": EMAIL, "password": PASSWORD}
    signin_resp = requests.post(SIGNIN_URL, json=signin_payload, timeout=TIMEOUT)
    assert signin_resp.status_code == 200, f"Signin failed: {signin_resp.text}"
    signin_data = signin_resp.json()
    assert "token" in signin_data and "user" in signin_data
    cookies = {"auth_token": signin_data.get("token")}

    # Prepare common valid data for product creation
    valid_sub_account_id = "test-subaccount-id"

    # Test 1: Missing subAccountId - expect 400
    payload_missing_sub_account = {
        "name": "Test Product",
        "price": 1000
    }
    response = requests.post(
        PRODUCTS_URL, json=payload_missing_sub_account, cookies=cookies, timeout=TIMEOUT
    )
    assert response.status_code == 400, (
        f"Expected 400 for missing subAccountId but got {response.status_code}: {response.text}"
    )

    # Test 2: Missing name - expect 400
    payload_missing_name = {
        "subAccountId": valid_sub_account_id,
        "price": 1000
    }
    response = requests.post(
        PRODUCTS_URL, json=payload_missing_name, cookies=cookies, timeout=TIMEOUT
    )
    assert response.status_code == 400, (
        f"Expected 400 for missing name but got {response.status_code}: {response.text}"
    )

    # Test 3: Missing price - expect 400
    payload_missing_price = {
        "subAccountId": valid_sub_account_id,
        "name": "Test Product"
    }
    response = requests.post(
        PRODUCTS_URL, json=payload_missing_price, cookies=cookies, timeout=TIMEOUT
    )
    assert response.status_code == 400, (
        f"Expected 400 for missing price but got {response.status_code}: {response.text}"
    )

    # Test 4: Valid fields with optional description - expect 200 and product object
    valid_payload = {
        "subAccountId": valid_sub_account_id,
        "name": "Valid Product",
        "price": 1500,
        "description": "Optional product description"
    }

    created_product_id = None
    try:
        response = requests.post(
            PRODUCTS_URL, json=valid_payload, cookies=cookies, timeout=TIMEOUT
        )
        assert response.status_code == 200, (
            f"Expected 200 for valid product but got {response.status_code}: {response.text}"
        )
        product_data = response.json()
        assert isinstance(product_data, dict), "Product response should be a JSON object"
        assert "name" in product_data and product_data["name"] == valid_payload["name"]
        assert "price" in product_data and product_data["price"] == valid_payload["price"]
        assert "subAccountId" in product_data and product_data["subAccountId"] == valid_payload["subAccountId"]
        # description is optional, check if present and matches
        if "description" in product_data:
            assert product_data["description"] == valid_payload["description"]
        created_product_id = product_data.get("id") or product_data.get("productId")
        assert created_product_id, "Created product ID missing in response"
    finally:
        # Clean up: delete the created product if possible
        if created_product_id:
            try:
                delete_resp = requests.delete(
                    PRODUCTS_URL,
                    json={"productId": created_product_id},
                    cookies=cookies,
                    timeout=TIMEOUT,
                )
                assert delete_resp.status_code == 200, (
                    f"Failed to delete product {created_product_id}: {delete_resp.text}"
                )
            except Exception:
                pass


test_post_api_stripe_products_create_product_validation()
