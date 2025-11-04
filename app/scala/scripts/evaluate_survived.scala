#!/usr/bin/env scala

// 評価スクリプト: 保存済みSurvived生存予測モデルの評価
// 使用方法: scala scripts/evaluate_survived.scala [model_path] [data_path]

import org.apache.spark.sql.SparkSession
import org.apache.spark.ml.{Pipeline, PipelineModel}
import org.apache.spark.ml.feature.{Imputer, StringIndexer, OneHotEncoder, VectorAssembler}
import org.apache.spark.ml.evaluation.BinaryClassificationEvaluator

object EvaluateSurvivedScript {
  def main(args: Array[String]): Unit = {
    // SparkSession の作成
    val spark = SparkSession.builder()
      .appName("SurvivedEvaluation")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .getOrCreate()

    try {
      spark.sparkContext.setLogLevel("WARN")

      println("=" * 50)
      println("Survived Model Evaluation")
      println("=" * 50)
      println()

      // パラメータ取得
      val modelPath = args.headOption.getOrElse("model/survived_model")
      val dataPath = args.lift(1).getOrElse("data/Survived.csv")

      // データをロード
      println(s"Loading data from $dataPath...")
      val df = spark.read
        .option("header", "true")
        .option("inferSchema", "true")
        .csv(dataPath)

      // カラム名を小文字に変換
      val lowercaseDF = df.columns.foldLeft(df) { (currentDF, colName) =>
        currentDF.withColumnRenamed(colName, colName.toLowerCase)
      }

      println(s"Loaded ${lowercaseDF.count()} records")
      println()

      // 前処理: 欠損値補完
      println("Preprocessing: Imputing missing values...")
      val imputer = new Imputer()
        .setInputCols(Array("age", "fare"))
        .setOutputCols(Array("age_imputed", "fare_imputed"))
        .setStrategy("mean")

      val imputed = imputer.fit(lowercaseDF).transform(lowercaseDF)

      // カテゴリカル変数のエンコーディング
      println("Encoding categorical variables...")
      val sexIndexer = new StringIndexer()
        .setInputCol("sex")
        .setOutputCol("sex_index")

      val sexEncoder = new OneHotEncoder()
        .setInputCol("sex_index")
        .setOutputCol("sex_vec")

      val embarkedIndexer = new StringIndexer()
        .setInputCol("embarked")
        .setOutputCol("embarked_index")
        .setHandleInvalid("keep")

      val embarkedEncoder = new OneHotEncoder()
        .setInputCol("embarked_index")
        .setOutputCol("embarked_vec")

      val encodePipeline = new Pipeline().setStages(Array(
        sexIndexer, sexEncoder,
        embarkedIndexer, embarkedEncoder
      ))

      val encoded = encodePipeline.fit(imputed).transform(imputed)

      // 外れ値除去
      val cleaned = encoded.filter("fare_imputed < 500 AND fare_imputed > 0")

      // 特徴量統合
      println("Assembling features...")
      val assembler = new VectorAssembler()
        .setInputCols(Array(
          "pclass",
          "age_imputed",
          "sibsp",
          "parch",
          "fare_imputed",
          "sex_vec",
          "embarked_vec"
        ))
        .setOutputCol("features")

      val preparedDf = assembler.transform(cleaned)
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
        val labeledData = preparedDf.withColumnRenamed("survived", "label")
        val predictions = model.transform(labeledData)

        // 評価メトリクスを計算
        // Accuracy
        val correct = predictions.filter("prediction = label").count()
        val total = predictions.count()
        val accuracy = correct.toDouble / total
        println(f"Accuracy: ${accuracy * 100}%.2f%%")

        // AUC (Area Under ROC Curve)
        val aucEvaluator = new BinaryClassificationEvaluator()
          .setLabelCol("label")
          .setRawPredictionCol("rawPrediction")
          .setMetricName("areaUnderROC")

        val auc = aucEvaluator.evaluate(predictions)
        println(f"AUC: ${auc * 100}%.2f%%")

        // Precision
        val truePositives = predictions.filter("prediction = 1 AND label = 1").count().toDouble
        val predictedPositives = predictions.filter("prediction = 1").count().toDouble
        val precision = if (predictedPositives > 0) truePositives / predictedPositives else 0.0
        println(f"Precision: ${precision * 100}%.2f%%")

        // Recall
        val actualPositives = predictions.filter("label = 1").count().toDouble
        val recall = if (actualPositives > 0) truePositives / actualPositives else 0.0
        println(f"Recall: ${recall * 100}%.2f%%")

        // F1 Score
        val f1 = if (precision + recall > 0) 2 * (precision * recall) / (precision + recall) else 0.0
        println(f"F1 Score: ${f1 * 100}%.2f%%")
        println()

        // 予測結果のサンプル表示
        println("Sample predictions:")
        predictions.select("pclass", "sex", "age_imputed", "fare_imputed",
                          "label", "prediction", "probability")
          .show(10, truncate = false)

        println("=" * 50)
        println("Evaluation Completed Successfully")
        println("=" * 50)

      } catch {
        case e: Exception =>
          println(s"Error: Could not load model from $modelPath")
          println(s"Reason: ${e.getMessage}")
          println()
          println("Note: Model persistence is not available on Windows")
          println("      Please train a model first using train_survived.scala on Linux/Mac")
          System.exit(1)
      }

    } finally {
      spark.stop()
    }
  }
}

EvaluateSurvivedScript.main(args)
