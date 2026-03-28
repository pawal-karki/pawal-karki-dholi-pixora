import requests

BASE_URL = "http://localhost:3000"
SIGNIN_URL = f"{BASE_URL}/api/auth/signin"
CREATE_CHECKOUT_SESSION_URL = f"{BASE_URL}/api/stripe/create-checkout-session"

TEST_EMAIL = "test_pawal@yopmail.com"
TEST_PASSWORD = "Wlink123"
TIMEOUT = 30

def test_post_api_stripe_create_checkout_session_validation():
    # Step 1: Authenticate and get auth_token cookie
    signin_payload = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
    signin_resp = requests.post(SIGNIN_URL, json=signin_payload, timeout=TIMEOUT)
    assert signin_resp.status_code == 200, f"Signin failed with status {signin_resp.status_code}"
    signin_data = signin_resp.json()
    # The token is returned in the JSON body, but auth_token cookie is required for subsequent calls
    # We must set cookie header: "auth_token=<JWT_VALUE>"
    auth_token = signin_data.get("token")
    assert auth_token, "No token received on signin"
    cookies = {"auth_token": auth_token}

    headers = {
        "Content-Type": "application/json"
    }

    # Test 1: POST with empty body -> Expect 400
    resp_empty_body = requests.post(CREATE_CHECKOUT_SESSION_URL, cookies=cookies, headers=headers, json={}, timeout=TIMEOUT)
    assert resp_empty_body.status_code == 400, f"Expected 400 for empty body, got {resp_empty_body.status_code}"

    # Test 2: POST with missing prices array (send body without 'items') -> Expect 400
    payload_missing_prices = {
        "subAccountConnectedId": "some-id"
        # no 'items' key
    }
    resp_missing_prices = requests.post(CREATE_CHECKOUT_SESSION_URL, cookies=cookies, headers=headers, json=payload_missing_prices, timeout=TIMEOUT)
    assert resp_missing_prices.status_code == 400, f"Expected 400 for missing prices array, got {resp_missing_prices.status_code}"

    # Test 3: POST with empty prices array [] -> Expect 400
    payload_empty_prices = {
        "subAccountConnectedId": "some-id",
        "items": []
    }
    resp_empty_prices = requests.post(CREATE_CHECKOUT_SESSION_URL, cookies=cookies, headers=headers, json=payload_empty_prices, timeout=TIMEOUT)
    assert resp_empty_prices.status_code == 400, f"Expected 400 for empty prices array, got {resp_empty_prices.status_code}"

    # Test 4: POST with missing subAccountConnectedId -> Expect 400
    payload_missing_sub_account = {
        "items": [{"price": "price_123", "quantity": 1}]
    }
    resp_missing_sub_account = requests.post(CREATE_CHECKOUT_SESSION_URL, cookies=cookies, headers=headers, json=payload_missing_sub_account, timeout=TIMEOUT)
    assert resp_missing_sub_account.status_code == 400, f"Expected 400 for missing subAccountConnectedId, got {resp_missing_sub_account.status_code}"

test_post_api_stripe_create_checkout_session_validation()