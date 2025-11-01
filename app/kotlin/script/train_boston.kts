#!/usr/bin/env kotlin

/**
 * Boston 住宅価格予測モデルの訓練スクリプト
 *
 * 使い方:
 *   ./gradlew trainBoston
 */

import ml.BostonPredictor
import java.io.File

println("=".repeat(60))
println("Boston 住宅価格予測モデルの訓練")
println("=".repeat(60))

// データセットのパス
val dataPath = "src/main/resources/data/Boston.csv"
val modelPath = "model/boston_model.bin"

// モデルの作成
println("\n[1] モデルの初期化...")
val predictor = BostonPredictor()
println("    BostonPredictor を作成しました")

// データの読み込み
println("\n[2] データの読み込み...")
val df = predictor.loadData(dataPath)
println("    サンプル数: ${df.nrow}")
println("    特徴量数: ${df.ncol}")

// CRIME列のダミー変数化
println("\n[3] CRIME列のダミー変数化...")
val dfEncoded = predictor.encodeCrime(df)
println("    CRIM列 → CRIM_high ダミー変数")

// 欠損値補完
println("\n[4] 欠損値補完...")
val dfFilled = predictor.fillMissingValues(dfEncoded, dfEncoded)
println("    訓練データの平均値で補完")

// 外れ値除外
println("\n[5] 外れ値除外...")
val dfCleaned = predictor.removeOutliers(dfFilled)
println("    除外前: ${dfFilled.nrow} サンプル")
println("    除外後: ${dfCleaned.nrow} サンプル")

// 特徴量とラベルに分割
println("\n[6] 特徴量とラベルに分割...")
val featureNames = listOf("RM", "LSTAT", "PTRATIO")
val X = Array(dfCleaned.nrow) { idx ->
    featureNames.map { name ->
        (dfCleaned[name][idx] as? Number)?.toDouble() ?: 0.0
    }.toDoubleArray()
}
val y = DoubleArray(dfCleaned.nrow) { idx ->
    (dfCleaned["PRICE"][idx] as? Number)?.toDouble() ?: 0.0
}

println("    特徴量: ${featureNames.joinToString(", ")}")
println("    サンプル数: ${X.size}")

// 価格の統計情報
println("\n[7] 価格の統計情報:")
val prices = y.sorted()
println("    最小値: %.2f".format(prices.first()))
println("    最大値: %.2f".format(prices.last()))
println("    平均値: %.2f".format(y.average()))
println("    中央値: %.2f".format(prices[prices.size / 2]))

// モデルの訓練
println("\n[8] モデルの訓練中...")
val startTime = System.currentTimeMillis()
predictor.train(X, y)
val trainingTime = System.currentTimeMillis() - startTime
println("    訓練時間: ${trainingTime}ms")

// 訓練データでの評価
println("\n[9] 訓練データでの評価...")
val trainR2 = predictor.evaluate(X, y)
println("    R²: %.4f".format(trainR2))

// 予測値と実測値の比較（サンプル）
println("\n[10] 予測値と実測値の比較（サンプル5件）:")
val predictions = predictor.predict(X)
for (i in 0 until minOf(5, X.size)) {
    println("    サンプル ${i+1}:")
    println("      特徴量: RM=${X[i][0]}, LSTAT=${X[i][1]}, PTRATIO=${X[i][2]}")
    println("      実測値: %.2f, 予測値: %.2f".format(y[i], predictions[i]))
}

// モデルの保存
println("\n[11] モデルの保存...")
File(modelPath).parentFile?.mkdirs()
predictor.saveModels(modelPath)
println("    保存先: $modelPath")
println("    ファイルサイズ: ${File(modelPath).length()} bytes")

println("\n" + "=".repeat(60))
println("訓練完了！")
println("=".repeat(60))
