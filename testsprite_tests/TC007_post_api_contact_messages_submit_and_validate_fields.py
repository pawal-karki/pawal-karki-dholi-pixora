import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_api_contact_messages_submit_and_validate_fields():
    url = f"{BASE_URL}/api/contact-messages"
    headers = {"Content-Type": "application/json"}

    # 1. Valid payload required fields only
    payload = {"name": "Test", "email": "test@test.com", "message": "Hello"}
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        body = response.json()
        assert body.get("success") is True, "Expected success:true in response"
    except Exception as e:
        assert False, f"Exception during valid POST request: {e}"

    # 2. Valid payload with optional subject field
    payload_with_subject = {
        "name": "Test",
        "email": "test@test.com",
        "subject": "Optional Subject",
        "message": "Hello",
    }
    try:
        response = requests.post(url, json=payload_with_subject, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        body = response.json()
        assert body.get("success") is True, "Expected success:true with subject included"
    except Exception as e:
        assert False, f"Exception during POST with subject: {e}"

    # 3. Missing name returns 400
    payload_missing_name = {"email": "test@test.com", "message": "Hello"}
    try:
        response = requests.post(url, json=payload_missing_name, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 400, f"Expected 400 for missing name, got {response.status_code}"
    except Exception as e:
        assert False, f"Exception during POST missing name: {e}"

    # 4. Missing email returns 400
    payload_missing_email = {"name": "Test", "message": "Hello"}
    try:
        response = requests.post(url, json=payload_missing_email, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 400, f"Expected 400 for missing email, got {response.status_code}"
    except Exception as e:
        assert False, f"Exception during POST missing email: {e}"

    # 5. Missing message returns 400
    payload_missing_message = {"name": "Test", "email": "test@test.com"}
    try:
        response = requests.post(url, json=payload_missing_message, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 400, f"Expected 400 for missing message, got {response.status_code}"
    except Exception as e:
        assert False, f"Exception during POST missing message: {e}"

    # 6. Empty body returns 400
    try:
        response = requests.post(url, data="{}", headers=headers, timeout=TIMEOUT)
        assert response.status_code == 400, f"Expected 400 for empty body, got {response.status_code}"
    except Exception as e:
        assert False, f"Exception during POST empty body: {e}"


test_post_api_contact_messages_submit_and_validate_fields()