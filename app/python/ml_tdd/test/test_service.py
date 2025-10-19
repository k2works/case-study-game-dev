"""サービス層のテストモジュール."""


class TestMLService:
    """MLService のテスト."""

    def test_predict_iris(self) -> None:
        """Iris 予測サービスが正しく動作する."""
        from api.service import MLService

        service = MLService()
        result = service.predict_iris([[5.1, 3.5, 1.4, 0.2]])

        assert isinstance(result, str)
        assert result in ["setosa", "versicolor", "virginica"]

    def test_predict_cinema(self) -> None:
        """Cinema 予測サービスが正しく動作する."""
        from api.service import MLService

        service = MLService()
        result = service.predict_cinema([[500, 300, 70, 1]])

        assert isinstance(result, float)
        assert result > 0

    def test_predict_survived(self) -> None:
        """Survived 予測サービスが正しく動作する."""
        from api.service import MLService

        service = MLService()
        result = service.predict_survived(pclass=3, age=22, sex="male")

        assert isinstance(result, int)
        assert result in [0, 1]

    def test_predict_boston(self) -> None:
        """Boston 予測サービスが正しく動作する."""
        from api.service import MLService

        service = MLService()
        result = service.predict_boston(rm=6.5, lstat=4.98, ptratio=15.3)

        assert isinstance(result, float)
        assert result > 0
