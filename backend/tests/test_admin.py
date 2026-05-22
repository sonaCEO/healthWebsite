class TestAdminDashboard:

    def test_dashboard_as_admin(self, client, admin_token):
        response = client.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "stats" in data
        assert "total_users" in data["stats"]
        assert "total_recipes" in data["stats"]

    def test_dashboard_as_user(self, client, user_token):
        response = client.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 403

    def test_dashboard_no_token(self, client):
        response = client.get("/api/v1/admin/dashboard")
        assert response.status_code == 403


class TestAdminUsers:

    def test_get_users_as_admin(self, client, admin_token, test_user):
        response = client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Проверяем что пароли не возвращаются
        for user in data:
            assert "hashed_password" not in user

    def test_get_users_as_user(self, client, user_token):
        response = client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 403