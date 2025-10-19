"""アプリケーション層 - FastAPI エンドポイントを定義."""

from typing import Any

from fastapi import FastAPI

from api.models import BostonModel, CinemaModel, IrisModel, SurvivedModel
from api.service import MLService

app = FastAPI(
    title="Machine Learning API",
    description="TDD で構築した機械学習モデルの API",
    version="1.0.0",
)

service = MLService()


@app.get("/", tags=["Root"])
async def root() -> dict[str, Any]:
    """ルートエンドポイント.

    Returns:
        API の基本情報
    """
    return {
        "message": "Machine Learning API",
        "version": "1.0.0",
        "endpoints": ["/iris", "/cinema", "/survived", "/boston"],
    }


@app.get("/health", tags=["Health"])
async def health() -> dict[str, str]:
    """ヘルスチェックエンドポイント.

    Returns:
        ヘルスステータス
    """
    return {"status": "ok"}


@app.post("/iris", tags=["Iris"], description="アヤメの種類を分類")
async def predict_iris(model: IrisModel) -> dict[str, str]:
    """Iris 分類エンドポイント.

    Args:
        model: Iris の特徴量

    Returns:
        予測された種名
    """
    features = [
        [
            model.sepal_length,
            model.sepal_width,
            model.petal_length,
            model.petal_width,
        ]
    ]

    species = service.predict_iris(features)
    return {"species": species}


@app.post("/cinema", tags=["Cinema"], description="映画の興行収入を予測")
async def predict_cinema(model: CinemaModel) -> dict[str, float]:
    """Cinema 売上予測エンドポイント.

    Args:
        model: Cinema の特徴量

    Returns:
        予測された売上
    """
    features = [
        [
            float(model.sns1),
            float(model.sns2),
            float(model.actor),
            float(model.original),
        ]
    ]

    predicted_sales = service.predict_cinema(features)
    return {"predicted_sales": predicted_sales}


@app.post("/survived", tags=["Survived"], description="タイタニック号での生存を予測")
async def predict_survived(model: SurvivedModel) -> dict[str, int]:
    """Survived 生存予測エンドポイント.

    Args:
        model: Survived の特徴量

    Returns:
        予測結果（0: 死亡, 1: 生存）
    """
    survived = service.predict_survived(
        pclass=model.pclass, age=model.age, sex=model.sex
    )
    return {"survived": survived}


@app.post("/boston", tags=["Boston"], description="ボストン住宅価格を予測")
async def predict_boston(model: BostonModel) -> dict[str, float]:
    """Boston 住宅価格予測エンドポイント.

    Args:
        model: Boston の特徴量

    Returns:
        予測された住宅価格
    """
    predicted_price = service.predict_boston(
        rm=model.rm, lstat=model.lstat, ptratio=model.ptratio
    )
    return {"predicted_price": predicted_price}
