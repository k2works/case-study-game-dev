#!/usr/bin/env kotlin

/**
 * Iris 分類モデルの評価スクリプト
 *
 * 使い方:
 *   ./gradlew runScript -Pscript=script/evaluate_iris.kts
 */

import ml.IrisClassifier
import java.io.File

println("=".repeat(60))
println("Iris 分類モデルの評価")
println("=".repeat(60))

// パスの設定
val dataPath = "src/main/resources/data/iris.csv"
val modelPath = "model/iris_model.ser"

// モデルの存在確認
if (!File(modelPath).exists()) {
    println("\nエラー: モデルファイルが見つかりません: $modelPath")
    println("先に train_iris.kts を実行してください。")
    kotlin.system.exitProcess(1)
}

// モデルの読み込み
println("\n[1] モデルの読み込み...")
val classifier = IrisClassifier()
classifier.loadModel(modelPath)
println("    モデルファイル: $modelPath")
println("    ファイルサイズ: ${File(modelPath).length()} bytes")

// テストデータの読み込み
println("\n[2] テストデータの読み込み...")
val (X, y) = classifier.loadData(dataPath)
println("    サンプル数: ${X.size}")
println("    特徴量数: ${X[0].size}")
println("    クラス数: ${y.distinct().size}")

// 予測の実行
println("\n[3] 予測の実行中...")
val startTime = System.currentTimeMillis()
val predictions = classifier.predict(X)
val predictionTime = System.currentTimeMillis() - startTime
println("    予測時間: ${predictionTime}ms")
println("    1サンプルあたり: %.3fms".format(predictionTime.toDouble() / X.size))

// 正解率の計算
val accuracy = predictions.zip(y).count { (pred, actual) -> pred == actual }.toDouble() / y.size
println("\n[4] 評価結果:")
println("    正解率: %.2f%%".format(accuracy * 100))
println("    正解数: ${predictions.zip(y).count { (pred, actual) -> pred == actual }} / ${y.size}")

// クラス別の性能
println("\n[5] クラス別の性能:")
val species = y.distinct().sorted()

species.forEach { targetSpecies ->
    val indices = y.indices.filter { y[it] == targetSpecies }
    val correct = indices.count { predictions[it] == targetSpecies }
    val total = indices.size
    val classAccuracy = correct.toDouble() / total

    println("    $targetSpecies:")
    println("      正解率: %.2f%% ($correct / $total)".format(classAccuracy * 100))
}

// 混同行列
println("\n[6] 混同行列:")
println("    実際 \\ 予測 | " + species.joinToString(" | "))
println("    " + "-".repeat(60))

species.forEach { actualSpecies ->
    val actualIndices = y.indices.filter { y[it] == actualSpecies }
    print("    %-15s | ".format(actualSpecies))
    species.forEach { predSpecies ->
        val count = actualIndices.count { predictions[it] == predSpecies }
        print("%3d | ".format(count))
    }
    println()
}

// 誤分類の詳細
println("\n[7] 誤分類されたサンプル:")
val misclassified = predictions.indices.filter { predictions[it] != y[it] }

if (misclassified.isEmpty()) {
    println("    誤分類なし！完璧です！✨")
} else {
    println("    合計 ${misclassified.size} 件:")
    misclassified.take(10).forEach { idx ->
        println("    サンプル $idx: [${X[idx].joinToString(", ")}]")
        println("      実際: ${y[idx]}, 予測: ${predictions[idx]}")
    }
    if (misclassified.size > 10) {
        println("    ... 他 ${misclassified.size - 10} 件")
    }
}

// 個別予測の例
println("\n[8] 個別予測の例:")
val testSamples = listOf(
    Triple(doubleArrayOf(5.1, 3.5, 1.4, 0.2), "setosa", "setosa の典型的な特徴"),
    Triple(doubleArrayOf(6.5, 3.0, 5.2, 2.0), "virginica", "virginica の典型的な特徴"),
    Triple(doubleArrayOf(5.7, 2.8, 4.1, 1.3), "versicolor", "versicolor の典型的な特徴")
)

testSamples.forEachIndexed { i, (sample, expected, description) ->
    val prediction = classifier.predict(arrayOf(sample))[0]
    val isCorrect = prediction == expected
    val mark = if (isCorrect) "✓" else "✗"
    println("    $mark サンプル ${i+1} ($description):")
    println("      特徴量: [${sample.joinToString(", ")}]")
    println("      予測: $prediction (期待: $expected)")
}

println("\n" + "=".repeat(60))
println("評価完了！")
println("=".repeat(60))
