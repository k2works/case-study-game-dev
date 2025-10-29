module IrisClassifierTests

open Expecto
open MlTddFSharp.Domain.Types
open MlTddFSharp.Ml

[<Tests>]
let irisClassifierInitTests =
    testList
        "IrisClassifier の初期化テスト"
        [ test "デフォルトパラメータでの初期化" {
              let mlContext = Microsoft.ML.MLContext()
              let classifier = IrisClassifier(mlContext)

              Expect.isTrue (classifier.MlContext <> null) "MLContext が設定されている"
          }

          test "IrisData レコード型の作成" {
              let data =
                  { SepalLength = 5.1f
                    SepalWidth = 3.5f
                    PetalLength = 1.4f
                    PetalWidth = 0.2f
                    Species = "Setosa" }

              Expect.equal data.Species "Setosa" "種類が正しい"
              Expect.equal data.SepalLength 5.1f "がく片の長さが正しい"
          } ]

[<Tests>]
let irisClassifierTrainingTests =
    testList
        "IrisClassifier の訓練テスト"
        [ test "CSV ファイルからデータを読み込んで訓練できる" {
              let mlContext = Microsoft.ML.MLContext(seed = System.Nullable 0)
              let classifier = IrisClassifier(mlContext)

              let result = classifier.Train("../data/iris.csv")

              match result with
              | Ok metrics ->
                  Expect.isGreaterThan metrics.MacroAccuracy 0.8 "精度が 80% 以上"
                  Expect.isTrue (classifier.Model.IsSome) "モデルが訓練された"
              | Error msg -> failtestf "訓練に失敗: %s" msg
          }

          test "訓練後に予測できる" {
              let mlContext = Microsoft.ML.MLContext(seed = System.Nullable 0)
              let classifier = IrisClassifier(mlContext)

              match classifier.Train("../data/iris.csv") with
              | Ok _ ->
                  let testData =
                      { SepalLength = 5.1f
                        SepalWidth = 3.5f
                        PetalLength = 1.4f
                        PetalWidth = 0.2f
                        Species = "" }

                  match classifier.Predict(testData) with
                  | Ok prediction ->
                      Expect.isNotEmpty prediction.PredictedSpecies "予測結果が取得できた"
                  | Error msg -> failtestf "予測に失敗: %s" msg
              | Error msg -> failtestf "訓練に失敗: %s" msg
          } ]
