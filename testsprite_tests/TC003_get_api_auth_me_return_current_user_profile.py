import requests

base_url = "http://localhost:3000"
signin_url = f"{base_url}/api/auth/signin"
me_url = f"{base_url}/api/auth/me"

def test_get_api_auth_me_return_current_user_profile():
    # First, sign in to get a valid JWT token
    signin_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "Wlink123"
    }
    try:
        signin_resp = requests.post(signin_url, json=signin_payload, timeout=30)
        assert signin_resp.status_code == 200, f"Signin failed with status {signin_resp.status_code}"
        signin_data = signin_resp.json()
        token = signin_data.get("token")
        assert token, "Token not found in signin response"
    except Exception as e:
        raise AssertionError(f"Signin step failed: {e}")

    # Test GET /api/auth/me with valid Bearer JWT token in Authorization header
    headers_valid = {
        "Authorization": f"Bearer {token}"
    }
    try:
        resp_valid = requests.get(me_url, headers=headers_valid, timeout=30)
        assert resp_valid.status_code == 200, f"Expected 200 with valid token, got {resp_valid.status_code}"
        user_profile = resp_valid.json()
        assert isinstance(user_profile, dict), "User profile response is not a JSON object"
        assert user_profile, "User profile is empty"
    except Exception as e:
        raise AssertionError(f"GET /api/auth/me with valid token failed: {e}")

    # Test GET /api/auth/me missing Authorization header returns 401
    try:
        resp_no_auth = requests.get(me_url, timeout=30)
        assert resp_no_auth.status_code == 401, f"Expected 401 without Authorization header, got {resp_no_auth.status_code}"
    except Exception as e:
        raise AssertionError(f"GET /api/auth/me without Authorization header failed: {e}")

    # Test GET /api/auth/me with invalid/malformed token returns 401
    headers_invalid_token = {
        "Authorization": "Bearer invalid.token.value"
    }
    try:
        resp_invalid = requests.get(me_url, headers=headers_invalid_token, timeout=30)
        assert resp_invalid.status_code == 401, f"Expected 401 with invalid token, got {resp_invalid.status_code}"
    except Exception as e:
        raise AssertionError(f"GET /api/auth/me with invalid token failed: {e}")

test_get_api_auth_me_return_current_user_profile()
