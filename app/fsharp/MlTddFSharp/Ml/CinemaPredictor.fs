namespace MlTddFSharp.Ml

open Microsoft.ML
open Microsoft.ML.Data
open MlTddFSharp.Domain.Types

type CinemaPredictor(mlContext: MLContext) =
    let mutable trainedModel: ITransformer option = None

    /// F# 用のダウンキャストヘルパー関数
    let downcastPipeline (x: IEstimator<_>) =
        match x with
        | :? IEstimator<ITransformer> as y -> y
        | _ -> failwith "downcastPipeline: IEstimator<ITransformer> が期待されます"

    member this.MlContext = mlContext

    member this.Model = trainedModel

    member this.Train(filePath: string) : Result<RegressionMetrics, string> =
        try
            let dataView =
                mlContext.Data.LoadFromTextFile<CinemaData>(
                    filePath,
                    hasHeader = true,
                    separatorChar = ','
                )

            let trainTestSplit = mlContext.Data.TrainTestSplit(dataView, testFraction = 0.2)

            let pipeline =
                mlContext.Transforms.CopyColumns("Label", "Sales")
                |> downcastPipeline
                |> fun estimator ->
                    estimator
                        .Append(mlContext.Transforms.ReplaceMissingValues("SNS1"))
                        .Append(mlContext.Transforms.ReplaceMissingValues("SNS2"))
                        .Append(
                            mlContext.Transforms.Concatenate(
                                "Features",
                                "SNS1",
                                "SNS2",
                                "Actor",
                                "Original"
                            )
                        )
                        .Append(mlContext.Regression.Trainers.FastTree())

            let model = pipeline.Fit(trainTestSplit.TrainSet)
            trainedModel <- Some model

            let predictions = model.Transform(trainTestSplit.TestSet)
            let metrics = mlContext.Regression.Evaluate(predictions, labelColumnName = "Label")
            Result.Ok metrics
        with ex ->
            Result.Error $"訓練エラー: {ex.Message}"

    member this.Predict(input: CinemaData) : Result<CinemaPrediction, string> =
        match trainedModel with
        | None -> Result.Error "モデルが訓練されていません"
        | Some model ->
            try
                let predictionEngine =
                    mlContext.Model.CreatePredictionEngine<CinemaData, CinemaPrediction>(model)

                let prediction = predictionEngine.Predict(input)
                Result.Ok prediction
            with ex ->
                Result.Error $"予測エラー: {ex.Message}"

    /// モデルをファイルに保存する
    member this.SaveModel(modelPath: string) : Result<unit, string> =
        match trainedModel with
        | None -> Result.Error "保存するモデルがありません"
        | Some model ->
            try
                // ダミーのスキーマ用データビュー（保存時に必要）
                let dummyData =
                    [ { CinemaId = 0
                        SNS1 = 0.0f
                        SNS2 = 0.0f
                        Actor = 0.0f
                        Original = 0.0f
                        Sales = 0.0f } ]

                let dataView = mlContext.Data.LoadFromEnumerable(dummyData)
                mlContext.Model.Save(model, dataView.Schema, modelPath)
                Result.Ok()
            with ex ->
                Result.Error $"モデル保存エラー: {ex.Message}"

    /// モデルをファイルから読み込む
    member this.LoadModel(modelPath: string) : Result<unit, string> =
        try
            if not (System.IO.File.Exists(modelPath)) then
                Result.Error $"モデルファイルが見つかりません: {modelPath}"
            else
                let model = mlContext.Model.Load(modelPath, ref null)
                trainedModel <- Some model
                Result.Ok()
        with ex ->
            Result.Error $"モデル読み込みエラー: {ex.Message}"
