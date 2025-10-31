#!/usr/bin/env kotlin

/**
 * Iris 分類モデルの訓練スクリプト
 *
 * 使い方:
 *   ./gradlew runScript -Pscript=script/train_iris.kts
 */

import ml.IrisClassifier
import java.io.File

println("=".repeat(60))
println("Iris 分類モデルの訓練")
println("=".repeat(60))

// データセットのパス
val dataPath = "src/main/resources/data/iris.csv"
val modelPath = "model/iris_model.ser"

// モデルの作成
println("\n[1] モデルの初期化...")
val classifier = IrisClassifier(maxDepth = 3)
println("    決定木の最大深さ: ${classifier.maxDepth}")

// データの読み込み
println("\n[2] データの読み込み...")
val (X, y) = classifier.loadData(dataPath)
println("    サンプル数: ${X.size}")
println("    特徴量数: ${X[0].size}")
println("    クラス数: ${y.distinct().size}")

// クラスの分布を表示
println("\n[3] クラスの分布:")
val total = y.size.toDouble()
y.distinct().sorted().forEach { species ->
    val count = y.count { it == species }
    val percentage = (count / total * 100)
    println("    $species: $count 件 (%.1f%%)".format(percentage))
}

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
val species = y.distinct().sorted()

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

// モデルの保存
println("\n[7] モデルの保存...")
File(modelPath).parentFile?.mkdirs()
classifier.saveModel(modelPath)
println("    保存先: $modelPath")
println("    ファイルサイズ: ${File(modelPath).length()} bytes")

println("\n" + "=".repeat(60))
println("訓練完了！")
println("=".repeat(60))
