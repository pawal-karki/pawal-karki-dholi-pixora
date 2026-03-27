import requests

BASE_URL = "http://localhost:3000"
SIGNIN_URL = f"{BASE_URL}/api/auth/signin"
CREATE_SUBSCRIPTION_SESSION_URL = f"{BASE_URL}/api/stripe/create-subscription-session"
TIMEOUT = 30


def test_post_api_stripe_create_subscription_session_validation():
    # Test without auth - expect 401
    response_no_auth = requests.post(
        CREATE_SUBSCRIPTION_SESSION_URL,
        json={
            "agencyId": "some-agency-id",
            "priceId": "some-price-id",
            "successUrl": "https://example.com/success",
            "cancelUrl": "https://example.com/cancel"
        },
        timeout=TIMEOUT
    )
    assert response_no_auth.status_code == 401, f"Expected 401 Unauthorized without auth, got {response_no_auth.status_code}"

    # Sign in to get cookie auth_token
    signin_payload = {"email": "test_pawal@yopmail.com", "password": "Wlink123"}
    signin_response = requests.post(SIGNIN_URL, json=signin_payload, timeout=TIMEOUT)
    assert signin_response.status_code == 200, f"Sign in failed with status {signin_response.status_code}"
    signin_json = signin_response.json()
    assert "token" in signin_json, "Sign in response missing token"
    token = signin_json["token"]
    cookies = {"auth_token": token}

    # Test with auth but missing required fields (empty body)
    response_missing_fields = requests.post(
        CREATE_SUBSCRIPTION_SESSION_URL,
        json={},  # No fields
        cookies=cookies,
        timeout=TIMEOUT
    )
    assert response_missing_fields.status_code == 400, f"Expected 400 Bad Request for missing fields, got {response_missing_fields.status_code}"

    # Test with auth but partially missing fields
    partial_payloads = [
        {"priceId": "price_123", "successUrl": "https://example.com/success", "cancelUrl": "https://example.com/cancel"},  # missing agencyId
        {"agencyId": "agency_123", "successUrl": "https://example.com/success", "cancelUrl": "https://example.com/cancel"},  # missing priceId
        {"agencyId": "agency_123", "priceId": "price_123", "cancelUrl": "https://example.com/cancel"},  # missing successUrl
        {"agencyId": "agency_123", "priceId": "price_123", "successUrl": "https://example.com/success"},  # missing cancelUrl
    ]

    for payload in partial_payloads:
        resp = requests.post(
            CREATE_SUBSCRIPTION_SESSION_URL,
            json=payload,
            cookies=cookies,
            timeout=TIMEOUT
        )
        assert resp.status_code == 400, (
            f"Expected 400 Bad Request for missing fields in payload {payload}, got {resp.status_code}"
        )


test_post_api_stripe_create_subscription_session_validation()