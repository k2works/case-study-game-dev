namespace MlTddFSharp.Ml

open Microsoft.ML
open Microsoft.ML.Data
open MlTddFSharp.Domain.Types

type IrisClassifier(mlContext: MLContext) =
    let mutable trainedModel: ITransformer option = None

    /// F# 用のダウンキャストヘルパー関数
    let downcastPipeline (x: IEstimator<_>) =
        match x with
        | :? IEstimator<ITransformer> as y -> y
        | _ -> failwith "downcastPipeline: IEstimator<ITransformer> が期待されます"

    /// データ変換パイプラインを構築
    let buildPipeline () =
        mlContext.Transforms.Conversion.MapValueToKey("Label", "Species")
        |> downcastPipeline
        |> fun estimator ->
            estimator
                .Append(
                    mlContext.Transforms.Concatenate(
                        "Features",
                        "SepalLength",
                        "SepalWidth",
                        "PetalLength",
                        "PetalWidth"
                    )
                )
                .Append(mlContext.MulticlassClassification.Trainers.SdcaMaximumEntropy())
                .Append(mlContext.Transforms.Conversion.MapKeyToValue("PredictedLabel"))

    member this.MlContext = mlContext

    member this.Model = trainedModel

    /// CSV ファイルからデータを読み込んで訓練する
    member this.Train(filePath: string) : Result<MulticlassClassificationMetrics, string> =
        try
            // データの読み込み
            let dataView =
                mlContext.Data.LoadFromTextFile<IrisData>(
                    filePath,
                    hasHeader = true,
                    separatorChar = ','
                )

            // データの分割（80% 訓練、20% テスト）
            let trainTestSplit = mlContext.Data.TrainTestSplit(dataView, testFraction = 0.2)

            // パイプラインの構築と訓練
            let pipeline = buildPipeline ()
            let model = pipeline.Fit(trainTestSplit.TrainSet)

            trainedModel <- Some model

            // テストデータで評価
            let predictions = model.Transform(trainTestSplit.TestSet)
            let metrics = mlContext.MulticlassClassification.Evaluate(predictions)

            Result.Ok metrics
        with ex ->
            Result.Error $"訓練エラー: {ex.Message}"

    /// 訓練済みモデルで予測を実行する
    member this.Predict(data: IrisData) : Result<IrisPrediction, string> =
        match trainedModel with
        | None -> Result.Error "モデルが訓練されていません"
        | Some model ->
            try
                let predictionEngine =
                    mlContext.Model.CreatePredictionEngine<IrisData, IrisPrediction>(model)

                let prediction = predictionEngine.Predict(data)
                Result.Ok prediction
            with ex ->
                Result.Error $"予測エラー: {ex.Message}"
