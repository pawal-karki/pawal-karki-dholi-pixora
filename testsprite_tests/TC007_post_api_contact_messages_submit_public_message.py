import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_api_contact_messages_submit_public_message():
    url = f"{BASE_URL}/api/contact-messages"
    headers = {
        "Content-Type": "application/json"
    }

    # Valid submission
    valid_payload = {
        "name": "Test User",
        "email": "testuser@example.com",
        "message": "This is a test message."
    }

    try:
        response = requests.post(url, json=valid_payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
        data = response.json()
        assert "success" in data and data["success"] is True, "Response success field is not True"
        assert "message" in data, "Response missing 'message' field"
        # message field is expected to be a ContactMessage object, so assert it has at least the message text
        assert isinstance(data["message"], dict), "Response 'message' should be a dict"
        # Check the submitted message text returned matches input partially (optional)
        assert "message" in data["message"], "ContactMessage object missing 'message' field"
        assert valid_payload["message"] == data["message"]["message"] or valid_payload["message"] in data["message"]["message"]

        # Missing required fields: missing 'message' field
        invalid_payload = {
            "name": "Test User",
            "email": "testuser@example.com"
            # message is missing
        }
        response_invalid = requests.post(url, json=invalid_payload, headers=headers, timeout=TIMEOUT)
        assert response_invalid.status_code == 400, f"Expected 400 Bad Request for missing fields, got {response_invalid.status_code}"
        # Optionally check error message content
        try:
            error_data = response_invalid.json()
            assert "error" in error_data or "message" in error_data, "Expected error message in response for invalid input"
        except Exception:
            pass  # response might not have JSON body in error, ignore

    except requests.RequestException as e:
        assert False, f"Request to {url} failed with exception: {e}"


test_post_api_contact_messages_submit_public_message()