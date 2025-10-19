"""ドメイン層のテストモジュール."""

import numpy as np
import pandas as pd
import pytest


class TestIrisDomain:
    """IrisDomain のテスト."""

    def test_IrisDomainでモデルを読み込める(self) -> None:
        """訓練済み Iris モデルを読み込める."""
        from api.domain import IrisDomain

        domain = IrisDomain()
        assert domain.model is not None

    def test_IrisDomainで予測ができる(self) -> None:
        """Iris モデルで予測を実行できる."""
        from api.domain import IrisDomain

        domain = IrisDomain()
        X = [[5.1, 3.5, 1.4, 0.2]]
        result = domain.predict(X)

        assert len(result) == 1
        assert result[0] in ["setosa", "versicolor", "virginica"]


class TestCinemaDomain:
    """CinemaDomain のテスト."""

    def test_CinemaDomainでモデルを読み込める(self) -> None:
        """訓練済み Cinema モデルを読み込める."""
        from api.domain import CinemaDomain

        domain = CinemaDomain()
        assert domain.model is not None

    def test_CinemaDomainで予測ができる(self) -> None:
        """Cinema モデルで予測を実行できる."""
        from api.domain import CinemaDomain

        domain = CinemaDomain()
        X = [[500, 300, 70, 1]]
        result = domain.predict(X)

        assert len(result) == 1
        assert isinstance(result[0], (int, float))
        assert result[0] > 0


class TestSurvivedDomain:
    """SurvivedDomain のテスト."""

    def test_SurvivedDomainでモデルを読み込める(self) -> None:
        """訓練済み Survived モデルを読み込める."""
        from api.domain import SurvivedDomain

        domain = SurvivedDomain()
        assert domain.model is not None

    def test_SurvivedDomainで予測ができる(self) -> None:
        """Survived モデルで予測を実行できる."""
        from api.domain import SurvivedDomain

        domain = SurvivedDomain()
        X_dict = [{"Pclass": 3, "Age": 22, "SibSp": 0, "Parch": 0, "Fare": 7.25, "male": 1}]
        result = domain.predict(X_dict)

        assert len(result) == 1
        assert result[0] in [0, 1]


class TestBostonDomain:
    """BostonDomain のテスト."""

    def test_BostonDomainでモデルを読み込める(self) -> None:
        """訓練済み Boston モデルを読み込める."""
        from api.domain import BostonDomain

        domain = BostonDomain()
        assert domain.model is not None
        assert domain.scaler_X is not None
        assert domain.scaler_y is not None

    def test_BostonDomainで予測ができる(self) -> None:
        """Boston モデルで予測を実行できる."""
        from api.domain import BostonDomain

        domain = BostonDomain()
        X_dict = [{"RM": 6.5, "LSTAT": 4.98, "PTRATIO": 15.3}]
        result = domain.predict(X_dict)

        assert len(result) == 1
        assert isinstance(result[0], (int, float))
        assert result[0] > 0
