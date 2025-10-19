"""Survived 生存予測器モジュール."""

import os
import pickle
from typing import Optional, Tuple

import pandas as pd
from sklearn import tree


class SurvivedClassifier:
    """客船沈没事故の生存を予測する分類モデル.

    Attributes:
        max_depth: 決定木の最大深度
        class_weight: クラスの重み付け（'balanced' で自動調整）
        model: 訓練済みの決定木モデル（未訓練時は None）
    """

    def __init__(self, max_depth: int = 9, class_weight: str = "balanced") -> None:
        """初期化.

        Args:
            max_depth: 決定木の最大深度（デフォルト: 9）
            class_weight: クラス重み付け方法（デフォルト: 'balanced'）

        Raises:
            ValueError: max_depth が 1 未満の場合
        """
        if max_depth < 1:
            raise ValueError("max_depth must be at least 1")

        self.max_depth = max_depth
        self.class_weight = class_weight
        self.model: Optional[tree.DecisionTreeClassifier] = None

    def load_data(
        self, file_path: str, preprocess: bool = True
    ) -> Tuple[pd.DataFrame, pd.Series]:
        """CSV ファイルからデータを読み込む.

        Args:
            file_path: CSV ファイルのパス
            preprocess: 前処理を実行するかどうか（デフォルト: True）

        Returns:
            特徴量 DataFrame と目的変数 Series のタプル

        Raises:
            FileNotFoundError: ファイルが存在しない場合
            ValueError: 必要な列が不足している場合
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        # データの読み込み
        df = pd.read_csv(file_path)

        # 必要な列の存在確認
        required_columns = [
            "Pclass",
            "Age",
            "SibSp",
            "Parch",
            "Fare",
            "Sex",
            "Survived",
        ]
        missing_columns = set(required_columns) - set(df.columns)
        if missing_columns:
            raise ValueError(f"Missing columns: {missing_columns}")

        # 前処理の実行（オプション）
        if preprocess:
            df = self._preprocess_data(df)

        # 特徴量と目的変数の分割
        feature_columns = ["Pclass", "Age", "SibSp", "Parch", "Fare", "male"]
        if not preprocess:
            # 前処理なしの場合、Sex 列をそのまま使う（テスト用）
            feature_columns = ["Pclass", "Age", "SibSp", "Parch", "Fare", "Sex"]

        X = df[feature_columns]
        y = df["Survived"]

        return X, y

    def _preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """データの前処理（内部メソッド）.

        Args:
            df: 元の DataFrame

        Returns:
            前処理済みの DataFrame
        """
        df = self._preprocess_age(df)
        df = self._encode_sex(df)
        return df

    def _preprocess_age(self, df: pd.DataFrame) -> pd.DataFrame:
        """Age 列の欠損値をグループ別中央値で補完.

        Pclass と Survived のグループごとに中央値を計算し、欠損値を補完します。

        Args:
            df: 元の DataFrame

        Returns:
            Age が補完された DataFrame
        """
        df_copy = df.copy()

        # グループ別の中央値を計算
        group_medians = df_copy.groupby(["Pclass", "Survived"])["Age"].median()

        # 各行の欠損値を対応するグループの中央値で補完
        for idx, row in df_copy[df_copy["Age"].isnull()].iterrows():
            pclass = row["Pclass"]
            survived = row["Survived"]
            median_age = group_medians.get((pclass, survived))

            if pd.notna(median_age):
                df_copy.loc[idx, "Age"] = median_age
            else:
                # グループに該当がない場合は全体の中央値を使用
                df_copy.loc[idx, "Age"] = df_copy["Age"].median()

        return df_copy

    def _encode_sex(self, df: pd.DataFrame) -> pd.DataFrame:
        """Sex 列をダミー変数に変換.

        Args:
            df: 元の DataFrame

        Returns:
            Sex がダミー変数化された DataFrame
        """
        df_copy = df.copy()

        # Sex をダミー変数化（drop_first=True で female を削除）
        sex_dummies = pd.get_dummies(df_copy["Sex"], drop_first=True, dtype=int)
        df_encoded = pd.concat([df_copy.drop("Sex", axis=1), sex_dummies], axis=1)

        return df_encoded

    def train(self, X_train: pd.DataFrame, y_train: pd.Series) -> None:
        """モデルを訓練する.

        Args:
            X_train: 訓練用特徴量
            y_train: 訓練用目的変数
        """
        self.model = tree.DecisionTreeClassifier(
            max_depth=self.max_depth, class_weight=self.class_weight, random_state=0
        )
        self.model.fit(X_train, y_train)

    def predict(self, X_test: pd.DataFrame) -> pd.Series:
        """予測を行う.

        Args:
            X_test: テスト用特徴量

        Returns:
            予測結果

        Raises:
            RuntimeError: モデルが訓練されていない場合
        """
        if self.model is None:
            raise RuntimeError("Model has not been trained yet. Call train() first.")

        return self.model.predict(X_test)

    def evaluate(self, X_test: pd.DataFrame, y_test: pd.Series) -> float:
        """モデルを評価する.

        Args:
            X_test: テスト用特徴量
            y_test: テスト用目的変数

        Returns:
            正解率（accuracy）

        Raises:
            RuntimeError: モデルが訓練されていない場合
        """
        if self.model is None:
            raise RuntimeError("Model has not been trained yet. Call train() first.")

        score: float = self.model.score(X_test, y_test)
        return score

    def save_model(self, file_path: str) -> None:
        """訓練済みモデルをファイルに保存する.

        Args:
            file_path: 保存先ファイルパス

        Raises:
            RuntimeError: モデルが訓練されていない場合
        """
        if self.model is None:
            raise RuntimeError("Model has not been trained yet. Call train() first.")

        with open(file_path, "wb") as f:
            pickle.dump(self.model, f)

    def load_model(self, file_path: str) -> None:
        """保存されたモデルをファイルから読み込む.

        Args:
            file_path: 読み込むファイルパス

        Raises:
            FileNotFoundError: ファイルが存在しない場合
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        with open(file_path, "rb") as f:
            self.model = pickle.load(f)
