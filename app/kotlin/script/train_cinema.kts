#!/usr/bin/env kotlin

/**
 * Cinema 興行収入予測モデルの訓練スクリプト
 *
 * 使い方:
 *   ./gradlew runScript -Pscript=script/train_cinema.kts
 */

import ml.CinemaPredictor
import java.io.File
import kotlin.math.sqrt

println("=".repeat(60))
println("Cinema 興行収入予測モデルの訓練")
println("=".repeat(60))

// データセットのパス
val dataPath = "src/main/resources/data/cinema.csv"
val modelPath = "model/cinema_model.ser"

// モデルの作成
println("\n[1] モデルの初期化...")
val predictor = CinemaPredictor()
println("    線形回帰モデル（OLS）")

// データの読み込み（外れ値除去あり）
println("\n[2] データの読み込み...")
val (X, y) = predictor.loadData(dataPath, removeOutliers = true)
println("    サンプル数: ${X.size}")
println("    特徴量数: ${X[0].size}")
println("    特徴量: SNS1, SNS2, actor, original")

// データの統計量を表示
println("\n[3] 目的変数（興行収入）の統計:")
val salesMean = y.average()
val salesMin = y.minOrNull() ?: 0.0
val salesMax = y.maxOrNull() ?: 0.0
val salesStd = sqrt(y.map { (it - salesMean) * (it - salesMean) }.average())

println("    最小値: %.1f 万円".format(salesMin))
println("    最大値: %.1f 万円".format(salesMax))
println("    平均値: %.1f 万円".format(salesMean))
println("    標準偏差: %.1f 万円".format(salesStd))

// 特徴量の統計
println("\n[4] 特徴量の統計:")
val featureNames = listOf("SNS1", "SNS2", "actor", "original")
featureNames.forEachIndexed { idx, name ->
    val values = X.map { it[idx] }
    val mean = values.average()
    val min = values.minOrNull() ?: 0.0
    val max = values.maxOrNull() ?: 0.0
    println("    %-10s: 平均=%.1f, 範囲=[%.1f, %.1f]".format(name, mean, min, max))
}

// モデルの訓練
println("\n[5] モデルの訓練中...")
val startTime = System.currentTimeMillis()
predictor.train(X, y)
val trainingTime = System.currentTimeMillis() - startTime
println("    訓練時間: ${trainingTime}ms")

// 訓練データでの評価
println("\n[6] 訓練データでの評価...")
val metrics = predictor.evaluate(X, y)
println("    R² スコア:        %.4f".format(metrics["r2Score"]))
println("    MAE（平均絶対誤差）: %.2f 万円".format(metrics["mae"]))
println("    RMSE（二乗平均平方根誤差）: %.2f 万円".format(metrics["rmse"]))

// 予測例の表示
println("\n[7] 予測例（最初の5件）:")
val predictions = predictor.predict(X)
println("    実測値    予測値    誤差")
println("    " + "-".repeat(40))
(0 until minOf(5, X.size)).forEach { i ->
    val actual = y[i]
    val pred = predictions[i]
    val error = actual - pred
    println("    %7.1f   %7.1f   %+7.1f".format(actual, pred, error))
}

// モデルの保存
println("\n[8] モデルの保存...")
File(modelPath).parentFile?.mkdirs()
predictor.saveModel(modelPath)
println("    保存先: $modelPath")
println("    ファイルサイズ: ${File(modelPath).length()} bytes")

println("\n" + "=".repeat(60))
println("訓練完了！")
println("=".repeat(60))
