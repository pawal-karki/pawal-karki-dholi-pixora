import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_stripe_cancel_subscription_unauthorized():
    url = f"{BASE_URL}/api/stripe/cancel-subscription"
    payload = {"agencyId": "any-agency-id"}

    # 1. Test without auth - expect 401 Unauthorized
    try:
        response = requests.post(url, json=payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed unexpectedly: {e}"
    assert response.status_code == 401, f"Expected 401 Unauthorized without auth but got {response.status_code}"

    # 2. Test with auth as non-owner role (AGENCY user role) - expect 403 Forbidden
    signin_url = f"{BASE_URL}/api/auth/signin"
    signin_data = {"email": "test_pawal@yopmail.com", "password": "Wlink123"}
    try:
        signin_resp = requests.post(signin_url, json=signin_data, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Sign-in request failed: {e}"
    assert signin_resp.status_code == 200, f"Sign-in failed with status code {signin_resp.status_code}"
    signin_json = signin_resp.json()
    token = signin_json.get("token")
    assert token, "No token received on sign-in"

    cookies = {"auth_token": token}
    try:
        response_auth = requests.post(url, json=payload, cookies=cookies, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Authenticated request failed: {e}"
    assert response_auth.status_code == 403, f"Expected 403 Forbidden for non-owner role but got {response_auth.status_code}"

test_post_api_stripe_cancel_subscription_unauthorized()