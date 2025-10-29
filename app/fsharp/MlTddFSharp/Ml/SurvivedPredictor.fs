namespace MlTddFSharp.Ml

open System
open System.IO
open Microsoft.ML
open Microsoft.ML.Data
open MlTddFSharp.Domain.Types

/// グループ別平均を計算するヘルパー関数
module private SurvivedHelper =
    let calculateGroupMeans (rows: SurvivedData list) =
        rows
        |> List.filter (fun r -> not (Single.IsNaN(r.Age)))
        |> List.groupBy (fun r -> (r.Pclass, r.Survived))
        |> List.map (fun ((pclass, survived), group) ->
            let avgAge = group |> List.averageBy (fun r -> r.Age)
            ((pclass, survived), avgAge))
        |> Map.ofList

    let imputeRow (ageMapping: Map<float32 * bool, float32>) (row: SurvivedData) =
        if Single.IsNaN(row.Age) then
            let key = (row.Pclass, row.Survived)

            match Map.tryFind key ageMapping with
            | Some avgAge -> { row with Age = avgAge }
            | None -> row // グループに有効な Age がない場合はそのまま
        else
            row

type SurvivedPredictor(mlContext: MLContext) =
    let mutable trainedModel: ITransformer option = None

    /// F# 用のダウンキャストヘルパー関数
    let downcastPipeline (x: IEstimator<_>) =
        match x with
        | :? IEstimator<ITransformer> as y -> y
        | _ -> failwith "downcastPipeline: IEstimator<ITransformer> が期待されます"

    member this.MlContext = mlContext

    member this.Model = trainedModel

    /// CSV ファイルからデータを読み込む
    member this.LoadData(filePath: string) : Result<IDataView, string> =
        try
            if not (File.Exists(filePath)) then
                Result.Error $"ファイルが見つかりません: {filePath}"
            else
                let dataView =
                    mlContext.Data.LoadFromTextFile<SurvivedData>(
                        filePath,
                        hasHeader = true,
                        separatorChar = ','
                    )

                Result.Ok dataView
        with ex ->
            Result.Error $"データ読み込みエラー: {ex.Message}"

    /// グループ別欠損値補完
    member this.ImputeAge(inputData: IDataView) : Result<IDataView, string> =
        try
            // データを List に読み込み
            let rows =
                mlContext.Data.CreateEnumerable<SurvivedData>(inputData, reuseRowObject = false)
                |> Seq.toList

            // グループ別平均を計算
            let ageMapping = SurvivedHelper.calculateGroupMeans rows

            // 欠損値を補完
            let imputedRows = rows |> List.map (SurvivedHelper.imputeRow ageMapping)

            // IDataView に戻す
            let imputedDataView = mlContext.Data.LoadFromEnumerable(imputedRows)
            Result.Ok imputedDataView
        with ex ->
            Result.Error $"欠損値補完エラー: {ex.Message}"

    /// モデルの訓練
    member this.Train(filePath: string) : Result<BinaryClassificationMetrics, string> =
        try
            // データ読み込み
            let dataResult = this.LoadData(filePath)

            match dataResult with
            | Error msg -> Result.Error msg
            | Ok dataView ->
                // 欠損値補完
                let imputedResult = this.ImputeAge(dataView)

                match imputedResult with
                | Error msg -> Result.Error msg
                | Ok imputedData ->
                    // データ分割
                    let trainTestSplit =
                        mlContext.Data.TrainTestSplit(imputedData, testFraction = 0.2, seed = Nullable 42)

                    // パイプライン構築
                    let pipeline =
                        mlContext.Transforms.CopyColumns("Label", "Survived")
                        |> downcastPipeline
                        |> fun estimator ->
                            estimator
                                .Append(
                                    mlContext.Transforms.Categorical.OneHotEncoding(
                                        "SexEncoded",
                                        "Sex",
                                        Microsoft.ML.Transforms.OneHotEncodingEstimator.OutputKind.Indicator
                                    )
                                )
                                .Append(
                                    mlContext.Transforms.Concatenate("Features", "Pclass", "SexEncoded", "Age")
                                )
                                .Append(mlContext.BinaryClassification.Trainers.FastTree())

                    // モデル訓練
                    let model = pipeline.Fit(trainTestSplit.TrainSet)
                    trainedModel <- Some model

                    // 評価
                    let predictions = model.Transform(trainTestSplit.TestSet)

                    let metrics =
                        mlContext.BinaryClassification.Evaluate(predictions, labelColumnName = "Label")

                    Result.Ok metrics
        with ex ->
            Result.Error $"訓練エラー: {ex.Message}"

    /// 予測
    member this.Predict(input: SurvivedData) : Result<SurvivedPrediction, string> =
        match trainedModel with
        | None -> Result.Error "モデルが訓練されていません"
        | Some model ->
            try
                let predictionEngine =
                    mlContext.Model.CreatePredictionEngine<SurvivedData, SurvivedPrediction>(model)

                let prediction = predictionEngine.Predict(input)
                Result.Ok prediction
            with ex ->
                Result.Error $"予測エラー: {ex.Message}"
