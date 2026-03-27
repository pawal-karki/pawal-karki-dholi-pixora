import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_get_api_media_list_media_files():
    # Valid subAccountId param - expect 200 with media array
    valid_sub_account_id = "test-sub-account-id-123"

    params = {"subAccountId": valid_sub_account_id}
    try:
        response = requests.get(f"{BASE_URL}/api/media", params=params, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to GET /api/media with valid subAccountId failed: {e}"
    
    assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
    try:
        media_list = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(media_list, list), "Expected response to be a list (media array)"
    # Optional: further validate each media item if schema was known

    # Missing subAccountId param - expect 400 validation error
    try:
        response_missing = requests.get(f"{BASE_URL}/api/media", timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to GET /api/media without subAccountId failed: {e}"

    assert response_missing.status_code == 400, (
        f"Expected status 400 when missing subAccountId, got {response_missing.status_code}"
    )


test_get_api_media_list_media_files()