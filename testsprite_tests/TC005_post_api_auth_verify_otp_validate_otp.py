import requests

BASE_URL = "http://localhost:3000"
AUTH_TOKEN_COOKIE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZGY0YWJhNi1iMGFlLTQ4MTUtYWQ0Mi02Mzk1NWM2NTQzMDciLCJlbWFpbCI6InRlc3RfcGF3YWxAeW9wbWFpbC5jb20iLCJyb2xlIjoiQUdFTkNZX09XTkVSIiwiaWF0IjoxNzc0Njg4MjU1LCJleHAiOjE3NzUyOTMwNTV9.LFtQEgaHNMtNyMuaVMA6aEj92lbRUs6UPJy0y4I3BI0"
VERIFY_OTP_ENDPOINT = f"{BASE_URL}/api/auth/verify-otp"
EMAIL = "test_pawal@yopmail.com"
INVALID_OTP = "000000"
TIMEOUT = 30

def test_post_api_auth_verify_otp_invalid():
    headers = {
        "Content-Type": "application/json",
    }
    payload = {
        "email": EMAIL,
        "otp": INVALID_OTP
    }
    try:
        response = requests.post(
            VERIFY_OTP_ENDPOINT,
            json=payload,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 400, f"Expected status code 400, got {response.status_code}"
    try:
        json_resp = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    error_msgs = []
    if isinstance(json_resp, dict):
        if "message" in json_resp:
            error_msgs.append(json_resp["message"])
        if "error" in json_resp:
            error_msgs.append(json_resp["error"])
        if "detail" in json_resp:
            error_msgs.append(json_resp["detail"])

    combined_errors = " ".join(error_msgs).lower()
    assert "invalid" in combined_errors and "otp" in combined_errors, \
        f"Expected error message containing 'invalid' and 'otp', got: {json_resp}"

test_post_api_auth_verify_otp_invalid()
