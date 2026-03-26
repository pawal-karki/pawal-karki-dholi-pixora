import requests

BASE_URL = "http://localhost:3000"

def test_post_api_auth_signin_authenticate_user():
    signin_url = f"{BASE_URL}/api/auth/signin"
    timeout = 30

    valid_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "Wlink123"
    }

    invalid_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "WrongPassword123"
    }

    # Test valid credentials signin
    try:
        response_valid = requests.post(signin_url, json=valid_payload, timeout=timeout)
        assert response_valid.status_code == 200, f"Expected 200 OK but got {response_valid.status_code}"
        json_valid = response_valid.json()
        assert "token" in json_valid and isinstance(json_valid["token"], str) and len(json_valid["token"]) > 0, "Missing or invalid 'token'"
        assert "user" in json_valid and isinstance(json_valid["user"], dict), "Missing or invalid 'user' object"
    except requests.RequestException as e:
        assert False, f"Request Exception occurred during valid signin: {e}"

    # Test invalid password signin
    try:
        response_invalid = requests.post(signin_url, json=invalid_payload, timeout=timeout)
        assert response_invalid.status_code == 401, f"Expected 401 Unauthorized but got {response_invalid.status_code}"
        # Typically error message should be present but not guaranteed, no strict check on body required
    except requests.RequestException as e:
        assert False, f"Request Exception occurred during invalid signin: {e}"

test_post_api_auth_signin_authenticate_user()