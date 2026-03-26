import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_post_api_auth_reset_password_using_reset_jwt():
    signin_url = f"{BASE_URL}/api/auth/signin"
    reset_password_url = f"{BASE_URL}/api/auth/reset-password"
    signin_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "Wlink123"
    }

    # 1. Sign in to get JWT token
    try:
        signin_resp = requests.post(signin_url, json=signin_payload, timeout=TIMEOUT)
        assert signin_resp.status_code == 200, f"Signin failed with status {signin_resp.status_code}"
        signin_json = signin_resp.json()
        token = signin_json.get("token")
        assert token, "No token found in signin response"

        # According to instructions, for password reset endpoint auth uses Cookie: auth_token=<jwt>
        cookies = {"auth_token": token}

        # 2. Test invalid reset password token (negative case) - since real reset token not available
        invalid_reset_token = "invalid.or.expired.token"
        reset_payload_invalid = {
            "token": invalid_reset_token,
            "password": "NewPassword123!"
        }
        resp_invalid = requests.post(reset_password_url, json=reset_payload_invalid, cookies=cookies, timeout=TIMEOUT)
        assert resp_invalid.status_code == 400, f"Expected 400 for invalid token but got {resp_invalid.status_code}"
        resp_invalid_json = resp_invalid.json()
        # Check for indication of invalid or expired token in response content if available
        assert "invalid" in str(resp_invalid_json).lower() or "expired" in str(resp_invalid_json).lower()

        # 3. According to instructions and PRD, cannot test valid reset token flow (no real reset token).
        # So the positive case is skipped.

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_auth_reset_password_using_reset_jwt()