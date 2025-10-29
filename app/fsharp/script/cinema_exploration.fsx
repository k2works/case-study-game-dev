// Cinema 回帰モデルの探索と分析
// F# スクリプト版

#r "nuget: Microsoft.ML, 3.0.1"
#r "nuget: Microsoft.ML.FastTree, 3.0.1"
#r "nuget: FSharp.Stats, 0.5.0"

open System
open System.IO
open Microsoft.ML
open Microsoft.ML.Data
open FSharp.Stats

printfn "==================================="
printfn "Cinema 回帰モデルの探索と分析"
printfn "==================================="

// データ型定義
[<CLIMutable>]
type CinemaData = {
    [<LoadColumn(0)>] CinemaId: int
    [<LoadColumn(1)>] SNS1: float32
    [<LoadColumn(2)>] SNS2: float32
    [<LoadColumn(3)>] Actor: float32
    [<LoadColumn(4)>] Original: float32
    [<LoadColumn(5)>] Sales: float32
}

[<CLIMutable>]
type CinemaPrediction = {
    [<ColumnName("Score")>] PredictedSales: float32
}

// F# 用のダウンキャストヘルパー関数
let downcastPipeline (x: IEstimator<_>) =
    match x with
    | :? IEstimator<ITransformer> as y -> y
    | _ -> failwith "downcastPipeline: IEstimator<ITransformer> が期待されます"

printfn "\n--- 1. データ読み込みと探索 ---"

let mlContext = MLContext(seed = Nullable 0)
// スクリプトファイルの場所を基準にした絶対パスを使用
let dataPath = System.IO.Path.Combine(__SOURCE_DIRECTORY__, "..", "data", "cinema.csv")
printfn $"データファイル: {dataPath}"

let dataView =
    mlContext.Data.LoadFromTextFile<CinemaData>(
        dataPath,
        hasHeader = true,
        separatorChar = ',')

// データフレームに変換
let cinemaData =
    mlContext.Data.CreateEnumerable<CinemaData>(dataView, reuseRowObject = false)
    |> Seq.toList

printfn $"データ数: {cinemaData.Length} サンプル"

printfn "\n--- 2. 欠損値の確認 ---"

let countMissing getValue name =
    let missing =
        cinemaData
        |> List.filter (fun d -> Single.IsNaN(getValue d))
        |> List.length
    let percentage = float missing / float cinemaData.Length * 100.0
    printfn $"{name}: {missing} 件の欠損値 ({percentage:F2}%%)"

countMissing (fun d -> d.SNS1) "SNS1"
countMissing (fun d -> d.SNS2) "SNS2"
countMissing (fun d -> d.Actor) "Actor"
countMissing (fun d -> d.Original) "Original"
countMissing (fun d -> d.Sales) "Sales"

printfn "\n--- 3. 基本統計量 ---"

let printStats name getValue =
    let values =
        cinemaData
        |> List.map (fun d -> float (getValue d))
        |> List.filter (fun v -> not (Double.IsNaN v))

    if values.Length > 0 then
        let mean = List.average values
        let std = Seq.stDev values
        let min = List.min values
        let max = List.max values
        printfn $"\n{name}:"
        printfn $"  平均={mean:F2}, 標準偏差={std:F2}, 最小={min:F2}, 最大={max:F2}"

printStats "SNS1" (fun d -> d.SNS1)
printStats "SNS2" (fun d -> d.SNS2)
printStats "Actor" (fun d -> d.Actor)
printStats "Original" (fun d -> d.Original)
printStats "Sales (売上)" (fun d -> d.Sales)

printfn "\n--- 4. モデルの訓練と評価 ---"

let trainTestSplit = mlContext.Data.TrainTestSplit(dataView, testFraction = 0.2, seed = Nullable 42)

let pipeline =
    mlContext.Transforms.CopyColumns("Label", "Sales")
    |> downcastPipeline
    |> fun estimator ->
        estimator
            .Append(mlContext.Transforms.ReplaceMissingValues("SNS1"))
            .Append(mlContext.Transforms.ReplaceMissingValues("SNS2"))
            .Append(mlContext.Transforms.Concatenate("Features", "SNS1", "SNS2", "Actor", "Original"))
            .Append(mlContext.Regression.Trainers.FastTree())

printfn "モデルを訓練中..."
let model = pipeline.Fit(trainTestSplit.TrainSet)

// 予測
let predictions = model.Transform(trainTestSplit.TestSet)

// 評価
let metrics = mlContext.Regression.Evaluate(predictions, labelColumnName = "Label")

printfn "\n=== モデル評価結果 ==="
printfn $"R^2 (決定係数):              {metrics.RSquared:F4}"
printfn $"MAE (平均絶対誤差):          {metrics.MeanAbsoluteError:F2} 万円"
printfn $"RMSE (二乗平均平方根誤差):   {metrics.RootMeanSquaredError:F2} 万円"
printfn $"相対二乗誤差:                {metrics.LossFunction:F4}"

printfn "\n--- 5. 実測値 vs 予測値 ---"

let testData =
    mlContext.Data.CreateEnumerable<CinemaData>(trainTestSplit.TestSet, reuseRowObject = false)
    |> Seq.toList

let predictedData =
    mlContext.Data.CreateEnumerable<CinemaPrediction>(predictions, reuseRowObject = false)
    |> Seq.toList

printfn "\n実測値 vs 予測値（最初の 10 件）:"
printfn "実測値(万円) | 予測値(万円) | 誤差(万円)"
printfn "-------------|-------------|----------"

List.zip testData predictedData
|> List.take (min 10 (List.length testData))
|> List.iter (fun (actual, predicted) ->
    let error = actual.Sales - predicted.PredictedSales
    printfn $"{actual.Sales,12:F2} | {predicted.PredictedSales,11:F2} | {error,9:F2}"
)

printfn "\n--- 6. 予測例 ---"

// 新しいサンプルデータでの予測
let testSamples =
    [
        { CinemaId = 0; SNS1 = 700.0f; SNS2 = 800.0f; Actor = 9000.0f; Original = 1.0f; Sales = 0.0f }
        { CinemaId = 0; SNS1 = 500.0f; SNS2 = 600.0f; Actor = 7000.0f; Original = 0.0f; Sales = 0.0f }
        { CinemaId = 0; SNS1 = 900.0f; SNS2 = 1000.0f; Actor = 11000.0f; Original = 1.0f; Sales = 0.0f }
    ]

printfn "\nサンプルデータでの予測:"
testSamples
|> List.iteri (fun i sample ->
    let input = mlContext.Data.LoadFromEnumerable([sample])
    let prediction = model.Transform(input)
    let pred =
        mlContext.Data.CreateEnumerable<CinemaPrediction>(prediction, reuseRowObject = false)
        |> Seq.head

    printfn $"\nサンプル {i + 1}:"
    printfn $"  特徴量: SNS1={sample.SNS1:F0}, SNS2={sample.SNS2:F0}, Actor={sample.Actor:F0}, Original={sample.Original:F0}"
    printfn $"  予測売上: {pred.PredictedSales:F2} 万円"
)

printfn "\n==================================="
printfn "分析完了！"
printfn "==================================="
printfn "\n主な発見:"
printfn "- 欠損値が SNS1 と SNS2 に存在"
printfn "- FastTree アルゴリズムで回帰モデルを構築"
printfn "- 欠損値は平均値で補完"
let r2Percentage = metrics.RSquared * 100.0
printfn $"- モデルの決定係数 (R^2): {r2Percentage:F2}%%"
printfn $"- 平均絶対誤差 (MAE): {metrics.MeanAbsoluteError:F2} 万円"
