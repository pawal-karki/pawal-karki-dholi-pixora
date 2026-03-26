import requests

BASE_URL = "http://localhost:3001"
SIGNIN_URL = f"{BASE_URL}/api/auth/signin"
AUTH_ME_URL = f"{BASE_URL}/api/auth/me"
EMAIL = "test_pawal@yopmail.com"
PASSWORD = "Wlink123"
TIMEOUT = 30


def test_get_api_auth_me_return_current_user_data_from_bearer_jwt():
    # Step 1: Sign in to get JWT token
    signin_payload = {"email": EMAIL, "password": PASSWORD}
    try:
        signin_response = requests.post(SIGNIN_URL, json=signin_payload, timeout=TIMEOUT)
        assert signin_response.status_code == 200, f"Sign-in failed. Status code: {signin_response.status_code}"
        signin_json = signin_response.json()
        token = signin_json.get("token")
        assert token, "Token not found in sign-in response"
    except Exception as e:
        assert False, f"Exception during sign-in: {str(e)}"

    # Step 2: Test GET /api/auth/me with valid Bearer token in Authorization header
    headers = {"Authorization": f"Bearer {token}"}
    try:
        auth_me_response = requests.get(AUTH_ME_URL, headers=headers, timeout=TIMEOUT)
        assert auth_me_response.status_code == 200, f"Expected 200 OK for valid token, got {auth_me_response.status_code}"
        user_data = auth_me_response.json()
        # Verify user_data has 'email' field (may be nested in a user object)
        assert isinstance(user_data, dict), "User data should be a JSON object"
        # If response is like signin response, it might contain 'user' key
        if "email" in user_data:
            email_value = user_data.get("email")
        elif "user" in user_data and isinstance(user_data["user"], dict):
            email_value = user_data["user"].get("email")
        else:
            email_value = None
        assert email_value, "User data missing 'email'"
        assert email_value.lower() == EMAIL.lower(), "Returned email does not match signed-in user email"
    except Exception as e:
        assert False, f"Exception during GET /api/auth/me with valid token: {str(e)}"

    # Step 3: Test GET /api/auth/me with missing Authorization header
    try:
        no_auth_response = requests.get(AUTH_ME_URL, timeout=TIMEOUT)
        assert no_auth_response.status_code == 401, f"Expected 401 Unauthorized for missing token, got {no_auth_response.status_code}"
    except Exception as e:
        assert False, f"Exception during GET /api/auth/me with missing token: {str(e)}"

    # Step 4: Test GET /api/auth/me with invalid Authorization header
    invalid_headers = {"Authorization": "Bearer invalid.token.here"}
    try:
        invalid_auth_response = requests.get(AUTH_ME_URL, headers=invalid_headers, timeout=TIMEOUT)
        assert invalid_auth_response.status_code == 401, f"Expected 401 Unauthorized for invalid token, got {invalid_auth_response.status_code}"
    except Exception as e:
        assert False, f"Exception during GET /api/auth/me with invalid token: {str(e)}"


test_get_api_auth_me_return_current_user_data_from_bearer_jwt()