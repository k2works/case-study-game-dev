"""ドメイン層 - ML モデルの操作を担当."""

import pickle
from typing import Dict, List, Union

import pandas as pd


class IrisDomain:
    """Iris 分類ドメイン."""

    def __init__(self, model_path: str = "model/iris_model.pkl") -> None:
        """初期化.

        Args:
            model_path: モデルファイルのパス
        """
        self.model_path = model_path
        self.model = None
        self.load_model()

    def load_model(self) -> None:
        """訓練済みモデルの読み込み."""
        try:
            with open(self.model_path, "rb") as f:
                self.model = pickle.load(f)
        except FileNotFoundError as e:
            raise FileNotFoundError(f"Model file not found: {self.model_path}") from e

    def predict(self, X: List[List[float]]) -> List[str]:
        """予測を実行.

        Args:
            X: 特徴量のリスト [[sepal_length, sepal_width, petal_length, petal_width]]

        Returns:
            予測結果（種名）のリスト

        Raises:
            ValueError: モデルが読み込まれていない場合
        """
        if self.model is None:
            raise ValueError("Model not loaded")

        predictions = self.model.predict(X)
        return predictions.tolist()


class CinemaDomain:
    """Cinema 売上予測ドメイン."""

    def __init__(self, model_path: str = "model/cinema_model.pkl") -> None:
        """初期化.

        Args:
            model_path: モデルファイルのパス
        """
        self.model_path = model_path
        self.model = None
        self.load_model()

    def load_model(self) -> None:
        """訓練済みモデルの読み込み."""
        try:
            with open(self.model_path, "rb") as f:
                self.model = pickle.load(f)
        except FileNotFoundError as e:
            raise FileNotFoundError(f"Model file not found: {self.model_path}") from e

    def predict(self, X: List[List[Union[int, float]]]) -> List[float]:
        """予測を実行.

        Args:
            X: 特徴量のリスト [[sns1, sns2, actor, original]]

        Returns:
            予測結果（売上）のリスト

        Raises:
            ValueError: モデルが読み込まれていない場合
        """
        if self.model is None:
            raise ValueError("Model not loaded")

        predictions = self.model.predict(X)
        return predictions.tolist()


class SurvivedDomain:
    """Survived 生存予測ドメイン."""

    def __init__(self, model_path: str = "model/survived.pkl") -> None:
        """初期化.

        Args:
            model_path: モデルファイルのパス
        """
        self.model_path = model_path
        self.model = None
        self.load_model()

    def load_model(self) -> None:
        """訓練済みモデルの読み込み."""
        try:
            with open(self.model_path, "rb") as f:
                self.model = pickle.load(f)
        except FileNotFoundError as e:
            raise FileNotFoundError(f"Model file not found: {self.model_path}") from e

    def predict(self, X_dict: List[Dict[str, Union[int, float]]]) -> List[int]:
        """予測を実行.

        Args:
            X_dict: 特徴量の辞書のリスト [{"Pclass": 3, "Age": 22, "male": 1}]

        Returns:
            予測結果（0: 死亡, 1: 生存）のリスト

        Raises:
            ValueError: モデルが読み込まれていない場合
        """
        if self.model is None:
            raise ValueError("Model not loaded")

        # 辞書を DataFrame に変換
        X = pd.DataFrame(X_dict)
        predictions = self.model.predict(X)
        return predictions.tolist()


class BostonDomain:
    """Boston 住宅価格予測ドメイン."""

    def __init__(
        self,
        model_path: str = "model/boston_model.pkl",
        scaler_X_path: str = "model/boston_scaler_X.pkl",
        scaler_y_path: str = "model/boston_scaler_y.pkl",
    ) -> None:
        """初期化.

        Args:
            model_path: モデルファイルのパス
            scaler_X_path: 特徴量スケーラーのパス
            scaler_y_path: 目的変数スケーラーのパス
        """
        self.model_path = model_path
        self.scaler_X_path = scaler_X_path
        self.scaler_y_path = scaler_y_path
        self.model = None
        self.scaler_X = None
        self.scaler_y = None
        self.load_model()

    def load_model(self) -> None:
        """訓練済みモデルとスケーラーの読み込み."""
        try:
            with open(self.model_path, "rb") as f:
                self.model = pickle.load(f)
            with open(self.scaler_X_path, "rb") as f:
                self.scaler_X = pickle.load(f)
            with open(self.scaler_y_path, "rb") as f:
                self.scaler_y = pickle.load(f)
        except FileNotFoundError as e:
            raise FileNotFoundError(f"Model or scaler file not found: {e}") from e

    def predict(self, X_dict: List[Dict[str, float]]) -> List[float]:
        """予測を実行.

        Args:
            X_dict: 特徴量の辞書のリスト [{"RM": 6.5, "LSTAT": 4.98, "PTRATIO": 15.3}]

        Returns:
            予測結果（住宅価格）のリスト

        Raises:
            ValueError: モデルまたはスケーラーが読み込まれていない場合
        """
        if self.model is None or self.scaler_X is None or self.scaler_y is None:
            raise ValueError("Model or scalers not loaded")

        # 辞書を DataFrame に変換
        X = pd.DataFrame(X_dict)

        # 特徴量エンジニアリング（訓練時と同じ処理）
        X_engineered = self._feature_engineering(X)

        # 特徴量の標準化
        X_scaled = self.scaler_X.transform(X_engineered)

        # 予測（標準化された値）
        y_pred_scaled = self.model.predict(X_scaled)

        # 予測結果を元のスケールに戻す
        y_pred = self.scaler_y.inverse_transform(y_pred_scaled.reshape(-1, 1))

        return y_pred.flatten().tolist()

    def _feature_engineering(self, X: pd.DataFrame) -> pd.DataFrame:
        """特徴量エンジニアリング（2乗項と交互作用項の追加）.

        Args:
            X: 元の特徴量 DataFrame

        Returns:
            エンジニアリング後の特徴量 DataFrame
        """
        X_new = X.copy()

        # 2乗項の追加
        X_new["RM2"] = X["RM"] ** 2
        X_new["LSTAT2"] = X["LSTAT"] ** 2
        X_new["PTRATIO2"] = X["PTRATIO"] ** 2

        # 交互作用項の追加
        X_new["RM * LSTAT"] = X["RM"] * X["LSTAT"]

        return X_new
