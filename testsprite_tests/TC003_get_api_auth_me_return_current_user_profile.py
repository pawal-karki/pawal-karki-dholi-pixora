import requests

BASE_URL = "http://localhost:3000"
AUTH_TOKEN = ("auth_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
                         "eyJ1c2VySWQiOiJiZGY0YWJhNi1iMGFlLTQ4MTUtYWQ0Mi02Mzk1NWM2NTQzMDciLCJlbWFpbCI6InRlc3RfcGF3YWxAeW9wbWFpbC5jb20iLCJyb2xlIjoiQUdFTkNZX09XTkVSIiwiaWF0IjoxNzc0Njg4MjU1LCJleHAiOjE3NzUyOTMwNTV9."
                         "LFtQEgaHNMtNyMuaVMA6aEj92lbRUs6UPJy0y4I3BI0")

def test_get_api_auth_me_with_and_without_auth_token_cookie():
    # Test with valid Bearer token in Authorization header
    headers = {"Authorization": f"Bearer {AUTH_TOKEN[1]}"}
    try:
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to /api/auth/me with valid Authorization header failed: {e}"

    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
    data = response.json()
    # Validate user profile contains required fields and correct email and role from token payload
    assert isinstance(data, dict), "Response JSON is not an object"
    assert "id" in data and isinstance(data["id"], str) and data["id"], "User id missing or invalid"
    assert "name" in data and isinstance(data["name"], str) and data["name"], "User name missing or invalid"
    assert "email" in data and data["email"] == "test_pawal@yopmail.com", "Email does not match"
    assert "role" in data and data["role"] == "AGENCY_OWNER", "Role does not match"

    # Test request without Authorization header
    try:
        response_no_auth = requests.get(f"{BASE_URL}/api/auth/me", timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to /api/auth/me without Authorization header failed: {e}"

    assert response_no_auth.status_code == 401, f"Expected 401 Unauthorized without Authorization header, got {response_no_auth.status_code}"

test_get_api_auth_me_with_and_without_auth_token_cookie()