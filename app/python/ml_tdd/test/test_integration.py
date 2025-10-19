"""API 統合テスト."""


class TestAPIIntegration:
    """API 全体の統合テスト."""

    def test_ルートエンドポイントが正しく動作する(self, client) -> None:
        """ルートエンドポイントが API 情報を返す."""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Machine Learning API"
        assert data["version"] == "1.0.0"
        assert "/iris" in data["endpoints"]
        assert "/cinema" in data["endpoints"]
        assert "/survived" in data["endpoints"]
        assert "/boston" in data["endpoints"]

    def test_ヘルスチェックが正しく動作する(self, client) -> None:
        """ヘルスチェックエンドポイントが正常ステータスを返す."""
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    def test_Iris予測のエンドツーエンドフロー(
        self, client, iris_sample_data
    ) -> None:
        """Iris 予測の完全なフローが正しく動作する."""
        response = client.post("/iris", json=iris_sample_data)

        assert response.status_code == 200
        data = response.json()
        assert "species" in data
        assert data["species"] in ["setosa", "versicolor", "virginica"]

    def test_Iris予測で不正なデータを拒否する(self, client) -> None:
        """不正なリクエストデータでエラーを返す."""
        # 負の値を送信
        invalid_data = {
            "sepal_length": -1.0,
            "sepal_width": 3.5,
            "petal_length": 1.4,
            "petal_width": 0.2,
        }
        response = client.post("/iris", json=invalid_data)

        assert response.status_code == 422  # Validation Error

    def test_Cinema予測のエンドツーエンドフロー(
        self, client, cinema_sample_data
    ) -> None:
        """Cinema 予測の完全なフローが正しく動作する."""
        response = client.post("/cinema", json=cinema_sample_data)

        assert response.status_code == 200
        data = response.json()
        assert "predicted_sales" in data
        assert isinstance(data["predicted_sales"], (int, float))
        assert data["predicted_sales"] > 0

    def test_Cinema予測でactor範囲外を拒否する(self, client) -> None:
        """actor スコアが範囲外の場合エラーを返す."""
        invalid_data = {
            "sns1": 500,
            "sns2": 300,
            "actor": 150,  # 100 を超える
            "original": 1,
        }
        response = client.post("/cinema", json=invalid_data)

        assert response.status_code == 422  # Validation Error

    def test_Survived予測のエンドツーエンドフロー(
        self, client, survived_sample_data
    ) -> None:
        """Survived 予測の完全なフローが正しく動作する."""
        response = client.post("/survived", json=survived_sample_data)

        assert response.status_code == 200
        data = response.json()
        assert "survived" in data
        assert data["survived"] in [0, 1]

    def test_Survived予測で不正なsexを拒否する(self, client) -> None:
        """sex が male/female 以外の場合エラーを返す."""
        invalid_data = {"pclass": 1, "age": 30, "sex": "unknown"}  # 不正な値
        response = client.post("/survived", json=invalid_data)

        assert response.status_code == 422  # Validation Error

    def test_Boston予測のエンドツーエンドフロー(
        self, client, boston_sample_data
    ) -> None:
        """Boston 予測の完全なフローが正しく動作する."""
        response = client.post("/boston", json=boston_sample_data)

        assert response.status_code == 200
        data = response.json()
        assert "predicted_price" in data
        assert isinstance(data["predicted_price"], (int, float))
        assert data["predicted_price"] > 0

    def test_Boston予測で必須フィールド欠落を拒否する(self, client) -> None:
        """必須フィールドが欠けている場合エラーを返す."""
        invalid_data = {
            "rm": 6.5,
            "lstat": 4.98
            # ptratio が欠けている
        }
        response = client.post("/boston", json=invalid_data)

        assert response.status_code == 422  # Validation Error

    def test_存在しないエンドポイントで404を返す(self, client) -> None:
        """存在しないエンドポイントにアクセスすると 404 を返す."""
        response = client.get("/nonexistent")

        assert response.status_code == 404

    def test_複数のエンドポイントを連続して呼び出せる(
        self, client, iris_sample_data, cinema_sample_data
    ) -> None:
        """複数のエンドポイントを連続して呼び出しても正しく動作する."""
        # Iris 予測
        response1 = client.post("/iris", json=iris_sample_data)
        assert response1.status_code == 200

        # Cinema 予測
        response2 = client.post("/cinema", json=cinema_sample_data)
        assert response2.status_code == 200

        # それぞれの結果が独立している
        assert "species" in response1.json()
        assert "predicted_sales" in response2.json()
