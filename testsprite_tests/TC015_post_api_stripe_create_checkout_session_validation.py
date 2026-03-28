import requests

BASE_URL = "http://localhost:3000"
AUTH_COOKIE = {
    "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZGY0YWJhNi1iMGFlLTQ4MTUtYWQ0Mi02Mzk1NWM2NTQzMDciLCJlbWFpbCI6InRlc3RfcGF3YWxAeW9wbWFpbC5jb20iLCJyb2xlIjoiQUdFTkNZX09XTkVSIiwiaWF0IjoxNzc0Njg4MjU1LCJleHAiOjE3NzUyOTMwNTV9.LFtQEgaHNMtNyMuaVMA6aEj92lbRUs6UPJy0y4I3BI0"
}

def test_post_api_stripe_create_checkout_session_validation():
    url = f"{BASE_URL}/api/stripe/create-checkout-session"
    headers = {"Content-Type": "application/json"}
    cookies = AUTH_COOKIE
    timeout = 30

    # Test case 1: Missing required fields (empty body)
    response = requests.post(url, headers=headers, cookies=cookies, json={}, timeout=timeout)
    assert response.status_code == 400, f"Expected status 400 for missing fields but got {response.status_code}"

    # Test case 2: Empty prices array in 'items'
    # According to the PRD, body should have subAccountId, items (array), funnelPageId
    # Provide valid subAccountId and funnelPageId with items as empty array to trigger validation error
    payload = {
        "subAccountId": "dummySubAccountId",
        "items": [],
        "funnelPageId": "dummyFunnelPageId"
    }
    response2 = requests.post(url, headers=headers, cookies=cookies, json=payload, timeout=timeout)
    # Expecting 400 for invalid cart items (empty prices array)
    assert response2.status_code == 400, f"Expected status 400 for empty items array but got {response2.status_code}"


test_post_api_stripe_create_checkout_session_validation()