#!/usr/bin/env kotlin

/**
 * Cinema 興行収入予測モデルの評価スクリプト
 *
 * 使い方:
 *   ./gradlew runScript -Pscript=script/evaluate_cinema.kts
 */

import ml.CinemaPredictor
import java.io.File
import kotlin.math.abs

println("=".repeat(60))
println("Cinema 興行収入予測モデルの評価")
println("=".repeat(60))

// パスの設定
val dataPath = "src/main/resources/data/cinema.csv"
val modelPath = "model/cinema_model.ser"

// モデルの存在確認
if (!File(modelPath).exists()) {
    println("\nエラー: モデルファイルが見つかりません: $modelPath")
    println("先に train_cinema.kts を実行してください。")
    kotlin.system.exitProcess(1)
}

// モデルの読み込み
println("\n[1] モデルの読み込み...")
val predictor = CinemaPredictor()
predictor.loadModel(modelPath)
println("    モデルファイル: $modelPath")
println("    ファイルサイズ: ${File(modelPath).length()} bytes")

// テストデータの読み込み
println("\n[2] テストデータの読み込み...")
val (X, y) = predictor.loadData(dataPath, removeOutliers = true)
println("    サンプル数: ${X.size}")
println("    特徴量数: ${X[0].size}")

// 予測の実行
println("\n[3] 予測の実行中...")
val startTime = System.currentTimeMillis()
val predictions = predictor.predict(X)
val predictionTime = System.currentTimeMillis() - startTime
println("    予測時間: ${predictionTime}ms")
println("    1サンプルあたり: %.3fms".format(predictionTime.toDouble() / X.size))

// 評価指標の計算
println("\n[4] 評価指標:")
val metrics = predictor.evaluate(X, y)
println("    R² スコア:        %.4f".format(metrics["r2Score"]))
println("    MAE（平均絶対誤差）: %.2f 万円".format(metrics["mae"]))
println("    RMSE（二乗平均平方根誤差）: %.2f 万円".format(metrics["rmse"]))

// 予測結果の分析
println("\n[5] 予測結果の分析:")
val errors = predictions.zip(y).map { (pred, actual) -> abs(pred - actual) }
val errorMean = errors.average()
val errorMin = errors.minOrNull() ?: 0.0
val errorMax = errors.maxOrNull() ?: 0.0

println("    誤差の平均値: %.2f 万円".format(errorMean))
println("    誤差の最小値: %.2f 万円".format(errorMin))
println("    誤差の最大値: %.2f 万円".format(errorMax))

// 誤差の分布
val errorRanges = listOf(0.0, 100.0, 200.0, 500.0, 1000.0, Double.MAX_VALUE)
println("\n[6] 誤差の分布:")
(0 until errorRanges.size - 1).forEach { i ->
    val lower = errorRanges[i]
    val upper = errorRanges[i + 1]
    val count = errors.count { it >= lower && it < upper }
    val percentage = count.toDouble() / errors.size * 100
    val rangeStr = if (upper == Double.MAX_VALUE) {
        "%.0f 万円以上".format(lower)
    } else {
        "%.0f ~ %.0f 万円".format(lower, upper)
    }
    println("    %-20s: %3d 件 (%.1f%%)".format(rangeStr, count, percentage))
}

// 予測と実測の比較（最初の10件）
println("\n[7] 予測と実測の比較（最初の10件）:")
println("    実測値    予測値    誤差     誤差率")
println("    " + "-".repeat(50))
(0 until minOf(10, X.size)).forEach { i ->
    val actual = y[i]
    val pred = predictions[i]
    val error = actual - pred
    val errorRate = abs(error) / actual * 100
    println("    %7.1f   %7.1f   %+7.1f   %5.1f%%".format(actual, pred, error, errorRate))
}

// 最も大きな誤差のサンプル
println("\n[8] 最も大きな誤差のサンプル（上位5件）:")
val sortedIndices = errors.indices.sortedByDescending { errors[it] }
println("    実測値    予測値    誤差     特徴量")
println("    " + "-".repeat(70))
sortedIndices.take(5).forEach { idx ->
    val actual = y[idx]
    val pred = predictions[idx]
    val error = actual - pred
    val features = X[idx].joinToString(", ") { "%.1f".format(it) }
    println("    %7.1f   %7.1f   %+7.1f   [%s]".format(actual, pred, error, features))
}

// 個別予測の例
println("\n[9] 個別予測の例:")
val testSamples = listOf(
    Triple(doubleArrayOf(500.0, 800.0, 20.0, 1.0), "低〜中程度のSNS露出、オリジナル作品"),
    Triple(doubleArrayOf(1200.0, 1500.0, 50.0, 0.0), "高いSNS露出、人気俳優出演"),
    Triple(doubleArrayOf(300.0, 400.0, 10.0, 0.0), "低いSNS露出、新人俳優")
)

testSamples.forEachIndexed { i, (sample, description) ->
    val prediction = predictor.predict(arrayOf(sample))[0]
    println("    サンプル ${i+1} ($description):")
    println("      SNS1=%.0f, SNS2=%.0f, actor=%.0f, original=%.0f".format(
        sample[0], sample[1], sample[2], sample[3]
    ))
    println("      予測興行収入: %.1f 万円".format(prediction))
}

println("\n" + "=".repeat(60))
println("評価完了！")
println("=".repeat(60))
