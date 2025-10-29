// Boston 住宅価格予測モデルの探索と分析
// F# スクリプト版

#r "nuget: Microsoft.ML, 3.0.1"
#r "nuget: FSharp.Stats, 0.5.0"

open System
open System.IO
open Microsoft.ML
open Microsoft.ML.Data
open FSharp.Stats

printfn "===================================="
printfn "Boston 住宅価格予測モデルの探索と分析"
printfn "===================================="

// データ型定義
[<CLIMutable>]
type BostonData =
    { [<LoadColumn(0)>]
      CRIME: string

      [<LoadColumn(5)>]
      RM: float32

      [<LoadColumn(10)>]
      PTRATIO: float32

      [<LoadColumn(12)>]
      LSTAT: float32

      [<LoadColumn(13)>]
      PRICE: float32 }

[<CLIMutable>]
type BostonFeatures =
    { RM: float32
      LSTAT: float32
      PTRATIO: float32
      RM2: float32
      LSTAT2: float32
      PTRATIO2: float32

      [<ColumnName("RM_x_LSTAT")>]
      RMxLSTAT: float32

      PRICE: float32 }

[<CLIMutable>]
type BostonPrediction = { [<ColumnName("Score")>] Price: float32 }

// F# 用のダウンキャストヘルパー関数
let downcastPipeline (x: IEstimator<_>) =
    match x with
    | :? IEstimator<ITransformer> as y -> y
    | _ -> failwith "downcastPipeline: IEstimator<ITransformer> が期待されます"

// ヘルパー関数
let calculateMean (values: float32 list) =
    if List.isEmpty values then 0.0f else List.average values

printfn "\n--- 1. データ読み込みと探索 ---"

let mlContext = MLContext(seed = Nullable 0)
// スクリプトファイルの場所を基準にした絶対パスを使用
let dataPath =
    System.IO.Path.Combine(__SOURCE_DIRECTORY__, "..", "data", "Boston.csv")

printfn $"データファイル: {dataPath}"

let dataView =
    mlContext.Data.LoadFromTextFile<BostonData>(dataPath, hasHeader = true, separatorChar = ',')

// データフレームに変換
let bostonData =
    mlContext.Data.CreateEnumerable<BostonData>(dataView, reuseRowObject = false)
    |> Seq.toList

printfn $"データ数: {bostonData.Length} サンプル"

printfn "\n--- 2. 欠損値の確認 ---"

let missingRM =
    bostonData
    |> List.filter (fun d -> Single.IsNaN(d.RM))
    |> List.length

let missingLSTAT =
    bostonData
    |> List.filter (fun d -> Single.IsNaN(d.LSTAT))
    |> List.length

let missingPTRATIO =
    bostonData
    |> List.filter (fun d -> Single.IsNaN(d.PTRATIO))
    |> List.length

printfn $"RM の欠損値: {missingRM} 件"
printfn $"LSTAT の欠損値: {missingLSTAT} 件"
printfn $"PTRATIO の欠損値: {missingPTRATIO} 件"

printfn "\n--- 3. 基本統計量 ---"

let validRMs =
    bostonData
    |> List.map (fun d -> float d.RM)
    |> List.filter (fun v -> not (Double.IsNaN v))

let validLSTATs =
    bostonData
    |> List.map (fun d -> float d.LSTAT)
    |> List.filter (fun v -> not (Double.IsNaN v))

let validPTRATIOs =
    bostonData
    |> List.map (fun d -> float d.PTRATIO)
    |> List.filter (fun v -> not (Double.IsNaN v))

let validPRICEs =
    bostonData
    |> List.map (fun d -> float d.PRICE)
    |> List.filter (fun v -> not (Double.IsNaN v))

printfn "\nRM（平均部屋数）:"

if validRMs.Length > 0 then
    let mean = List.average validRMs
    let std = Seq.stDev validRMs
    let min = List.min validRMs
    let max = List.max validRMs
    printfn $"  平均={mean:F2}, 標準偏差={std:F2}, 最小={min:F2}, 最大={max:F2}"

printfn "\nLSTAT（低所得者の割合）:"

if validLSTATs.Length > 0 then
    let mean = List.average validLSTATs
    let std = Seq.stDev validLSTATs
    let min = List.min validLSTATs
    let max = List.max validLSTATs
    printfn $"  平均={mean:F2}, 標準偏差={std:F2}, 最小={min:F2}, 最大={max:F2}"

printfn "\nPTRATIO（教員1人当たりの児童生徒数）:"

if validPTRATIOs.Length > 0 then
    let mean = List.average validPTRATIOs
    let std = Seq.stDev validPTRATIOs
    let min = List.min validPTRATIOs
    let max = List.max validPTRATIOs
    printfn $"  平均={mean:F2}, 標準偏差={std:F2}, 最小={min:F2}, 最大={max:F2}"

printfn "\nPRICE（住宅価格、$1000単位）:"

if validPRICEs.Length > 0 then
    let mean = List.average validPRICEs
    let std = Seq.stDev validPRICEs
    let min = List.min validPRICEs
    let max = List.max validPRICEs
    printfn $"  平均={mean:F2}, 標準偏差={std:F2}, 最小={min:F2}, 最大={max:F2}"

printfn "\nCRIME（犯罪率カテゴリ）分布:"

bostonData
|> List.groupBy (fun d -> d.CRIME)
|> List.iter (fun (crime, samples) -> printfn $"  {crime}: {samples.Length} サンプル")

printfn "\n--- 4. 欠損値補完 ---"

let validRMValues =
    bostonData
    |> List.filter (fun r -> not (Single.IsNaN(r.RM)))
    |> List.map (fun r -> r.RM)

let validLSTATValues =
    bostonData
    |> List.filter (fun r -> not (Single.IsNaN(r.LSTAT)))
    |> List.map (fun r -> r.LSTAT)

let validPTRATIOValues =
    bostonData
    |> List.filter (fun r -> not (Single.IsNaN(r.PTRATIO)))
    |> List.map (fun r -> r.PTRATIO)

let trainMean =
    Map.ofList
        [ ("RM", calculateMean validRMValues)
          ("LSTAT", calculateMean validLSTATValues)
          ("PTRATIO", calculateMean validPTRATIOValues) ]

let filledData =
    bostonData
    |> List.map (fun row ->
        { row with
            RM = if Single.IsNaN(row.RM) then trainMean.["RM"] else row.RM
            LSTAT = if Single.IsNaN(row.LSTAT) then trainMean.["LSTAT"] else row.LSTAT
            PTRATIO = if Single.IsNaN(row.PTRATIO) then trainMean.["PTRATIO"] else row.PTRATIO })

printfn "欠損値補完完了（平均値で補完）"
let rmMean = trainMean.["RM"]
let lstatMean = trainMean.["LSTAT"]
let ptratioMean = trainMean.["PTRATIO"]
printfn $"  RM 平均値: {rmMean:F2}"
printfn $"  LSTAT 平均値: {lstatMean:F2}"
printfn $"  PTRATIO 平均値: {ptratioMean:F2}"

printfn "\n--- 5. 特徴量エンジニアリング ---"

let engineeredData =
    filledData
    |> List.map (fun row ->
        { RM = row.RM
          LSTAT = row.LSTAT
          PTRATIO = row.PTRATIO
          RM2 = row.RM * row.RM
          LSTAT2 = row.LSTAT * row.LSTAT
          PTRATIO2 = row.PTRATIO * row.PTRATIO
          RMxLSTAT = row.RM * row.LSTAT
          PRICE = row.PRICE })

printfn "特徴量エンジニアリング完了"
printfn "  元の特徴量: RM, LSTAT, PTRATIO"
printfn "  追加された特徴量: RM2, LSTAT2, PTRATIO2, RM×LSTAT"
printfn $"  合計特徴量数: 7"

printfn "\n--- 6. モデルの訓練と評価 ---"

let engineeredDataView = mlContext.Data.LoadFromEnumerable(engineeredData)

let trainTestSplit =
    mlContext.Data.TrainTestSplit(engineeredDataView, testFraction = 0.2, seed = Nullable 42)

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
            .Append(mlContext.Regression.Trainers.Sdca(labelColumnName = "PRICE", maximumNumberOfIterations = 100))

printfn "モデルを訓練中..."
let model = pipeline.Fit(trainTestSplit.TrainSet)

// 予測
let predictions = model.Transform(trainTestSplit.TestSet)

// 評価
let metrics =
    mlContext.Regression.Evaluate(predictions, labelColumnName = "PRICE")

printfn "\n=== モデル評価結果 ==="
printfn $"R² (決定係数):              {metrics.RSquared:F4} ({metrics.RSquared * 100.0:F2}%%)"
printfn $"平均絶対誤差 (MAE):         ${metrics.MeanAbsoluteError:F2}k"
printfn $"二乗平均平方根誤差 (RMSE):  ${metrics.RootMeanSquaredError:F2}k"

printfn "\n--- 7. 実測値 vs 予測値 ---"

let testData =
    mlContext.Data.CreateEnumerable<BostonFeatures>(trainTestSplit.TestSet, reuseRowObject = false)
    |> Seq.toList

let predictedData =
    mlContext.Data.CreateEnumerable<BostonPrediction>(predictions, reuseRowObject = false)
    |> Seq.toList

printfn "\n実測値 vs 予測値（最初の 10 件）:"
printfn "RM   | LSTAT | PTRATIO | 実測価格 | 予測価格"
printfn "-----|-------|---------|----------|----------"

List.zip testData predictedData
|> List.take (min 10 (List.length testData))
|> List.iter (fun (actual, predicted) ->
    printfn
        $"{actual.RM,4:F1} | {actual.LSTAT,5:F1} | {actual.PTRATIO,7:F1} | ${actual.PRICE,7:F2}k | ${predicted.Price,7:F2}k")

printfn "\n--- 8. 予測例 ---"

// 新しいサンプルデータでの予測
let testSamples =
    [ { CRIME = "low"
        RM = 7.5f
        LSTAT = 5.0f
        PTRATIO = 15.0f
        PRICE = 0.0f }
      { CRIME = "high"
        RM = 6.0f
        LSTAT = 15.0f
        PTRATIO = 18.0f
        PRICE = 0.0f }
      { CRIME = "very_high"
        RM = 5.0f
        LSTAT = 30.0f
        PTRATIO = 20.0f
        PRICE = 0.0f } ]

printfn "\nサンプルデータでの予測:"

testSamples
|> List.iteri (fun i sample ->
    // 前処理を適用
    let sampleData = mlContext.Data.LoadFromEnumerable([ sample ])

    let filledSample =
        mlContext.Data.CreateEnumerable<BostonData>(sampleData, reuseRowObject = false)
        |> Seq.head

    let engineeredSample =
        [ { RM = filledSample.RM
            LSTAT = filledSample.LSTAT
            PTRATIO = filledSample.PTRATIO
            RM2 = filledSample.RM * filledSample.RM
            LSTAT2 = filledSample.LSTAT * filledSample.LSTAT
            PTRATIO2 = filledSample.PTRATIO * filledSample.PTRATIO
            RMxLSTAT = filledSample.RM * filledSample.LSTAT
            PRICE = 0.0f } ]

    let engineeredDataView = mlContext.Data.LoadFromEnumerable(engineeredSample)
    let prediction = model.Transform(engineeredDataView)

    let pred =
        mlContext.Data.CreateEnumerable<BostonPrediction>(prediction, reuseRowObject = false)
        |> Seq.head

    printfn $"\nサンプル {i + 1}:"
    printfn $"  特徴量: CRIME={sample.CRIME}, RM={sample.RM:F1}, LSTAT={sample.LSTAT:F1}, PTRATIO={sample.PTRATIO:F1}"
    printfn $"  予測価格: ${pred.Price:F2}k")

printfn "\n===================================="
printfn "分析完了！"
printfn "===================================="
printfn "\n主な発見:"
printfn "- 特徴量エンジニアリングで 3 個 → 7 個の特徴量を生成"
printfn "- データ標準化により学習を安定化"
printfn "- SDCA アルゴリズムで回帰モデルを構築"

let r2Percentage = metrics.RSquared * 100.0
printfn $"- モデルの R² (決定係数): {r2Percentage:F2}%%"
printfn $"- 平均絶対誤差 (MAE): ${metrics.MeanAbsoluteError:F2}k"
