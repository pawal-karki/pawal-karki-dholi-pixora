import requests

BASE_URL = "http://localhost:3000"
SIGNIN_PATH = "/api/auth/signin"
TIMEOUT = 30


def test_post_api_auth_signin_authenticate_user_and_get_jwt():
    url = f"{BASE_URL}{SIGNIN_PATH}"
    headers = {"Content-Type": "application/json"}

    # Valid credentials test
    valid_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "Wlink123"
    }
    try:
        response = requests.post(url, json=valid_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Valid signin request failed: {e}"
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert "token" in data and isinstance(data["token"], str) and data["token"], "Missing or invalid token"
    assert "user" in data and isinstance(data["user"], dict), "Missing or invalid user object"
    user = data["user"]
    required_user_fields = {"id", "name", "email", "role"}
    for field in required_user_fields:
        assert field in user, f"User object missing field: {field}"
    assert user["email"] == valid_payload["email"], f"User email mismatch: expected {valid_payload['email']}, got {user['email']}"
    assert user["role"] == "AGENCY_OWNER", f"User role expected 'AGENCY_OWNER', got {user['role']}"

    # Wrong password test (should return 401)
    wrong_password_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "WrongPassword123"
    }
    try:
        response = requests.post(url, json=wrong_password_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Signin request with wrong password failed: {e}"
    assert response.status_code == 401, f"Expected 401 for wrong password, got {response.status_code}"

    # Nonexistent email test (should return 401)
    nonexistent_email_payload = {
        "email": "nonexistent_email_abc123@yopmail.com",
        "password": "Wlink123"
    }
    try:
        response = requests.post(url, json=nonexistent_email_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Signin request with nonexistent email failed: {e}"
    assert response.status_code == 401, f"Expected 401 for nonexistent email, got {response.status_code}"

    # Missing fields tests (should return 400)
    # Missing email
    missing_email_payload = {
        "password": "Wlink123"
    }
    try:
        response = requests.post(url, json=missing_email_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Signin request missing email failed: {e}"
    assert response.status_code == 400, f"Expected 400 for missing email, got {response.status_code}"

    # Missing password
    missing_password_payload = {
        "email": "test_pawal@yopmail.com"
    }
    try:
        response = requests.post(url, json=missing_password_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Signin request missing password failed: {e}"
    assert response.status_code == 400, f"Expected 400 for missing password, got {response.status_code}"

    # Missing both email and password (empty body)
    empty_payload = {}
    try:
        response = requests.post(url, json=empty_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Signin request empty body failed: {e}"
    assert response.status_code == 400, f"Expected 400 for missing email and password, got {response.status_code}"


test_post_api_auth_signin_authenticate_user_and_get_jwt()