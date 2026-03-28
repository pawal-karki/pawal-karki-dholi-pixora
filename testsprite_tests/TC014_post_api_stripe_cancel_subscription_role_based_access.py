import requests

BASE_URL = "http://localhost:3000"
AUTH_SIGNIN_URL = f"{BASE_URL}/api/auth/signin"
CANCEL_SUBSCRIPTION_URL = f"{BASE_URL}/api/stripe/cancel-subscription"

EMAIL = "test_pawal@yopmail.com"
PASSWORD = "Wlink123"
AGENCY_ID_FAKE = "fake-id"
TIMEOUT = 30


def test_post_api_stripe_cancel_subscription_role_based_access():
    # 1. Test POST /api/stripe/cancel-subscription without auth - expect 401 Unauthorized
    payload = {"agencyId": AGENCY_ID_FAKE}
    try:
        response = requests.post(
            CANCEL_SUBSCRIPTION_URL,
            json=payload,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request without auth failed to connect: {e}"
    assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"

    # 2. Authenticate to get auth_token cookie for user with role AGENCY_OWNER
    signin_payload = {"email": EMAIL, "password": PASSWORD}
    try:
        signin_resp = requests.post(AUTH_SIGNIN_URL, json=signin_payload, timeout=TIMEOUT)
        signin_resp.raise_for_status()
    except requests.HTTPError as e:
        assert False, f"Sign-in request failed: {e}"
    except requests.RequestException as e:
        assert False, f"Sign-in request connection error: {e}"

    signin_json = signin_resp.json()
    auth_token = signin_json.get("token")
    assert auth_token and isinstance(auth_token, str), "No valid token returned on sign in"

    cookies = {"auth_token": auth_token}

    # 3. Test POST /api/stripe/cancel-subscription with valid auth_token cookie but agencyId fake-id
    try:
        auth_response = requests.post(
            CANCEL_SUBSCRIPTION_URL,
            json=payload,
            cookies=cookies,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request with auth failed to connect: {e}"

    # Valid role AGENCY_OWNER can only cancel if member of agency, else 403 or 404 expected
    assert auth_response.status_code in (403, 404), (
        f"Expected 403 or 404 for invalid agency membership, got {auth_response.status_code}"
    )


test_post_api_stripe_cancel_subscription_role_based_access()