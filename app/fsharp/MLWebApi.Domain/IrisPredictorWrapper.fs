namespace MLWebApi.Domain

open Microsoft.ML
open MlTddFSharp.Domain.Types
open MlTddFSharp.Ml
open MLWebApi.Domain.Models

/// Iris モデルのラッパークラス
type IrisPredictorWrapper(modelPath: string) =
    let mlContext = MLContext(seed = System.Nullable 0)
    let classifier = IrisClassifier(mlContext)

    // 初期化時にモデルを読み込む
    do
        match classifier.LoadModel(modelPath) with
        | Ok _ -> printfn $"Iris モデルを読み込みました: {modelPath}"
        | Error msg -> failwith $"Iris モデルの読み込みに失敗: {msg}"

    /// 予測を実行
    member this.Predict(request: IrisPredictRequest) : Result<IrisPredictResponse, string> =
        let input =
            { SepalLength = request.SepalLength
              SepalWidth = request.SepalWidth
              PetalLength = request.PetalLength
              PetalWidth = request.PetalWidth
              Species = "" }

        match classifier.Predict(input) with
        | Ok prediction ->
            // Score 配列から最大値を取得（信頼度）
            let maxScore =
                if prediction.Score.Length > 0 then
                    Array.max prediction.Score
                else
                    0.0f

            let response =
                { PredictedSpecies = prediction.PredictedSpecies
                  Confidence = maxScore }

            Result.Ok response
        | Error msg -> Result.Error msg
