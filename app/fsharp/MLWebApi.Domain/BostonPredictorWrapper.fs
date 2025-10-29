namespace MLWebApi.Domain

open Microsoft.ML
open MlTddFSharp.Domain.Types
open MlTddFSharp.Ml
open MLWebApi.Domain.Models

/// Boston モデルのラッパークラス
type BostonPredictorWrapper(modelPath: string) =
    let mlContext = MLContext(seed = System.Nullable 0)
    let predictor = BostonPredictor(mlContext)

    // 初期化時にモデルを読み込む
    do
        match predictor.LoadModel(modelPath) with
        | Ok _ -> printfn $"Boston モデルを読み込みました: {modelPath}"
        | Error msg -> failwith $"Boston モデルの読み込みに失敗: {msg}"

    /// 予測を実行
    member this.Predict(request: BostonPredictRequest) : Result<BostonPredictResponse, string> =
        let input =
            { CRIME = request.CRIME
              RM = request.RM
              LSTAT = request.LSTAT
              PTRATIO = request.PTRATIO
              PRICE = 0.0f }

        match predictor.Predict(input) with
        | Ok predictedPrice ->
            let response = { PredictedPrice = predictedPrice }
            Result.Ok response
        | Error msg -> Result.Error msg
