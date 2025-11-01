@file:DependsOn("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

import ml.BostonPredictor
import java.io.File
import java.io.ObjectOutputStream

fun main() {
    println("Boston API モデルのトレーニングを開始...")

    // データの読み込みと前処理
    val predictor = BostonPredictor()
    val df = predictor.loadData("src/main/resources/data/Boston.csv")

    // CRIME列のダミー変数化
    val dfEncoded = predictor.encodeCrime(df)

    // 外れ値除去
    val dfCleaned = predictor.removeOutliers(dfEncoded)

    // 訓練データとテストデータに分割（80:20）
    val nSamples = dfCleaned.nrow
    val nTrain = (nSamples * 0.8).toInt()

    val dfTrain = dfCleaned.take(nTrain)
    val dfTest = dfCleaned.drop(nTrain)

    // 欠損値補完（訓練データの統計量を使用）
    val dfTrainFilled = predictor.fillMissingValues(dfTrain, dfTrain)
    val dfTestFilled = predictor.fillMissingValues(dfTest, dfTrain)

    // 特徴量と目的変数に分離
    val XTrain = dfTrainFilled.rows.map { row ->
        doubleArrayOf(
            row["RM"] as Double,
            row["LSTAT"] as Double,
            row["PTRATIO"] as Double
        )
    }.toTypedArray()

    val yTrain = dfTrainFilled["PRICE"].values().map {
        (it as Number).toDouble()
    }.toDoubleArray()

    val XTest = dfTestFilled.rows.map { row ->
        doubleArrayOf(
            row["RM"] as Double,
            row["LSTAT"] as Double,
            row["PTRATIO"] as Double
        )
    }.toTypedArray()

    val yTest = dfTestFilled["PRICE"].values().map {
        (it as Number).toDouble()
    }.toDoubleArray()

    // モデルの訓練
    println("モデルをトレーニング中...")
    predictor.train(XTrain, yTrain)

    // 評価
    val r2 = predictor.evaluate(XTest, yTest)
    println("テストデータでのR²: ${String.format("%.4f", r2)}")

    // モデルを保存（BostonPredictor 全体を保存）
    val modelPath = "model/boston_model.ser"
    predictor.saveModels(modelPath)

    println("モデルを保存しました: $modelPath")
    println("Boston API モデルのトレーニングが完了しました")
}

main()
