"""API Pydantic モデルのテストモジュール."""
import pytest
from pydantic import ValidationError


class TestIrisModel:
    """IrisModel のテスト."""

    def test_IrisModelの正常な値(self):
        """正しい値で IrisModel を作成できる."""
        from api.models import IrisModel

        model = IrisModel(
            sepal_length=5.1, sepal_width=3.5, petal_length=1.4, petal_width=0.2
        )

        assert model.sepal_length == 5.1
        assert model.sepal_width == 3.5
        assert model.petal_length == 1.4
        assert model.petal_width == 0.2

    def test_IrisModelの負の値でエラー(self):
        """負の値を指定するとバリデーションエラー."""
        from api.models import IrisModel

        with pytest.raises(ValidationError):
            IrisModel(
                sepal_length=-1.0, sepal_width=3.5, petal_length=1.4, petal_width=0.2
            )

    def test_IrisModelの型エラー(self):
        """文字列を指定すると型エラー."""
        from api.models import IrisModel

        with pytest.raises(ValidationError):
            IrisModel(
                sepal_length="invalid",
                sepal_width=3.5,
                petal_length=1.4,
                petal_width=0.2,
            )


class TestCinemaModel:
    """CinemaModel のテスト."""

    def test_CinemaModelの正常な値(self):
        """正しい値で CinemaModel を作成できる."""
        from api.models import CinemaModel

        model = CinemaModel(sns1=500, sns2=300, actor=70, original=1)

        assert model.sns1 == 500
        assert model.sns2 == 300
        assert model.actor == 70
        assert model.original == 1

    def test_CinemaModelのactorスコア範囲外でエラー(self):
        """actor が 0-100 範囲外でエラー."""
        from api.models import CinemaModel

        with pytest.raises(ValidationError):
            CinemaModel(sns1=500, sns2=300, actor=150, original=1)


class TestSurvivedModel:
    """SurvivedModel のテスト."""

    def test_SurvivedModelの正常な値(self):
        """正しい値で SurvivedModel を作成できる."""
        from api.models import SurvivedModel

        model = SurvivedModel(pclass=3, age=22, sex="male")

        assert model.pclass == 3
        assert model.age == 22
        assert model.sex == "male"

    def test_SurvivedModelの不正なsexでエラー(self):
        """sex が male/female 以外でエラー."""
        from api.models import SurvivedModel

        with pytest.raises(ValidationError):
            SurvivedModel(pclass=1, age=30, sex="unknown")


class TestBostonModel:
    """BostonModel のテスト."""

    def test_BostonModelの正常な値(self):
        """正しい値で BostonModel を作成できる."""
        from api.models import BostonModel

        model = BostonModel(rm=6.5, lstat=4.98, ptratio=15.3)

        assert model.rm == 6.5
        assert model.lstat == 4.98
        assert model.ptratio == 15.3

    def test_BostonModelの負の値でエラー(self):
        """rm が 0 以下でエラー."""
        from api.models import BostonModel

        with pytest.raises(ValidationError):
            BostonModel(rm=-1.0, lstat=4.98, ptratio=15.3)
