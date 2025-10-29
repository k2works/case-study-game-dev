namespace MlTddFSharp.Ml

open System
open System.IO
open Microsoft.ML
open Microsoft.ML.Data
open MlTddFSharp.Domain.Types

/// グループ別平均を計算するヘルパー関数
module private BostonHelper =
    let calculateMean (values: float32 list) =
        if List.isEmpty values then 0.0f else List.average values

type BostonPredictor(mlContext: MLContext) =
    let mutable trainedModel: ITransformer option = None
    let mutable trainMean: Map<string, float32> option = None

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
                    mlContext.Data.LoadFromTextFile<BostonData>(filePath, hasHeader = true, separatorChar = ',')

                Result.Ok dataView
        with ex ->
            Result.Error $"データ読み込みエラー: {ex.Message}"

    /// 欠損値補完
    member this.FillMissingValues(inputData: IDataView, fit: bool) : Result<IDataView, string> =
        try
            if fit then
                // 訓練データの平均を計算
                let rows =
                    mlContext.Data.CreateEnumerable<BostonData>(inputData, reuseRowObject = false)
                    |> Seq.toList

                let validRM =
                    rows
                    |> List.filter (fun r -> not (Single.IsNaN(r.RM)))
                    |> List.map (fun r -> r.RM)

                let validLSTAT =
                    rows
                    |> List.filter (fun r -> not (Single.IsNaN(r.LSTAT)))
                    |> List.map (fun r -> r.LSTAT)

                let validPTRATIO =
                    rows
                    |> List.filter (fun r -> not (Single.IsNaN(r.PTRATIO)))
                    |> List.map (fun r -> r.PTRATIO)

                trainMean <-
                    Some(
                        Map.ofList
                            [ ("RM", BostonHelper.calculateMean validRM)
                              ("LSTAT", BostonHelper.calculateMean validLSTAT)
                              ("PTRATIO", BostonHelper.calculateMean validPTRATIO) ]
                    )

                let filledRows =
                    rows
                    |> List.map (fun row ->
                        { row with
                            RM = if Single.IsNaN(row.RM) then trainMean.Value.["RM"] else row.RM
                            LSTAT = if Single.IsNaN(row.LSTAT) then trainMean.Value.["LSTAT"] else row.LSTAT
                            PTRATIO =
                                if Single.IsNaN(row.PTRATIO) then
                                    trainMean.Value.["PTRATIO"]
                                else
                                    row.PTRATIO })

                let filledData = mlContext.Data.LoadFromEnumerable(filledRows)
                Result.Ok filledData
            else
                match trainMean with
                | None -> Result.Error "trainMean not set. Call with fit=true first."
                | Some means ->
                    let rows =
                        mlContext.Data.CreateEnumerable<BostonData>(inputData, reuseRowObject = false)
                        |> Seq.toList

                    let filledRows =
                        rows
                        |> List.map (fun row ->
                            { row with
                                RM = if Single.IsNaN(row.RM) then means.["RM"] else row.RM
                                LSTAT = if Single.IsNaN(row.LSTAT) then means.["LSTAT"] else row.LSTAT
                                PTRATIO = if Single.IsNaN(row.PTRATIO) then means.["PTRATIO"] else row.PTRATIO })

                    let filledData = mlContext.Data.LoadFromEnumerable(filledRows)
                    Result.Ok filledData
        with ex ->
            Result.Error $"欠損値補完エラー: {ex.Message}"

    /// 特徴量エンジニアリング（2乗項 + 交互作用項）
    member this.FeatureEngineering(inputData: IDataView) : Result<IDataView, string> =
        try
            let rows =
                mlContext.Data.CreateEnumerable<BostonData>(inputData, reuseRowObject = false)
                |> Seq.toList

            let engineeredRows =
                rows
                |> List.map (fun row ->
                    { RM = row.RM
                      LSTAT = row.LSTAT
                      PTRATIO = row.PTRATIO
                      RM2 = row.RM * row.RM
                      LSTAT2 = row.LSTAT * row.LSTAT
                      PTRATIO2 = row.PTRATIO * row.PTRATIO
                      RMxLSTAT = row.RM * row.LSTAT
                      PRICE = row.PRICE })

            let engineeredData = mlContext.Data.LoadFromEnumerable(engineeredRows)
            Result.Ok engineeredData
        with ex ->
            Result.Error $"特徴量エンジニアリングエラー: {ex.Message}"

    /// モデルの訓練
    member this.Train(filePath: string) : Result<RegressionMetrics, string> =
        try
            // データ読み込み
            let dataResult = this.LoadData(filePath)

            match dataResult with
            | Error msg -> Result.Error msg
            | Ok dataView ->
                // 欠損値補完 + 特徴量エンジニアリング
                let preprocessResult =
                    this.FillMissingValues(dataView, fit = true)
                    |> Result.bind this.FeatureEngineering

                match preprocessResult with
                | Error msg -> Result.Error msg
                | Ok engineeredData ->
                    // データ分割
                    let trainTestSplit =
                        mlContext.Data.TrainTestSplit(engineeredData, testFraction = 0.2, seed = Nullable 42)

                    // パイプライン構築
                    let pipeline =
                        mlContext.Transforms.Concatenate(
                            "Features",
                            "RM",
                            "LSTAT",
                            "PTRATIO",
                            "RM2",
                            "LSTAT2",
                            "PTRATIO2",
                            "RM_x_LSTAT"
                        )
                        |> downcastPipeline
                        |> fun estimator ->
                            estimator
                                .Append(mlContext.Transforms.NormalizeMinMax("Features"))
                                .Append(
                                    mlContext.Regression.Trainers.Sdca(
                                        labelColumnName = "PRICE",
                                        maximumNumberOfIterations = 100
                                    )
                                )

                    // モデル訓練
                    let model = pipeline.Fit(trainTestSplit.TrainSet)
                    trainedModel <- Some model

                    // 評価
                    let predictions = model.Transform(trainTestSplit.TestSet)

                    let metrics =
                        mlContext.Regression.Evaluate(predictions, labelColumnName = "PRICE")

                    Result.Ok metrics
        with ex ->
            Result.Error $"訓練エラー: {ex.Message}"

    /// 予測
    member this.Predict(input: BostonData) : Result<float32, string> =
        match trainedModel with
        | None -> Result.Error "モデルが訓練されていません"
        | Some model ->
            try
                // 前処理を適用
                let inputData = mlContext.Data.LoadFromEnumerable([ input ])

                let preprocessResult =
                    this.FillMissingValues(inputData, fit = false)
                    |> Result.bind this.FeatureEngineering

                match preprocessResult with
                | Error msg -> Result.Error msg
                | Ok preprocessedData ->
                    let predictions = model.Transform(preprocessedData)

                    let result =
                        mlContext.Data.CreateEnumerable<BostonPrediction>(predictions, reuseRowObject = false)
                        |> Seq.head

                    Result.Ok result.Price
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
                    [ { RM = 0.0f
                        LSTAT = 0.0f
                        PTRATIO = 0.0f
                        RM2 = 0.0f
                        LSTAT2 = 0.0f
                        PTRATIO2 = 0.0f
                        RMxLSTAT = 0.0f
                        PRICE = 0.0f } ]

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
