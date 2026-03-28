import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_get_api_media_requires_subaccountid_param():
    # Test GET /api/media without subAccountId query param. Expect 400.
    url = f"{BASE_URL}/api/media"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        assert response.status_code == 400, f"Expected 400 but got {response.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Test GET /api/media?subAccountId=nonexistent-id. Expect 200 with {media: []} empty array.
    params = {"subAccountId": "nonexistent-id"}
    try:
        response = requests.get(url, params=params, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 but got {response.status_code}"
        data = response.json()
        # Validate response format is object with a key "media" that is an array
        assert isinstance(data, dict), f"Response is not a dict: {data}"
        assert "media" in data, "Response JSON does not contain 'media' key"
        assert isinstance(data["media"], list), "'media' is not a list"
        assert data["media"] == [], f"'media' is not an empty list for nonexistent subAccountId: {data['media']}"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    except ValueError as e:
        assert False, f"Response is not JSON: {e}"


test_get_api_media_requires_subaccountid_param()