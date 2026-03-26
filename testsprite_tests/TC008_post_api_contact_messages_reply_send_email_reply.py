import requests

BASE_URL = "http://localhost:3000"
SIGNIN_ENDPOINT = f"{BASE_URL}/api/auth/signin"
CONTACT_MESSAGES_ENDPOINT = f"{BASE_URL}/api/contact-messages"
REPLY_ENDPOINT = f"{BASE_URL}/api/contact-messages/reply"
TIMEOUT = 30

def test_post_api_contact_messages_reply_send_email_reply():
    signin_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "Wlink123"
    }

    # Step 1: Attempt POST /api/contact-messages/reply without auth header -> Expect 401
    reply_payload_dummy = {
        "messageId": "dummy-id",
        "replySubject": "Subject",
        "replyBody": "Reply body"
    }
    without_auth_response = requests.post(REPLY_ENDPOINT, json=reply_payload_dummy, timeout=TIMEOUT)
    assert without_auth_response.status_code == 401, f"Expected 401 Unauthorized without auth, got {without_auth_response.status_code}"

    # Step 2: Sign in to get auth token
    signin_resp = requests.post(SIGNIN_ENDPOINT, json=signin_payload, timeout=TIMEOUT)
    assert signin_resp.status_code == 200, f"Signing in failed with status {signin_resp.status_code}"
    signin_data = signin_resp.json()
    token = signin_data.get("token")
    assert token and isinstance(token, str), "No token found in signin response"

    headers = {"Authorization": f"Bearer {token}"}

    # Step 3: Create a new public contact message to get a valid messageId
    contact_message_payload = {
        "name": "Test User",
        "email": "test_user@yopmail.com",
        "subject": "Test subject for reply",
        "message": "This is a test message body to generate messageId."
    }
    contact_resp = requests.post(CONTACT_MESSAGES_ENDPOINT, json=contact_message_payload, timeout=TIMEOUT)
    assert contact_resp.status_code == 200, f"Creating contact message failed with status {contact_resp.status_code}"
    contact_resp_json = contact_resp.json()
    assert contact_resp_json.get("success") is True, "Contact message creation success flag not true"
    message_obj = contact_resp_json.get("message")
    assert message_obj and isinstance(message_obj, dict), "No message object returned"
    message_id = message_obj.get("id")
    assert message_id and isinstance(message_id, str), "No valid messageId found in created contact message"

    # Step 4: POST /api/contact-messages/reply with auth header and valid payload
    reply_payload = {
        "messageId": message_id,
        "replySubject": "Re: Test subject for reply",
        "replyBody": "This is a test reply body."
    }

    try:
        reply_resp = requests.post(REPLY_ENDPOINT, json=reply_payload, headers=headers, timeout=TIMEOUT)
        assert reply_resp.status_code == 200, f"Reply sending failed with status {reply_resp.status_code}"
        reply_json = reply_resp.json()
        assert reply_json.get("success") is True, "Reply success flag not true"
    finally:
        # Cleanup: no direct API to delete a contact message, so no delete attempt
        pass

test_post_api_contact_messages_reply_send_email_reply()
