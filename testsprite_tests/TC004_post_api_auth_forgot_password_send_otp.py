import requests

BASE_URL = "http://localhost:3000"
FORGOT_PASSWORD_ENDPOINT = "/api/auth/forgot-password"
TIMEOUT = 30

def test_post_api_auth_forgot_password_send_otp():
    url = BASE_URL + FORGOT_PASSWORD_ENDPOINT
    headers = {"Content-Type": "application/json"}

    # Test known email (should return 200 with message 'OTP sent')
    known_email_payload = {"email": "test_pawal@yopmail.com"}
    try:
        resp = requests.post(url, json=known_email_payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 for known email, got {resp.status_code}"
        json_resp = resp.json()
        assert "message" in json_resp and json_resp["message"].strip().lower() == "otp sent", "Response message should be 'OTP sent'"
    except requests.RequestException as e:
        assert False, f"Request failed for known email test: {e}"

    # Test unknown email (should return 404 with 'User not found')
    unknown_email_payload = {"email": "nonexistent_email_1234@yopmail.com"}
    try:
        resp = requests.post(url, json=unknown_email_payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 404, f"Expected 404 for unknown email, got {resp.status_code}"
        json_resp = resp.json()
        assert "User not found" in json_resp.get("message", ""), "Response message should indicate 'User not found'"
    except requests.RequestException as e:
        assert False, f"Request failed for unknown email test: {e}"

    # Test missing email field (should return 400)
    missing_email_payload = {}
    try:
        resp = requests.post(url, json=missing_email_payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 400, f"Expected 400 for missing email, got {resp.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed for missing email test: {e}"

test_post_api_auth_forgot_password_send_otp()
