import requests

BASE_URL = "http://localhost:3000"
USER_EMAIL = "test_pawal@yopmail.com"
USER_PASSWORD = "Wlink123"
VERIFY_OTP_ENDPOINT = "/api/auth/verify-otp"
SIGNIN_ENDPOINT = "/api/auth/signin"
TIMEOUT = 30


def test_post_api_auth_verify_otp_with_invalid_otp():
    # First, sign in to get auth token cookie if needed (though verify-otp does NOT require auth)
    signin_resp = requests.post(
        BASE_URL + SIGNIN_ENDPOINT,
        json={"email": USER_EMAIL, "password": USER_PASSWORD},
        timeout=TIMEOUT,
    )
    assert signin_resp.status_code == 200, f"Sign in failed: {signin_resp.text}"
    signin_data = signin_resp.json()
    token = signin_data.get("token")
    assert token and isinstance(token, str), "Sign in token missing or invalid"

    headers = {
        'Content-Type': 'application/json',
    }

    # Test case 1: invalid OTP code "000000" with valid email
    payload_invalid_otp = {"email": USER_EMAIL, "otp": "000000"}
    resp_invalid_otp = requests.post(
        BASE_URL + VERIFY_OTP_ENDPOINT, json=payload_invalid_otp, headers=headers, timeout=TIMEOUT
    )
    assert resp_invalid_otp.status_code == 400, (
        f"Expected 400 for invalid OTP, got {resp_invalid_otp.status_code}: {resp_invalid_otp.text}"
    )
    resp_json = resp_invalid_otp.json()
    assert (
        "invalid" in str(resp_json).lower() and "otp" in str(resp_json).lower()
    ), f"Response does not indicate invalid OTP: {resp_invalid_otp.text}"

    # Test case 2: missing email field (only otp provided)
    payload_missing_email = {"otp": "000000"}
    resp_missing_email = requests.post(
        BASE_URL + VERIFY_OTP_ENDPOINT, json=payload_missing_email, headers=headers, timeout=TIMEOUT
    )
    assert resp_missing_email.status_code == 400, (
        f"Expected 400 for missing email, got {resp_missing_email.status_code}: {resp_missing_email.text}"
    )

    # Test case 3: missing otp field (only email provided)
    payload_missing_otp = {"email": USER_EMAIL}
    resp_missing_otp = requests.post(
        BASE_URL + VERIFY_OTP_ENDPOINT, json=payload_missing_otp, headers=headers, timeout=TIMEOUT
    )
    assert resp_missing_otp.status_code == 400, (
        f"Expected 400 for missing otp, got {resp_missing_otp.status_code}: {resp_missing_otp.text}"
    )


test_post_api_auth_verify_otp_with_invalid_otp()