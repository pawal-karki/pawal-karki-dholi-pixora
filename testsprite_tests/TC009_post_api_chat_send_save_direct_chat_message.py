import requests

BASE_URL = "http://localhost:3000"


def test_post_api_chat_send_auth_and_validation():
    signin_url = f"{BASE_URL}/api/auth/signin"
    chat_send_url = f"{BASE_URL}/api/chat/send"

    signin_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "Wlink123"
    }

    timeout = 30

    # Attempt POST /api/chat/send without auth - expect 401 Unauthorized
    try:
        resp = requests.post(
            chat_send_url,
            json={"conversationId": "dummy", "content": "Hello"},
            timeout=timeout,
        )
    except requests.RequestException as e:
        raise AssertionError(f"Request failed: {e}")
    assert resp.status_code == 401, f"Expected 401 Unauthorized without auth, got {resp.status_code}"

    # Sign in to get auth token
    try:
        signin_resp = requests.post(signin_url, json=signin_payload, timeout=timeout)
    except requests.RequestException as e:
        raise AssertionError(f"Signin request failed: {e}")

    assert signin_resp.status_code == 200, f"Signin failed with status {signin_resp.status_code}"
    signin_data = signin_resp.json()
    assert "token" in signin_data, "Signin response missing 'token'"
    token = signin_data["token"]

    # Set auth cookie with the token
    cookies = {"auth_token": token}

    # POST /api/chat/send with auth but missing both content and conversationId - expect 400
    try:
        resp = requests.post(chat_send_url, cookies=cookies, json={}, timeout=timeout)
    except requests.RequestException as e:
        raise AssertionError(f"Request failed: {e}")
    assert resp.status_code == 400, f"Expected 400 Bad Request for missing content/conversationId, got {resp.status_code}"

    # POST /api/chat/send with auth but missing content only - expect 400
    try:
        resp = requests.post(chat_send_url, cookies=cookies, json={"conversationId": "abc123"}, timeout=timeout)
    except requests.RequestException as e:
        raise AssertionError(f"Request failed: {e}")
    assert resp.status_code == 400, f"Expected 400 Bad Request for missing content, got {resp.status_code}"

    # POST /api/chat/send with auth but missing conversationId only - expect 400
    try:
        resp = requests.post(chat_send_url, cookies=cookies, json={"content": "Hello"}, timeout=timeout)
    except requests.RequestException as e:
        raise AssertionError(f"Request failed: {e}")
    assert resp.status_code == 400, f"Expected 400 Bad Request for missing conversationId, got {resp.status_code}"


test_post_api_chat_send_auth_and_validation()