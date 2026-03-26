import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_auth_signup_create_new_user_account():
    session = requests.Session()
    signup_url = f"{BASE_URL}/api/auth/signup"
    
    # Generate unique email for test
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@yopmail.com"
    valid_payload = {
        "name": "Test User",
        "email": unique_email,
        "password": "TestPass123!"
    }
    
    try:
        # 1. Test valid signup
        resp = session.post(signup_url, json=valid_payload, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Expected 201 Created, got {resp.status_code}"
        json_data = resp.json()
        assert "token" in json_data and isinstance(json_data["token"], str) and json_data["token"].strip() != "", "Missing or invalid token in response"
        assert "user" in json_data and isinstance(json_data["user"], dict), "Missing or invalid user object in response"
        user = json_data["user"]
        assert user.get("email") == unique_email, "User email does not match signup email"
        assert user.get("name") == valid_payload["name"], "User name does not match signup name"

        # 2. Test duplicate email returns 409
        resp_dup = session.post(signup_url, json=valid_payload, timeout=TIMEOUT)
        assert resp_dup.status_code == 409, f"Expected 409 Conflict for duplicate email, got {resp_dup.status_code}"

        # 3. Test missing fields return 400
        # Missing name
        payload_missing_name = {
            "email": f"missingname_{uuid.uuid4().hex[:8]}@yopmail.com",
            "password": "SomePass123!"
        }
        resp_missing_name = session.post(signup_url, json=payload_missing_name, timeout=TIMEOUT)
        assert resp_missing_name.status_code == 400, f"Expected 400 Bad Request for missing name, got {resp_missing_name.status_code}"

        # Missing email
        payload_missing_email = {
            "name": "No Email",
            "password": "SomePass123!"
        }
        resp_missing_email = session.post(signup_url, json=payload_missing_email, timeout=TIMEOUT)
        assert resp_missing_email.status_code == 400, f"Expected 400 Bad Request for missing email, got {resp_missing_email.status_code}"

        # Missing password
        payload_missing_password = {
            "name": "No Password",
            "email": f"nopassword_{uuid.uuid4().hex[:8]}@yopmail.com"
        }
        resp_missing_password = session.post(signup_url, json=payload_missing_password, timeout=TIMEOUT)
        assert resp_missing_password.status_code == 400, f"Expected 400 Bad Request for missing password, got {resp_missing_password.status_code}"

    finally:
        # Attempt to cleanup by deleting created user if possible (if API supported delete user)
        # No delete endpoint specified in PRD, so nothing to clean up
        pass

test_post_api_auth_signup_create_new_user_account()