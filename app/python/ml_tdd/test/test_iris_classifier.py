"""Iris 分類器のテスト."""

from typing import Any

import numpy as np
import pandas as pd
import pytest

from src.ml.iris_classifier import IrisClassifier  # まだ存在しないモジュール


class TestIrisClassifierInit:
    """IrisClassifier の初期化テスト."""

    def test_デフォルトパラメータでの初期化(self) -> None:
        """デフォルトパラメータで初期化できることを確認."""
        classifier = IrisClassifier()  # 分類器を作成

        assert classifier is not None  # インスタンスが作られた
        assert classifier.model is None  # まだモデルは訓練されていない
        assert classifier.max_depth == 2  # デフォルトの深さは 2

    def test_カスタムパラメータでの初期化(self) -> None:
        """カスタムパラメータで初期化できることを確認."""
        classifier = IrisClassifier(max_depth=5)  # 深さ 5 を指定

        assert classifier.max_depth == 5  # 指定した値が設定される

    def test_無効なmax_depthの拒否(self) -> None:
        """無効な max_depth を拒否することを確認."""
        # 負の値はダメ！
        with pytest.raises(ValueError):
            IrisClassifier(max_depth=-1)

        # 0 もダメ！
        with pytest.raises(ValueError):
            IrisClassifier(max_depth=0)


class TestIrisClassifierDataLoading:
    """データ読み込みのテスト."""

    def test_CSVファイルからのデータ読み込み(self) -> None:
        """CSV ファイルからデータを読み込めることを確認."""
        classifier = IrisClassifier()
        X, y = classifier.load_data("data/iris.csv")

        assert X is not None
        assert y is not None
        assert isinstance(X, pd.DataFrame)
        assert isinstance(y, pd.Series)

    def test_特徴量の列数確認(self) -> None:
        """特徴量が 4 列であることを確認."""
        classifier = IrisClassifier()
        X, y = classifier.load_data("data/iris.csv")

        assert X.shape[1] == 4
        assert list(X.columns) == [
            "sepal_length",
            "sepal_width",
            "petal_length",
            "petal_width",
        ]

    def test_ラベルのユニーク数確認(self) -> None:
        """ラベルが 3 種類であることを確認."""
        classifier = IrisClassifier()
        X, y = classifier.load_data("data/iris.csv")

        unique_species = y.unique()
        assert len(unique_species) == 3
        assert "setosa" in unique_species
        assert "versicolor" in unique_species
        assert "virginica" in unique_species

    def test_欠損値の処理(self) -> None:
        """欠損値が適切に処理されることを確認."""
        import os
        import tempfile

        # テスト用に欠損値を含むデータを作成
        test_data = """sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
,3.0,1.4,0.2,setosa
7.0,,4.7,1.4,versicolor"""

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".csv") as f:
            f.write(test_data)
            temp_path = f.name

        try:
            classifier = IrisClassifier()
            X, y = classifier.load_data(temp_path)

            # 欠損値が補完されていることを確認
            assert X.isnull().sum().sum() == 0
        finally:
            os.unlink(temp_path)


class TestIrisClassifierTraining:
    """モデル訓練のテスト."""

    def test_モデルの訓練(self) -> None:
        """モデルを訓練できることを確認."""
        classifier = IrisClassifier()
        X_train = pd.DataFrame(
            {
                "sepal_length": [5.1, 4.9, 7.0],
                "sepal_width": [3.5, 3.0, 3.2],
                "petal_length": [1.4, 1.4, 4.7],
                "petal_width": [0.2, 0.2, 1.4],
            }
        )
        y_train = pd.Series(["setosa", "setosa", "versicolor"])

        classifier.train(X_train, y_train)

        assert classifier.model is not None

    def test_訓練済みモデルの属性確認(self) -> None:
        """訓練済みモデルが適切な属性を持つことを確認."""
        classifier = IrisClassifier(max_depth=3)
        X_train = pd.DataFrame(
            {
                "sepal_length": [5.1, 4.9, 7.0],
                "sepal_width": [3.5, 3.0, 3.2],
                "petal_length": [1.4, 1.4, 4.7],
                "petal_width": [0.2, 0.2, 1.4],
            }
        )
        y_train = pd.Series(["setosa", "setosa", "versicolor"])

        classifier.train(X_train, y_train)

        assert classifier.model is not None
        assert classifier.model.max_depth == 3
        assert hasattr(classifier.model, "classes_")

    def test_空のデータでの訓練拒否(self) -> None:
        """空のデータでの訓練を拒否することを確認."""
        classifier = IrisClassifier()
        X_train = pd.DataFrame()
        y_train = pd.Series(dtype=str)

        with pytest.raises(ValueError):
            classifier.train(X_train, y_train)

    def test_特徴量とラベルの数が不一致の拒否(self) -> None:
        """特徴量とラベルの数が一致しない場合を拒否."""
        classifier = IrisClassifier()
        X_train = pd.DataFrame(
            {
                "sepal_length": [5.1, 4.9],
                "sepal_width": [3.5, 3.0],
                "petal_length": [1.4, 1.4],
                "petal_width": [0.2, 0.2],
            }
        )
        y_train = pd.Series(["setosa"])  # 数が一致しない

        with pytest.raises(ValueError):
            classifier.train(X_train, y_train)


class TestIrisClassifierPrediction:
    """予測機能のテスト."""

    @pytest.fixture
    def trained_classifier(self) -> IrisClassifier:
        """訓練済みの分類器を返す fixture."""
        classifier = IrisClassifier()
        X_train = pd.DataFrame(
            {
                "sepal_length": [5.1, 4.9, 7.0, 6.4],
                "sepal_width": [3.5, 3.0, 3.2, 3.2],
                "petal_length": [1.4, 1.4, 4.7, 4.5],
                "petal_width": [0.2, 0.2, 1.4, 1.5],
            }
        )
        y_train = pd.Series(["setosa", "setosa", "versicolor", "versicolor"])
        classifier.train(X_train, y_train)
        return classifier

    def test_単一サンプルの予測(self, trained_classifier: IrisClassifier) -> None:
        """単一サンプルを予測できることを確認."""
        X_test = pd.DataFrame(
            {
                "sepal_length": [5.0],
                "sepal_width": [3.5],
                "petal_length": [1.3],
                "petal_width": [0.3],
            }
        )

        predictions = trained_classifier.predict(X_test)

        assert len(predictions) == 1
        assert predictions[0] in ["setosa", "versicolor", "virginica"]

    def test_複数サンプルの予測(self, trained_classifier: IrisClassifier) -> None:
        """複数サンプルを予測できることを確認."""
        X_test = pd.DataFrame(
            {
                "sepal_length": [5.0, 7.0],
                "sepal_width": [3.5, 3.2],
                "petal_length": [1.3, 4.7],
                "petal_width": [0.3, 1.4],
            }
        )

        predictions = trained_classifier.predict(X_test)

        assert len(predictions) == 2

    def test_未訓練モデルでの予測拒否(self) -> None:
        """未訓練モデルでの予測を拒否することを確認."""
        classifier = IrisClassifier()
        X_test = pd.DataFrame(
            {
                "sepal_length": [5.0],
                "sepal_width": [3.5],
                "petal_length": [1.3],
                "petal_width": [0.3],
            }
        )

        with pytest.raises(ValueError):
            classifier.predict(X_test)


class TestIrisClassifierEvaluation:
    """モデル評価のテスト."""

    @pytest.fixture
    def trained_classifier(self) -> IrisClassifier:
        """訓練済みの分類器."""
        classifier = IrisClassifier()
        X, y = classifier.load_data("data/iris.csv")
        classifier.train(X, y)
        return classifier

    def test_正解率の計算(self, trained_classifier: IrisClassifier) -> None:
        """正解率を計算できることを確認."""
        X_test = pd.DataFrame(
            {
                "sepal_length": [5.1, 7.0],
                "sepal_width": [3.5, 3.2],
                "petal_length": [1.4, 4.7],
                "petal_width": [0.2, 1.4],
            }
        )
        y_test = pd.Series(["setosa", "versicolor"])

        accuracy = trained_classifier.evaluate(X_test, y_test)

        assert 0.0 <= accuracy <= 1.0

    def test_完全一致時の正解率(self) -> None:
        """全て正解の場合に正解率が 1.0 になることを確認."""
        classifier = IrisClassifier()
        X_train = pd.DataFrame(
            {
                "sepal_length": [5.1, 7.0],
                "sepal_width": [3.5, 3.2],
                "petal_length": [1.4, 4.7],
                "petal_width": [0.2, 1.4],
            }
        )
        y_train = pd.Series(["setosa", "versicolor"])
        classifier.train(X_train, y_train)

        # 訓練データと同じデータでテスト（必ず正解）
        accuracy = classifier.evaluate(X_train, y_train)

        assert accuracy == 1.0


class TestIrisClassifierPersistence:
    """モデルの永続化テスト."""

    @pytest.fixture
    def trained_classifier(self) -> IrisClassifier:
        """訓練済みの分類器."""
        classifier = IrisClassifier()
        X_train = pd.DataFrame(
            {
                "sepal_length": [5.1, 7.0],
                "sepal_width": [3.5, 3.2],
                "petal_length": [1.4, 4.7],
                "petal_width": [0.2, 1.4],
            }
        )
        y_train = pd.Series(["setosa", "versicolor"])
        classifier.train(X_train, y_train)
        return classifier

    def test_モデルの保存(
        self, trained_classifier: IrisClassifier, tmp_path: Any
    ) -> None:
        """訓練済みモデルを保存できることを確認."""
        model_path = tmp_path / "iris_model.pkl"

        trained_classifier.save_model(str(model_path))

        assert model_path.exists()

    def test_モデルの読み込み(self, tmp_path: Any) -> None:
        """保存したモデルを読み込めることを確認."""
        # モデルを訓練して保存
        classifier1 = IrisClassifier()
        X_train = pd.DataFrame(
            {
                "sepal_length": [5.1, 7.0],
                "sepal_width": [3.5, 3.2],
                "petal_length": [1.4, 4.7],
                "petal_width": [0.2, 1.4],
            }
        )
        y_train = pd.Series(["setosa", "versicolor"])
        classifier1.train(X_train, y_train)

        model_path = tmp_path / "iris_model.pkl"
        classifier1.save_model(str(model_path))

        # 新しいインスタンスでモデルを読み込み
        classifier2 = IrisClassifier()
        classifier2.load_model(str(model_path))

        assert classifier2.model is not None

    def test_保存したモデルでの予測一貫性(self, tmp_path: Any) -> None:
        """保存前後で予測結果が一致することを確認."""
        # モデルを訓練
        classifier1 = IrisClassifier()
        X_train = pd.DataFrame(
            {
                "sepal_length": [5.1, 7.0],
                "sepal_width": [3.5, 3.2],
                "petal_length": [1.4, 4.7],
                "petal_width": [0.2, 1.4],
            }
        )
        y_train = pd.Series(["setosa", "versicolor"])
        classifier1.train(X_train, y_train)

        # テストデータ
        X_test = pd.DataFrame(
            {
                "sepal_length": [5.0],
                "sepal_width": [3.4],
                "petal_length": [1.5],
                "petal_width": [0.2],
            }
        )

        # 保存前の予測
        pred_before = classifier1.predict(X_test)

        # モデルの保存と読み込み
        model_path = tmp_path / "iris_model.pkl"
        classifier1.save_model(str(model_path))

        classifier2 = IrisClassifier()
        classifier2.load_model(str(model_path))

        # 読み込み後の予測
        pred_after = classifier2.predict(X_test)

        assert np.array_equal(pred_before, pred_after)
