// モデル訓練スクリプト
// すべてのモデルを訓練して model/ ディレクトリに保存する

#r "nuget: Microsoft.ML, 3.0.1"
#r "nuget: Microsoft.ML.FastTree, 3.0.1"

#load "../MlTddFSharp/Domain/Types.fs"
#load "../MlTddFSharp/Ml/IrisClassifier.fs"
#load "../MlTddFSharp/Ml/CinemaPredictor.fs"
#load "../MlTddFSharp/Ml/SurvivedPredictor.fs"
#load "../MlTddFSharp/Ml/BostonPredictor.fs"

open System
open System.IO
open Microsoft.ML
open MlTddFSharp.Domain.Types
open MlTddFSharp.Ml

printfn "===================================="
printfn "モデル訓練スクリプト"
printfn "===================================="

// パスの設定
let baseDir = __SOURCE_DIRECTORY__
let dataDir = Path.Combine(baseDir, "..", "data")
let modelDir = Path.Combine(baseDir, "..", "model")

// model/ ディレクトリを作成
if not (Directory.Exists(modelDir)) then
    Directory.CreateDirectory(modelDir) |> ignore
    printfn $"model/ ディレクトリを作成しました: {modelDir}"

let mlContext = MLContext(seed = Nullable 0)

// 1. Iris モデルの訓練と保存
printfn "\n--- 1. Iris 分類モデル ---"
let irisDataPath = Path.Combine(dataDir, "iris.csv")
let irisModelPath = Path.Combine(modelDir, "iris_model.zip")

let irisClassifier = IrisClassifier(mlContext)

match irisClassifier.Train(irisDataPath) with
| Ok metrics ->
    printfn $"訓練完了: MacroAccuracy = {metrics.MacroAccuracy:F4}"

    match irisClassifier.SaveModel(irisModelPath) with
    | Ok _ -> printfn $"モデル保存完了: {irisModelPath}"
    | Error msg -> printfn $"モデル保存エラー: {msg}"
| Error msg -> printfn $"訓練エラー: {msg}"

// 2. Cinema モデルの訓練と保存
printfn "\n--- 2. Cinema 回帰モデル ---"
let cinemaDataPath = Path.Combine(dataDir, "cinema.csv")
let cinemaModelPath = Path.Combine(modelDir, "cinema_model.zip")

let cinemaPredictor = CinemaPredictor(mlContext)

match cinemaPredictor.Train(cinemaDataPath) with
| Ok metrics ->
    printfn $"訓練完了: R² = {metrics.RSquared:F4}, MAE = {metrics.MeanAbsoluteError:F2}"

    match cinemaPredictor.SaveModel(cinemaModelPath) with
    | Ok _ -> printfn $"モデル保存完了: {cinemaModelPath}"
    | Error msg -> printfn $"モデル保存エラー: {msg}"
| Error msg -> printfn $"訓練エラー: {msg}"

// 3. Survived モデルの訓練と保存
printfn "\n--- 3. Survived 二値分類モデル ---"
let survivedDataPath = Path.Combine(dataDir, "Survived.csv")
let survivedModelPath = Path.Combine(modelDir, "survived_model.zip")

let survivedPredictor = SurvivedPredictor(mlContext)

match survivedPredictor.Train(survivedDataPath) with
| Ok metrics ->
    printfn $"訓練完了: Accuracy = {metrics.Accuracy:F4}, AUC = {metrics.AreaUnderRocCurve:F4}"

    match survivedPredictor.SaveModel(survivedModelPath) with
    | Ok _ -> printfn $"モデル保存完了: {survivedModelPath}"
    | Error msg -> printfn $"モデル保存エラー: {msg}"
| Error msg -> printfn $"訓練エラー: {msg}"

// 4. Boston モデルの訓練と保存
printfn "\n--- 4. Boston 回帰モデル ---"
let bostonDataPath = Path.Combine(dataDir, "Boston.csv")
let bostonModelPath = Path.Combine(modelDir, "boston_model.zip")

let bostonPredictor = BostonPredictor(mlContext)

match bostonPredictor.Train(bostonDataPath) with
| Ok metrics ->
    printfn $"訓練完了: R² = {metrics.RSquared:F4}, MAE = {metrics.MeanAbsoluteError:F2}"

    match bostonPredictor.SaveModel(bostonModelPath) with
    | Ok _ -> printfn $"モデル保存完了: {bostonModelPath}"
    | Error msg -> printfn $"モデル保存エラー: {msg}"
| Error msg -> printfn $"訓練エラー: {msg}"

printfn "\n===================================="
printfn "すべてのモデルの訓練が完了しました"
printfn "===================================="

// 保存されたモデルの一覧
printfn "\n保存されたモデル:"
let modelFiles = Directory.GetFiles(modelDir, "*.zip")

for file in modelFiles do
    let fileInfo = FileInfo(file)
    printfn $"  - {Path.GetFileName(file)} ({fileInfo.Length / 1024L} KB)"
