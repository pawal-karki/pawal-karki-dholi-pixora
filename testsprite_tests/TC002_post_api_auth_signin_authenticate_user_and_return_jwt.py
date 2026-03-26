import requests

BASE_URL = "http://localhost:3001"
SIGNIN_ENDPOINT = "/api/auth/signin"
TIMEOUT = 30

def test_post_api_auth_signin_authenticate_user_and_return_jwt():
    signin_url = BASE_URL + SIGNIN_ENDPOINT
    headers = {"Content-Type": "application/json"}

    # Test valid signin credentials
    valid_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "Wlink123"
    }
    try:
        response = requests.post(signin_url, json=valid_payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        json_data = response.json()
        assert "token" in json_data and isinstance(json_data["token"], str) and json_data["token"], "Token missing or empty"
        assert "user" in json_data and isinstance(json_data["user"], dict), "User object missing or invalid"
    except requests.RequestException as e:
        assert False, f"Request to signin endpoint failed: {e}"

    # Test signin with incorrect password
    invalid_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "WrongPassword123!"
    }
    try:
        response = requests.post(signin_url, json=invalid_payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        json_data = response.json()
        # The error message can vary - check contains "invalid" or "Invalid credentials"
        error_message = str(json_data).lower()
        assert "invalid" in error_message or "credentials" in error_message, f"Unexpected error message: {json_data}"
    except requests.RequestException as e:
        assert False, f"Request to signin endpoint failed: {e}"


test_post_api_auth_signin_authenticate_user_and_return_jwt()