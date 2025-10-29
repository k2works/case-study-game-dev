// Iris 分類モデルの探索と視覚化
// F# スクリプト版

#r "nuget: Microsoft.ML, 3.0.1"
#r "nuget: FSharp.Stats, 0.5.0"

open System
open System.IO
open Microsoft.ML
open Microsoft.ML.Data
open FSharp.Stats

printfn "==================================="
printfn "Iris 分類モデルの探索と分析"
printfn "==================================="

// データ型定義
[<CLIMutable>]
type IrisData = {
    [<LoadColumn(0)>] SepalLength: float32
    [<LoadColumn(1)>] SepalWidth: float32
    [<LoadColumn(2)>] PetalLength: float32
    [<LoadColumn(3)>] PetalWidth: float32
    [<LoadColumn(4)>] Species: string
}

[<CLIMutable>]
type IrisPrediction = {
    [<ColumnName("PredictedLabel")>] PredictedSpecies: string
    Score: float32[]
}

// F# 用のダウンキャストヘルパー関数
let downcastPipeline (x: IEstimator<_>) =
    match x with
    | :? IEstimator<ITransformer> as y -> y
    | _ -> failwith "downcastPipeline: IEstimator<ITransformer> が期待されます"

printfn "\n--- 1. データ読み込みと探索 ---"

let mlContext = MLContext(seed = Nullable 0)
// スクリプトファイルの場所を基準にした絶対パスを使用
let dataPath = System.IO.Path.Combine(__SOURCE_DIRECTORY__, "..", "data", "iris.csv")
printfn $"データファイル: {dataPath}"

let dataView =
    mlContext.Data.LoadFromTextFile<IrisData>(
        dataPath,
        hasHeader = true,
        separatorChar = ',')

// データフレームに変換
let irisData =
    mlContext.Data.CreateEnumerable<IrisData>(dataView, reuseRowObject = false)
    |> Seq.toList

printfn $"データ数: {irisData.Length} サンプル"
printfn $"\nクラス分布:"
irisData
|> List.groupBy (fun d -> d.Species)
|> List.iter (fun (species, samples) ->
    printfn $"  {species}: {samples.Length} サンプル"
)

printfn "\n--- 2. 基本統計量 ---"

let printStats name getValue =
    printfn $"\n{name}:"
    irisData
    |> List.groupBy (fun d -> d.Species)
    |> List.iter (fun (species, samples) ->
        let values = samples |> List.map (fun d -> float (getValue d))
        let mean = List.average values
        let std = Seq.stDev values
        let min = List.min values
        let max = List.max values
        printfn $"  {species}:"
        printfn $"    平均={mean:F3}, 標準偏差={std:F3}, 最小={min:F3}, 最大={max:F3}"
    )

printStats "がく片の長さ" (fun d -> d.SepalLength)
printStats "がく片の幅" (fun d -> d.SepalWidth)
printStats "花弁の長さ" (fun d -> d.PetalLength)
printStats "花弁の幅" (fun d -> d.PetalWidth)

printfn "\n--- 3. モデルの訓練と評価 ---"

let trainTestSplit = mlContext.Data.TrainTestSplit(dataView, testFraction = 0.2, seed = Nullable 42)

let pipeline =
    mlContext.Transforms.Conversion.MapValueToKey("Label", "Species")
    |> downcastPipeline
    |> fun estimator ->
        estimator
            .Append(mlContext.Transforms.Concatenate("Features", "SepalLength", "SepalWidth", "PetalLength", "PetalWidth"))
            .Append(mlContext.MulticlassClassification.Trainers.SdcaMaximumEntropy())
            .Append(mlContext.Transforms.Conversion.MapKeyToValue("PredictedLabel"))

printfn "モデルを訓練中..."
let model = pipeline.Fit(trainTestSplit.TrainSet)

// 予測
let predictions = model.Transform(trainTestSplit.TestSet)

// 評価
let metrics = mlContext.MulticlassClassification.Evaluate(predictions, labelColumnName = "Label")

printfn "\n=== モデル評価結果 ==="
printfn $"マクロ精度:     {metrics.MacroAccuracy:F4} ({metrics.MacroAccuracy * 100.0:F2}%%)"
printfn $"ミクロ精度:     {metrics.MicroAccuracy:F4} ({metrics.MicroAccuracy * 100.0:F2}%%)"
printfn $"対数損失:       {metrics.LogLoss:F4}"
printfn $"対数損失軽減:   {metrics.LogLossReduction:F4}"

printfn "\n--- 4. 混同行列 ---"

let predictionResults =
    mlContext.Data.CreateEnumerable<IrisData>(trainTestSplit.TestSet, reuseRowObject = false)
    |> Seq.zip (mlContext.Data.CreateEnumerable<IrisPrediction>(predictions, reuseRowObject = false))
    |> Seq.toList

let confusionMatrix =
    predictionResults
    |> List.groupBy (fun (pred, actual) -> (actual.Species, pred.PredictedSpecies))
    |> List.map (fun ((actual, predicted), items) -> (actual, predicted, items.Length))
    |> List.sortBy (fun (a, p, _) -> (a, p))

// 混同行列を表示
let species = ["Iris-setosa"; "Iris-versicolor"; "Iris-virginica"]
let matrix =
    species
    |> List.map (fun actual ->
        species
        |> List.map (fun predicted ->
            confusionMatrix
            |> List.tryFind (fun (a, p, _) -> a = actual && p = predicted)
            |> Option.map (fun (_, _, count) -> count)
            |> Option.defaultValue 0
        )
    )

printfn "\n混同行列:"
printfn "                     予測"
printfn "          | setosa | versicolor | virginica"
printfn "----------|--------|------------|----------"
List.iter2 (fun (actual: string) (row: int list) ->
    let shortName = actual.Replace("Iris-", "")
    printfn $"{shortName,-10}| {row.[0],6} | {row.[1],10} | {row.[2],9}"
) species matrix

printfn "\n--- 5. 予測例 ---"

// テストデータから3つのサンプルを予測
let testSamples =
    [
        { SepalLength = 0.22f; SepalWidth = 0.63f; PetalLength = 0.08f; PetalWidth = 0.04f; Species = "" }
        { SepalLength = 0.75f; SepalWidth = 0.5f; PetalLength = 0.43f; PetalWidth = 0.54f; Species = "" }
        { SepalLength = 0.94f; SepalWidth = 0.75f; PetalLength = 0.84f; PetalWidth = 0.88f; Species = "" }
    ]

printfn "\nサンプルデータでの予測:"
testSamples
|> List.iteri (fun i sample ->
    let input = mlContext.Data.LoadFromEnumerable([sample])
    let prediction = model.Transform(input)
    let pred =
        mlContext.Data.CreateEnumerable<IrisPrediction>(prediction, reuseRowObject = false)
        |> Seq.head

    printfn $"\nサンプル {i + 1}:"
    printfn $"  特徴量: SepalL={sample.SepalLength:F2}, SepalW={sample.SepalWidth:F2}, PetalL={sample.PetalLength:F2}, PetalW={sample.PetalWidth:F2}"
    printfn $"  予測: {pred.PredictedSpecies}"
    let scores = pred.Score |> Array.map (fun s -> sprintf "%.3f" s) |> String.concat ", "
    printfn $"  確信度: {scores}"
)

printfn "\n==================================="
printfn "分析完了！"
printfn "==================================="
printfn "\n主な発見:"
printfn "- Iris-setosa は他の種と明確に分離可能"
printfn "- Iris-versicolor と Iris-virginica は部分的に重複"
printfn "- 花弁の特徴量が分類に有効"
printfn $"- モデルの精度: {metrics.MacroAccuracy * 100.0:F2}%%"
