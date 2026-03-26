import requests

BASE_URL = "http://localhost:3000"
SIGNIN_URL = f"{BASE_URL}/api/auth/signin"
VERIFY_OTP_URL = f"{BASE_URL}/api/auth/verify-otp"
TIMEOUT = 30

def test_post_api_auth_verify_otp_invalid_otp():
    signin_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "Wlink123"
    }
    # Sign in to get JWT token
    try:
        signin_resp = requests.post(SIGNIN_URL, json=signin_payload, timeout=TIMEOUT)
        assert signin_resp.status_code == 200, f"Sign-in failed with status {signin_resp.status_code}"
        token = signin_resp.json().get("token")
        assert token, "No token in sign-in response"
    except Exception as e:
        raise AssertionError(f"Sign-in request failed: {e}")

    # Prepare headers; no auth needed for verify-otp as per schema, but just in case
    headers = {
        "Content-Type": "application/json",
    }
    # Use a known email and an invalid OTP
    verify_otp_payload = {
        "email": "test_pawal@yopmail.com",
        "otp": "000000"  # Intentionally invalid OTP
    }
    try:
        resp = requests.post(VERIFY_OTP_URL, json=verify_otp_payload, headers=headers, timeout=TIMEOUT)
    except Exception as e:
        raise AssertionError(f"POST /api/auth/verify-otp request failed: {e}")

    # Assert response status and error message
    assert resp.status_code == 400, f"Expected status 400 for invalid OTP but got {resp.status_code}"
    # The body is expected to indicate 'Invalid OTP' - check JSON message or text
    try:
        resp_json = resp.json()
        # Accept either a field error or a general message containing "Invalid"
        error_msgs = []
        if isinstance(resp_json, dict):
            for v in resp_json.values():
                if isinstance(v, str):
                    error_msgs.append(v.lower())
        error_text = resp.text.lower() if not error_msgs else " ".join(error_msgs)
        assert "invalid" in error_text and "otp" in error_text, f"Response does not indicate invalid OTP: {resp.text}"
    except Exception:
        # If response is not JSON, just check plain text
        assert "invalid" in resp.text.lower() and "otp" in resp.text.lower(), f"Response does not indicate invalid OTP: {resp.text}"

test_post_api_auth_verify_otp_invalid_otp()