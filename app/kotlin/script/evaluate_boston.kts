#!/usr/bin/env kotlin

/**
 * Boston 住宅価格予測モデルの評価スクリプト
 *
 * 使い方:
 *   ./gradlew evaluateBoston
 */

import ml.BostonPredictor
import java.io.File
import kotlin.math.abs
import kotlin.math.pow
import kotlin.math.sqrt

println("=".repeat(60))
println("Boston 住宅価格予測モデルの評価")
println("=".repeat(60))

// パスの設定
val dataPath = "src/main/resources/data/Boston.csv"
val modelPath = "model/boston_model.bin"

// モデルの存在確認
if (!File(modelPath).exists()) {
    println("\nエラー: モデルファイルが見つかりません: $modelPath")
    println("先に train_boston.kts を実行してください。")
    kotlin.system.exitProcess(1)
}

// モデルの読み込み
println("\n[1] モデルの読み込み...")
val predictor = BostonPredictor()
predictor.loadModels(modelPath)
println("    モデルファイル: $modelPath")
println("    ファイルサイズ: ${File(modelPath).length()} bytes")

// テストデータの読み込み
println("\n[2] テストデータの読み込み...")
val df = predictor.loadData(dataPath)
val dfEncoded = predictor.encodeCrime(df)
val dfFilled = predictor.fillMissingValues(dfEncoded, dfEncoded)
val dfCleaned = predictor.removeOutliers(dfFilled)

val featureNames = listOf("RM", "LSTAT", "PTRATIO")
val X = Array(dfCleaned.nrow) { idx ->
    featureNames.map { name ->
        (dfCleaned[name][idx] as? Number)?.toDouble() ?: 0.0
    }.toDoubleArray()
}
val y = DoubleArray(dfCleaned.nrow) { idx ->
    (dfCleaned["PRICE"][idx] as? Number)?.toDouble() ?: 0.0
}

println("    サンプル数: ${X.size}")
println("    特徴量数: ${X[0].size}")

// 予測の実行
println("\n[3] 予測の実行中...")
val startTime = System.currentTimeMillis()
val predictions = predictor.predict(X)
val predictionTime = System.currentTimeMillis() - startTime
println("    予測時間: ${predictionTime}ms")
println("    1サンプルあたり: %.3fms".format(predictionTime.toDouble() / X.size))

// R²の計算
val r2 = predictor.evaluate(X, y)
println("\n[4] 評価結果:")
println("    R²: %.4f".format(r2))

// MAE（平均絶対誤差）の計算
val mae = predictions.zip(y.toTypedArray()).map { (pred, actual) ->
    abs(pred - actual)
}.average()
println("    MAE: %.2f".format(mae))

// RMSE（二乗平均平方根誤差）の計算
val rmse = sqrt(predictions.zip(y.toTypedArray()).map { (pred, actual) ->
    (pred - actual).pow(2)
}.average())
println("    RMSE: %.2f".format(rmse))

// 価格帯別の精度
println("\n[5] 価格帯別の精度:")
val priceBands = listOf(
    Triple(0.0, 20.0, "低価格帯"),
    Triple(20.0, 30.0, "中価格帯"),
    Triple(30.0, Double.MAX_VALUE, "高価格帯")
)

priceBands.forEach { (min, max, label) ->
    val indices = y.indices.filter { y[it] >= min && y[it] < max }
    if (indices.isNotEmpty()) {
        val bandMae = indices.map { abs(predictions[it] - y[it]) }.average()
        println("    $label ($min-$max): MAE=%.2f (%d サンプル)".format(bandMae, indices.size))
    }
}

// 予測誤差の分析
println("\n[6] 予測誤差の分析:")
val errors = predictions.zip(y.toTypedArray()).map { (pred, actual) -> pred - actual }
val sortedErrors = errors.sorted()
val median = sortedErrors[sortedErrors.size / 2]
val q1 = sortedErrors[sortedErrors.size / 4]
val q3 = sortedErrors[sortedErrors.size * 3 / 4]

println("    誤差の中央値: %.2f".format(median))
println("    第1四分位数: %.2f".format(q1))
println("    第3四分位数: %.2f".format(q3))

// 最大誤差のサンプル
println("\n[7] 最大誤差のサンプル:")
val errorIndices = predictions.indices.sortedByDescending { abs(predictions[it] - y[it]) }
errorIndices.take(5).forEach { idx ->
    val error = predictions[idx] - y[idx]
    println("    サンプル $idx:")
    println("      特徴量: RM=${X[idx][0]}, LSTAT=${X[idx][1]}, PTRATIO=${X[idx][2]}")
    println("      実測値: %.2f, 予測値: %.2f, 誤差: %.2f".format(y[idx], predictions[idx], error))
}

// 個別予測の例
println("\n[8] 個別予測の例:")
val testSamples = listOf(
    Triple(doubleArrayOf(6.5, 4.98, 15.3), 25.0, "RM=6.5, LSTAT=4.98, PTRATIO=15.3"),
    Triple(doubleArrayOf(7.0, 3.0, 14.0), 30.0, "RM=7.0, LSTAT=3.0, PTRATIO=14.0"),
    Triple(doubleArrayOf(5.5, 10.0, 18.0), 18.0, "RM=5.5, LSTAT=10.0, PTRATIO=18.0")
)

testSamples.forEachIndexed { i, (sample, expected, description) ->
    val prediction = predictor.predict(arrayOf(sample))[0]
    val error = abs(prediction - expected)
    println("    サンプル ${i+1} ($description):")
    println("      期待値: %.2f, 予測値: %.2f, 誤差: %.2f".format(expected, prediction, error))
}

println("\n" + "=".repeat(60))
println("評価完了！")
println("=".repeat(60))
