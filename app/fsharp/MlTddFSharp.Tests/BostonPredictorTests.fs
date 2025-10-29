module BostonPredictorTests

open Expecto
open System.IO
open MlTddFSharp.Domain.Types
open MlTddFSharp.Ml

[<Tests>]
let bostonPredictorInitTests =
    testList
        "BostonPredictor の初期化テスト"
        [ test "デフォルトパラメータでの初期化" {
              let mlContext = Microsoft.ML.MLContext()
              let predictor = BostonPredictor(mlContext)

              Expect.isTrue (predictor.MlContext <> null) "MLContext が設定されている"
          }

          test "BostonData レコード型の作成" {
              let data =
                  { CRIME = "low"
                    RM = 6.5f
                    LSTAT = 5.0f
                    PTRATIO = 15.0f
                    PRICE = 24.0f }

              Expect.equal data.RM 6.5f "RM が正しい"
              Expect.equal data.CRIME "low" "CRIME が正しい"
          } ]

[<Tests>]
let bostonPredictorDataTests =
    testList
        "BostonPredictor のデータ処理テスト"
        [ test "CSV ファイルからデータを読み込める" {
              let mlContext = Microsoft.ML.MLContext(seed = System.Nullable 0)
              let predictor = BostonPredictor(mlContext)

              let testFile = "test_boston.csv"

              File.WriteAllText(
                  testFile,
                  """CRIME,ZN,INDUS,CHAS,NOX,RM,AGE,DIS,RAD,TAX,PTRATIO,B,LSTAT,PRICE
high,0,18.1,0,0.718,6.5,87.9,1.6132,24,666,15.0,354.7,5.0,24.0
low,0,8.14,0,0.538,5.5,82,3.99,4,307,18.0,232.6,10.0,18.5
very_low,82.5,2.03,0,0.415,7.0,38.4,6.27,2,348,14.0,393.77,3.0,33.2"""
              )

              let result = predictor.LoadData(testFile)

              match result with
              | Ok dataView ->
                  let rows =
                      mlContext.Data.CreateEnumerable<BostonData>(dataView, reuseRowObject = false)
                      |> Seq.toList

                  File.Delete(testFile)
                  Expect.equal rows.Length 3 "3 行読み込まれる"
              | Error msg ->
                  File.Delete(testFile)
                  failtestf "データ読み込みに失敗: %s" msg
          }

          test "欠損値を平均値で補完できる" {
              let mlContext = Microsoft.ML.MLContext(seed = System.Nullable 0)
              let predictor = BostonPredictor(mlContext)

              let testFile = "test_missing_boston.csv"

              File.WriteAllText(
                  testFile,
                  """CRIME,ZN,INDUS,CHAS,NOX,RM,AGE,DIS,RAD,TAX,PTRATIO,B,LSTAT,PRICE
low,0,18.1,0,0.718,6.0,87.9,1.6132,24,666,15.0,354.7,10.0,24.0
high,0,8.14,0,0.538,7.0,82,3.99,4,307,18.0,232.6,NaN,18.5
low,82.5,2.03,0,0.415,5.0,38.4,6.27,2,348,14.0,393.77,10.0,33.2"""
              )

              let result =
                  predictor.LoadData(testFile)
                  |> Result.bind (fun data -> predictor.FillMissingValues(data, fit = true))

              match result with
              | Ok filledData ->
                  let rows =
                      mlContext.Data.CreateEnumerable<BostonData>(filledData, reuseRowObject = false)
                      |> Seq.toList

                  File.Delete(testFile)
                  // LSTAT の欠損値が平均値 (10.0 + 10.0) / 2 = 10.0 で補完される
                  Expect.equal rows.[1].LSTAT 10.0f "LSTAT の欠損値が平均で補完される"
              | Error msg ->
                  File.Delete(testFile)
                  failtestf "欠損値補完に失敗: %s" msg
          }

          test "特徴量エンジニアリングができる" {
              let mlContext = Microsoft.ML.MLContext(seed = System.Nullable 0)
              let predictor = BostonPredictor(mlContext)

              let testFile = "test_features_boston.csv"

              File.WriteAllText(
                  testFile,
                  """CRIME,ZN,INDUS,CHAS,NOX,RM,AGE,DIS,RAD,TAX,PTRATIO,B,LSTAT,PRICE
low,0,18.1,0,0.718,6.5,87.9,1.6132,24,666,15.0,354.7,5.0,24.0"""
              )

              let result =
                  predictor.LoadData(testFile)
                  |> Result.bind (fun data -> predictor.FillMissingValues(data, fit = true))
                  |> Result.bind predictor.FeatureEngineering

              match result with
              | Ok engineeredData ->
                  let rows =
                      mlContext.Data.CreateEnumerable<BostonFeatures>(engineeredData, reuseRowObject = false)
                      |> Seq.head

                  File.Delete(testFile)
                  // 2乗項の確認
                  Expect.floatClose Accuracy.low (float rows.RM2) (6.5 * 6.5) "RM2 should be 6.5^2"
                  Expect.floatClose Accuracy.low (float rows.LSTAT2) (5.0 * 5.0) "LSTAT2 should be 5.0^2"

                  Expect.floatClose
                      Accuracy.low
                      (float rows.PTRATIO2)
                      (15.0 * 15.0)
                      "PTRATIO2 should be 15.0^2"

                  // 交互作用項の確認
                  Expect.floatClose
                      Accuracy.low
                      (float rows.RMxLSTAT)
                      (6.5 * 5.0)
                      "RMxLSTAT should be 6.5 * 5.0"
              | Error msg ->
                  File.Delete(testFile)
                  failtestf "特徴量エンジニアリングに失敗: %s" msg
          } ]

[<Tests>]
let bostonPredictorTrainingTests =
    testList
        "BostonPredictor の訓練テスト"
        [ test "CSV ファイルからデータを読み込んで訓練できる" {
              let mlContext = Microsoft.ML.MLContext(seed = System.Nullable 0)
              let predictor = BostonPredictor(mlContext)

              let result = predictor.Train("../data/Boston.csv")

              match result with
              | Ok metrics ->
                  Expect.isGreaterThan metrics.RSquared 0.2 "R² が 20% 以上（モデルが学習できている）"
                  Expect.isTrue (predictor.Model.IsSome) "モデルが訓練された"
              | Error msg -> failtestf "訓練に失敗: %s" msg
          }

          test "訓練後に予測できる" {
              let mlContext = Microsoft.ML.MLContext(seed = System.Nullable 0)
              let predictor = BostonPredictor(mlContext)

              match predictor.Train("../data/Boston.csv") with
              | Ok _ ->
                  let testData =
                      { CRIME = "low"
                        RM = 6.5f
                        LSTAT = 5.0f
                        PTRATIO = 15.0f
                        PRICE = 0.0f }

                  match predictor.Predict(testData) with
                  | Ok prediction -> Expect.isGreaterThan prediction 0.0f "予測価格が 0 より大きい"
                  | Error msg -> failtestf "予測に失敗: %s" msg
              | Error msg -> failtestf "訓練に失敗: %s" msg
          } ]
