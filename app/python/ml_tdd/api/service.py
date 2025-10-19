"""サービス層 - ビジネスロジックとデータ変換を担当."""

from typing import List, Optional, Union

from api.domain import BostonDomain, CinemaDomain, IrisDomain, SurvivedDomain


class MLService:
    """機械学習サービス層."""

    def __init__(self) -> None:
        """初期化 - ドメインオブジェクトは遅延初期化."""
        # 初回アクセス時にモデルを読み込み、以降は再利用
        self._iris_domain: Optional[IrisDomain] = None
        self._cinema_domain: Optional[CinemaDomain] = None
        self._survived_domain: Optional[SurvivedDomain] = None
        self._boston_domain: Optional[BostonDomain] = None

    @property
    def iris_domain(self) -> IrisDomain:
        """Lazy loading で IrisDomain を取得."""
        if self._iris_domain is None:
            self._iris_domain = IrisDomain()
        return self._iris_domain

    @property
    def cinema_domain(self) -> CinemaDomain:
        """Lazy loading で CinemaDomain を取得."""
        if self._cinema_domain is None:
            self._cinema_domain = CinemaDomain()
        return self._cinema_domain

    @property
    def survived_domain(self) -> SurvivedDomain:
        """Lazy loading で SurvivedDomain を取得."""
        if self._survived_domain is None:
            self._survived_domain = SurvivedDomain()
        return self._survived_domain

    @property
    def boston_domain(self) -> BostonDomain:
        """Lazy loading で BostonDomain を取得."""
        if self._boston_domain is None:
            self._boston_domain = BostonDomain()
        return self._boston_domain

    def predict_iris(self, features: List[List[float]]) -> str:
        """Iris 分類予測.

        Args:
            features: [[sepal_length, sepal_width, petal_length, petal_width]]

        Returns:
            予測された種名
        """
        predictions = self.iris_domain.predict(features)
        return predictions[0]  # 最初の予測結果を返す

    def predict_cinema(self, features: List[List[Union[int, float]]]) -> float:
        """Cinema 売上予測.

        Args:
            features: [[sns1, sns2, actor, original]]

        Returns:
            予測された売上
        """
        predictions = self.cinema_domain.predict(features)
        return float(predictions[0])

    def predict_survived(
        self,
        pclass: int,
        age: int,
        sex: str,
        sibsp: int = 0,
        parch: int = 0,
        fare: float = 0.0,
    ) -> int:
        """Survived 生存予測.

        Args:
            pclass: 客室クラス (1, 2, 3)
            age: 年齢
            sex: 性別 ("male" または "female")
            sibsp: 同乗している兄弟姉妹・配偶者の数（デフォルト: 0）
            parch: 同乗している親・子供の数（デフォルト: 0）
            fare: 運賃（デフォルト: 0.0）

        Returns:
            予測結果（0: 死亡, 1: 生存）
        """
        # sex を male ダミー変数に変換
        male = 1 if sex == "male" else 0

        X_dict = [
            {
                "Pclass": pclass,
                "Age": age,
                "SibSp": sibsp,
                "Parch": parch,
                "Fare": fare,
                "male": male,
            }
        ]
        predictions = self.survived_domain.predict(X_dict)
        return int(predictions[0])

    def predict_boston(self, rm: float, lstat: float, ptratio: float) -> float:
        """Boston 住宅価格予測.

        Args:
            rm: 部屋数
            lstat: 低所得者人口割合 (%)
            ptratio: 生徒と教師の比率

        Returns:
            予測された住宅価格
        """
        X_dict = [{"RM": rm, "LSTAT": lstat, "PTRATIO": ptratio}]
        predictions = self.boston_domain.predict(X_dict)
        return float(predictions[0])
