import requests

BASE_URL = "http://localhost:3001"
SIGNIN_ENDPOINT = "/api/auth/signin"
CONTACT_MESSAGES_ENDPOINT = "/api/contact-messages"
REPLY_ENDPOINT = "/api/contact-messages/reply"
TIMEOUT = 30


def test_post_api_contact_messages_reply_send_email_reply_and_mark_message_as_replied():
    signin_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "Wlink123"
    }

    # Step 1: Sign in as staff to get auth token
    try:
        signin_resp = requests.post(
            f"{BASE_URL}{SIGNIN_ENDPOINT}",
            json=signin_payload,
            timeout=TIMEOUT,
        )
        assert signin_resp.status_code == 200, f"Signin failed: {signin_resp.text}"
        signin_json = signin_resp.json()
        token = signin_json.get("token")
        assert token, "No token in signin response"

        auth_header = {"Authorization": f"Bearer {token}"}

        # Step 2a: Create a public contact message to get messageId for reply
        contact_payload = {
            "name": "Test User",
            "email": "testuser@example.com",
            "message": "This is a test message for reply."
        }
        contact_resp = requests.post(
            f"{BASE_URL}{CONTACT_MESSAGES_ENDPOINT}",
            json=contact_payload,
            timeout=TIMEOUT,
        )
        assert contact_resp.status_code == 200, f"Contact message creation failed: {contact_resp.text}"
        contact_json = contact_resp.json()
        assert contact_json.get("success") is True, "Contact message creation success false"
        message_data = contact_json.get("message")
        assert message_data and "id" in message_data, "Message id not returned"
        message_id = message_data["id"]

        # Step 2b: Send a reply with auth header
        reply_payload = {
            "messageId": message_id,
            "replySubject": "Re: Test message",
            "replyBody": "This is a reply body to mark the message as replied."
        }
        reply_headers = {
            "Content-Type": "application/json"
        }
        reply_headers.update(auth_header)

        reply_resp = requests.post(
            f"{BASE_URL}{REPLY_ENDPOINT}",
            json=reply_payload,
            headers=reply_headers,
            timeout=TIMEOUT,
        )
        assert reply_resp.status_code == 200, f"Reply request failed: {reply_resp.text}"
        reply_json = reply_resp.json()
        assert reply_json.get("success") is True, "Reply success false"

        # Step 3: Send reply request without auth to confirm 401 unauthorized
        reply_resp_no_auth = requests.post(
            f"{BASE_URL}{REPLY_ENDPOINT}",
            json=reply_payload,
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT,
        )
        assert reply_resp_no_auth.status_code == 401, "Expected 401 Unauthorized without auth"

    finally:
        pass


test_post_api_contact_messages_reply_send_email_reply_and_mark_message_as_replied()
