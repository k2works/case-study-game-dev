package ml

import org.apache.spark.sql.SparkSession

object TrainIris {
  def main(args: Array[String]): Unit = {
    // SparkSession の作成
    val spark = SparkSession.builder()
      .appName("IrisClassifier")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .getOrCreate()

    try {
      spark.sparkContext.setLogLevel("WARN")

      println("=== Iris Classification Model Training ===")
      println()

      // IrisClassifier のインスタンスを作成
      val classifier = IrisClassifier(spark)

      // データをロード
      println("Loading data from data/iris.csv...")
      val df = classifier.loadData("data/iris.csv")
      println(s"Loaded ${df.count()} records")
      println()

      // 特徴量を準備
      println("Preparing features...")
      val preparedDf = classifier.prepareFeatures(df)
      println(s"Prepared ${preparedDf.count()} records (null values skipped)")
      println()

      // データを分割
      println("Splitting data into training and test sets...")
      val (trainData, testData) = classifier.splitData(preparedDf)
      println(s"Training set: ${trainData.count()} records")
      println(s"Test set: ${testData.count()} records")
      println()

      // モデルを訓練
      println("Training model...")
      val model = classifier.train(trainData)
      println("Model training completed")
      println()

      // モデルを評価
      println("Evaluating model...")
      val accuracy = classifier.evaluate(model, testData)
      println(f"Test Accuracy: ${accuracy * 100}%.2f%%")
      println()

      println("=== Training Completed ===")

    } finally {
      spark.stop()
    }
  }
}
