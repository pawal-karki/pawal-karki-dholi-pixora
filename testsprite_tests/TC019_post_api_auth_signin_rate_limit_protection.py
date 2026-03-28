import requests
from time import sleep

BASE_URL = "http://localhost:3000"
SIGNIN_ENDPOINT = "/api/auth/signin"
TIMEOUT = 30

def test_post_api_auth_signin_rate_limit_protection():
    url = f"{BASE_URL}{SIGNIN_ENDPOINT}"
    headers = {'Content-Type': 'application/json'}
    invalid_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "WrongPassword123!"
    }
    max_attempts = 20
    rate_limit_triggered = False

    for attempt in range(max_attempts):
        try:
            response = requests.post(url, json=invalid_payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request failed unexpectedly on attempt {attempt + 1}: {str(e)}"

        # Acceptable responses before rate limiting: 401 Unauthorized
        # After several failed attempts expect 429 Too Many Requests
        if response.status_code == 429:
            rate_limit_triggered = True
            break
        elif response.status_code == 401:
            continue
        else:
            # Unexpected status code
            assert False, f"Unexpected status code {response.status_code} on attempt {attempt +1}, response: {response.text}"

        # Slight delay to simulate rapid but not simultaneous requests and avoid network buffering issues
        sleep(0.1)

    assert rate_limit_triggered, "Expected 429 Too Many Requests status code after multiple failed signin attempts but did not receive it."

test_post_api_auth_signin_rate_limit_protection()
