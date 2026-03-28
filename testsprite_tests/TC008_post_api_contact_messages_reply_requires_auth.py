import requests

BASE_URL = "http://localhost:3000"
AUTH_SIGNIN_URL = f"{BASE_URL}/api/auth/signin"
CONTACT_MESSAGES_REPLY_URL = f"{BASE_URL}/api/contact-messages/reply"

TEST_USER_EMAIL = "test_pawal@yopmail.com"
TEST_USER_PASSWORD = "Wlink123"

def test_post_api_contact_messages_reply_requires_auth():
    timeout = 30
    # 1) Test POST /api/contact-messages/reply without auth cookie -> expect 401 Unauthorized
    no_auth_payload = {
        "messageId": "dummy-message-id",
        "replySubject": "Test reply subject",
        "replyBody": "Test reply body"
    }
    try:
        response = requests.post(CONTACT_MESSAGES_REPLY_URL, json=no_auth_payload, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request failed without auth cookie: {e}"
    assert response.status_code == 401, f"Expected 401 Unauthorized without auth cookie, got {response.status_code}"


    # 2) Get valid auth_token by signing in
    signin_payload = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    try:
        signin_response = requests.post(AUTH_SIGNIN_URL, json=signin_payload, timeout=timeout)
        signin_response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Sign in failed: {e}"
    signin_data = signin_response.json()
    assert "token" in signin_data, "Signin response missing token"
    auth_token = signin_data["token"]

    # 3) Test POST /api/contact-messages/reply with valid auth_token cookie but missing messageId expect 400
    cookies = {
        "auth_token": auth_token
    }
    invalid_payload = {
        # "messageId": missing on purpose
        "replySubject": "Test reply subject",
        "replyBody": "Test reply body"
    }
    try:
        resp = requests.post(CONTACT_MESSAGES_REPLY_URL, json=invalid_payload, cookies=cookies, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request with auth_token cookie and missing messageId failed: {e}"
    assert resp.status_code == 400, f"Expected 400 Bad Request when missing messageId with auth, got {resp.status_code}"

test_post_api_contact_messages_reply_requires_auth()