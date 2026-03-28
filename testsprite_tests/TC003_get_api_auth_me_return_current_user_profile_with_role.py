import requests

BASE_URL = "http://localhost:3000"
EMAIL = "test_pawal@yopmail.com"
PASSWORD = "Wlink123"
TIMEOUT = 30

def test_get_api_auth_me_return_current_user_profile_with_role():
    signin_url = f"{BASE_URL}/api/auth/signin"
    me_url = f"{BASE_URL}/api/auth/me"

    # Step 1: Sign in to obtain valid JWT token
    signin_payload = {"email": EMAIL, "password": PASSWORD}
    try:
        signin_resp = requests.post(signin_url, json=signin_payload, timeout=TIMEOUT)
        assert signin_resp.status_code == 200, f"Signin failed with status {signin_resp.status_code}"
        signin_data = signin_resp.json()
        token = signin_data.get("token")
        assert token and isinstance(token, str), "Token missing or invalid in signin response"
    except Exception as e:
        raise AssertionError(f"Sign in request failed: {e}")

    headers_valid = {"Authorization": f"Bearer {token}"}

    # Test 1: Valid Authorization header returns 200 with correct user info and role=AGENCY_OWNER
    try:
        resp = requests.get(me_url, headers=headers_valid, timeout=TIMEOUT)
    except Exception as e:
        raise AssertionError(f"GET /api/auth/me request with valid token failed: {e}")

    assert resp.status_code == 200, f"Expected 200 for valid token, got {resp.status_code}"
    try:
        json_resp = resp.json()
    except Exception as e:
        raise AssertionError(f"GET /api/auth/me response invalid JSON: {e}")

    # The user object may be nested inside 'user' key or directly returned
    if isinstance(json_resp, dict) and 'user' in json_resp:
        user_obj = json_resp.get('user')
    else:
        user_obj = json_resp

    # Validate user fields existence and types
    for field in ["id", "name", "email", "role"]:
        assert field in user_obj, f"Field '{field}' missing from user profile"
        assert isinstance(user_obj[field], str), f"Field '{field}' is not string type"
    # Validate role is AGENCY_OWNER
    assert user_obj["role"] == "AGENCY_OWNER", f"User role expected 'AGENCY_OWNER', got '{user_obj['role']}'"

    # Test 2: Missing Authorization header returns 401
    try:
        resp = requests.get(me_url, timeout=TIMEOUT)
    except Exception as e:
        raise AssertionError(f"GET /api/auth/me request without auth header failed: {e}")
    assert resp.status_code == 401, f"Expected 401 for missing Authorization header, got {resp.status_code}"

    # Test 3: Invalid/garbage token returns 401
    invalid_headers = {"Authorization": "Bearer garbage.invalid.token"}
    try:
        resp = requests.get(me_url, headers=invalid_headers, timeout=TIMEOUT)
    except Exception as e:
        raise AssertionError(f"GET /api/auth/me request with invalid token failed: {e}")
    assert resp.status_code == 401, f"Expected 401 for invalid token, got {resp.status_code}"

    # Test 4: Expired token returns 401
    expired_token = (
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
        "eyJ1c2VySWQiOiJiZGY0YWJhNi1iMGFlLTQ4MTUtYWQ0Mi02Mzk1NWM2NTQzMDciLCJlbWFpbCI6InRlc3RfcGF3YWxAeW9wbWFpbC5jb20iLCJyb2xlIjoiQUdFTkNZX09XTkVSIiwiaWF0IjoxNzc0Njg4MjU1LCJleHAiOjE3NzUyOTMwNTV9."
        "LFtQEgaHNMtNyMuaVMA6aEj92lbRUs6UPJy0y4I3BI0"
    )
    expired_headers = {"Authorization": f"Bearer {expired_token}"}
    try:
        resp = requests.get(me_url, headers=expired_headers, timeout=TIMEOUT)
    except Exception as e:
        raise AssertionError(f"GET /api/auth/me request with expired token failed: {e}")
    assert resp.status_code == 401, f"Expected 401 for expired token, got {resp.status_code}"

test_get_api_auth_me_return_current_user_profile_with_role()
