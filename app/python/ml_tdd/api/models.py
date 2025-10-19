"""API Pydantic モデル定義."""

from typing import Literal

from pydantic import BaseModel, Field


class IrisModel(BaseModel):
    """Iris 分類のリクエストモデル."""

    sepal_length: float = Field(..., ge=0, description="がく片の長さ (cm)")
    sepal_width: float = Field(..., ge=0, description="がく片の幅 (cm)")
    petal_length: float = Field(..., ge=0, description="花弁の長さ (cm)")
    petal_width: float = Field(..., ge=0, description="花弁の幅 (cm)")


class CinemaModel(BaseModel):
    """Cinema 売上予測のリクエストモデル."""

    sns1: int = Field(..., ge=0, description="SNS 言及数 1")
    sns2: int = Field(..., ge=0, description="SNS 言及数 2")
    actor: int = Field(..., ge=0, le=100, description="主演俳優スコア (0-100)")
    original: int = Field(..., ge=0, le=1, description="オリジナル作品フラグ (0 or 1)")


class SurvivedModel(BaseModel):
    """Survived 生存予測のリクエストモデル."""

    pclass: int = Field(..., ge=1, le=3, description="客室クラス (1, 2, 3)")
    age: int = Field(..., ge=0, le=100, description="年齢")
    sex: Literal["male", "female"] = Field(..., description="性別")


class BostonModel(BaseModel):
    """Boston 住宅価格予測のリクエストモデル."""

    rm: float = Field(..., gt=0, description="部屋数")
    lstat: float = Field(..., ge=0, le=100, description="低所得者人口割合 (%)")
    ptratio: float = Field(..., gt=0, description="生徒と教師の比率")
