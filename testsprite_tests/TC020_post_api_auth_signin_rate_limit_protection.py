import requests
import time

BASE_URL = "http://localhost:3000"
SIGNIN_PATH = "/api/auth/signin"
EMAIL = "test_pawal@yopmail.com"
WRONG_PASSWORD = "WrongPassword123!"
TIMEOUT = 30

def test_post_api_auth_signin_rate_limit_protection():
    url = BASE_URL + SIGNIN_PATH
    headers = {'Content-Type': 'application/json'}
    payload = {"email": EMAIL, "password": WRONG_PASSWORD}

    # Send 10 rapid signin requests with wrong password
    status_codes = []
    for _ in range(10):
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
            status_codes.append(resp.status_code)
        except requests.RequestException as e:
            # If connection errors, fail immediately
            assert False, f"Request failed: {e}"

    # There should be some 429 Too Many Requests responses after limit hit
    has_429 = any(code == 429 for code in status_codes)
    # All responses should be either 401 Unauthorized or 429 Too Many Requests (no other errors expected here)
    all_expected = all(code in (401, 429) for code in status_codes)

    assert has_429, "Expected at least one 429 Too Many Requests response due to rate limiting"
    assert all_expected, f"Unexpected status codes received: {status_codes}"

test_post_api_auth_signin_rate_limit_protection()