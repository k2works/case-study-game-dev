namespace MLWebApi.Domain

open Microsoft.ML
open MlTddFSharp.Domain.Types
open MlTddFSharp.Ml
open MLWebApi.Domain.Models

/// Survived モデルのラッパークラス
type SurvivedPredictorWrapper(modelPath: string) =
    let mlContext = MLContext(seed = System.Nullable 0)
    let predictor = SurvivedPredictor(mlContext)

    // 初期化時にモデルを読み込む
    do
        match predictor.LoadModel(modelPath) with
        | Ok _ -> printfn $"Survived モデルを読み込みました: {modelPath}"
        | Error msg -> failwith $"Survived モデルの読み込みに失敗: {msg}"

    /// 予測を実行
    member this.Predict(request: SurvivedPredictRequest) : Result<SurvivedPredictResponse, string> =
        let input =
            { PassengerId = 0
              Survived = false
              Pclass = request.Pclass
              Sex = request.Sex
              Age = request.Age }

        match predictor.Predict(input) with
        | Ok prediction ->
            let response =
                { Survived = prediction.Survived
                  Probability = prediction.Score }

            Result.Ok response
        | Error msg -> Result.Error msg
