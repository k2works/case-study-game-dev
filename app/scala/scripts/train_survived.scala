#!/usr/bin/env scala

// 訓練スクリプト: Survived生存予測モデルの訓練
// 使用方法: scala scripts/train_survived.scala [data_path] [model_path]

import org.apache.spark.sql.SparkSession
import org.apache.spark.ml.{Pipeline, PipelineModel}
import org.apache.spark.ml.classification.LogisticRegression
import org.apache.spark.ml.feature.{Imputer, StringIndexer, OneHotEncoder, VectorAssembler}
import org.apache.spark.ml.evaluation.BinaryClassificationEvaluator

object TrainSurvivedScript {
  def main(args: Array[String]): Unit = {
    // SparkSession の作成
    val spark = SparkSession.builder()
      .appName("SurvivedTraining")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .getOrCreate()

    try {
      spark.sparkContext.setLogLevel("WARN")

      println("=" * 50)
      println("Survived Life Prediction Model Training")
      println("=" * 50)
      println()

      // パラメータ取得
      val dataPath = args.headOption.getOrElse("data/Survived.csv")
      val modelPath = args.lift(1).getOrElse("model/survived_model")

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

      // 欠損値補完
      println("Imputing missing values...")
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
      println("Removing outliers...")
      val cleaned = encoded.filter("fare_imputed < 500 AND fare_imputed > 0")
      println(s"Removed ${encoded.count() - cleaned.count()} outliers")

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

      val assembled = assembler.transform(cleaned)
      println(s"Prepared ${assembled.count()} records")
      println()

      // データ分割
      println("Splitting data into training and test sets...")
      val Array(trainData, testData) = assembled.randomSplit(Array(0.7, 0.3), seed = 42)
      println(s"Training set: ${trainData.count()} records")
      println(s"Test set: ${testData.count()} records")
      println()

      // モデル訓練
      println("Training LogisticRegression model...")
      val labeledTrain = trainData.withColumnRenamed("survived", "label")

      val lr = new LogisticRegression()
        .setLabelCol("label")
        .setFeaturesCol("features")
        .setMaxIter(100)
        .setRegParam(0.01)

      val pipeline = new Pipeline().setStages(Array(lr))
      val model = pipeline.fit(labeledTrain)
      println("Model training completed")
      println()

      // モデル評価
      println("Evaluating model on test set...")
      val labeledTest = testData.withColumnRenamed("survived", "label")
      val predictions = model.transform(labeledTest)

      val correct = predictions.filter("prediction = label").count()
      val total = predictions.count()
      val accuracy = correct.toDouble / total

      println(f"Test Accuracy: ${accuracy * 100}%.2f%%")
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

TrainSurvivedScript.main(args)
