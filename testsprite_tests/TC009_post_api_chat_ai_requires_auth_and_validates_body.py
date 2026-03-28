import requests

BASE_URL = "http://localhost:3000"
AUTH_SIGNIN_PATH = "/api/auth/signin"
CHAT_AI_PATH = "/api/chat/ai"
EMAIL = "test_pawal@yopmail.com"
PASSWORD = "Wlink123"
TIMEOUT = 30


def test_post_api_chat_ai_requires_auth_and_validates_body():
    # Step 1: POST /api/chat/ai without auth => expect 401 Unauthorized
    url = BASE_URL + CHAT_AI_PATH
    try:
        resp = requests.post(url, json={}, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed without auth: {e}"
    assert resp.status_code == 401, f"Expected 401 without auth, got {resp.status_code}"

    # Step 2: Authenticate and get auth_token cookie
    signin_url = BASE_URL + AUTH_SIGNIN_PATH
    signin_payload = {"email": EMAIL, "password": PASSWORD}
    try:
        signin_resp = requests.post(signin_url, json=signin_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Signin request failed: {e}"
    assert signin_resp.status_code == 200, f"Signin failed with status {signin_resp.status_code}"
    signin_json = signin_resp.json()
    auth_token = signin_json.get("token")
    assert isinstance(auth_token, str) and auth_token.strip() != "", "Invalid token received from signin"

    cookies = {"auth_token": auth_token}
    headers = {"Content-Type": "application/json"}

    # Step 3: POST /api/chat/ai with auth_token cookie and empty body => expect 400 with error 'Content and conversationId are required'
    try:
        resp = requests.post(url, cookies=cookies, headers=headers, json={}, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request with empty body failed: {e}"
    assert resp.status_code == 400, f"Expected 400 for empty body, got {resp.status_code}"
    resp_json = resp.json()
    err_msg = ""
    if isinstance(resp_json, dict):
        err_msg = (
            resp_json.get("error") or resp_json.get("message") or resp_json.get("detail") or ""
        )
    assert "Content" in err_msg and "conversationId" in err_msg, f"Expected error about 'Content and conversationId' required but got: {err_msg}"

    # Step 4: POST with content but missing conversationId => expect 400
    payload = {"message": "Hello AI"}
    try:
        resp = requests.post(url, cookies=cookies, headers=headers, json=payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request with missing conversationId failed: {e}"
    assert resp.status_code == 400, f"Expected 400 for missing conversationId, got {resp.status_code}"
    resp_json = resp.json()
    err_msg = ""
    if isinstance(resp_json, dict):
        err_msg = (
            resp_json.get("error") or resp_json.get("message") or resp_json.get("detail") or ""
        )
    assert "conversationId" in err_msg or ("required" in err_msg and "conversationId" in err_msg), f"Expected error about missing conversationId but got: {err_msg}"

    # Step 5: POST with conversationId but missing content => expect 400
    payload = {"conversationId": "conv-12345"}
    try:
        resp = requests.post(url, cookies=cookies, headers=headers, json=payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request with missing content failed: {e}"
    assert resp.status_code == 400, f"Expected 400 for missing content, got {resp.status_code}"
    resp_json = resp.json()
    err_msg = ""
    if isinstance(resp_json, dict):
        err_msg = (
            resp_json.get("error") or resp_json.get("message") or resp_json.get("detail") or ""
        )
    assert "Content" in err_msg or ("required" in err_msg and "Content" in err_msg), f"Expected error about missing Content but got: {err_msg}"


test_post_api_chat_ai_requires_auth_and_validates_body()