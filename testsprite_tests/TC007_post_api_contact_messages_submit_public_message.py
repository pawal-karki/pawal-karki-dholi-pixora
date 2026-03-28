import requests

BASE_URL = "http://localhost:3000"
CONTACT_MESSAGES_ENDPOINT = f"{BASE_URL}/api/contact-messages"
TIMEOUT = 30

def test_post_api_contact_messages_submit_public_message():
    headers = {"Content-Type": "application/json"}

    # Test valid submission with required fields
    valid_payload = {
        "name": "Test User",
        "email": "testuser@example.com",
        "message": "This is a test contact message."
    }
    try:
        response = requests.post(CONTACT_MESSAGES_ENDPOINT, json=valid_payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 but got {response.status_code}"
        json_data = response.json()
        assert isinstance(json_data, dict), "Response is not a JSON object"
        assert json_data.get("success") is True, "Response 'success' field is not True"
        assert "message" in json_data, "Response missing 'message' field"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Test missing required fields (missing 'message')
    missing_message_payload = {
        "name": "Test User",
        "email": "testuser@example.com"
    }
    try:
        response = requests.post(CONTACT_MESSAGES_ENDPOINT, json=missing_message_payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 400, f"Expected 400 for missing required fields but got {response.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Test empty body
    try:
        response = requests.post(CONTACT_MESSAGES_ENDPOINT, json={}, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 400, f"Expected 400 for empty body but got {response.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_contact_messages_submit_public_message()