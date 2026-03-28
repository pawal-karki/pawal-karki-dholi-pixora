import requests

BASE_URL = "http://localhost:3000"
AUTH_TOKEN_COOKIE_NAME = "auth_token"
AUTH_TOKEN_COOKIE_VALUE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZGY0YWJhNi1iMGFlLTQ4MTUtYWQ0Mi02Mzk1NWM2NTQzMDciLCJlbWFpbCI6InRlc3RfcGF3YWxAeW9wbWFpbC5jb20iLCJyb2xlIjoiQUdFTkNZX09XTkVSIiwiaWF0IjoxNzc0Njg4MjU1LCJleHAiOjE3NzUyOTMwNTV9.LFtQEgaHNMtNyMuaVMA6aEj92lbRUs6UPJy0y4I3BI0"
TIMEOUT = 30

def test_get_api_notifications_list_user_notifications():
    url = f"{BASE_URL}/api/notifications"

    # Test without auth cookie - expect 401 Unauthorized
    response_no_auth = requests.get(url, timeout=TIMEOUT)
    assert response_no_auth.status_code == 401, f"Expected 401 without auth, got {response_no_auth.status_code}"

    # Test with auth cookie - expect 200 and notifications array sorted by createdAt desc
    cookies = {AUTH_TOKEN_COOKIE_NAME: AUTH_TOKEN_COOKIE_VALUE}
    response_auth = requests.get(url, cookies=cookies, timeout=TIMEOUT)
    assert response_auth.status_code == 200, f"Expected 200 with auth, got {response_auth.status_code}"

    json_data = response_auth.json()
    # Expecting the response to have a 'notifications' field which is a list
    assert "notifications" in json_data, "'notifications' key missing in response"
    notifications = json_data["notifications"]
    assert isinstance(notifications, list), "'notifications' is not a list"

    # Check if notifications are sorted by createdAt descending
    created_at_list = []
    for n in notifications:
        # Validate each notification has createdAt field
        assert "createdAt" in n, "Notification missing 'createdAt' field"
        created_at_list.append(n["createdAt"])

    # Check descending order
    assert created_at_list == sorted(created_at_list, reverse=True), "Notifications are not sorted by createdAt descendently"

test_get_api_notifications_list_user_notifications()