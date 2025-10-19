"""Cinema 予測器のテスト."""

import os
import tempfile
from typing import Any

import pandas as pd
import pytest

from src.ml.cinema_predictor import CinemaPredictor


class TestCinemaPredictorInit:
    """CinemaPredictor の初期化テスト."""

    def test_デフォルトパラメータでの初期化(self) -> None:
        """デフォルトパラメータで初期化できることを確認."""
        predictor = CinemaPredictor()

        assert predictor is not None
        assert predictor.model is None

    def test_初期化時の属性確認(self) -> None:
        """初期化時に必要な属性が設定されることを確認."""
        predictor = CinemaPredictor()

        assert hasattr(predictor, "model")
        assert predictor.model is None


class TestCinemaPredictorDataLoading:
    """データ読み込みのテスト."""

    def test_CSVファイルからのデータ読み込み(self) -> None:
        """CSV ファイルからデータを読み込めることを確認."""
        predictor = CinemaPredictor()
        X, y = predictor.load_data("data/cinema.csv")

        assert X is not None
        assert y is not None
        assert isinstance(X, pd.DataFrame)
        assert isinstance(y, pd.Series)

    def test_特徴量の列数確認(self) -> None:
        """特徴量が 4 列であることを確認."""
        predictor = CinemaPredictor()
        X, y = predictor.load_data("data/cinema.csv")

        assert X.shape[1] == 4
        expected_columns = ["SNS1", "SNS2", "actor", "original"]
        assert list(X.columns) == expected_columns

    def test_欠損値の補完(self) -> None:
        """欠損値が平均値で補完されることを確認."""
        # 欠損値を含むテストデータ
        test_data = """cinema_id,SNS1,SNS2,actor,original,sales
1,100,500,200,1,10000
2,,600,250,0,11000
3,150,,300,1,12000"""

        with tempfile.NamedTemporaryFile(
            mode="w", delete=False, suffix=".csv"
        ) as f:
            f.write(test_data)
            temp_path = f.name

        try:
            predictor = CinemaPredictor()
            X, y = predictor.load_data(temp_path)

            # 欠損値が補完されていることを確認
            assert X.isnull().sum().sum() == 0
        finally:
            os.unlink(temp_path)

    def test_目的変数の分離(self) -> None:
        """sales が目的変数として正しく分離されることを確認."""
        predictor = CinemaPredictor()
        X, y = predictor.load_data("data/cinema.csv")

        assert "sales" not in X.columns
        assert y.name == "sales"


class TestCinemaPredictorTraining:
    """モデル訓練のテスト."""

    def test_モデルの訓練(self) -> None:
        """モデルを訓練できることを確認."""
        predictor = CinemaPredictor()
        X, y = predictor.load_data("data/cinema.csv")

        predictor.train(X, y)

        assert predictor.model is not None

    def test_訓練後のモデル属性(self) -> None:
        """訓練後にモデルが適切に設定されることを確認."""
        predictor = CinemaPredictor()
        X, y = predictor.load_data("data/cinema.csv")

        predictor.train(X, y)

        # LinearRegression のインスタンスであることを確認
        from sklearn.linear_model import LinearRegression

        assert isinstance(predictor.model, LinearRegression)
        # 係数が設定されていることを確認
        assert predictor.model.coef_ is not None
        assert predictor.model.intercept_ is not None


class TestCinemaPredictorPrediction:
    """予測機能のテスト."""

    def test_予測ができる(self) -> None:
        """訓練後に予測ができることを確認."""
        predictor = CinemaPredictor()
        X, y = predictor.load_data("data/cinema.csv")
        predictor.train(X, y)

        # 訓練データの一部で予測
        predictions = predictor.predict(X[:5])

        assert predictions is not None
        assert len(predictions) == 5

    def test_未訓練時の予測エラー(self) -> None:
        """未訓練時に予測しようとするとエラーが発生することを確認."""
        predictor = CinemaPredictor()
        X, y = predictor.load_data("data/cinema.csv")

        with pytest.raises(ValueError, match="Model is not trained yet"):
            predictor.predict(X[:5])

    def test_予測結果の型(self) -> None:
        """予測結果が numpy 配列であることを確認."""
        import numpy as np

        predictor = CinemaPredictor()
        X, y = predictor.load_data("data/cinema.csv")
        predictor.train(X, y)

        predictions = predictor.predict(X[:5])

        assert isinstance(predictions, np.ndarray)


class TestCinemaPredictorEvaluation:
    """評価機能のテスト."""

    def test_評価指標の計算(self) -> None:
        """評価指標を計算できることを確認."""
        predictor = CinemaPredictor()
        X, y = predictor.load_data("data/cinema.csv")
        predictor.train(X, y)

        predictions = predictor.predict(X)
        metrics = predictor.evaluate(y, predictions)

        assert "r2" in metrics
        assert "mae" in metrics
        assert "rmse" in metrics

    def test_評価指標の型(self) -> None:
        """評価指標が適切な型であることを確認."""
        predictor = CinemaPredictor()
        X, y = predictor.load_data("data/cinema.csv")
        predictor.train(X, y)

        predictions = predictor.predict(X)
        metrics = predictor.evaluate(y, predictions)

        assert isinstance(metrics["r2"], float)
        assert isinstance(metrics["mae"], float)
        assert isinstance(metrics["rmse"], float)

    def test_R2スコアの範囲(self) -> None:
        """R² スコアが適切な範囲にあることを確認."""
        predictor = CinemaPredictor()
        X, y = predictor.load_data("data/cinema.csv")
        predictor.train(X, y)

        predictions = predictor.predict(X)
        metrics = predictor.evaluate(y, predictions)

        # R² は通常 0-1 の範囲（訓練データでは高い値が期待される）
        assert metrics["r2"] >= 0
        assert metrics["r2"] <= 1


class TestCinemaPredictorPersistence:
    """モデル永続化のテスト."""

    def test_モデルの保存(self) -> None:
        """モデルを保存できることを確認."""
        predictor = CinemaPredictor()
        X, y = predictor.load_data("data/cinema.csv")
        predictor.train(X, y)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pkl") as f:
            model_path = f.name

        try:
            predictor.save_model(model_path)

            # ファイルが作成されていることを確認
            assert os.path.exists(model_path)
        finally:
            if os.path.exists(model_path):
                os.unlink(model_path)

    def test_未訓練時の保存エラー(self) -> None:
        """未訓練時に保存しようとするとエラーが発生することを確認."""
        predictor = CinemaPredictor()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pkl") as f:
            model_path = f.name

        try:
            with pytest.raises(ValueError, match="Model is not trained yet"):
                predictor.save_model(model_path)
        finally:
            if os.path.exists(model_path):
                os.unlink(model_path)

    def test_モデルの読み込み(self) -> None:
        """保存したモデルを読み込めることを確認."""
        # モデルを訓練して保存
        predictor1 = CinemaPredictor()
        X, y = predictor1.load_data("data/cinema.csv")
        predictor1.train(X, y)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pkl") as f:
            model_path = f.name

        try:
            predictor1.save_model(model_path)

            # 新しいインスタンスでモデルを読み込み
            predictor2 = CinemaPredictor()
            predictor2.load_model(model_path)

            # モデルが読み込まれていることを確認
            assert predictor2.model is not None

            # 同じ予測結果が得られることを確認
            pred1 = predictor1.predict(X[:5])
            pred2 = predictor2.predict(X[:5])

            import numpy as np

            np.testing.assert_array_almost_equal(pred1, pred2)
        finally:
            if os.path.exists(model_path):
                os.unlink(model_path)
