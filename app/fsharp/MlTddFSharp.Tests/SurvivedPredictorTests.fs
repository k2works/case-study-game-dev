module SurvivedPredictorTests

open Expecto
open System.IO
open MlTddFSharp.Domain.Types
open MlTddFSharp.Ml

[<Tests>]
let survivedPredictorInitTests =
    testList
        "SurvivedPredictor の初期化テスト"
        [ test "デフォルトパラメータでの初期化" {
              let mlContext = Microsoft.ML.MLContext()
              let predictor = SurvivedPredictor(mlContext)

              Expect.isTrue (predictor.MlContext <> null) "MLContext が設定されている"
          }

          test "SurvivedData レコード型の作成" {
              let data =
                  { PassengerId = 1
                    Survived = false
                    Pclass = 3.0f
                    Sex = "male"
                    Age = 22.0f }

              Expect.equal data.PassengerId 1 "PassengerId が正しい"
              Expect.equal data.Sex "male" "Sex が正しい"
          } ]

[<Tests>]
let survivedPredictorDataTests =
    testList
        "SurvivedPredictor のデータ処理テスト"
        [ test "CSV ファイルからデータを読み込める" {
              let mlContext = Microsoft.ML.MLContext(seed = System.Nullable 0)
              let predictor = SurvivedPredictor(mlContext)

              let testFile = "test_survived.csv"

              File.WriteAllText(
                  testFile,
                  """PassengerId,Survived,Pclass,Sex,Age
1,0,3,male,22.0
2,1,1,female,38.0
3,0,2,male,26.0"""
              )

              let result = predictor.LoadData(testFile)

              match result with
              | Ok dataView ->
                  let rows =
                      mlContext.Data.CreateEnumerable<SurvivedData>(dataView, reuseRowObject = false)
                      |> Seq.toList

                  File.Delete(testFile)
                  Expect.equal rows.Length 3 "3 行読み込まれる"
              | Error msg ->
                  File.Delete(testFile)
                  failtestf "データ読み込みに失敗: %s" msg
          }

          test "グループ別欠損値補完ができる" {
              let mlContext = Microsoft.ML.MLContext(seed = System.Nullable 0)
              let predictor = SurvivedPredictor(mlContext)

              let testFile = "test_age_impute.csv"

              File.WriteAllText(
                  testFile,
                  """PassengerId,Survived,Pclass,Sex,Age
1,0,1,male,NaN
2,1,1,male,35.0
3,1,3,female,NaN
4,1,3,female,20.0"""
              )

              let result = predictor.LoadData(testFile) |> Result.bind predictor.ImputeAge

              match result with
              | Ok imputedData ->
                  let rows =
                      mlContext.Data.CreateEnumerable<SurvivedData>(imputedData, reuseRowObject = false)
                      |> Seq.toList

                  File.Delete(testFile)
                  // Pclass=3, Survived=1 の平均 = 20.0
                  Expect.equal rows.[2].Age 20.0f "グループ平均で補完される"
              | Error msg ->
                  File.Delete(testFile)
                  failtestf "欠損値補完に失敗: %s" msg
          } ]

[<Tests>]
let survivedPredictorTrainingTests =
    testList
        "SurvivedPredictor の訓練テスト"
        [ test "CSV ファイルからデータを読み込んで訓練できる" {
              let mlContext = Microsoft.ML.MLContext(seed = System.Nullable 0)
              let predictor = SurvivedPredictor(mlContext)

              let result = predictor.Train("../data/Survived.csv")

              match result with
              | Ok metrics ->
                  Expect.isGreaterThan metrics.Accuracy 0.7 "精度が 70% 以上"
                  Expect.isTrue (predictor.Model.IsSome) "モデルが訓練された"
              | Error msg -> failtestf "訓練に失敗: %s" msg
          }

          test "訓練後に予測できる" {
              let mlContext = Microsoft.ML.MLContext(seed = System.Nullable 0)
              let predictor = SurvivedPredictor(mlContext)

              match predictor.Train("../data/Survived.csv") with
              | Ok _ ->
                  let testData =
                      { PassengerId = 0
                        Survived = false
                        Pclass = 3.0f
                        Sex = "male"
                        Age = 22.0f }

                  match predictor.Predict(testData) with
                  | Ok prediction -> Expect.isTrue true "予測が取得できた"
                  | Error msg -> failtestf "予測に失敗: %s" msg
              | Error msg -> failtestf "訓練に失敗: %s" msg
          } ]
