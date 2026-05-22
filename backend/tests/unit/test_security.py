import pytest
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token
)
from datetime import timedelta

@pytest.mark.unit
class TestPasswordHashing:

    def test_hash_password(self):
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert hashed != password
        assert len(hashed) > 0

    def test_verify_correct_password(self):
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True

    def test_verify_wrong_password(self):
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert verify_password("wrongpassword", hashed) is False

    def test_different_passwords_different_hashes(self):
        hash1 = get_password_hash("password1")
        hash2 = get_password_hash("password2")
        assert hash1 != hash2

    def test_same_password_different_hashes(self):
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        assert hash1 != hash2 

@pytest.mark.unit
class TestTokens:

    def test_create_access_token(self):
        token = create_access_token(data={"sub": "test@example.com"})
        assert token is not None
        assert len(token) > 0

    def test_verify_valid_token(self):
        email = "test@example.com"
        token = create_access_token(data={"sub": email})
        result = verify_token(token)
        assert result == email

    def test_verify_invalid_token(self):
        result = verify_token("invalidtoken123")
        assert result is None

    def test_verify_expired_token(self):
        token = create_access_token(
            data={"sub": "test@example.com"},
            expires_delta=timedelta(seconds=-1)
        )
        result = verify_token(token)
        assert result is None

    def test_create_refresh_token(self):
        token1 = create_refresh_token()
        token2 = create_refresh_token()
        assert token1 != token2 
        assert len(token1) > 20