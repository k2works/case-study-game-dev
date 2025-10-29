namespace MLWebApi.Domain

open Microsoft.ML
open MlTddFSharp.Domain.Types
open MlTddFSharp.Ml
open MLWebApi.Domain.Models

/// Cinema モデルのラッパークラス
type CinemaPredictorWrapper(modelPath: string) =
    let mlContext = MLContext(seed = System.Nullable 0)
    let predictor = CinemaPredictor(mlContext)

    // 初期化時にモデルを読み込む
    do
        match predictor.LoadModel(modelPath) with
        | Ok _ -> printfn $"Cinema モデルを読み込みました: {modelPath}"
        | Error msg -> failwith $"Cinema モデルの読み込みに失敗: {msg}"

    /// 予測を実行
    member this.Predict(request: CinemaPredictRequest) : Result<CinemaPredictResponse, string> =
        let input =
            { CinemaId = 0
              SNS1 = request.SNS1
              SNS2 = request.SNS2
              Actor = request.Actor
              Original = request.Original
              Sales = 0.0f }

        match predictor.Predict(input) with
        | Ok prediction ->
            let response = { PredictedSales = prediction.PredictedSales }
            Result.Ok response
        | Error msg -> Result.Error msg
