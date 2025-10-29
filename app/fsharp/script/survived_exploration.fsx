// Survived 生存予測モデルの探索と分析
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
printfn "Survived 生存予測モデルの探索と分析"
printfn "==================================="

// データ型定義
[<CLIMutable>]
type SurvivedData = {
    [<LoadColumn(0)>] PassengerId: int
    [<LoadColumn(1)>] Survived: bool
    [<LoadColumn(2)>] Pclass: float32
    [<LoadColumn(3)>] Sex: string
    [<LoadColumn(4)>] Age: float32
}

[<CLIMutable>]
type SurvivedPrediction = {
    [<ColumnName("PredictedLabel")>] Survived: bool
    Score: float32
}

// F# 用のダウンキャストヘルパー関数
let downcastPipeline (x: IEstimator<_>) =
    match x with
    | :? IEstimator<ITransformer> as y -> y
    | _ -> failwith "downcastPipeline: IEstimator<ITransformer> が期待されます"

// グループ別平均計算
let calculateGroupMeans (rows: SurvivedData list) =
    rows
    |> List.filter (fun r -> not (Single.IsNaN(r.Age)))
    |> List.groupBy (fun r -> (r.Pclass, r.Survived))
    |> List.map (fun ((pclass, survived), group) ->
        let avgAge = group |> List.averageBy (fun r -> r.Age)
        ((pclass, survived), avgAge))
    |> Map.ofList

printfn "\n--- 1. データ読み込みと探索 ---"

let mlContext = MLContext(seed = Nullable 0)
// スクリプトファイルの場所を基準にした絶対パスを使用
let dataPath = System.IO.Path.Combine(__SOURCE_DIRECTORY__, "..", "data", "Survived.csv")
printfn $"データファイル: {dataPath}"

let dataView =
    mlContext.Data.LoadFromTextFile<SurvivedData>(
        dataPath,
        hasHeader = true,
        separatorChar = ',')

// データフレームに変換
let survivedData =
    mlContext.Data.CreateEnumerable<SurvivedData>(dataView, reuseRowObject = false)
    |> Seq.toList

printfn $"データ数: {survivedData.Length} サンプル"

printfn $"\nクラス分布:"
survivedData
|> List.groupBy (fun d -> d.Survived)
|> List.iter (fun (survived, samples) ->
    let label = if survived then "生存" else "死亡"
    printfn $"  {label}: {samples.Length} サンプル"
)

printfn "\n--- 2. 欠損値の確認 ---"

let missingAges =
    survivedData
    |> List.filter (fun d -> Single.IsNaN(d.Age))
    |> List.length

let missingPercentage = float missingAges / float survivedData.Length * 100.0
printfn $"Age の欠損値: {missingAges} 件 ({missingPercentage:F2}%%)"

printfn "\n--- 3. 基本統計量 ---"

printfn "\nAge（年齢）:"
let validAges =
    survivedData
    |> List.map (fun d -> float d.Age)
    |> List.filter (fun v -> not (Double.IsNaN v))

if validAges.Length > 0 then
    let mean = List.average validAges
    let std = Seq.stDev validAges
    let min = List.min validAges
    let max = List.max validAges
    printfn $"  平均={mean:F2}, 標準偏差={std:F2}, 最小={min:F2}, 最大={max:F2}"

printfn "\nPclass（客室クラス）別の年齢:"
survivedData
|> List.filter (fun d -> not (Single.IsNaN(d.Age)))
|> List.groupBy (fun d -> d.Pclass)
|> List.sortBy fst
|> List.iter (fun (pclass, samples) ->
    let ages = samples |> List.map (fun d -> float d.Age)
    let mean = List.average ages
    printfn $"  クラス {int pclass}: 平均年齢={mean:F2}"
)

printfn "\nSex（性別）分布:"
survivedData
|> List.groupBy (fun d -> d.Sex)
|> List.iter (fun (sex, samples) ->
    printfn $"  {sex}: {samples.Length} サンプル"
)

printfn "\n--- 4. グループ別欠損値補完 ---"

let ageMapping = calculateGroupMeans survivedData

let imputedData =
    survivedData
    |> List.map (fun row ->
        if Single.IsNaN(row.Age) then
            let key = (row.Pclass, row.Survived)
            match Map.tryFind key ageMapping with
            | Some avgAge -> { row with Age = avgAge }
            | None -> row
        else
            row
    )

printfn "グループ別平均年齢:"
ageMapping
|> Map.toList
|> List.sortBy fst
|> List.iter (fun ((pclass, survived), avgAge) ->
    let label = if survived then "生存" else "死亡"
    printfn $"  クラス {int pclass}, {label}: {avgAge:F2}"
)

printfn "\n--- 5. モデルの訓練と評価 ---"

let imputedDataView = mlContext.Data.LoadFromEnumerable(imputedData)
let trainTestSplit = mlContext.Data.TrainTestSplit(imputedDataView, testFraction = 0.2, seed = Nullable 42)

let pipeline =
    mlContext.Transforms.CopyColumns("Label", "Survived")
    |> downcastPipeline
    |> fun estimator ->
        estimator
            .Append(mlContext.Transforms.Categorical.OneHotEncoding("SexEncoded", "Sex"))
            .Append(mlContext.Transforms.Concatenate("Features", "Pclass", "SexEncoded", "Age"))
            .Append(mlContext.BinaryClassification.Trainers.FastTree())

printfn "モデルを訓練中..."
let model = pipeline.Fit(trainTestSplit.TrainSet)

// 予測
let predictions = model.Transform(trainTestSplit.TestSet)

// 評価
let metrics = mlContext.BinaryClassification.Evaluate(predictions, labelColumnName = "Label")

printfn "\n=== モデル評価結果 ==="
printfn $"精度 (Accuracy):        {metrics.Accuracy:F4} ({metrics.Accuracy * 100.0:F2}%%)"
printfn $"AUC:                    {metrics.AreaUnderRocCurve:F4}"
printfn $"F1 スコア:              {metrics.F1Score:F4}"
printfn $"適合率 (Precision):     {metrics.PositivePrecision:F4}"
printfn $"再現率 (Recall):        {metrics.PositiveRecall:F4}"

printfn "\n--- 6. 実測値 vs 予測値 ---"

let testData =
    mlContext.Data.CreateEnumerable<SurvivedData>(trainTestSplit.TestSet, reuseRowObject = false)
    |> Seq.toList

let predictedData =
    mlContext.Data.CreateEnumerable<SurvivedPrediction>(predictions, reuseRowObject = false)
    |> Seq.toList

printfn "\n実測値 vs 予測値（最初の 10 件）:"
printfn "PassengerId | Pclass | Sex    | Age  | 実測 | 予測"
printfn "------------|--------|--------|------|------|------"

List.zip testData predictedData
|> List.take (min 10 (List.length testData))
|> List.iter (fun (actual, predicted) ->
    let actualLabel = if actual.Survived then "生存" else "死亡"
    let predLabel = if predicted.Survived then "生存" else "死亡"
    printfn $"{actual.PassengerId,11} | {int actual.Pclass,6} | {actual.Sex,6} | {actual.Age,4:F0} | {actualLabel,4} | {predLabel,4}"
)

printfn "\n--- 7. 混同行列 ---"

let confusionPairs =
    List.zip testData predictedData
    |> List.groupBy (fun (actual, predicted) -> (actual.Survived, predicted.Survived))
    |> List.map (fun ((actualLabel, predLabel), items) -> ((actualLabel, predLabel), items.Length))
    |> Map.ofList

let tp = Map.tryFind (true, true) confusionPairs |> Option.defaultValue 0
let fp = Map.tryFind (false, true) confusionPairs |> Option.defaultValue 0
let tn = Map.tryFind (false, false) confusionPairs |> Option.defaultValue 0
let fn = Map.tryFind (true, false) confusionPairs |> Option.defaultValue 0

printfn "\n混同行列:"
printfn "              予測"
printfn "        | 死亡 | 生存"
printfn "--------|------|------"
printfn $"死亡    | {tn,4} | {fp,4}"
printfn $"生存    | {fn,4} | {tp,4}"

printfn "\n--- 8. 予測例 ---"

// 新しいサンプルデータでの予測
let testSamples =
    [
        { PassengerId = 0; Survived = false; Pclass = 3.0f; Sex = "male"; Age = 22.0f }
        { PassengerId = 0; Survived = false; Pclass = 1.0f; Sex = "female"; Age = 38.0f }
        { PassengerId = 0; Survived = false; Pclass = 2.0f; Sex = "male"; Age = 35.0f }
    ]

printfn "\nサンプルデータでの予測:"
testSamples
|> List.iteri (fun i sample ->
    let input = mlContext.Data.LoadFromEnumerable([sample])
    let prediction = model.Transform(input)
    let pred =
        mlContext.Data.CreateEnumerable<SurvivedPrediction>(prediction, reuseRowObject = false)
        |> Seq.head

    let predLabel = if pred.Survived then "生存" else "死亡"
    printfn $"\nサンプル {i + 1}:"
    printfn $"  特徴量: Pclass={int sample.Pclass}, Sex={sample.Sex}, Age={sample.Age:F0}"
    printfn $"  予測: {predLabel}"
    printfn $"  確信度: {pred.Score:F4}"
)

printfn "\n==================================="
printfn "分析完了！"
printfn "==================================="
printfn "\n主な発見:"
printfn "- Age に欠損値が存在し、グループ別平均で補完"
printfn "- Sex と Pclass が生存に大きく影響"
printfn "- FastTree アルゴリズムで二値分類モデルを構築"
let accuracyPercentage = metrics.Accuracy * 100.0
printfn $"- モデルの精度 (Accuracy): {accuracyPercentage:F2}%%"
printfn $"- AUC: {metrics.AreaUnderRocCurve:F4}"
