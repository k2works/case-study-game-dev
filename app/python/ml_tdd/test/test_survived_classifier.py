"""Survived 分類器のテストモジュール."""

import os
import tempfile

import numpy as np
import pandas as pd
import pytest

from src.ml.survived_classifier import SurvivedClassifier


class TestSurvivedClassifierInit:
    """初期化のテスト."""

    def test_初期化_デフォルトパラメータ(self):
        """デフォルトパラメータで初期化できることを確認."""
        classifier = SurvivedClassifier()

        assert classifier.max_depth == 9
        assert classifier.class_weight == "balanced"
        assert classifier.model is None

    def test_初期化_カスタムパラメータ(self):
        """カスタムパラメータで初期化できることを確認."""
        classifier = SurvivedClassifier(max_depth=5, class_weight=None)

        assert classifier.max_depth == 5
        assert classifier.class_weight is None

    def test_初期化_無効なmax_depth(self):
        """無効な max_depth で例外が発生することを確認."""
        with pytest.raises(ValueError, match="max_depth must be at least 1"):
            SurvivedClassifier(max_depth=0)


class TestSurvivedClassifierDataLoading:
    """データ読み込みのテスト."""

    def test_CSVファイルからのデータ読み込み(self):
        """CSV ファイルからデータを読み込めることを確認."""
        classifier = SurvivedClassifier()
        X, y = classifier.load_data("data/Survived.csv")

        assert X is not None
        assert y is not None
        assert isinstance(X, pd.DataFrame)
        assert isinstance(y, pd.Series)

    def test_特徴量の列数確認(self):
        """特徴量が正しい列で構成されることを確認."""
        classifier = SurvivedClassifier()
        X, y = classifier.load_data("data/Survived.csv")

        # 前処理後は male ダミー変数が作成される
        expected_columns = ["Pclass", "Age", "SibSp", "Parch", "Fare", "male"]
        assert list(X.columns) == expected_columns

    def test_目的変数の確認(self):
        """目的変数が 0 と 1 のみであることを確認."""
        classifier = SurvivedClassifier()
        X, y = classifier.load_data("data/Survived.csv")

        unique_values = y.unique()
        assert len(unique_values) == 2
        assert 0 in unique_values
        assert 1 in unique_values

    def test_存在しないファイルでエラー(self):
        """存在しないファイルで例外が発生することを確認."""
        classifier = SurvivedClassifier()

        with pytest.raises(FileNotFoundError, match="File not found"):
            classifier.load_data("data/nonexistent.csv")


class TestSurvivedClassifierPreprocessing:
    """前処理のテスト."""

    def test_グループ別欠損値補完(self):
        """グループ別に欠損値が補完されることを確認."""
        classifier = SurvivedClassifier()

        # テストデータ作成（欠損値あり）
        test_data = pd.DataFrame(
            {
                "Pclass": [1, 1, 3, 3],
                "Age": [np.nan, 35.0, np.nan, 25.0],
                "SibSp": [0, 0, 1, 1],
                "Parch": [0, 0, 0, 0],
                "Fare": [71.0, 71.0, 7.0, 7.0],
                "Sex": ["female", "female", "male", "male"],
                "Survived": [1, 1, 0, 0],
            }
        )

        # 欠損値補完
        result = classifier._preprocess_age(test_data)

        # 補完された値を確認
        assert pd.notna(result.loc[0, "Age"])  # 欠損値が補完された
        assert pd.notna(result.loc[2, "Age"])  # 欠損値が補完された

    def test_Sex列のダミー変数化(self):
        """Sex 列がダミー変数に変換されることを確認."""
        classifier = SurvivedClassifier()

        test_data = pd.DataFrame(
            {
                "Pclass": [1, 2, 3],
                "Age": [30.0, 25.0, 20.0],
                "SibSp": [0, 1, 0],
                "Parch": [0, 0, 1],
                "Fare": [71.0, 30.0, 7.0],
                "Sex": ["female", "male", "female"],
                "Survived": [1, 0, 1],
            }
        )

        result = classifier._encode_sex(test_data)

        # Sex 列が削除され、male 列が追加されていることを確認
        assert "Sex" not in result.columns
        assert "male" in result.columns

        # male のダミー変数の値を確認
        assert result.loc[0, "male"] == 0  # female -> 0
        assert result.loc[1, "male"] == 1  # male -> 1
        assert result.loc[2, "male"] == 0  # female -> 0


class TestSurvivedClassifierTraining:
    """モデル訓練のテスト."""

    def test_モデル訓練(self):
        """モデルが正しく訓練されることを確認."""
        classifier = SurvivedClassifier()
        X, y = classifier.load_data("data/Survived.csv")

        # データ分割
        from sklearn.model_selection import train_test_split

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=0
        )

        # 訓練
        classifier.train(X_train, y_train)

        assert classifier.model is not None
        assert hasattr(classifier.model, "predict")

    def test_訓練前の予測でエラー(self):
        """訓練前に予測するとエラーが発生することを確認."""
        classifier = SurvivedClassifier()
        X, y = classifier.load_data("data/Survived.csv")

        with pytest.raises(RuntimeError, match="Model has not been trained yet"):
            classifier.predict(X)


class TestSurvivedClassifierPrediction:
    """予測のテスト."""

    def test_予測実行(self):
        """予測が正しく実行されることを確認."""
        classifier = SurvivedClassifier()
        X, y = classifier.load_data("data/Survived.csv")

        from sklearn.model_selection import train_test_split

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=0
        )

        classifier.train(X_train, y_train)
        predictions = classifier.predict(X_test)

        assert len(predictions) == len(X_test)
        assert all(p in [0, 1] for p in predictions)

    def test_評価実行(self):
        """評価が正しく実行されることを確認."""
        classifier = SurvivedClassifier()
        X, y = classifier.load_data("data/Survived.csv")

        from sklearn.model_selection import train_test_split

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=0
        )

        classifier.train(X_train, y_train)
        accuracy = classifier.evaluate(X_test, y_test)

        assert 0.0 <= accuracy <= 1.0


class TestSurvivedClassifierPersistence:
    """モデル永続化のテスト."""

    def test_モデル保存(self):
        """モデルが保存できることを確認."""
        classifier = SurvivedClassifier()
        X, y = classifier.load_data("data/Survived.csv")

        from sklearn.model_selection import train_test_split

        X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=0)

        classifier.train(X_train, y_train)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pkl") as f:
            temp_path = f.name

        try:
            classifier.save_model(temp_path)
            assert os.path.exists(temp_path)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def test_モデル読み込み(self):
        """モデルが読み込めることを確認."""
        classifier = SurvivedClassifier()
        X, y = classifier.load_data("data/Survived.csv")

        from sklearn.model_selection import train_test_split

        X_train, X_test, y_train, _ = train_test_split(
            X, y, test_size=0.2, random_state=0
        )

        classifier.train(X_train, y_train)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pkl") as f:
            temp_path = f.name

        try:
            # 保存
            classifier.save_model(temp_path)

            # 新しいインスタンスで読み込み
            new_classifier = SurvivedClassifier()
            new_classifier.load_model(temp_path)

            assert new_classifier.model is not None

            # 読み込んだモデルで予測できることを確認
            predictions = new_classifier.predict(X_test)
            assert len(predictions) == len(X_test)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def test_未訓練モデルの保存でエラー(self):
        """未訓練モデルを保存しようとするとエラーが発生することを確認."""
        classifier = SurvivedClassifier()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pkl") as f:
            temp_path = f.name

        try:
            with pytest.raises(RuntimeError, match="Model has not been trained yet"):
                classifier.save_model(temp_path)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
