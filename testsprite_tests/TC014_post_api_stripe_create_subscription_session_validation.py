import requests

BASE_URL = "http://localhost:3000"
AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZGY0YWJhNi1iMGFlLTQ4MTUtYWQ0Mi02Mzk1NWM2NTQzMDciLCJlbWFpbCI6InRlc3RfcGF3YWxAeW9wbWFpbC5jb20iLCJyb2xlIjoiQUdFTkNZX09XTkVSIiwiaWF0IjoxNzc0Njg4MjU1LCJleHAiOjE3NzUyOTMwNTV9.LFtQEgaHNMtNyMuaVMA6aEj92lbRUs6UPJy0y4I3BI0"


def test_post_api_stripe_create_subscription_session_validation():
    url = f"{BASE_URL}/api/stripe/create-subscription-session"
    timeout = 30

    # 1) Test POST without auth cookie - expect 401 Unauthorized
    try:
        resp = requests.post(url, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request failed without auth: {e}"
    assert resp.status_code == 401, f"Expected 401 Unauthorized without auth, got {resp.status_code}"

    # 2) Test POST with auth cookie but missing required fields - expect 400 Bad Request
    headers = {}
    cookies = {"auth_token": AUTH_TOKEN}
    # Empty payload missing all required fields agencyId, priceId, successUrl, cancelUrl
    payload = {}

    try:
        resp = requests.post(url, json=payload, cookies=cookies, headers=headers, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request failed with auth but missing fields: {e}"

    # Expecting 400 Bad Request
    assert resp.status_code == 400, f"Expected 400 Bad Request with missing fields, got {resp.status_code}"


test_post_api_stripe_create_subscription_session_validation()