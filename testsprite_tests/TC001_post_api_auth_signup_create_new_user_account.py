import requests
import uuid

base_url = "http://localhost:3000"
signup_url = f"{base_url}/api/auth/signup"

def test_post_api_auth_signup_create_new_user_account():
    timeout = 30
    headers = {"Content-Type": "application/json"}

    # Generate a unique email to avoid conflict in normal test flow
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    user_payload = {
        "name": "Test User",
        "email": unique_email,
        "password": "ValidPass123!"
    }

    # 1. Test successful signup returns 201 with token and user.role=SUBACCOUNT_USER
    resp = requests.post(signup_url, json=user_payload, headers=headers, timeout=timeout)
    try:
        assert resp.status_code == 201, f"Expected 201, got {resp.status_code}"
        data = resp.json()
        assert "token" in data and isinstance(data["token"], str) and data["token"], "Missing or invalid token"
        assert "user" in data and isinstance(data["user"], dict), "Missing user object"
        assert data["user"].get("role") == "SUBACCOUNT_USER", f"Expected role SUBACCOUNT_USER, got {data['user'].get('role')}"
    except Exception:
        # Cleanup on failure if user was created
        if resp.status_code == 201 and "user" in resp.json() and "id" in resp.json()["user"]:
            delete_user_by_email(unique_email)
        raise

    # 2. Test duplicate email returns 409
    resp_dup = requests.post(signup_url, json=user_payload, headers=headers, timeout=timeout)
    try:
        assert resp_dup.status_code == 409, f"Expected 409 for duplicate email, got {resp_dup.status_code}"
    except Exception:
        # Cleanup
        delete_user_by_email(unique_email)
        raise

    # 3. Test missing name returns 400
    payload_missing_name = {
        "email": f"missingname_{uuid.uuid4().hex[:8]}@example.com",
        "password": "ValidPass123!"
    }
    resp_missing_name = requests.post(signup_url, json=payload_missing_name, headers=headers, timeout=timeout)
    assert resp_missing_name.status_code == 400, f"Expected 400 for missing name, got {resp_missing_name.status_code}"

    # 4. Test missing email returns 400
    payload_missing_email = {
        "name": "Missing Email",
        "password": "ValidPass123!"
    }
    resp_missing_email = requests.post(signup_url, json=payload_missing_email, headers=headers, timeout=timeout)
    assert resp_missing_email.status_code == 400, f"Expected 400 for missing email, got {resp_missing_email.status_code}"

    # 5. Test missing password returns 400
    payload_missing_password = {
        "name": "Missing Password",
        "email": f"missingpassword_{uuid.uuid4().hex[:8]}@example.com"
    }
    resp_missing_password = requests.post(signup_url, json=payload_missing_password, headers=headers, timeout=timeout)
    assert resp_missing_password.status_code == 400, f"Expected 400 for missing password, got {resp_missing_password.status_code}"

    # Cleanup created user
    delete_user_by_email(unique_email)

def delete_user_by_email(email):
    # To delete a user, first sign in as the test user from instructions to get auth_token cookie
    signin_url = f"{base_url}/api/auth/signin"
    signin_payload = {
        "email": "test_pawal@yopmail.com",
        "password": "Wlink123"
    }
    signin_resp = requests.post(signin_url, json=signin_payload, timeout=30)
    if signin_resp.status_code != 200:
        return
    auth_token = signin_resp.cookies.get("auth_token")
    if not auth_token:
        return

    # There is no delete user endpoint documented in PRD.
    # As workaround, try to get user list or delete by admin routes if exist,
    # but none found in PRD.
    # Therefore no direct API to delete user. Skipping actual delete.

    # In practical scenario, one would use DB cleanup or admin APIs.
    # Here, just note that cleanup is recommended externally.
    pass

test_post_api_auth_signup_create_new_user_account()