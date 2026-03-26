import requests

BASE_URL = "http://localhost:3001"
VERIFY_OTP_ENDPOINT = "/api/auth/verify-otp"
TIMEOUT = 30

def test_post_api_auth_verify_otp_invalid():
    url = BASE_URL + VERIFY_OTP_ENDPOINT
    payload = {
        "email": "test_pawal@yopmail.com",
        "otp": "invalid_otp_code_123"
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"

    assert response.status_code == 400, f"Expected status code 400, got {response.status_code}"
    try:
        json_data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"
    assert "Invalid OTP" in response.text or ("error" in json_data and "otp" in json_data.get("error", "").lower()), \
        "Response does not indicate invalid OTP error"

test_post_api_auth_verify_otp_invalid()