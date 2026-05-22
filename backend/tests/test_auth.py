import pytest

@pytest.mark.integration
class TestRegister:

    def test_register_success(self, client):
        response = client.post("/api/v1/auth/register", json={
            "email": "newuser@example.com",
            "password": "password123",
            "full_name": "New User"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["full_name"] == "New User"
        assert "hashed_password" not in data  # пароль не возвращается

    def test_register_duplicate_email(self, client, test_user):
        response = client.post("/api/v1/auth/register", json={
            "email": test_user.email,
            "password": "password123",
        })
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    def test_register_invalid_email(self, client):
        response = client.post("/api/v1/auth/register", json={
            "email": "notanemail",
            "password": "password123",
        })
        assert response.status_code == 422  # валидация Pydantic

    def test_register_short_password(self, client):
        response = client.post("/api/v1/auth/register", json={
            "email": "user2@example.com",
            "password": "123",  # меньше 6 символов
        })
        assert response.status_code == 422


@pytest.mark.integration
class TestLogin:

    def test_login_success(self, client, test_user):
        response = client.post(
            "/api/v1/auth/login",
            data={"username": test_user.email, "password": "testpass123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, test_user):
        response = client.post(
            "/api/v1/auth/login",
            data={"username": test_user.email, "password": "wrongpassword"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "nobody@example.com", "password": "password123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 401


class TestMe:

    def test_get_me_success(self, client, user_token):
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "hashed_password" not in data

    def test_get_me_no_token(self, client):
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 403

    def test_get_me_invalid_token(self, client):
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalidtoken123"}
        )
        assert response.status_code == 401


class TestRefreshToken:

    def test_refresh_success(self, client, test_user):
        # Сначала логинимся
        login_response = client.post(
            "/api/v1/auth/login",
            data={"username": test_user.email, "password": "testpass123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        refresh_token = login_response.json()["refresh_token"]

        # Обновляем токен
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_refresh_invalid_token(self, client):
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": "invalidrefreshtoken"
        })
        assert response.status_code == 401


class TestLogout:

    def test_logout_success(self, client, test_user, user_token):
        # Логинимся снова чтобы получить refresh token
        login_response = client.post(
            "/api/v1/auth/login",
            data={"username": test_user.email, "password": "testpass123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        refresh_token = login_response.json()["refresh_token"]

        response = client.post(
            "/api/v1/auth/logout",
            json={"refresh_token": refresh_token},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200