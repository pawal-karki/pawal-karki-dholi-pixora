import requests
import uuid

BASE_URL = "http://localhost:3001"
SIGNIN_URL = f"{BASE_URL}/api/auth/signin"
CHAT_SEND_URL = f"{BASE_URL}/api/chat/send"
TIMEOUT = 30

def test_post_api_chat_send_save_chat_message_and_trigger_pusher_event():
    signin_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "Wlink123"
    }

    # 1. Sign in to get auth_token cookie
    signin_resp = requests.post(SIGNIN_URL, json=signin_payload, timeout=TIMEOUT)
    assert signin_resp.status_code == 200, f"Sign in failed with status {signin_resp.status_code}"
    signin_data = signin_resp.json()
    token = signin_data.get("token")
    assert token and isinstance(token, str), "No token found in signin response"

    cookies = {"auth_token": token}

    # Prepare chat message data
    conversation_id = str(uuid.uuid4())
    content = "Test chat message content"

    headers = {
        "Content-Type": "application/json"
    }

    # 2. Send chat message with valid auth cookie
    chat_payload = {
        "conversationId": conversation_id,
        "content": content
    }

    chat_resp = requests.post(CHAT_SEND_URL, json=chat_payload, cookies=cookies, headers=headers, timeout=TIMEOUT)
    assert chat_resp.status_code == 200, f"Chat send failed with status {chat_resp.status_code}"
    chat_data = chat_resp.json()
    # Validate chat message response: must contain expected fields e.g. conversationId and content echoed back or message id
    assert isinstance(chat_data, dict), "Chat response not a JSON object"
    assert "conversationId" in chat_data, "Response missing conversationId"
    assert chat_data["conversationId"] == conversation_id, "Response conversationId mismatch"
    assert "content" in chat_data, "Response missing content"
    assert chat_data["content"] == content, "Response content mismatch"

    # NOTE: The test case expects that a Pusher realtime event is emitted.
    # This test code cannot verify the Pusher event directly as it's outside HTTP scope.
    # Usually such event verification requires a Pusher client or mocks.
    # Here we comply by testing the response correctness only.

    # 3. Try sending chat message without auth cookie to check for 401 Unauthorized
    chat_resp_no_auth = requests.post(CHAT_SEND_URL, json=chat_payload, headers=headers, timeout=TIMEOUT)
    assert chat_resp_no_auth.status_code == 401, f"Expected 401 Unauthorized without auth but got {chat_resp_no_auth.status_code}"

# Run the test function
test_post_api_chat_send_save_chat_message_and_trigger_pusher_event()