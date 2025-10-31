package ml

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.doubles.shouldBeGreaterThan
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull

class IrisClassifierTest : StringSpec({

    "デフォルトパラメータでの初期化" {
        // デフォルトパラメータで初期化できることを確認
        val classifier = IrisClassifier()

        classifier shouldNotBe null       // インスタンスが作られた
        classifier.model.shouldBeNull()   // まだモデルは訓練されていない
        classifier.maxDepth shouldBe 2    // デフォルトの深さは 2
    }

    "カスタムパラメータでの初期化" {
        // カスタムパラメータで初期化できることを確認
        val classifier = IrisClassifier(maxDepth = 5)

        classifier.maxDepth shouldBe 5  // 指定した値が設定される
    }

    "無効な maxDepth の拒否" {
        // 負の値はダメ！
        shouldThrow<IllegalArgumentException> {
            IrisClassifier(maxDepth = -1)
        }

        // 0 もダメ！
        shouldThrow<IllegalArgumentException> {
            IrisClassifier(maxDepth = 0)
        }
    }

    "データの読み込み" {
        val classifier = IrisClassifier()
        val (X, y) = classifier.loadData("src/main/resources/data/iris.csv")

        // データサイズの確認（欠損値を除外した後）
        X.size shouldBe 143  // 149行 - 6行（欠損値）= 143サンプル
        y.size shouldBe 143

        // 特徴量の次元数
        X[0].size shouldBe 4  // 4つの特徴量

        // ラベルの種類
        y.distinct().size shouldBe 3  // 3種類のアヤメ
    }

    "モデルの訓練" {
        val classifier = IrisClassifier()
        val (X, y) = classifier.loadData("src/main/resources/data/iris.csv")

        // 訓練前はモデルが null
        classifier.model.shouldBeNull()

        // 訓練を実行
        classifier.train(X, y)

        // 訓練後はモデルが存在
        classifier.model.shouldNotBeNull()
    }

    "予測の実行" {
        val classifier = IrisClassifier()
        val (X, y) = classifier.loadData("src/main/resources/data/iris.csv")

        // モデルを訓練
        classifier.train(X, y)

        // 予測を実行
        val predictions = classifier.predict(X)

        // 予測結果のサイズが正しい
        predictions.size shouldBe 143

        // 予測結果が3種類のいずれか
        predictions.all { it in listOf("setosa", "versicolor", "virginica", "Iris-setosa", "Iris-versicolor", "Iris-virginica") } shouldBe true
    }

    "モデル性能の評価" {
        val classifier = IrisClassifier()
        val (X, y) = classifier.loadData("src/main/resources/data/iris.csv")

        // モデルを訓練
        classifier.train(X, y)

        // 評価を実行
        val accuracy = classifier.evaluate(X, y)

        // Iris データは比較的簡単なので、高い精度が期待できる
        accuracy shouldBeGreaterThan 0.9
    }

    "訓練前の予測エラー" {
        val classifier = IrisClassifier()

        // 訓練していないモデルで予測しようとするとエラー
        // requireNotNull は IllegalArgumentException を投げる
        shouldThrow<IllegalArgumentException> {
            classifier.predict(arrayOf(doubleArrayOf(5.1, 3.5, 1.4, 0.2)))
        }
    }

    "空のデータでの訓練エラー" {
        val classifier = IrisClassifier()

        // 空のデータで訓練しようとするとエラー
        shouldThrow<IllegalArgumentException> {
            classifier.train(emptyArray(), emptyArray())
        }
    }

    "不整合なデータサイズでの訓練エラー" {
        val classifier = IrisClassifier()

        // X と y のサイズが異なる場合はエラー
        shouldThrow<IllegalArgumentException> {
            classifier.train(
                arrayOf(doubleArrayOf(5.1, 3.5, 1.4, 0.2)),
                arrayOf("setosa", "versicolor")  // サイズが合わない！
            )
        }
    }
})
