"""Boston 住宅価格予測器モジュール."""

import os
import pickle
from typing import Optional

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler


class BostonPredictor:
    """ボストン市の住宅価格を予測する回帰モデル.

    Attributes:
        model: 訓練済みの線形回帰モデル（未訓練時は None）
        scaler_X: 特徴量の標準化スケーラー（未訓練時は None）
        scaler_y: 目的変数の標準化スケーラー（未訓練時は None）
        train_mean: 訓練データの平均値（欠損値補完用）

    Example:
        >>> predictor = BostonPredictor()
        >>> df = predictor.load_data('data/Boston.csv')
        >>> # データの前処理と訓練（詳細は train_boston.py 参照）
    """

    def __init__(self) -> None:
        """初期化."""
        self.model: Optional[LinearRegression] = None
        self.scaler_X: Optional[StandardScaler] = None
        self.scaler_y: Optional[StandardScaler] = None
        self.train_mean: Optional[pd.Series] = None

    def load_data(self, file_path: str) -> pd.DataFrame:
        """CSV ファイルからデータを読み込む.

        Args:
            file_path: CSV ファイルのパス

        Returns:
            読み込んだ DataFrame

        Raises:
            FileNotFoundError: ファイルが存在しない場合
            ValueError: 必要な列が不足している場合
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        # データの読み込み
        df = pd.read_csv(file_path)

        # 必要な列の存在確認
        required_columns = ["RM", "LSTAT", "PTRATIO", "CRIME", "PRICE"]
        missing_columns = set(required_columns) - set(df.columns)
        if missing_columns:
            raise ValueError(f"Missing columns: {missing_columns}")

        return df

    def _encode_crime(self, df: pd.DataFrame) -> pd.DataFrame:
        """CRIME 列をダミー変数に変換.

        Args:
            df: 元の DataFrame

        Returns:
            CRIME がダミー変数化された DataFrame

        Note:
            drop_first=True により、最初のカテゴリ（アルファベット順）を
            基準とし、それ以外のカテゴリのダミー変数を作成
        """
        df_copy = df.copy()

        # CRIME をダミー変数化（drop_first=True）
        crime_dummies = pd.get_dummies(df_copy["CRIME"], drop_first=True, dtype=int)
        df_encoded = pd.concat([df_copy.drop("CRIME", axis=1), crime_dummies], axis=1)

        return df_encoded

    def _fill_missing_values(self, df: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
        """欠損値を平均値で補完.

        Args:
            df: 対象の DataFrame
            fit: True の場合は平均値を計算して保存、False の場合は保存済みの平均値を使用

        Returns:
            欠損値が補完された DataFrame

        Raises:
            ValueError: fit=False の場合で train_mean が未設定の場合
        """
        if fit:
            # 訓練データの平均値を計算して保存
            self.train_mean = df.mean()
            return df.fillna(self.train_mean)
        else:
            # テストデータは訓練データの平均値で補完
            if self.train_mean is None:
                raise ValueError("train_mean not set. Call with fit=True first.")
            return df.fillna(self.train_mean)

    def _remove_outliers(self, df: pd.DataFrame) -> pd.DataFrame:
        """外れ値を除外.

        Args:
            df: 対象の DataFrame

        Returns:
            外れ値を除外した DataFrame

        Note:
            インデックス 76 のデータポイントを外れ値として除外
        """
        # インデックス 76 が存在する場合のみ除外
        if 76 in df.index:
            return df.drop([76], axis=0)
        return df

    def feature_engineering(self, X: pd.DataFrame) -> pd.DataFrame:
        """特徴量エンジニアリング（2乗項と交互作用項の追加）.

        Args:
            X: 元の特徴量 DataFrame

        Returns:
            エンジニアリング後の特徴量 DataFrame

        Note:
            - 2乗項: RM2, LSTAT2, PTRATIO2
            - 交互作用項: RM * LSTAT
            合計7個の特徴量を生成
        """
        X_new = X.copy()

        # 2乗項の追加
        X_new["RM2"] = X["RM"] ** 2
        X_new["LSTAT2"] = X["LSTAT"] ** 2
        X_new["PTRATIO2"] = X["PTRATIO"] ** 2

        # 交互作用項の追加
        X_new["RM * LSTAT"] = X["RM"] * X["LSTAT"]

        return X_new

    def standardize_features(self, X: pd.DataFrame, fit: bool = True) -> np.ndarray:
        """特徴量を標準化.

        Args:
            X: 特徴量 DataFrame
            fit: True の場合は fit_transform、False の場合は transform のみ

        Returns:
            標準化された特徴量（numpy 配列）

        Raises:
            ValueError: fit=False の場合で scaler_X が未設定の場合
        """
        if fit:
            self.scaler_X = StandardScaler()
            result_fit: np.ndarray = self.scaler_X.fit_transform(X)
            return result_fit
        else:
            if self.scaler_X is None:
                raise ValueError("Scaler not fitted yet. Call with fit=True first.")
            result_transform: np.ndarray = self.scaler_X.transform(X)
            return result_transform

    def standardize_target(
        self, y: pd.DataFrame, fit: bool = True
    ) -> np.ndarray:
        """目的変数を標準化.

        Args:
            y: 目的変数 DataFrame
            fit: True の場合は fit_transform、False の場合は transform のみ

        Returns:
            標準化された目的変数（numpy 配列）

        Raises:
            ValueError: fit=False の場合で scaler_y が未設定の場合
        """
        if fit:
            self.scaler_y = StandardScaler()
            result_fit: np.ndarray = self.scaler_y.fit_transform(y)
            return result_fit
        else:
            if self.scaler_y is None:
                raise ValueError("Scaler not fitted yet. Call with fit=True first.")
            result_transform: np.ndarray = self.scaler_y.transform(y)
            return result_transform

    def inverse_transform_prediction(self, y_pred: np.ndarray) -> np.ndarray:
        """予測結果を元のスケールに戻す.

        Args:
            y_pred: 標準化された予測結果

        Returns:
            元のスケールに戻された予測結果

        Raises:
            RuntimeError: scaler_y が未設定の場合
        """
        if self.scaler_y is None:
            raise RuntimeError("scaler_y not set. Train the model first.")

        result: np.ndarray = self.scaler_y.inverse_transform(y_pred)
        return result

    def train(self, X_train: np.ndarray, y_train: np.ndarray) -> None:
        """モデルを訓練する.

        Args:
            X_train: 訓練用特徴量（標準化済み）
            y_train: 訓練用目的変数（標準化済み）
        """
        self.model = LinearRegression()
        self.model.fit(X_train, y_train.ravel())

    def predict(self, X_test: np.ndarray) -> np.ndarray:
        """予測を実行する.

        Args:
            X_test: テスト用特徴量（標準化済み）

        Returns:
            予測結果（標準化済み）

        Raises:
            RuntimeError: モデルが訓練されていない場合
        """
        if self.model is None:
            raise RuntimeError("Model has not been trained yet. Call train() first.")

        result: np.ndarray = self.model.predict(X_test)
        return result

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> float:
        """モデルを評価する.

        Args:
            X_test: テスト用特徴量（標準化済み）
            y_test: テスト用目的変数（標準化済み）

        Returns:
            決定係数（R²）

        Raises:
            RuntimeError: モデルが訓練されていない場合
        """
        if self.model is None:
            raise RuntimeError("Model has not been trained yet. Call train() first.")

        score: float = self.model.score(X_test, y_test)
        return score

    def save_models(
        self, model_path: str, scaler_X_path: str, scaler_y_path: str
    ) -> None:
        """モデルとスケーラーを保存.

        Args:
            model_path: モデルの保存先パス
            scaler_X_path: 特徴量スケーラーの保存先パス
            scaler_y_path: 目的変数スケーラーの保存先パス

        Raises:
            RuntimeError: モデルまたはスケーラーが未訓練の場合
        """
        if self.model is None:
            raise RuntimeError("Model has not been trained yet.")
        if self.scaler_X is None or self.scaler_y is None:
            raise RuntimeError("Scalers have not been fitted yet.")

        with open(model_path, "wb") as f:
            pickle.dump(self.model, f)
        with open(scaler_X_path, "wb") as f:
            pickle.dump(self.scaler_X, f)
        with open(scaler_y_path, "wb") as f:
            pickle.dump(self.scaler_y, f)

    def load_models(
        self, model_path: str, scaler_X_path: str, scaler_y_path: str
    ) -> None:
        """モデルとスケーラーを読み込み.

        Args:
            model_path: モデルファイルのパス
            scaler_X_path: 特徴量スケーラーファイルのパス
            scaler_y_path: 目的変数スケーラーファイルのパス

        Raises:
            FileNotFoundError: ファイルが存在しない場合
        """
        for path in [model_path, scaler_X_path, scaler_y_path]:
            if not os.path.exists(path):
                raise FileNotFoundError(f"File not found: {path}")

        with open(model_path, "rb") as f:
            self.model = pickle.load(f)
        with open(scaler_X_path, "rb") as f:
            self.scaler_X = pickle.load(f)
        with open(scaler_y_path, "rb") as f:
            self.scaler_y = pickle.load(f)
