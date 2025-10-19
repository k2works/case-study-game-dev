"""Cinema 興行収入予測器モジュール."""

import os
import pickle
from typing import Dict, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


class CinemaPredictor:
    """映画興行収入を予測する線形回帰モデル.

    Attributes:
        model: 訓練済みの線形回帰モデル（未訓練時は None）
    """

    def __init__(self) -> None:
        """初期化."""
        self.model: Optional[LinearRegression] = None

    def load_data(self, file_path: str) -> Tuple[pd.DataFrame, pd.Series]:
        """CSV ファイルからデータを読み込む.

        Args:
            file_path: CSV ファイルのパス

        Returns:
            特徴量 DataFrame と目的変数 Series のタプル

        Raises:
            FileNotFoundError: ファイルが存在しない場合
            ValueError: データの形式が不正な場合
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        # データの読み込み
        df = pd.read_csv(file_path)

        # 必要な列の存在確認
        required_columns = ["SNS1", "SNS2", "actor", "original", "sales"]
        missing_columns = set(required_columns) - set(df.columns)
        if missing_columns:
            raise ValueError(f"Missing columns: {missing_columns}")

        # 特徴量列
        feature_columns = ["SNS1", "SNS2", "actor", "original"]

        # 特徴量と目的変数の分離
        X = df[feature_columns].copy()
        y = df["sales"].copy()

        # 欠損値を平均値で補完
        for col in feature_columns:
            if X[col].isnull().any():
                mean_value = X[col].mean()
                X[col] = X[col].fillna(mean_value)

        return X, y

    def train(self, X: pd.DataFrame, y: pd.Series) -> None:
        """モデルを訓練する.

        Args:
            X: 特徴量 DataFrame
            y: 目的変数 Series
        """
        self.model = LinearRegression()
        self.model.fit(X, y)

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """予測を行う.

        Args:
            X: 特徴量 DataFrame

        Returns:
            予測結果の numpy 配列

        Raises:
            ValueError: モデルが訓練されていない場合
        """
        if self.model is None:
            raise ValueError("Model is not trained yet")

        return self.model.predict(X)

    def evaluate(self, y_true: pd.Series, y_pred: np.ndarray) -> Dict[str, float]:
        """モデルの性能を評価する.

        Args:
            y_true: 真の値（実測値）
            y_pred: 予測値

        Returns:
            評価指標の辞書（r2, mae, rmse）
        """
        r2 = r2_score(y_true, y_pred)
        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))

        return {"r2": r2, "mae": mae, "rmse": rmse}

    def save_model(self, file_path: str) -> None:
        """モデルをファイルに保存する.

        Args:
            file_path: 保存先のファイルパス

        Raises:
            ValueError: モデルが訓練されていない場合
        """
        if self.model is None:
            raise ValueError("Model is not trained yet")

        with open(file_path, "wb") as f:
            pickle.dump(self.model, f)

    def load_model(self, file_path: str) -> None:
        """ファイルからモデルを読み込む.

        Args:
            file_path: 読み込むファイルパス

        Raises:
            FileNotFoundError: ファイルが存在しない場合
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        with open(file_path, "rb") as f:
            self.model = pickle.load(f)
