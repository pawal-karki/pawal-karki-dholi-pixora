import requests
import time

BASE_URL = "http://localhost:3001"
SIGNIN_ENDPOINT = "/api/auth/signin"
CHAT_AI_ENDPOINT = "/api/chat/ai"
TIMEOUT = 30

USER_EMAIL = "test_pawal@yopmail.com"
USER_PASSWORD = "Wlink123"

def test_post_api_chat_ai_send_message():
    session = requests.Session()
    # Step 1: Sign in to get JWT token (auth_token cookie)
    signin_payload = {"email": USER_EMAIL, "password": USER_PASSWORD}
    signin_resp = session.post(
        BASE_URL + SIGNIN_ENDPOINT,
        json=signin_payload,
        timeout=TIMEOUT
    )
    assert signin_resp.status_code == 200, f"Signin failed: {signin_resp.text}"
    signin_json = signin_resp.json()
    token = signin_json.get("token")
    assert token and isinstance(token, str), "Signin response missing token"

    # Set cookie for auth_token as per instructions (cookie-based auth)
    session.cookies.set("auth_token", token)

    valid_conversation_id = "test-conversation-123"
    valid_message = "Hello AI, how are you?"

    # 1) Test valid request
    valid_payload = {"conversationId": valid_conversation_id, "message": valid_message}
    resp = session.post(
        BASE_URL + CHAT_AI_ENDPOINT,
        json=valid_payload,
        timeout=TIMEOUT
    )
    assert resp.status_code == 200, f"Valid AI chat request failed: {resp.text}"
    json_data = resp.json()
    assert "userMessage" in json_data and isinstance(json_data["userMessage"], str)
    assert "aiMessage" in json_data and isinstance(json_data["aiMessage"], str)

    # 2) Test invalid API key - simulate by sending request with invalid token cookie
    invalid_token_session = requests.Session()
    invalid_token_session.cookies.set("auth_token", "invalid.jwt.token")
    resp_invalid_key = invalid_token_session.post(
        BASE_URL + CHAT_AI_ENDPOINT,
        json=valid_payload,
        timeout=TIMEOUT
    )
    assert resp_invalid_key.status_code == 401, \
        f"Expected 401 for invalid API key but got {resp_invalid_key.status_code}, response: {resp_invalid_key.text}"

    # 3) Test rate limit exceeded - send many rapid requests to induce 429
    # Using the valid session and payload
    rate_limit_exceeded = False
    for _ in range(30):  # Try 30 rapid attempts
        resp_rl = session.post(
            BASE_URL + CHAT_AI_ENDPOINT,
            json=valid_payload,
            timeout=TIMEOUT
        )
        if resp_rl.status_code == 429:
            rate_limit_exceeded = True
            break
        # Small delay to avoid too fast requests loop
        time.sleep(0.1)

    assert rate_limit_exceeded, "Did not receive 429 Rate limit exceeded error after high request volume"

test_post_api_chat_ai_send_message()
