import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_api_stripe_create_checkout_session_validation():
    signin_url = f"{BASE_URL}/api/auth/signin"
    checkout_session_url = f"{BASE_URL}/api/stripe/create-checkout-session"

    signin_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "Wlink123"
    }

    # Sign in to get auth_token cookie
    try:
        signin_resp = requests.post(signin_url, json=signin_payload, timeout=TIMEOUT)
        assert signin_resp.status_code == 200, f"Sign in failed with status code {signin_resp.status_code}"
        token = signin_resp.json().get("token")
        assert token, "No token found in signin response"
    except requests.RequestException as e:
        assert False, f"Sign in request failed: {e}"

    headers = {
        "Cookie": f"auth_token={token}",
        "Content-Type": "application/json"
    }

    # Test 1: Missing required fields (empty body)
    try:
        resp = requests.post(checkout_session_url, json={}, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 400, f"Expected 400 for missing fields, got {resp.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed for missing fields test: {e}"

    # Test 2: Empty prices array (price array is part of items field or similarly named)
    # According to PRD, the POST /api/stripe/create-checkout-session body schema is:
    # { subAccountId: string, items: CartItem[], funnelPageId: string }
    # For validation, test with empty items array should cause 400.

    invalid_payload_empty_items = {
        "subAccountId": "some-sub-account-id",
        "items": [],
        "funnelPageId": "some-funnel-page-id"
    }
    try:
        resp = requests.post(checkout_session_url, json=invalid_payload_empty_items, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 400, f"Expected 400 for empty items array, got {resp.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed for empty items array test: {e}"


test_post_api_stripe_create_checkout_session_validation()