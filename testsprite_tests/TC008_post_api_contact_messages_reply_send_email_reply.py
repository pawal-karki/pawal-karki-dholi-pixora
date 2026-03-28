import requests

BASE_URL = "http://localhost:3000"
SIGNIN_ENDPOINT = f"{BASE_URL}/api/auth/signin"
CONTACT_MESSAGES_ENDPOINT = f"{BASE_URL}/api/contact-messages"
CONTACT_MESSAGES_REPLY_ENDPOINT = f"{BASE_URL}/api/contact-messages/reply"

AUTH_EMAIL = "test_pawal@yopmail.com"
AUTH_PASSWORD = "Wlink123"
TIMEOUT = 30

def test_post_api_contact_messages_reply_send_email_reply():
    # Sign in to get token
    signin_payload = {"email": AUTH_EMAIL, "password": AUTH_PASSWORD}
    signin_resp = requests.post(SIGNIN_ENDPOINT, json=signin_payload, timeout=TIMEOUT)
    assert signin_resp.status_code == 200, f"Signing in failed: {signin_resp.text}"
    signin_json = signin_resp.json()
    token = signin_json.get("token")
    assert token is not None, "Token not found in signin response"
    auth_header = {"Authorization": f"Bearer {token}"}

    # 1. Without auth header: expect 401 Unauthorized
    without_auth_resp = requests.post(CONTACT_MESSAGES_REPLY_ENDPOINT, json={}, timeout=TIMEOUT)
    assert without_auth_resp.status_code == 401, f"Expected 401 without auth, got {without_auth_resp.status_code}"

    # 2. With auth header: need a message to reply to -> create a contact message first
    new_message_payload = {
        "name": "Test User",
        "email": "testuser@example.com",
        "subject": "Test Subject",
        "message": "This is a test message for reply"
    }
    create_msg_resp = requests.post(CONTACT_MESSAGES_ENDPOINT, json=new_message_payload, timeout=TIMEOUT)
    assert create_msg_resp.status_code == 200, f"Failed to create contact message: {create_msg_resp.text}"
    create_msg_json = create_msg_resp.json()
    assert create_msg_json.get("success") is True, f"Create contact message success false: {create_msg_json}"

    message_obj = create_msg_json.get("message")
    assert message_obj and "id" in message_obj, "Created message object missing id"
    message_id = message_obj["id"]

    # Send reply with valid auth header
    reply_payload = {
        "messageId": message_id,
        "replySubject": "Re: Test Subject",
        "replyBody": "This is a reply from test."
    }
    headers = {
        "Content-Type": "application/json",
        **auth_header
    }
    reply_resp = requests.post(CONTACT_MESSAGES_REPLY_ENDPOINT, json=reply_payload, headers=headers, timeout=TIMEOUT)
    assert reply_resp.status_code == 200, f"Reply request failed: {reply_resp.text}"
    reply_json = reply_resp.json()
    assert reply_json.get("success") is True, f"Reply response success false: {reply_json}"


test_post_api_contact_messages_reply_send_email_reply()
