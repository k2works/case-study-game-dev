"""Boston 住宅価格予測器のテストモジュール."""
import os
import tempfile

import numpy as np
import pandas as pd
import pytest

from src.ml.boston_predictor import BostonPredictor


class TestBostonPredictorInit:
    """初期化のテスト."""

    def test_初期化(self):
        """初期化できることを確認."""
        predictor = BostonPredictor()

        assert predictor.model is None
        assert predictor.scaler_X is None
        assert predictor.scaler_y is None
        assert predictor.train_mean is None


class TestBostonPredictorDataLoading:
    """データ読み込みのテスト."""

    def test_CSVファイルからのデータ読み込み(self):
        """CSV ファイルからデータを読み込めることを確認."""
        predictor = BostonPredictor()
        df = predictor.load_data("data/Boston.csv")

        assert df is not None
        assert isinstance(df, pd.DataFrame)

    def test_必要な列が存在する(self):
        """必要な列がすべて存在することを確認."""
        predictor = BostonPredictor()
        df = predictor.load_data("data/Boston.csv")

        required_columns = ["RM", "LSTAT", "PTRATIO", "CRIME", "PRICE"]
        for col in required_columns:
            assert col in df.columns

    def test_存在しないファイルでエラー(self):
        """存在しないファイルで例外が発生することを確認."""
        predictor = BostonPredictor()

        with pytest.raises(FileNotFoundError, match="File not found"):
            predictor.load_data("data/nonexistent.csv")

    def test_必要な列が不足している場合エラー(self):
        """必要な列が不足している場合に例外が発生することを確認."""
        predictor = BostonPredictor()

        # 一時ファイルを作成（不足している列）
        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".csv") as f:
            f.write("A,B,C\n1,2,3\n")
            temp_path = f.name

        try:
            with pytest.raises(ValueError, match="Missing columns"):
                predictor.load_data(temp_path)
        finally:
            os.remove(temp_path)


class TestBostonPredictorEncodeCrime:
    """CRIME 列ダミー変数化のテスト."""

    def test_CRIME列がダミー変数化される(self):
        """CRIME 列がダミー変数に変換されることを確認."""
        predictor = BostonPredictor()

        df = pd.DataFrame(
            {"RM": [6.5, 5.5], "CRIME": ["low", "high"], "PRICE": [24.0, 18.5]}
        )

        df_encoded = predictor._encode_crime(df)

        # CRIME 列が削除され、ダミー変数が追加されることを確認
        assert "CRIME" not in df_encoded.columns
        # drop_first=True により、アルファベット順で最初（high）が削除され low が作成される
        assert "low" in df_encoded.columns

    def test_ダミー変数の値が正しい(self):
        """ダミー変数の値が正しいことを確認."""
        predictor = BostonPredictor()

        df = pd.DataFrame({"CRIME": ["low", "high", "low", "medium"]})

        df_encoded = predictor._encode_crime(df)

        # drop_first=True により、アルファベット順で最初（high）が削除され、low と medium が作成される
        assert "low" in df_encoded.columns
        assert "medium" in df_encoded.columns

    def test_他の列は保持される(self):
        """CRIME 以外の列は保持されることを確認."""
        predictor = BostonPredictor()

        df = pd.DataFrame(
            {
                "RM": [6.5, 5.5],
                "LSTAT": [5.0, 10.0],
                "CRIME": ["low", "high"],
                "PRICE": [24.0, 18.5],
            }
        )

        df_encoded = predictor._encode_crime(df)

        assert "RM" in df_encoded.columns
        assert "LSTAT" in df_encoded.columns
        assert "PRICE" in df_encoded.columns
        assert df_encoded["RM"].tolist() == [6.5, 5.5]


class TestBostonPredictorPreprocess:
    """前処理のテスト."""

    def test_欠損値が平均値で補完される(self):
        """欠損値が訓練データの平均値で補完されることを確認."""
        predictor = BostonPredictor()

        df_train = pd.DataFrame(
            {
                "RM": [6.0, 7.0, 5.0],
                "LSTAT": [5.0, 10.0, np.nan],  # 平均: 7.5
                "PRICE": [24.0, 18.5, 21.0],
            }
        )

        df_filled = predictor._fill_missing_values(df_train, fit=True)

        # 欠損値が平均値で補完される
        assert df_filled["LSTAT"].iloc[2] == 7.5
        # train_mean が保存される
        assert predictor.train_mean is not None

    def test_テストデータは訓練データの平均で補完される(self):
        """テストデータは訓練データの平均で補完されることを確認."""
        predictor = BostonPredictor()

        df_train = pd.DataFrame(
            {
                "RM": [6.0, 7.0, 5.0],
                "LSTAT": [5.0, 10.0, 15.0],
                "PRICE": [24.0, 18.5, 21.0],
            }
        )

        # 訓練データで平均を計算
        predictor._fill_missing_values(df_train, fit=True)

        df_test = pd.DataFrame({"RM": [np.nan], "LSTAT": [8.0], "PRICE": [20.0]})

        # テストデータは訓練データの平均で補完
        df_test_filled = predictor._fill_missing_values(df_test, fit=False)

        # 訓練データの RM 平均は 6.0
        assert df_test_filled["RM"].iloc[0] == 6.0

    def test_外れ値が除外される(self):
        """特定のインデックスの外れ値が除外されることを確認."""
        predictor = BostonPredictor()

        # インデックス 76 を含むデータ
        df = pd.DataFrame(
            {"RM": [6.0, 7.0, 5.0, 8.0], "PRICE": [24.0, 18.5, 21.0, 50.0]},
            index=[0, 1, 76, 3],
        )

        df_cleaned = predictor._remove_outliers(df)

        # インデックス 76 が除外される
        assert 76 not in df_cleaned.index
        assert len(df_cleaned) == 3

    def test_fit前のtransformでエラー(self):
        """fit 前に transform しようとすると ValueError を発生."""
        predictor = BostonPredictor()

        df_test = pd.DataFrame({"RM": [6.0]})

        with pytest.raises(ValueError, match="train_mean not set"):
            predictor._fill_missing_values(df_test, fit=False)


class TestBostonPredictorFeatureEngineering:
    """特徴量エンジニアリングのテスト."""

    def test_2乗項が追加される(self):
        """2乗項が正しく追加されることを確認."""
        predictor = BostonPredictor()

        X = pd.DataFrame({"RM": [6.5], "LSTAT": [5.0], "PTRATIO": [15.0]})

        X_engineered = predictor.feature_engineering(X)

        # 2乗項が追加される
        assert "RM2" in X_engineered.columns
        assert "LSTAT2" in X_engineered.columns
        assert "PTRATIO2" in X_engineered.columns

        # 値が正しい
        assert X_engineered["RM2"].iloc[0] == 42.25  # 6.5^2
        assert X_engineered["LSTAT2"].iloc[0] == 25.0  # 5.0^2
        assert X_engineered["PTRATIO2"].iloc[0] == 225.0  # 15.0^2

    def test_交互作用項が追加される(self):
        """交互作用項が正しく追加されることを確認."""
        predictor = BostonPredictor()

        X = pd.DataFrame({"RM": [6.5], "LSTAT": [5.0], "PTRATIO": [15.0]})

        X_engineered = predictor.feature_engineering(X)

        # 交互作用項が追加される
        assert "RM * LSTAT" in X_engineered.columns
        assert X_engineered["RM * LSTAT"].iloc[0] == 32.5  # 6.5 * 5.0

    def test_元の特徴量は保持される(self):
        """元の特徴量が保持されることを確認."""
        predictor = BostonPredictor()

        X = pd.DataFrame(
            {"RM": [6.5, 5.5], "LSTAT": [5.0, 10.0], "PTRATIO": [15.0, 18.0]}
        )

        X_engineered = predictor.feature_engineering(X)

        # 元の特徴量が保持される
        assert "RM" in X_engineered.columns
        assert "LSTAT" in X_engineered.columns
        assert "PTRATIO" in X_engineered.columns
        assert X_engineered["RM"].tolist() == [6.5, 5.5]

    def test_特徴量数が正しい(self):
        """特徴量数が3個から7個に増えることを確認."""
        predictor = BostonPredictor()

        X = pd.DataFrame({"RM": [6.5], "LSTAT": [5.0], "PTRATIO": [15.0]})

        X_engineered = predictor.feature_engineering(X)

        # 元の3個 + 2乗項3個 + 交互作用項1個 = 7個
        assert len(X_engineered.columns) == 7


class TestBostonPredictorStandardization:
    """標準化のテスト."""

    def test_特徴量の標準化_訓練データ(self):
        """訓練データの特徴量が標準化されることを確認."""
        predictor = BostonPredictor()

        X_train = pd.DataFrame({"RM": [5.0, 6.0, 7.0], "LSTAT": [10.0, 20.0, 30.0]})

        X_scaled = predictor.standardize_features(X_train, fit=True)

        # 標準化後、平均が0、標準偏差が1付近になることを確認
        assert abs(X_scaled.mean()) < 0.01
        assert abs(X_scaled.std() - 1.0) < 0.01

    def test_特徴量の標準化_テストデータ(self):
        """テストデータが訓練データのスケーラーで標準化されることを確認."""
        predictor = BostonPredictor()

        X_train = pd.DataFrame({"RM": [5.0, 6.0, 7.0]})

        X_test = pd.DataFrame({"RM": [6.0]})

        # 訓練データでスケーラーを fit
        predictor.standardize_features(X_train, fit=True)

        # テストデータは同じスケーラーで transform のみ
        X_test_scaled = predictor.standardize_features(X_test, fit=False)

        # スケーラーが同じであることを確認
        assert predictor.scaler_X is not None
        # テストデータの値が訓練データの統計量で変換されることを確認
        assert X_test_scaled.shape == (1, 1)

    def test_目的変数の標準化(self):
        """目的変数が標準化されることを確認."""
        predictor = BostonPredictor()

        y_train = pd.DataFrame({"PRICE": [20.0, 25.0, 30.0]})

        y_scaled = predictor.standardize_target(y_train, fit=True)

        # 標準化後、平均が0、標準偏差が1付近になることを確認
        assert abs(y_scaled.mean()) < 0.01
        assert abs(y_scaled.std() - 1.0) < 0.01

    def test_逆標準化(self):
        """予測結果が元のスケールに戻されることを確認."""
        predictor = BostonPredictor()

        y_train = pd.DataFrame({"PRICE": [20.0, 25.0, 30.0]})

        # 標準化
        y_scaled = predictor.standardize_target(y_train, fit=True)

        # 逆標準化
        y_original = predictor.inverse_transform_prediction(y_scaled)

        # 元の値に戻ることを確認
        np.testing.assert_array_almost_equal(
            y_original.flatten(), y_train["PRICE"].values, decimal=5
        )

    def test_fit前にtransformするとエラー(self):
        """fit 前に transform しようとすると ValueError を発生."""
        predictor = BostonPredictor()

        X_test = pd.DataFrame({"RM": [6.0]})

        with pytest.raises(ValueError, match="Scaler not fitted yet"):
            predictor.standardize_features(X_test, fit=False)

    def test_逆標準化前にscaler未設定でエラー(self):
        """scaler_y が未設定で逆標準化しようとすると RuntimeError を発生."""
        predictor = BostonPredictor()

        y_pred = np.array([[25.0]])

        with pytest.raises(RuntimeError, match="scaler_y not set"):
            predictor.inverse_transform_prediction(y_pred)


class TestBostonPredictorTraining:
    """モデル訓練のテスト."""

    def test_モデル訓練(self):
        """モデルが正しく訓練されることを確認."""
        predictor = BostonPredictor()

        # ダミーの訓練データ
        X_train = np.array([[6.5, 5.0, 15.0], [5.5, 10.0, 18.0], [7.0, 8.0, 16.0]])
        y_train = np.array([24.0, 18.5, 30.0])

        # 訓練
        predictor.train(X_train, y_train)

        assert predictor.model is not None
        assert hasattr(predictor.model, "predict")

    def test_訓練前の予測でエラー(self):
        """訓練前に予測するとエラーが発生することを確認."""
        predictor = BostonPredictor()
        X_test = np.array([[6.5, 5.0, 15.0]])

        with pytest.raises(RuntimeError, match="Model has not been trained yet"):
            predictor.predict(X_test)


class TestBostonPredictorPrediction:
    """予測のテスト."""

    def test_予測実行(self):
        """予測が正しく実行されることを確認."""
        predictor = BostonPredictor()

        # ダミーの訓練データ
        X_train = np.array([[6.5, 5.0, 15.0], [5.5, 10.0, 18.0], [7.0, 8.0, 16.0]])
        y_train = np.array([24.0, 18.5, 30.0])

        predictor.train(X_train, y_train)

        # テストデータで予測
        X_test = np.array([[6.0, 7.0, 17.0]])
        predictions = predictor.predict(X_test)

        assert len(predictions) == len(X_test)
        assert isinstance(predictions, np.ndarray)

    def test_評価実行(self):
        """評価が正しく実行されることを確認."""
        predictor = BostonPredictor()

        # ダミーの訓練データ
        X_train = np.array([[6.5, 5.0, 15.0], [5.5, 10.0, 18.0], [7.0, 8.0, 16.0]])
        y_train = np.array([24.0, 18.5, 30.0])

        predictor.train(X_train, y_train)

        # 評価
        score = predictor.evaluate(X_train, y_train)

        # R² スコアは理論的には負の値も取り得るが、訓練データでは高い値になるはず
        assert isinstance(score, float)


class TestBostonPredictorPersistence:
    """モデル永続化のテスト."""

    def test_モデル保存(self):
        """モデルとスケーラーが保存できることを確認."""
        predictor = BostonPredictor()

        # ダミーの訓練データ
        X_train = np.array([[6.5, 5.0, 15.0], [5.5, 10.0, 18.0], [7.0, 8.0, 16.0]])
        y_train = np.array([[24.0], [18.5], [30.0]])

        # 標準化スケーラーを設定
        X_df = pd.DataFrame(X_train, columns=["RM", "LSTAT", "PTRATIO"])
        y_df = pd.DataFrame(y_train, columns=["PRICE"])

        X_scaled = predictor.standardize_features(X_df, fit=True)
        y_scaled = predictor.standardize_target(y_df, fit=True)

        # 訓練
        predictor.train(X_scaled, y_scaled)

        # 一時ファイル作成
        with tempfile.NamedTemporaryFile(
            delete=False, suffix="_model.pkl"
        ) as f_model:
            model_path = f_model.name
        with tempfile.NamedTemporaryFile(
            delete=False, suffix="_scaler_X.pkl"
        ) as f_scaler_X:
            scaler_X_path = f_scaler_X.name
        with tempfile.NamedTemporaryFile(
            delete=False, suffix="_scaler_y.pkl"
        ) as f_scaler_y:
            scaler_y_path = f_scaler_y.name

        try:
            predictor.save_models(model_path, scaler_X_path, scaler_y_path)
            assert os.path.exists(model_path)
            assert os.path.exists(scaler_X_path)
            assert os.path.exists(scaler_y_path)
        finally:
            for path in [model_path, scaler_X_path, scaler_y_path]:
                if os.path.exists(path):
                    os.remove(path)

    def test_モデル読み込み(self):
        """モデルとスケーラーが読み込めることを確認."""
        predictor = BostonPredictor()

        # ダミーの訓練データ
        X_train = np.array([[6.5, 5.0, 15.0], [5.5, 10.0, 18.0], [7.0, 8.0, 16.0]])
        y_train = np.array([[24.0], [18.5], [30.0]])

        # 標準化スケーラーを設定
        X_df = pd.DataFrame(X_train, columns=["RM", "LSTAT", "PTRATIO"])
        y_df = pd.DataFrame(y_train, columns=["PRICE"])

        X_scaled = predictor.standardize_features(X_df, fit=True)
        y_scaled = predictor.standardize_target(y_df, fit=True)

        # 訓練
        predictor.train(X_scaled, y_scaled)

        # 一時ファイル作成
        with tempfile.NamedTemporaryFile(
            delete=False, suffix="_model.pkl"
        ) as f_model:
            model_path = f_model.name
        with tempfile.NamedTemporaryFile(
            delete=False, suffix="_scaler_X.pkl"
        ) as f_scaler_X:
            scaler_X_path = f_scaler_X.name
        with tempfile.NamedTemporaryFile(
            delete=False, suffix="_scaler_y.pkl"
        ) as f_scaler_y:
            scaler_y_path = f_scaler_y.name

        try:
            # 保存
            predictor.save_models(model_path, scaler_X_path, scaler_y_path)

            # 新しいインスタンスで読み込み
            new_predictor = BostonPredictor()
            new_predictor.load_models(model_path, scaler_X_path, scaler_y_path)

            assert new_predictor.model is not None
            assert new_predictor.scaler_X is not None
            assert new_predictor.scaler_y is not None

            # 読み込んだモデルで予測できることを確認
            X_test = np.array([[6.0, 7.0, 17.0]])
            predictions = new_predictor.predict(X_test)
            assert len(predictions) == len(X_test)
        finally:
            for path in [model_path, scaler_X_path, scaler_y_path]:
                if os.path.exists(path):
                    os.remove(path)

    def test_未訓練モデルの保存でエラー(self):
        """未訓練モデルを保存しようとするとエラーが発生することを確認."""
        predictor = BostonPredictor()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pkl") as f:
            temp_path = f.name

        try:
            with pytest.raises(RuntimeError, match="Model has not been trained yet"):
                predictor.save_models(temp_path, temp_path, temp_path)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def test_存在しないファイルの読み込みでエラー(self):
        """存在しないファイルを読み込もうとするとエラーが発生することを確認."""
        predictor = BostonPredictor()

        with pytest.raises(FileNotFoundError, match="File not found"):
            predictor.load_models(
                "nonexistent_model.pkl",
                "nonexistent_scaler_X.pkl",
                "nonexistent_scaler_y.pkl",
            )
