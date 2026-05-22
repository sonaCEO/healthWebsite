import pytest

@pytest.mark.integration
class TestGetRecipes:

    def test_get_all_recipes(self, client, test_recipe):
        response = client.get("/api/v1/recipes/")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "total_pages" in data

    def test_get_recipes_pagination(self, client, test_recipe):
        response = client.get("/api/v1/recipes/?page=1&page_size=6")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 6

    def test_get_recipes_filter_by_category(self, client, test_recipe):
        response = client.get("/api/v1/recipes/?category=main")
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["category"] == "main"

    def test_get_recipes_filter_by_calories(self, client, test_recipe):
        response = client.get("/api/v1/recipes/?max_calories=500")
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["calories"] <= 500

    def test_get_recipes_sort_by_calories(self, client, test_recipe):
        response = client.get("/api/v1/recipes/?sort_by=calories&sort_order=asc")
        assert response.status_code == 200

    def test_get_recipe_by_id(self, client, test_recipe):
        response = client.get(f"/api/v1/recipes/{test_recipe.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_recipe.id
        assert data["title"] == test_recipe.title
        assert isinstance(data["ingredients"], list)
        assert isinstance(data["instructions"], list)
        assert isinstance(data["tags"], list)

    def test_get_recipe_not_found(self, client):
        response = client.get("/api/v1/recipes/99999")
        assert response.status_code == 404


@pytest.mark.integration
class TestAdminRecipes:

    def test_create_recipe_as_admin(self, client, admin_token):
        import json
        response = client.post(
            "/api/v1/admin/recipes",
            json={
                "title": "Новый рецепт",
                "description": "Описание",
                "ingredients": json.dumps([{"name": "Ингредиент", "amount": "100", "unit": "г"}]),
                "instructions": json.dumps(["Шаг 1"]),
                "cooking_time": 20,
                "calories": 250,
                "protein": 15,
                "carbs": 30,
                "fat": 8,
                "category": "main",
                "difficulty": "easy",
                "tags": json.dumps(["новый"]),
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Новый рецепт"

    def test_create_recipe_as_user(self, client, user_token):
        response = client.post(
            "/api/v1/admin/recipes",
            json={"title": "Рецепт"},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 403

    def test_delete_recipe_as_admin(self, client, admin_token, test_recipe):
        response = client.delete(
            f"/api/v1/admin/recipes/{test_recipe.id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200

    def test_delete_recipe_as_user(self, client, user_token, test_recipe):
        response = client.delete(
            f"/api/v1/admin/recipes/{test_recipe.id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 403