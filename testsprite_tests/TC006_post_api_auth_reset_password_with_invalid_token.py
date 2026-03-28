import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_auth_reset_password_with_invalid_token():
    url = f"{BASE_URL}/api/auth/reset-password"
    headers = {
        "Content-Type": "application/json",
        # The reset-password endpoint requires auth via Cookie with JWT as per PRD, so we include a dummy invalid token cookie
        # But to test invalid token behavior, we must provide Authorization: Bearer according to PRD? 
        # PRD states: "auth_required: true" and "reset-password" requires Authorization: Bearer <resetToken>
        # So set Authorization header with Bearer invalid_token_123
        # We will do different calls with different payloads as well.
    }

    # 1) Test with fake resetToken=invalid_token_123 and newPassword=NewPass123 (expect 400)
    invalid_token = "invalid_token_123"
    json_data = {
        "token": invalid_token,
        "password": "NewPass123"
    }
    headers_invalid_token = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {invalid_token}"
    }
    resp = requests.post(url, headers=headers_invalid_token, json=json_data, timeout=TIMEOUT)
    assert resp.status_code == 400, f"Expected status 400 for invalid token, got {resp.status_code}"
    try:
        resp_json = resp.json()
        # Expect error about invalid or expired token
        assert ("error" in resp_json and ("invalid" in resp_json["error"].lower() or "expired" in resp_json["error"].lower())) or \
               ("message" in resp_json and ("invalid" in resp_json["message"].lower() or "expired" in resp_json["message"].lower()))
    except Exception:
        # If no JSON or no error key, still consider test failed
        assert False, "Response JSON did not contain expected error message about invalid or expired token"

    # 2) Test missing resetToken (token field) - expect 400
    json_data_missing_token = {
        # "token" missing
        "password": "NewPass123"
    }
    # No Authorization header or maybe empty or missing too
    resp_missing_token = requests.post(url, headers={"Content-Type": "application/json"}, json=json_data_missing_token, timeout=TIMEOUT)
    assert resp_missing_token.status_code == 400, f"Expected status 400 for missing token, got {resp_missing_token.status_code}"

    # 3) Test missing newPassword (password field) - expect 400
    json_data_missing_password = {
        "token": invalid_token
        # password missing
    }
    resp_missing_password = requests.post(url, headers=headers_invalid_token, json=json_data_missing_password, timeout=TIMEOUT)
    assert resp_missing_password.status_code == 400, f"Expected status 400 for missing password, got {resp_missing_password.status_code}"

test_post_api_auth_reset_password_with_invalid_token()