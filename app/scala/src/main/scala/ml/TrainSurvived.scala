package ml

import org.apache.spark.sql.SparkSession

object TrainSurvived {
  def main(args: Array[String]): Unit = {
    val spark = SparkSession.builder()
      .appName("Survived Training")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .getOrCreate()

    try {
      spark.sparkContext.setLogLevel("ERROR")

      val classifier = SurvivedClassifier(spark)

      println("=" * 50)
      println("Survived 生存予測モデル訓練")
      println("=" * 50)
      println()

      // データ読み込み
      println(s"データ読み込み中: data/Survived.csv")
      val df = classifier.loadData("data/Survived.csv")
      println(s"データ件数: ${df.count()}")
      println()

      // 欠損値の確認
      println("=== 欠損値の確認 ===")
      df.select("age", "fare").summary("count").show()

      // 欠損値補完
      println("=== 欠損値補完中... ===")
      val imputed = classifier.imputeMissingValues(df)
      println("欠損値補完完了")
      imputed.select("age", "age_imputed", "fare", "fare_imputed").show(5)

      // カテゴリカル変数のエンコーディング
      println("=== カテゴリカル変数エンコーディング中... ===")
      val encoded = classifier.encodeCategorical(imputed)
      println("カテゴリカル変数エンコーディング完了")
      encoded.select("sex", "sex_vec", "embarked", "embarked_vec").show(5, truncate = false)

      // 外れ値除去
      println("=== 外れ値除去中... ===")
      val cleaned = classifier.removeOutliers(encoded)
      println(s"除去前: ${encoded.count()}, 除去後: ${cleaned.count()}")
      println()

      // 特徴量統合
      println("=== 特徴量統合中... ===")
      val assembled = classifier.assembleFeatures(cleaned)
      println(s"特徴量統合完了: ${assembled.count()} 件")
      println()

      // データ分割
      val (trainData, testData) = classifier.splitData(assembled)
      println(s"訓練データ: ${trainData.count()}, テストデータ: ${testData.count()}")

      // クラスバランスの確認
      println()
      println("=== クラスバランス ===")
      trainData.groupBy("survived").count().show()

      // モデル訓練
      println("=== モデル訓練中... ===")
      val model = classifier.train(trainData)
      println("モデル訓練完了")
      println()

      // モデル評価
      println("=== モデル評価 ===")
      val accuracy = classifier.evaluate(model, testData)
      println(f"Accuracy: ${accuracy * 100}%.2f%%")
      println()

      // モデル保存（Windows以外）
      val osName = System.getProperty("os.name").toLowerCase
      if (!osName.contains("win")) {
        println("=== モデル保存中... ===")
        classifier.saveModel(model, "model/survived_model")
        println("モデル保存完了: model/survived_model")
      } else {
        println("Note: Model persistence is disabled on Windows due to Hadoop limitations")
        println("      The model can be retrained in about 10 seconds")
      }
      println()

      // 予測結果のサンプル表示
      val predictions = model.transform(testData.withColumnRenamed("survived", "label"))
      println("=== 予測結果サンプル ===")
      predictions.select("label", "prediction", "probability").show(10, truncate = false)

      println("=" * 50)
      println("訓練完了")
      println("=" * 50)

    } finally {
      spark.stop()
    }
  }
}
