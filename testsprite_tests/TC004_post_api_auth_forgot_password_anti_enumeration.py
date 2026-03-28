import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_auth_forgot_password_anti_enumeration():
    url = f"{BASE_URL}/api/auth/forgot-password"
    headers = {'Content-Type': 'application/json'}

    # Known email test
    known_email_payload = {"email": "test_pawal@yopmail.com"}
    try:
        resp_known = requests.post(url, json=known_email_payload, headers=headers, timeout=TIMEOUT)
        assert resp_known.status_code == 200, f"Expected 200 for known email, got {resp_known.status_code}"
        json_resp_known = resp_known.json()
        # Expect response to have a message indicating OTP sent (or similar)
        assert isinstance(json_resp_known, dict), "Response is not a JSON object"
        assert "message" in json_resp_known and isinstance(json_resp_known["message"], str), "Missing or invalid 'message' in known email response"
    except requests.RequestException as e:
        assert False, f"HTTP request failed for known email: {e}"

    # Unknown email test (anti-enumeration)
    unknown_email_payload = {"email": "randomxyz@nowhere.com"}
    try:
        resp_unknown = requests.post(url, json=unknown_email_payload, headers=headers, timeout=TIMEOUT)
        assert resp_unknown.status_code == 200, f"Expected 200 for unknown email (anti-enumeration), got {resp_unknown.status_code}"
        json_resp_unknown = resp_unknown.json()
        assert isinstance(json_resp_unknown, dict), "Response is not a JSON object"
        assert "message" in json_resp_unknown and isinstance(json_resp_unknown["message"], str), "Missing or invalid 'message' in unknown email response"
    except requests.RequestException as e:
        assert False, f"HTTP request failed for unknown email: {e}"

    # Missing email field (should return 400)
    missing_email_payload = {}
    try:
        resp_missing = requests.post(url, json=missing_email_payload, headers=headers, timeout=TIMEOUT)
        assert resp_missing.status_code == 400, f"Expected 400 for missing email, got {resp_missing.status_code}"
    except requests.RequestException as e:
        assert False, f"HTTP request failed for missing email field: {e}"

test_post_api_auth_forgot_password_anti_enumeration()