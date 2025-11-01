#!/usr/bin/env kotlin

/**
 * Survived 分類モデルの訓練スクリプト
 *
 * 使い方:
 *   ./gradlew runScript -Pscript=script/train_survived.kts
 */

import ml.SurvivedClassifier
import java.io.File

println("=".repeat(60))
println("Survived 分類モデルの訓練 (Titanic 生存予測)")
println("=".repeat(60))

// データセットのパス
val dataPath = "src/main/resources/data/Survived.csv"
val modelPath = "model/survived_model.ser"

// モデルの作成
println("\n[1] モデルの初期化...")
val classifier = SurvivedClassifier(maxDepth = 9)
println("    決定木の最大深さ: ${classifier.maxDepth}")

// データの読み込み
println("\n[2] データの読み込み...")
val (X, y) = classifier.loadData(dataPath)
println("    サンプル数: ${X.size}")
println("    特徴量数: ${X[0].size}")
println("    クラス数: 2 (0: 死亡, 1: 生存)")

// クラスの分布を表示
println("\n[3] クラスの分布:")
val total = y.size.toDouble()
val survived = y.count { it == 1 }
val died = y.count { it == 0 }
println("    0 (死亡): $died 件 (%.1f%%)".format(died / total * 100))
println("    1 (生存): $survived 件 (%.1f%%)".format(survived / total * 100))

// モデルの訓練
println("\n[4] モデルの訓練中...")
val startTime = System.currentTimeMillis()
classifier.train(X, y)
val trainingTime = System.currentTimeMillis() - startTime
println("    訓練時間: ${trainingTime}ms")

// 訓練データでの評価
println("\n[5] 訓練データでの評価...")
val trainAccuracy = classifier.evaluate(X, y)
println("    訓練正解率: %.2f%%".format(trainAccuracy * 100))

// 混同行列の表示
println("\n[6] 混同行列:")
val predictions = classifier.predict(X)
val classes = listOf(0, 1)

println("    実際 \\ 予測 |   0 |   1")
println("    " + "-".repeat(30))

classes.forEach { actualClass ->
    val actualIndices = y.indices.filter { y[it] == actualClass }
    val className = if (actualClass == 0) "死亡" else "生存"
    print("    %-10s | ".format(className))
    classes.forEach { predClass ->
        val count = actualIndices.count { predictions[it] == predClass }
        print("%3d | ".format(count))
    }
    println()
}

// モデルの保存
println("\n[7] モデルの保存...")
File(modelPath).parentFile?.mkdirs()
classifier.saveModel(modelPath)
println("    保存先: $modelPath")
println("    ファイルサイズ: ${File(modelPath).length()} bytes")

println("\n" + "=".repeat(60))
println("訓練完了！")
println("=".repeat(60))
