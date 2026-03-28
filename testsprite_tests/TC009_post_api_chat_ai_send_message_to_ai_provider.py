import requests

BASE_URL = "http://localhost:3000"
AUTH_TOKEN_COOKIE = (
    "auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJ1c2VySWQiOiJiZGY0YWJhNi1iMGFlLTQ4MTUtYWQ0Mi02Mzk1NWM2NTQzMDciLCJlbWFpbCI6InRlc3RfcGF3YWxAeW9wbWFpbC5jb20iLCJyb2xlIjoiQUdFTkNZX09XTkVSIiwiaWF0IjoxNzc0Njg4MjU1LCJleHAiOjE3NzUyOTMwNTV9."
    "LFtQEgaHNMtNyMuaVMA6aEj92lbRUs6UPJy0y4I3BI0"
)
TIMEOUT = 30

def test_post_api_chat_ai_send_message():
    endpoint = f"{BASE_URL}/api/chat/ai"

    # 1. Without auth header/cookie: expect 401 Unauthorized
    resp = requests.post(endpoint, json={"conversationId": "conv1", "message": "Hello"}, timeout=TIMEOUT)
    assert resp.status_code == 401, f"Expected 401 Unauthorized without auth, got {resp.status_code}"

    # 2. With auth cookie but missing both content and conversationId: expect 400 with error message
    cookies = {"auth_token": AUTH_TOKEN_COOKIE.split("=",1)[1]}

    # Case: Missing content and conversationId (empty body)
    resp = requests.post(endpoint, cookies=cookies, json={}, timeout=TIMEOUT)
    assert resp.status_code == 400, f"Expected 400 Bad Request with missing fields, got {resp.status_code}"
    try:
        resp_json = resp.json()
    except Exception:
        resp_json = {}
    error_msg_found = False
    if isinstance(resp_json, dict):
        # Accept either key 'error' or 'message' that contains required text
        error_msg = resp_json.get("error") or resp_json.get("message") or ""
        if "Content and conversationId are required" in error_msg:
            error_msg_found = True
    assert error_msg_found, f"Expected error message about required content and conversationId, got {resp.text}"

    # Case: Missing 'message' only
    resp = requests.post(endpoint, cookies=cookies, json={"conversationId": "conv1"}, timeout=TIMEOUT)
    assert resp.status_code == 400, f"Expected 400 Bad Request with missing message, got {resp.status_code}"
    try:
        resp_json = resp.json()
    except Exception:
        resp_json = {}
    error_msg_found = False
    if isinstance(resp_json, dict):
        error_msg = resp_json.get("error") or resp_json.get("message") or ""
        if "Content and conversationId are required" in error_msg:
            error_msg_found = True
    assert error_msg_found, f"Expected error message about required content and conversationId (missing message), got {resp.text}"

    # Case: Missing 'conversationId' only
    resp = requests.post(endpoint, cookies=cookies, json={"message": "Hello"}, timeout=TIMEOUT)
    assert resp.status_code == 400, f"Expected 400 Bad Request with missing conversationId, got {resp.status_code}"
    try:
        resp_json = resp.json()
    except Exception:
        resp_json = {}
    error_msg_found = False
    if isinstance(resp_json, dict):
        error_msg = resp_json.get("error") or resp_json.get("message") or ""
        if "Content and conversationId are required" in error_msg:
            error_msg_found = True
    assert error_msg_found, f"Expected error message about required content and conversationId (missing conversationId), got {resp.text}"

test_post_api_chat_ai_send_message()