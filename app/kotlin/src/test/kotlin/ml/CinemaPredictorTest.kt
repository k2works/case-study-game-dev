package ml

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.comparables.shouldBeGreaterThan
import io.kotest.matchers.comparables.shouldBeLessThan
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.doubles.shouldBeGreaterThan as doublesShouldBeGreaterThan
import io.kotest.matchers.doubles.shouldBeLessThan as doublesShouldBeLessThan
import java.io.File

class CinemaPredictorTest : StringSpec({

    "デフォルトパラメータでの初期化" {
        // デフォルトパラメータで初期化できることを確認
        val predictor = CinemaPredictor()

        predictor shouldNotBe null         // インスタンスが作られた
        predictor.model.shouldBeNull()     // まだモデルは訓練されていない
    }

    "データの読み込み" {
        val predictor = CinemaPredictor()
        val (X, y) = predictor.loadData("src/main/resources/data/cinema.csv")

        // データサイズの確認
        X.size shouldBeGreaterThan 0
        y.size shouldBeGreaterThan 0
        X.size shouldBe y.size

        // 特徴量の次元数（SNS1, SNS2, actor, original）
        X[0].size shouldBe 4

        // 目的変数が正の値
        y.all { it > 0 } shouldBe true
    }

    "外れ値除去ありでのデータ読み込み" {
        val predictor = CinemaPredictor()

        // 外れ値除去なし
        val (X_full, y_full) = predictor.loadData("src/main/resources/data/cinema.csv", removeOutliers = false)

        // 外れ値除去あり
        val (X_clean, y_clean) = predictor.loadData("src/main/resources/data/cinema.csv", removeOutliers = true)

        // 外れ値除去すると、データ数が減る（または同じ）
        X_clean.size shouldBeLessThan (X_full.size + 1)
        y_clean.size shouldBeLessThan (y_full.size + 1)
    }

    "モデルの訓練" {
        val predictor = CinemaPredictor()
        val (X, y) = predictor.loadData("src/main/resources/data/cinema.csv")

        // 訓練前はモデルが null
        predictor.model.shouldBeNull()

        // 訓練を実行
        predictor.train(X, y)

        // 訓練後はモデルが存在
        predictor.model.shouldNotBeNull()
    }

    "予測の実行" {
        val predictor = CinemaPredictor()
        val (X, y) = predictor.loadData("src/main/resources/data/cinema.csv")

        // モデルを訓練
        predictor.train(X, y)

        // 予測を実行
        val predictions = predictor.predict(X)

        // 予測結果のサイズが正しい
        predictions.size shouldBe X.size

        // 予測結果が正の値（興行収入なので）
        predictions.all { it > 0 } shouldBe true
    }

    "モデル性能の評価" {
        val predictor = CinemaPredictor()
        val (X, y) = predictor.loadData("src/main/resources/data/cinema.csv", removeOutliers = true)

        // モデルを訓練
        predictor.train(X, y)

        // 評価を実行
        val metrics = predictor.evaluate(X, y)

        // 評価指標が含まれている
        metrics.containsKey("r2Score") shouldBe true
        metrics.containsKey("mae") shouldBe true
        metrics.containsKey("rmse") shouldBe true

        // R² スコアは 0 から 1 の間（良いモデルなら 0.5 以上）
        metrics["r2Score"]!! doublesShouldBeGreaterThan 0.0
        metrics["r2Score"]!! doublesShouldBeLessThan 1.1

        // MAE と RMSE は正の値
        metrics["mae"]!! doublesShouldBeGreaterThan 0.0
        metrics["rmse"]!! doublesShouldBeGreaterThan 0.0
    }

    "訓練前の予測エラー" {
        val predictor = CinemaPredictor()

        // 訓練していないモデルで予測しようとするとエラー
        shouldThrow<IllegalArgumentException> {
            predictor.predict(arrayOf(doubleArrayOf(500.0, 800.0, 20.0, 1.0)))
        }
    }

    "訓練前の評価エラー" {
        val predictor = CinemaPredictor()
        val (X, y) = predictor.loadData("src/main/resources/data/cinema.csv")

        // 訓練していないモデルで評価しようとするとエラー
        shouldThrow<IllegalArgumentException> {
            predictor.evaluate(X, y)
        }
    }

    "空のデータでの訓練エラー" {
        val predictor = CinemaPredictor()

        // 空のデータで訓練しようとするとエラー
        shouldThrow<IllegalArgumentException> {
            predictor.train(emptyArray(), doubleArrayOf())
        }
    }

    "不整合なデータサイズでの訓練エラー" {
        val predictor = CinemaPredictor()

        // X と y のサイズが異なる場合はエラー
        shouldThrow<IllegalArgumentException> {
            predictor.train(
                arrayOf(doubleArrayOf(500.0, 800.0, 20.0, 1.0)),
                doubleArrayOf(8000.0, 9000.0)  // サイズが合わない！
            )
        }
    }

    "モデルの保存と読み込み" {
        val predictor = CinemaPredictor()
        val (X, y) = predictor.loadData("src/main/resources/data/cinema.csv")

        // モデルを訓練
        predictor.train(X, y)

        // モデルを保存
        val modelPath = "build/test_cinema_model.ser"
        predictor.saveModel(modelPath)

        // ファイルが作成されている
        File(modelPath).exists() shouldBe true

        // 新しいインスタンスでモデルを読み込み
        val predictor2 = CinemaPredictor()
        predictor2.loadModel(modelPath)

        // 読み込んだモデルが存在
        predictor2.model.shouldNotBeNull()

        // 同じ予測結果が得られる
        val predictions1 = predictor.predict(X)
        val predictions2 = predictor2.predict(X)

        predictions1.size shouldBe predictions2.size
        predictions1.zip(predictions2).all { (p1, p2) ->
            kotlin.math.abs(p1 - p2) < 0.01
        } shouldBe true

        // テストファイルを削除
        File(modelPath).delete()
    }

    "訓練前のモデル保存エラー" {
        val predictor = CinemaPredictor()

        // 訓練していないモデルを保存しようとするとエラー
        shouldThrow<IllegalArgumentException> {
            predictor.saveModel("build/test_model.ser")
        }
    }

    "存在しないモデルファイルの読み込みエラー" {
        val predictor = CinemaPredictor()

        // 存在しないファイルを読み込もうとするとエラー
        shouldThrow<Exception> {
            predictor.loadModel("nonexistent_model.ser")
        }
    }
})
