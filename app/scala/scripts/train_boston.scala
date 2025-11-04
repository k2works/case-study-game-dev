#!/usr/bin/env scala

// 訓練スクリプト: Boston住宅価格予測モデルの訓練
// 使用方法: scala scripts/train_boston.scala [data_path] [model_path]

import org.apache.spark.sql.SparkSession
import org.apache.spark.ml.{Pipeline, PipelineModel}
import org.apache.spark.ml.feature.{SQLTransformer, VectorAssembler, StandardScaler, StringIndexer, OneHotEncoder}
import org.apache.spark.ml.regression.LinearRegression
import org.apache.spark.ml.evaluation.RegressionEvaluator

object TrainBostonScript {
  def main(args: Array[String]): Unit = {
    // SparkSession の作成
    val spark = SparkSession.builder()
      .appName("BostonTraining")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .getOrCreate()

    try {
      spark.sparkContext.setLogLevel("WARN")

      println("=" * 50)
      println("Boston Housing Price Prediction Model Training")
      println("=" * 50)
      println()

      // パラメータ取得
      val dataPath = args.headOption.getOrElse("data/Boston.csv")
      val modelPath = args.lift(1).getOrElse("model/boston_model")

      // データをロード
      println(s"Loading data from $dataPath...")
      val df = spark.read
        .option("header", "true")
        .option("inferSchema", "true")
        .csv(dataPath)

      println(s"Loaded ${df.count()} records")
      println()

      // カテゴリカル変数のエンコーディング
      println("Encoding categorical variables...")
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
      println("Categorical encoding completed")
      println()

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
      println("Feature engineering completed")
      println()

      // データクリーニング
      println("Cleaning data...")
      val cleaned = engineered.filter("PRICE < 50 AND PRICE > 0")
        .filter("RM > 0 AND LSTAT > 0")
      println(s"Cleaned: ${engineered.count()} -> ${cleaned.count()} records")
      println()

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
      println(s"Assembled ${assembled.count()} records")
      println()

      // データ標準化
      println("Scaling features...")
      val scaler = new StandardScaler()
        .setInputCol("features")
        .setOutputCol("scaled_features")
        .setWithMean(true)
        .setWithStd(true)

      val scaled = scaler.fit(assembled).transform(assembled)
      println("Feature scaling completed")
      println()

      // データ分割
      println("Splitting data into training and test sets...")
      val Array(trainData, testData) = scaled.randomSplit(Array(0.7, 0.3), seed = 42)
      println(s"Training set: ${trainData.count()} records")
      println(s"Test set: ${testData.count()} records")
      println()

      // モデル訓練
      println("Training LinearRegression model...")
      val lr = new LinearRegression()
        .setLabelCol("PRICE")
        .setFeaturesCol("scaled_features")
        .setMaxIter(100)
        .setRegParam(0.1)
        .setElasticNetParam(0.0)

      val pipeline = new Pipeline().setStages(Array(lr))
      val model = pipeline.fit(trainData)
      println("Model training completed")
      println()

      // モデル評価
      println("Evaluating model on test set...")
      val predictions = model.transform(testData)

      val evaluator = new RegressionEvaluator()
        .setLabelCol("PRICE")
        .setPredictionCol("prediction")

      val r2 = evaluator.setMetricName("r2").evaluate(predictions)
      val rmse = evaluator.setMetricName("rmse").evaluate(predictions)
      val mae = evaluator.setMetricName("mae").evaluate(predictions)

      println(f"R² Score: ${r2 * 100}%.2f%%")
      println(f"RMSE: $rmse%.4f")
      println(f"MAE: $mae%.4f")
      println()

      // モデル保存
      val osName = System.getProperty("os.name").toLowerCase
      val isWindows = osName.contains("win")

      if (!isWindows) {
        println(s"Saving model to $modelPath...")
        try {
          model.write.overwrite().save(modelPath)
          println("Model saved successfully")
        } catch {
          case e: Exception =>
            println(s"Warning: Could not save model (${e.getMessage})")
        }
        println()
      } else {
        println("Note: Model persistence is disabled on Windows due to Hadoop limitations")
        println("      The model can be retrained in about 10 seconds")
        println()
      }

      println("=" * 50)
      println("Training Completed Successfully")
      println("=" * 50)

    } finally {
      spark.stop()
    }
  }
}

TrainBostonScript.main(args)
