import requests

BASE_URL = "http://localhost:3001"
FORGOT_PASSWORD_ENDPOINT = "/api/auth/forgot-password"
TIMEOUT = 30


def test_post_api_auth_forgot_password_send_password_reset_otp_to_email():
    headers = {"Content-Type": "application/json"}

    # Test with a valid known email - expect 200 and message indicating OTP sent
    valid_email_payload = {"email": "test_pawal@yopmail.com"}
    try:
        response = requests.post(
            BASE_URL + FORGOT_PASSWORD_ENDPOINT,
            json=valid_email_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
    except requests.RequestException as e:
        assert False, f"Request failed for valid email test: {e}"

    assert response.status_code == 200, f"Expected 200 OK for known email, got {response.status_code}"
    try:
        json_resp = response.json()
    except Exception:
        assert False, "Response is not valid JSON for known email test"

    assert "message" in json_resp, "Response JSON missing 'message' for known email test"
    assert isinstance(json_resp["message"], str), "'message' should be a string in known email test"
    assert "otp" in json_resp["message"].lower() or "sent" in json_resp["message"].lower(), \
        "Response message should indicate OTP sent for known email test"

    # Test with an unknown email - expect 200 (anti-enumeration)
    unknown_email_payload = {"email": "unknown_email_for_test_abcdef@yopmail.com"}
    try:
        response_unknown = requests.post(
            BASE_URL + FORGOT_PASSWORD_ENDPOINT,
            json=unknown_email_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
    except requests.RequestException as e:
        assert False, f"Request failed for unknown email test: {e}"

    assert response_unknown.status_code == 200, f"Expected 200 OK for unknown email (anti-enumeration), got {response_unknown.status_code}"
    try:
        json_resp_unknown = response_unknown.json()
    except Exception:
        assert False, "Response is not valid JSON for unknown email test"

    assert "message" in json_resp_unknown, "Response JSON missing 'message' for unknown email test"
    assert isinstance(json_resp_unknown["message"], str), "'message' should be a string in unknown email test"
    # Message may be generic or say user not found, but status is 200 per instructions


test_post_api_auth_forgot_password_send_password_reset_otp_to_email()