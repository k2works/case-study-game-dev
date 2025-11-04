#!/usr/bin/env scala

// 評価スクリプト: 保存済みBoston住宅価格予測モデルの評価
// 使用方法: scala scripts/evaluate_boston.scala [model_path] [data_path]

import org.apache.spark.sql.SparkSession
import org.apache.spark.ml.{Pipeline, PipelineModel}
import org.apache.spark.ml.feature.{SQLTransformer, VectorAssembler, StandardScaler, StringIndexer, OneHotEncoder}
import org.apache.spark.ml.evaluation.RegressionEvaluator

object EvaluateBostonScript {
  def main(args: Array[String]): Unit = {
    // SparkSession の作成
    val spark = SparkSession.builder()
      .appName("BostonEvaluation")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .getOrCreate()

    try {
      spark.sparkContext.setLogLevel("WARN")

      println("=" * 50)
      println("Boston Model Evaluation")
      println("=" * 50)
      println()

      // パラメータ取得
      val modelPath = args.headOption.getOrElse("model/boston_model")
      val dataPath = args.lift(1).getOrElse("data/Boston.csv")

      // データをロード
      println(s"Loading data from $dataPath...")
      val df = spark.read
        .option("header", "true")
        .option("inferSchema", "true")
        .csv(dataPath)

      println(s"Loaded ${df.count()} records")
      println()

      // 前処理: カテゴリカル変数のエンコーディング
      println("Preprocessing: Encoding categorical variables...")
      val crimeIndexer = new StringIndexer()
        .setInputCol("CRIME")
        .setOutputCol("CRIME_index")

      val crimeEncoder = new OneHotEncoder()
        .setInputCol("CRIME_index")
        .setOutputCol("CRIME_vec")

      val encodePipeline = new Pipeline().setStages(Array(
        crimeIndexer, crimeEncoder
      ))

      val encoded = encodePipeline.fit(df).transform(df)

      // 特徴量エンジニアリング
      println("Engineering features...")
      val featureEngineering = new SQLTransformer().setStatement("""
        SELECT *,
          RM * RM as RM2,
          LSTAT * LSTAT as LSTAT2,
          PTRATIO * PTRATIO as PTRATIO2,
          RM * LSTAT as RM_LSTAT,
          RM * PTRATIO as RM_PTRATIO
        FROM __THIS__
      """)

      val engineered = featureEngineering.transform(encoded)

      // データクリーニング
      val cleaned = engineered.filter("PRICE < 50 AND PRICE > 0")
        .filter("RM > 0 AND LSTAT > 0")

      // 特徴量統合
      println("Assembling features...")
      val assembler = new VectorAssembler()
        .setInputCols(Array(
          "CRIME_vec",
          "ZN", "INDUS", "CHAS", "NOX", "RM", "AGE", "DIS",
          "RAD", "TAX", "PTRATIO", "B", "LSTAT",
          "RM2", "LSTAT2", "PTRATIO2", "RM_LSTAT", "RM_PTRATIO"
        ))
        .setOutputCol("features")
        .setHandleInvalid("skip")

      val assembled = assembler.transform(cleaned)

      // データ標準化
      val scaler = new StandardScaler()
        .setInputCol("features")
        .setOutputCol("scaled_features")
        .setWithMean(true)
        .setWithStd(true)

      val preparedDf = scaler.fit(assembled).transform(assembled)
      println(s"Prepared ${preparedDf.count()} records")
      println()

      // モデルをロード
      println(s"Loading model from $modelPath...")
      try {
        val model = PipelineModel.load(modelPath)
        println("Model loaded successfully")
        println()

        // 予測を実行
        println("Making predictions...")
        val predictions = model.transform(preparedDf)

        // 評価メトリクスを計算
        val evaluator = new RegressionEvaluator()
          .setLabelCol("PRICE")
          .setPredictionCol("prediction")

        // R² Score
        val r2 = evaluator.setMetricName("r2").evaluate(predictions)
        println(f"R² Score: ${r2 * 100}%.2f%%")

        // RMSE (Root Mean Squared Error)
        val rmse = evaluator.setMetricName("rmse").evaluate(predictions)
        println(f"RMSE: $rmse%.4f")

        // MAE (Mean Absolute Error)
        val mae = evaluator.setMetricName("mae").evaluate(predictions)
        println(f"MAE: $mae%.4f")

        // MSE (Mean Squared Error)
        val mse = evaluator.setMetricName("mse").evaluate(predictions)
        println(f"MSE: $mse%.4f")
        println()

        // 予測結果のサンプル表示
        println("Sample predictions:")
        predictions.select("CRIME", "RM", "LSTAT", "PRICE", "prediction")
          .show(10, truncate = false)

        // 予測誤差の統計
        import org.apache.spark.sql.functions._
        val errorStats = predictions
          .withColumn("error", abs(col("PRICE") - col("prediction")))
          .withColumn("error_pct", abs(col("PRICE") - col("prediction")) / col("PRICE") * 100)

        println("\nError statistics:")
        errorStats.select("error", "error_pct").describe().show()

        println("=" * 50)
        println("Evaluation Completed Successfully")
        println("=" * 50)

      } catch {
        case e: Exception =>
          println(s"Error: Could not load model from $modelPath")
          println(s"Reason: ${e.getMessage}")
          println()
          println("Note: Model persistence is not available on Windows")
          println("      Please train a model first using train_boston.scala on Linux/Mac")
          System.exit(1)
      }

    } finally {
      spark.stop()
    }
  }
}

EvaluateBostonScript.main(args)
