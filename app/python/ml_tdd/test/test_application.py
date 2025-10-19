"""アプリケーション層のテストモジュール."""

import pytest
from fastapi.testclient import TestClient


class TestMLAPI:
    """ML API のテスト."""

    @pytest.fixture
    def client(self) -> TestClient:
        """TestClient のフィクスチャ."""
        from api.application import app

        return TestClient(app)

    def test_Irisエンドポイントの正常系(self, client: TestClient) -> None:
        """Iris エンドポイントが正しく動作する."""
        response = client.post(
            "/iris",
            json={
                "sepal_length": 5.1,
                "sepal_width": 3.5,
                "petal_length": 1.4,
                "petal_width": 0.2,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "species" in data
        assert data["species"] in ["setosa", "versicolor", "virginica"]

    def test_Irisエンドポイントの異常系_負の値(self, client: TestClient) -> None:
        """負の値を指定するとバリデーションエラー."""
        response = client.post(
            "/iris",
            json={
                "sepal_length": -1.0,
                "sepal_width": 3.5,
                "petal_length": 1.4,
                "petal_width": 0.2,
            },
        )

        assert response.status_code == 422  # Validation error

    def test_Cinemaエンドポイントの正常系(self, client: TestClient) -> None:
        """Cinema エンドポイントが正しく動作する."""
        response = client.post(
            "/cinema",
            json={"sns1": 500, "sns2": 300, "actor": 70, "original": 1},
        )

        assert response.status_code == 200
        data = response.json()
        assert "predicted_sales" in data
        assert data["predicted_sales"] > 0

    def test_Survivedエンドポイントの正常系(self, client: TestClient) -> None:
        """Survived エンドポイントが正しく動作する."""
        response = client.post(
            "/survived",
            json={"pclass": 3, "age": 22, "sex": "male"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "survived" in data
        assert data["survived"] in [0, 1]

    def test_Bostonエンドポイントの正常系(self, client: TestClient) -> None:
        """Boston エンドポイントが正しく動作する."""
        response = client.post(
            "/boston",
            json={"rm": 6.5, "lstat": 4.98, "ptratio": 15.3},
        )

        assert response.status_code == 200
        data = response.json()
        assert "predicted_price" in data
        assert data["predicted_price"] > 0

    def test_ルートエンドポイント(self, client: TestClient) -> None:
        """ルートエンドポイントが正しく動作する."""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data

    def test_ヘルスチェックエンドポイント(self, client: TestClient) -> None:
        """ヘルスチェックエンドポイントが正しく動作する."""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
