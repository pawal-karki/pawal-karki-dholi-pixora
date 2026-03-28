import requests

BASE_URL = "http://localhost:3000"
SIGNIN_URL = f"{BASE_URL}/api/auth/signin"
CHAT_SEND_URL = f"{BASE_URL}/api/chat/send"
EMAIL = "test_pawal@yopmail.com"
PASSWORD = "Wlink123"
TIMEOUT = 30


def test_post_api_chat_send_requires_auth_and_validates_body():
    # First get a valid auth_token cookie by signing in
    signin_payload = {"email": EMAIL, "password": PASSWORD}
    try:
        signin_resp = requests.post(SIGNIN_URL, json=signin_payload, timeout=TIMEOUT)
        assert signin_resp.status_code == 200, f"Sign in failed with status {signin_resp.status_code}"
        signin_json = signin_resp.json()
        assert "token" in signin_json and "user" in signin_json, "Signin response missing token or user"
        auth_token = signin_json["token"]

        # Test POST /api/chat/send without auth => expect 401
        resp_no_auth = requests.post(CHAT_SEND_URL, json={"conversationId": "someId", "content": "Hello"}, timeout=TIMEOUT)
        assert resp_no_auth.status_code == 401, f"Expected 401 without auth but got {resp_no_auth.status_code}"

        # Prepare headers with Cookie auth_token
        headers_auth = {"Cookie": f"auth_token={auth_token}"}

        # Test with auth_token but empty body => expect 400 due to missing required fields
        resp_empty_body = requests.post(CHAT_SEND_URL, headers=headers_auth, json={}, timeout=TIMEOUT)
        assert resp_empty_body.status_code == 400, f"Expected 400 with empty body but got {resp_empty_body.status_code}"

        # Test with auth_token but missing content (only conversationId provided)
        body_missing_content = {"conversationId": "someConversationId"}
        resp_missing_content = requests.post(CHAT_SEND_URL, headers=headers_auth, json=body_missing_content, timeout=TIMEOUT)
        assert resp_missing_content.status_code == 400, f"Expected 400 missing content but got {resp_missing_content.status_code}"

        # Test with auth_token but missing conversationId (only content provided)
        body_missing_conversation = {"content": "Hello there"}
        resp_missing_conversation = requests.post(CHAT_SEND_URL, headers=headers_auth, json=body_missing_conversation, timeout=TIMEOUT)
        assert resp_missing_conversation.status_code == 400, f"Expected 400 missing conversationId but got {resp_missing_conversation.status_code}"

    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"


test_post_api_chat_send_requires_auth_and_validates_body()