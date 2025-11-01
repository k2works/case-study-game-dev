package ml

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.doubles.shouldBeGreaterThan
import io.kotest.matchers.ints.shouldBeGreaterThan as intsShouldBeGreaterThan
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe

/**
 * SurvivedClassifier の初期化テスト
 */
class SurvivedClassifierTest : StringSpec({

    "デフォルトパラメータで初期化できることを確認" {
        val classifier = SurvivedClassifier()
        classifier shouldNotBe null
        classifier.maxDepth shouldBe 9
    }

    "カスタムパラメータで初期化できることを確認" {
        val classifier = SurvivedClassifier(maxDepth = 5)
        classifier.maxDepth shouldBe 5
    }

    "不正なmaxDepthで初期化するとエラー" {
        shouldThrow<IllegalArgumentException> {
            SurvivedClassifier(maxDepth = 0)
        }
    }

    "Survived CSVファイルを正常に読み込めることを確認" {
        val classifier = SurvivedClassifier()
        val (X, y) = classifier.loadData("src/main/resources/data/Survived.csv")

        X.size intsShouldBeGreaterThan 0
        X[0].size shouldBe 3  // Pclass, Age, male (encoded)
        y.size shouldBe X.size
    }

    "モデルの訓練ができることを確認" {
        val classifier = SurvivedClassifier()
        val (X, y) = classifier.loadData("src/main/resources/data/Survived.csv")

        classifier.train(X, y)
        classifier.model shouldNotBe null
    }

    "予測を実行できることを確認" {
        val classifier = SurvivedClassifier()
        val (X, y) = classifier.loadData("src/main/resources/data/Survived.csv")
        classifier.train(X, y)

        val predictions = classifier.predict(X)
        predictions.size shouldBe X.size
        predictions.all { it == 0 || it == 1 } shouldBe true
    }

    "モデル性能の評価ができることを確認" {
        val classifier = SurvivedClassifier()
        val (X, y) = classifier.loadData("src/main/resources/data/Survived.csv")
        classifier.train(X, y)

        val accuracy = classifier.evaluate(X, y)
        accuracy shouldBeGreaterThan 0.5
    }

    "モデルの保存と読み込みができることを確認" {
        val classifier = SurvivedClassifier()
        val (X, y) = classifier.loadData("src/main/resources/data/Survived.csv")
        classifier.train(X, y)

        val modelPath = "model/survived_model_test.ser"
        classifier.saveModel(modelPath)

        val loadedClassifier = SurvivedClassifier()
        loadedClassifier.loadModel(modelPath)
        loadedClassifier.model shouldNotBe null

        // 同じ予測結果を返すことを確認
        val originalPredictions = classifier.predict(X)
        val loadedPredictions = loadedClassifier.predict(X)
        originalPredictions shouldBe loadedPredictions

        // テスト用ファイルを削除
        java.io.File(modelPath).delete()
    }
})
