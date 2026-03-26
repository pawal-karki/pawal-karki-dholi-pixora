import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_post_api_contact_messages_submit_public_contact_message():
    url = f"{BASE_URL}/api/contact-messages"
    headers = {
        "Content-Type": "application/json"
    }

    # Test valid submission with all fields (including optional subject)
    valid_payload_full = {
        "name": "Test User",
        "email": "testuser@example.com",
        "subject": "Test Subject",
        "message": "This is a test message for public contact submission."
    }
    response = requests.post(url, json=valid_payload_full, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}"
    json_resp = response.json()
    assert json_resp.get("success") is True, f"Expected success true but got {json_resp.get('success')}"
    assert "message" in json_resp, "Response missing 'message'"
    contact_message = json_resp["message"]
    assert contact_message.get("name") == valid_payload_full["name"], "Name mismatch in response"
    assert contact_message.get("email") == valid_payload_full["email"], "Email mismatch in response"
    if "subject" in contact_message:
        assert contact_message["subject"] == valid_payload_full["subject"], "Subject mismatch in response"
    assert contact_message.get("message") == valid_payload_full["message"], "Message mismatch in response"

    # Test valid submission without optional subject
    valid_payload_minimal = {
        "name": "Another User",
        "email": "anotheruser@example.com",
        "message": "This is a test message without subject."
    }
    response = requests.post(url, json=valid_payload_minimal, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}"
    json_resp = response.json()
    assert json_resp.get("success") is True, f"Expected success true but got {json_resp.get('success')}"
    assert "message" in json_resp, "Response missing 'message'"
    contact_message = json_resp["message"]
    assert contact_message.get("name") == valid_payload_minimal["name"], "Name mismatch in response"
    assert contact_message.get("email") == valid_payload_minimal["email"], "Email mismatch in response"
    assert "subject" not in contact_message or contact_message["subject"] in (None, ""), "Subject should be absent or empty"
    assert contact_message.get("message") == valid_payload_minimal["message"], "Message mismatch in response"

    # Test missing required field 'message' => expect 400 validation error
    invalid_payload_missing_message = {
        "name": "Invalid User",
        "email": "invaliduser@example.com"
        # missing 'message'
    }
    response = requests.post(url, json=invalid_payload_missing_message, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 400, f"Expected 400 but got {response.status_code}"
    # Optionally check error content format
    try:
        json_resp = response.json()
        assert "error" in json_resp or "message" in json_resp, "Expected error message in response"
    except Exception:
        # Response not JSON or error structure unexpected, pass as 400 is confirmed
        pass

    # Test missing required field 'name'
    invalid_payload_missing_name = {
        "email": "noname@example.com",
        "message": "Message without a name"
    }
    response = requests.post(url, json=invalid_payload_missing_name, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 400, f"Expected 400 but got {response.status_code}"

    # Test missing required field 'email'
    invalid_payload_missing_email = {
        "name": "NoEmail User",
        "message": "Message without an email"
    }
    response = requests.post(url, json=invalid_payload_missing_email, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 400, f"Expected 400 but got {response.status_code}"

test_post_api_contact_messages_submit_public_contact_message()