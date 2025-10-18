from fastapi import FastAPI
from pydantic import BaseModel

from src.api.app.service import Service

app = FastAPI(
    title="スッキリわかるPythonによる機械学習入門 API",
    description="スッキリわかるPythonによる機械学習入門の機械学習モデルをAPI化したものです",
    version="0.1.0",
    openapi_url="/api/v1/openapi.json",
)
service = Service()


class IrisModle(BaseModel):
    sepal_length: int
    sepal_width: int
    petal_length: int
    petal_width: int


class CinemaModel(BaseModel):
    SNS1: int
    SNS2: int
    actor: int
    original: int


class SurvivedModel(BaseModel):
    Pclass: int
    Age: int
    SlibSp: int
    Parch: int
    Fare: float
    Sex: int


class BostonModel(BaseModel):
    rm: float
    lstat: float
    ptratio: float


@app.get("/", tags=["Root"])
async def read_root():
    return {
        "message": "Welcome to my ml application, use the /docs route to proceed"
    }


@app.post("/iris", tags=["Iris"], description="分類1:アヤメの判別")
async def predict_iris(
    model: IrisModle,
):
    x = [[
        model.sepal_length,
        model.sepal_width,
        model.petal_length,
        model.petal_width
    ]]
    resutl = service.predict_iris(x)
    return resutl[0]


@app.post("/cinema", tags=["Cinema"], description="回帰1:映画の興行収入の予測")
async def predict_cinema(
    model: CinemaModel,
):
    x = [[
        model.SNS1,
        model.SNS2,
        model.actor,
        model.original
    ]]
    resutl = service.predict_cinema(x)
    return resutl[0]


@app.post("/survived", tags=["Survived"], description="分類2:客船沈没事故での生存予測")
async def predict_survived(
    model: SurvivedModel,
):
    x = [[
        model.Pclass,
        model.Age,
        model.SlibSp,
        model.Parch,
        model.Fare,
        model.Sex
    ]]
    result = service.predict_survived(x)
    return int(result[0])


@app.post("/boston", tags=["Boston"], description="回帰2:住宅の平均価格の予測")
async def predict_boston(
    model: BostonModel,
):
    result = service.predict_boston(model.rm, model.lstat, model.ptratio)
    return result[0][0]
