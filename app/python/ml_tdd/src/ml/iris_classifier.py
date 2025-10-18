"""Iris 分類器モジュール."""

import os
import pickle
from typing import Optional, Tuple

import numpy as np
import pandas as pd
from sklearn import tree


class IrisClassifier:
    """Iris データセットを分類する決定木モデル.

    Attributes:
        max_depth: 決定木の最大深さ
        model: 訓練済みの決定木モデル（未訓練時は None）
    """

    def __init__(self, max_depth: int = 2) -> None:
        """初期化.

        Args:
            max_depth: 決定木の最大深さ（デフォルト: 2）

        Raises:
            ValueError: max_depth が 1 未満の場合
        """
        if max_depth < 1:
            raise ValueError("max_depth must be at least 1")

        self.max_depth = max_depth
        self.model: Optional[tree.DecisionTreeClassifier] = None

    def _validate_dataframe(self, df: pd.DataFrame) -> None:
        """データフレームの妥当性を検証.

        Args:
            df: 検証する DataFrame

        Raises:
            ValueError: 必要な列が不足している場合
        """
        required_columns = [
            "sepal_length",
            "sepal_width",
            "petal_length",
            "petal_width",
            "species",
        ]
        missing_columns = set(required_columns) - set(df.columns)
        if missing_columns:
            raise ValueError(f"Missing columns: {missing_columns}")

    def _fill_missing_values(
        self, df: pd.DataFrame, columns: list[str]
    ) -> pd.DataFrame:
        """欠損値を平均値で補完.

        Args:
            df: 対象の DataFrame
            columns: 補完する列のリスト

        Returns:
            補完後の DataFrame
        """
        df_filled = df.copy()
        for col in columns:
            if df_filled[col].isnull().any():
                mean_value = df_filled[col].mean()
                df_filled[col] = df_filled[col].fillna(mean_value)
        return df_filled

    def load_data(self, file_path: str) -> Tuple[pd.DataFrame, pd.Series]:
        """CSV ファイルからデータを読み込む.

        Args:
            file_path: CSV ファイルのパス

        Returns:
            特徴量 DataFrame と正解ラベル Series のタプル

        Raises:
            FileNotFoundError: ファイルが存在しない場合
            ValueError: データの形式が不正な場合
        """
        # ファイルの存在確認
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        # データの読み込み
        df = pd.read_csv(file_path)

        # データの妥当性検証
        self._validate_dataframe(df)

        # 特徴量列
        feature_columns = [
            "sepal_length",
            "sepal_width",
            "petal_length",
            "petal_width",
        ]

        # 欠損値の補完
        df = self._fill_missing_values(df, feature_columns)

        # 特徴量と正解ラベルの分割
        X = df[feature_columns]
        y = df["species"]

        # species のラベルから "Iris-" プレフィックスを削除
        y = y.str.replace("Iris-", "", regex=False)

        return X, y

    def train(self, X_train: pd.DataFrame, y_train: pd.Series) -> None:
        """モデルを訓練する.

        Args:
            X_train: 訓練用特徴量
            y_train: 訓練用正解ラベル

        Raises:
            ValueError: データが空、または特徴量とラベルの数が不一致の場合
        """
        # データの妥当性チェック
        if len(X_train) == 0 or len(y_train) == 0:
            raise ValueError("Training data cannot be empty")

        if len(X_train) != len(y_train):
            raise ValueError(
                f"X_train and y_train must have the same length: "
                f"{len(X_train)} != {len(y_train)}"
            )

        # 決定木モデルの作成
        self.model = tree.DecisionTreeClassifier(
            max_depth=self.max_depth, random_state=0  # 再現性のため
        )

        # モデルの訓練
        self.model.fit(X_train, y_train)

    def predict(
        self, X_test: pd.DataFrame
    ) -> np.ndarray[tuple[int, ...], np.dtype[np.str_]]:
        """予測を実行する.

        Args:
            X_test: テスト用特徴量

        Returns:
            予測されたクラスラベルの配列

        Raises:
            ValueError: モデルが未訓練の場合
        """
        if self.model is None:
            raise ValueError("Model has not been trained yet")

        result: np.ndarray[tuple[int, ...], np.dtype[np.str_]]
        result = self.model.predict(X_test)
        return result

    def evaluate(self, X_test: pd.DataFrame, y_test: pd.Series) -> float:
        """モデルの性能を評価する.

        Args:
            X_test: テスト用特徴量
            y_test: テスト用正解ラベル

        Returns:
            正解率（0.0 〜 1.0）

        Raises:
            ValueError: モデルが未訓練の場合
        """
        if self.model is None:
            raise ValueError("Model has not been trained yet")

        score: float = self.model.score(X_test, y_test)
        return score

    def save_model(self, file_path: str) -> None:
        """訓練済みモデルをファイルに保存する.

        Args:
            file_path: 保存先のファイルパス

        Raises:
            ValueError: モデルが未訓練の場合
        """
        if self.model is None:
            raise ValueError("No trained model to save")

        with open(file_path, "wb") as f:
            pickle.dump(self.model, f)

    def load_model(self, file_path: str) -> None:
        """保存されたモデルをファイルから読み込む.

        Args:
            file_path: 読み込むファイルのパス

        Raises:
            FileNotFoundError: ファイルが存在しない場合
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Model file not found: {file_path}")

        with open(file_path, "rb") as f:
            self.model = pickle.load(f)
