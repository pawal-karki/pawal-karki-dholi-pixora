import requests

BASE_URL = "http://localhost:3000"
FORGOT_PASSWORD_ENDPOINT = "/api/auth/forgot-password"

def test_post_api_auth_forgot_password_send_otp():
    headers = {
        "Content-Type": "application/json"
    }
    timeout = 30

    # Test known email (expect 200)
    known_email_payload = {"email": "test_pawal@yopmail.com"}
    try:
        resp_known = requests.post(
            BASE_URL + FORGOT_PASSWORD_ENDPOINT,
            json=known_email_payload,
            headers=headers,
            timeout=timeout
        )
        assert resp_known.status_code == 200, f"Expected 200 for known email, got {resp_known.status_code}"
        json_known = resp_known.json()
        assert "message" in json_known and "otp" not in json_known, "Expected message key with OTP not included"
    except requests.RequestException as e:
        assert False, f"Request failed for known email test: {e}"

    # Test unknown email (expect 200 per anti-enumeration pattern)
    unknown_email_payload = {"email": "unknown_email_123456@yopmail.com"}
    try:
        resp_unknown = requests.post(
            BASE_URL + FORGOT_PASSWORD_ENDPOINT,
            json=unknown_email_payload,
            headers=headers,
            timeout=timeout
        )
        assert resp_unknown.status_code == 200, f"Expected 200 for unknown email, got {resp_unknown.status_code}"
        json_unknown = resp_unknown.json()
        assert "message" in json_unknown, "Expected message key in response for unknown email"
    except requests.RequestException as e:
        assert False, f"Request failed for unknown email test: {e}"

    # Test missing email field (expect 400 or 500)
    missing_email_payload = {}
    try:
        resp_missing = requests.post(
            BASE_URL + FORGOT_PASSWORD_ENDPOINT,
            json=missing_email_payload,
            headers=headers,
            timeout=timeout
        )
        assert resp_missing.status_code in (400, 500), f"Expected 400 or 500 for missing email, got {resp_missing.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed for missing email test: {e}"

test_post_api_auth_forgot_password_send_otp()