import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_stripe_cancel_subscription_unauthorized():
    cancel_sub_url = f"{BASE_URL}/api/stripe/cancel-subscription"
    
    # Test POST without auth, expect 401 Unauthorized
    response_no_auth = None
    try:
        response_no_auth = requests.post(cancel_sub_url, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed unexpectedly: {e}"
    assert response_no_auth.status_code == 401, f"Expected 401 without auth, got {response_no_auth.status_code}"

    # Sign in with given credentials (non-owner role user)
    signin_url = f"{BASE_URL}/api/auth/signin"
    signin_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "Wlink123"
    }
    try:
        signin_response = requests.post(signin_url, json=signin_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Signin request failed: {e}"
    assert signin_response.status_code == 200, f"Signin failed with status {signin_response.status_code}"
    signin_data = signin_response.json()
    token = signin_data.get("token")
    assert token, "Signin response missing token"
    
    # The JWT token is sent as 'auth_token' cookie for Stripe endpoints
    cookies = {"auth_token": token}

    # POST /api/stripe/cancel-subscription with auth but user is non-owner role (expect 403 Forbidden)
    # Need to provide a dummy agencyId, since body requires agencyId string
    payload = {"agencyId": "dummy-agency-id"}

    try:
        response_auth = requests.post(cancel_sub_url, json=payload, cookies=cookies, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Authorized cancel-subscription request failed: {e}"

    # According to instructions, non-owner role should get 403 Forbidden
    assert response_auth.status_code == 403, f"Expected 403 for non-owner role, got {response_auth.status_code}"

test_post_api_stripe_cancel_subscription_unauthorized()