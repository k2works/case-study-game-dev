namespace MLWebApi.Service

open System.IO
open MLWebApi.Domain
open MLWebApi.Domain.Models

/// 予測サービス - すべてのモデルを管理
type PredictionService(modelDirectory: string) =
    let irisModelPath = Path.Combine(modelDirectory, "iris_model.zip")
    let cinemaModelPath = Path.Combine(modelDirectory, "cinema_model.zip")
    let survivedModelPath = Path.Combine(modelDirectory, "survived_model.zip")
    let bostonModelPath = Path.Combine(modelDirectory, "boston_model.zip")

    // すべての Predictor ラッパーを初期化
    let irisPredictor = IrisPredictorWrapper(irisModelPath)
    let cinemaPredictor = CinemaPredictorWrapper(cinemaModelPath)
    let survivedPredictor = SurvivedPredictorWrapper(survivedModelPath)
    let bostonPredictor = BostonPredictorWrapper(bostonModelPath)

    /// Iris 予測
    member this.PredictIris(request: IrisPredictRequest) : Result<IrisPredictResponse, string> =
        irisPredictor.Predict(request)

    /// Cinema 予測
    member this.PredictCinema(request: CinemaPredictRequest) : Result<CinemaPredictResponse, string> =
        cinemaPredictor.Predict(request)

    /// Survived 予測
    member this.PredictSurvived(request: SurvivedPredictRequest) : Result<SurvivedPredictResponse, string> =
        survivedPredictor.Predict(request)

    /// Boston 予測
    member this.PredictBoston(request: BostonPredictRequest) : Result<BostonPredictResponse, string> =
        bostonPredictor.Predict(request)
