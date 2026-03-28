import requests

def test_post_api_auth_reset_password_invalid_token():
    base_url = "http://localhost:3000"
    url = f"{base_url}/api/auth/reset-password"
    invalid_reset_token = "invalid.or.expired.token"
    new_password = "NewPass123!"

    headers = {
        "Authorization": f"Bearer {invalid_reset_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "token": invalid_reset_token,
        "password": new_password
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 400, f"Expected status code 400 but got {response.status_code}"
    try:
        resp_json = response.json()
    except ValueError:
        resp_json = None

    if resp_json:
        error_msgs = ["invalid", "expired", "token"]
        combined_resp = str(resp_json).lower()
        assert any(msg in combined_resp for msg in error_msgs), f"Response body does not indicate invalid or expired token: {resp_json}"

test_post_api_auth_reset_password_invalid_token()