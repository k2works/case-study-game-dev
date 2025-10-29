module CinemaPredictorTests

open Expecto
open MlTddFSharp.Domain.Types
open MlTddFSharp.Ml

[<Tests>]
let cinemaPredictorInitTests =
    testList
        "CinemaPredictor の初期化テスト"
        [ test "デフォルトパラメータでの初期化" {
              let mlContext = Microsoft.ML.MLContext()
              let predictor = CinemaPredictor(mlContext)

              Expect.isTrue (predictor.MlContext <> null) "MLContext が設定されている"
          }

          test "CinemaData レコード型の作成" {
              let data =
                  { CinemaId = 1001
                    SNS1 = 650.5f
                    SNS2 = 850.3f
                    Actor = 8500.0f
                    Original = 1.0f
                    Sales = 9500.0f }

              Expect.equal data.CinemaId 1001 "CinemaId が正しい"
              Expect.equal data.SNS1 650.5f "SNS1 が正しい"
          } ]

[<Tests>]
let cinemaPredictorTrainingTests =
    testList
        "CinemaPredictor の訓練テスト"
        [ test "CSV ファイルからデータを読み込んで訓練できる" {
              let mlContext = Microsoft.ML.MLContext(seed = System.Nullable 0)
              let predictor = CinemaPredictor(mlContext)

              let result = predictor.Train("../data/cinema.csv")

              match result with
              | Ok metrics ->
                  Expect.isGreaterThan metrics.RSquared 0.5 "R^2 が 0.5 以上"
                  Expect.isTrue (predictor.Model.IsSome) "モデルが訓練された"
              | Error msg -> failtestf "訓練に失敗: %s" msg
          }

          test "訓練後に予測できる" {
              let mlContext = Microsoft.ML.MLContext(seed = System.Nullable 0)
              let predictor = CinemaPredictor(mlContext)

              match predictor.Train("../data/cinema.csv") with
              | Ok _ ->
                  let testData =
                      { CinemaId = 0
                        SNS1 = 700.0f
                        SNS2 = 800.0f
                        Actor = 9000.0f
                        Original = 1.0f
                        Sales = 0.0f }

                  match predictor.Predict(testData) with
                  | Ok prediction ->
                      Expect.isGreaterThan prediction.PredictedSales 0.0f "予測売上が取得できた"
                  | Error msg -> failtestf "予測に失敗: %s" msg
              | Error msg -> failtestf "訓練に失敗: %s" msg
          } ]
