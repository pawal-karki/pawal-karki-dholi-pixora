import requests

BASE_URL = "http://localhost:3000"
SIGNIN_PATH = "/api/auth/signin"
TIMEOUT = 30


def test_post_api_auth_signin_authenticate_user():
    signin_url = BASE_URL + SIGNIN_PATH
    headers = {"Content-Type": "application/json"}

    # Test valid credentials
    valid_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "Wlink123"
    }
    try:
        resp = requests.post(signin_url, json=valid_payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 OK for valid signin but got {resp.status_code}"
        json_data = resp.json()
        assert "token" in json_data and isinstance(json_data["token"], str) and len(json_data["token"]) > 0, \
            "Response missing valid 'token'"
        assert "user" in json_data and isinstance(json_data["user"], dict), "Response missing valid 'user' object"
    except requests.RequestException as e:
        assert False, f"RequestException during valid signin test: {e}"

    # Test invalid password
    invalid_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "WrongPassword123"
    }
    try:
        resp = requests.post(signin_url, json=invalid_payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 401, f"Expected 401 Unauthorized for invalid password but got {resp.status_code}"
    except requests.RequestException as e:
        assert False, f"RequestException during invalid password signin test: {e}"


test_post_api_auth_signin_authenticate_user()