#!/usr/bin/env kotlin

/**
 * Survived 分類モデルの評価スクリプト
 *
 * 使い方:
 *   ./gradlew runScript -Pscript=script/evaluate_survived.kts
 */

import ml.SurvivedClassifier
import java.io.File

println("=".repeat(60))
println("Survived 分類モデルの評価 (Titanic 生存予測)")
println("=".repeat(60))

// パスの設定
val dataPath = "src/main/resources/data/Survived.csv"
val modelPath = "model/survived_model.ser"

// モデルの存在確認
if (!File(modelPath).exists()) {
    println("\nエラー: モデルファイルが見つかりません: $modelPath")
    println("先に train_survived.kts を実行してください。")
    kotlin.system.exitProcess(1)
}

// モデルの読み込み
println("\n[1] モデルの読み込み...")
val classifier = SurvivedClassifier()
classifier.loadModel(modelPath)
println("    モデルファイル: $modelPath")
println("    ファイルサイズ: ${File(modelPath).length()} bytes")

// テストデータの読み込み
println("\n[2] テストデータの読み込み...")
val (X, y) = classifier.loadData(dataPath)
println("    サンプル数: ${X.size}")
println("    特徴量数: ${X[0].size}")
println("    クラス数: 2 (0: 死亡, 1: 生存)")

// 予測の実行
println("\n[3] 予測の実行中...")
val startTime = System.currentTimeMillis()
val predictions = classifier.predict(X)
val predictionTime = System.currentTimeMillis() - startTime
println("    予測時間: ${predictionTime}ms")
println("    1サンプルあたり: %.3fms".format(predictionTime.toDouble() / X.size))

// 正解率の計算
val accuracy = predictions.zip(y.toTypedArray()).count { (pred, actual) -> pred == actual }.toDouble() / y.size
println("\n[4] 評価結果:")
println("    正解率: %.2f%%".format(accuracy * 100))
println("    正解数: ${predictions.zip(y.toTypedArray()).count { (pred, actual) -> pred == actual }} / ${y.size}")

// クラス別の性能
println("\n[5] クラス別の性能:")
val classes = listOf(0, 1)
val classNames = mapOf(0 to "死亡", 1 to "生存")

classes.forEach { targetClass ->
    val indices = y.indices.filter { y[it] == targetClass }
    val correct = indices.count { predictions[it] == targetClass }
    val total = indices.size
    val classAccuracy = if (total > 0) correct.toDouble() / total else 0.0

    println("    ${classNames[targetClass]} ($targetClass):")
    println("      正解率: %.2f%% ($correct / $total)".format(classAccuracy * 100))
}

// 混同行列
println("\n[6] 混同行列:")
println("    実際 \\ 予測 |   0 |   1")
println("    " + "-".repeat(30))

classes.forEach { actualClass ->
    val actualIndices = y.indices.filter { y[it] == actualClass }
    val className = classNames[actualClass]!!
    print("    %-10s | ".format(className))
    classes.forEach { predClass ->
        val count = actualIndices.count { predictions[it] == predClass }
        print("%3d | ".format(count))
    }
    println()
}

// 精度指標の計算
println("\n[7] 精度指標:")
val tp = predictions.indices.count { predictions[it] == 1 && y[it] == 1 }  // True Positive
val tn = predictions.indices.count { predictions[it] == 0 && y[it] == 0 }  // True Negative
val fp = predictions.indices.count { predictions[it] == 1 && y[it] == 0 }  // False Positive
val fn = predictions.indices.count { predictions[it] == 0 && y[it] == 1 }  // False Negative

val precision = if (tp + fp > 0) tp.toDouble() / (tp + fp) else 0.0
val recall = if (tp + fn > 0) tp.toDouble() / (tp + fn) else 0.0
val f1Score = if (precision + recall > 0) 2 * precision * recall / (precision + recall) else 0.0

println("    Precision (精度): %.2f%%".format(precision * 100))
println("    Recall (再現率): %.2f%%".format(recall * 100))
println("    F1 Score: %.2f%%".format(f1Score * 100))

// 誤分類の詳細
println("\n[8] 誤分類されたサンプル:")
val misclassified = predictions.indices.filter { predictions[it] != y[it] }

if (misclassified.isEmpty()) {
    println("    誤分類なし！完璧です！")
} else {
    println("    合計 ${misclassified.size} 件:")
    misclassified.take(10).forEach { idx ->
        println("    サンプル $idx: Pclass=${X[idx][0]}, Age=${X[idx][1]}, male=${X[idx][2]}")
        println("      実際: ${classNames[y[idx]]}, 予測: ${classNames[predictions[idx]]}")
    }
    if (misclassified.size > 10) {
        println("    ... 他 ${misclassified.size - 10} 件")
    }
}

// 個別予測の例
println("\n[9] 個別予測の例:")
val testSamples = listOf(
    Triple(doubleArrayOf(1.0, 35.0, 0.0), 1, "1等客室、35歳、女性"),
    Triple(doubleArrayOf(3.0, 25.0, 1.0), 0, "3等客室、25歳、男性"),
    Triple(doubleArrayOf(2.0, 28.0, 0.0), 1, "2等客室、28歳、女性")
)

testSamples.forEachIndexed { i, (sample, expected, description) ->
    val prediction = classifier.predict(arrayOf(sample))[0]
    val isCorrect = prediction == expected
    val mark = if (isCorrect) "✓" else "✗"
    println("    $mark サンプル ${i+1} ($description):")
    println("      特徴量: Pclass=${sample[0]}, Age=${sample[1]}, male=${sample[2]}")
    println("      予測: ${classNames[prediction]} (期待: ${classNames[expected]})")
}

println("\n" + "=".repeat(60))
println("評価完了！")
println("=".repeat(60))
