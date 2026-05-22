class TestGetArticles:

    def test_get_all_articles(self, client, test_article):
        response = client.get("/api/v1/articles/")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data

    def test_get_articles_filter_by_category(self, client, test_article):
        response = client.get("/api/v1/articles/?category=nutrition")
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["category"] == "nutrition"

    def test_get_articles_sort_by_read_time(self, client, test_article):
        response = client.get("/api/v1/articles/?sort_by=read_time&sort_order=asc")
        assert response.status_code == 200

    def test_get_article_by_id(self, client, test_article):
        response = client.get(f"/api/v1/articles/{test_article.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_article.id
        assert data["title"] == test_article.title

    def test_get_article_not_found(self, client):
        response = client.get("/api/v1/articles/99999")
        assert response.status_code == 404