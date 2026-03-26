import requests

BASE_URL = "http://localhost:3000"
SIGNIN_EMAIL = "test_pawal@yopmail.com"
SIGNIN_PASSWORD = "Wlink123"
TIMEOUT = 30

def test_post_api_auth_reset_password_invalid_token():
    signin_url = f"{BASE_URL}/api/auth/signin"
    reset_password_url = f"{BASE_URL}/api/auth/reset-password"

    # Step 1: Sign in to obtain auth_token cookie
    signin_payload = {
        "email": SIGNIN_EMAIL,
        "password": SIGNIN_PASSWORD
    }

    try:
        signin_resp = requests.post(signin_url, json=signin_payload, timeout=TIMEOUT)
        assert signin_resp.status_code == 200, f"Signin failed with status {signin_resp.status_code}"
        signin_json = signin_resp.json()
        token = signin_json.get("token")
        assert token, "Signin response missing token"
    except requests.RequestException as e:
        assert False, f"Signin request failed: {e}"

    # Step 2: Use invalid reset token to test reset-password endpoint
    invalid_reset_token = "invalid-or-expired-token"
    reset_payload = {
        "token": invalid_reset_token,
        "password": "NewPassword123!"
    }

    headers = {
        "Cookie": f"auth_token={token}"
    }

    try:
        reset_resp = requests.post(reset_password_url, json=reset_payload, headers=headers, timeout=TIMEOUT)
        # Expect 400 Invalid or expired token
        assert reset_resp.status_code == 400, f"Expected 400 for invalid token but got {reset_resp.status_code}"
        resp_json = reset_resp.json()
        # The exact error message is not specified, but expect common error indication
        error_msgs = ["invalid", "expired", "Invalid or expired token"]
        if isinstance(resp_json, dict):
            msg_str = str(resp_json).lower()
            assert any(e in msg_str for e in error_msgs), f"Response does not indicate invalid or expired token: {resp_json}"
    except requests.RequestException as e:
        assert False, f"Reset password request failed: {e}"

test_post_api_auth_reset_password_invalid_token()