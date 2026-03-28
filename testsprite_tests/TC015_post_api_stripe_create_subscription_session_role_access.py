import requests

BASE_URL = "http://localhost:3000"
SIGNIN_URL = f"{BASE_URL}/api/auth/signin"
CREATE_SUBS_SESSION_URL = f"{BASE_URL}/api/stripe/create-subscription-session"
TEST_USER_EMAIL = "test_pawal@yopmail.com"
TEST_USER_PASSWORD = "Wlink123"
TIMEOUT = 30

def test_post_api_stripe_create_subscription_session_role_access():
    session = requests.Session()

    # 1. POST /api/stripe/create-subscription-session without auth should return 401
    payload_full = {
        "agencyId": "dummy-agency-id",
        "priceId": "dummy-price-id",
        "successUrl": "https://example.com/success",
        "cancelUrl": "https://example.com/cancel"
    }
    response = session.post(CREATE_SUBS_SESSION_URL, json=payload_full, timeout=TIMEOUT)
    assert response.status_code == 401, f"Expected 401 Unauthorized without auth, got {response.status_code}"

    # 2. Authenticate user to get auth_token cookie
    signin_payload = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    signin_resp = session.post(SIGNIN_URL, json=signin_payload, timeout=TIMEOUT)
    assert signin_resp.status_code == 200, f"Sign in failed with status {signin_resp.status_code}"
    signin_json = signin_resp.json()
    assert "token" in signin_json or "user" in signin_json, "Sign in response missing token/user"
    # Set cookie header with auth_token returned from signin
    # The API uses Cookie based JWT. The token is returned in JSON "token" field but cookie must be set manually.
    auth_token = signin_json.get("token")
    assert auth_token, "No token received from signin"
    session.cookies.set("auth_token", auth_token)

    headers = {
        "Content-Type": "application/json"
    }

    # 3. POST with auth but missing agencyId, expect 400
    payload_missing_agencyId = {
        "priceId": "dummy-price-id",
        "successUrl": "https://example.com/success",
        "cancelUrl": "https://example.com/cancel"
    }
    resp = session.post(CREATE_SUBS_SESSION_URL, json=payload_missing_agencyId, headers=headers, timeout=TIMEOUT)
    assert resp.status_code == 400, f"Expected 400 when agencyId missing, got {resp.status_code}"

    # 4. POST with auth but missing priceId, expect 400
    payload_missing_priceId = {
        "agencyId": "dummy-agency-id",
        "successUrl": "https://example.com/success",
        "cancelUrl": "https://example.com/cancel"
    }
    resp = session.post(CREATE_SUBS_SESSION_URL, json=payload_missing_priceId, headers=headers, timeout=TIMEOUT)
    assert resp.status_code == 400, f"Expected 400 when priceId missing, got {resp.status_code}"

    # 5. POST with auth but missing successUrl, expect 400
    payload_missing_successUrl = {
        "agencyId": "dummy-agency-id",
        "priceId": "dummy-price-id",
        "cancelUrl": "https://example.com/cancel"
    }
    resp = session.post(CREATE_SUBS_SESSION_URL, json=payload_missing_successUrl, headers=headers, timeout=TIMEOUT)
    assert resp.status_code == 400, f"Expected 400 when successUrl missing, got {resp.status_code}"

    # 6. POST with auth but missing cancelUrl, expect 400
    payload_missing_cancelUrl = {
        "agencyId": "dummy-agency-id",
        "priceId": "dummy-price-id",
        "successUrl": "https://example.com/success"
    }
    resp = session.post(CREATE_SUBS_SESSION_URL, json=payload_missing_cancelUrl, headers=headers, timeout=TIMEOUT)
    assert resp.status_code == 400, f"Expected 400 when cancelUrl missing, got {resp.status_code}"

test_post_api_stripe_create_subscription_session_role_access()