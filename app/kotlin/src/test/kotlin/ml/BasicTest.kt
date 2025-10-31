package ml

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.types.shouldBeInstanceOf
import smile.classification.DecisionTree
import smile.regression.LinearModel
import krangl.DataFrame
import krangl.dataFrameOf

class BasicTest : StringSpec({

    "パッケージのインポート確認" {
        // 必要なパッケージが正しくインポートできることを確認
        DecisionTree::class shouldNotBe null
        LinearModel::class shouldNotBe null
        DataFrame::class shouldNotBe null
    }

    "Krangl DataFrame の作成" {
        // DataFrame を作成できることを確認
        val df = dataFrameOf("A", "B")(
            1, 4,
            2, 5,
            3, 6
        )

        df.nrow shouldBe 3              // 3行のデータ
        df.names shouldBe listOf("A", "B")  // 列名が正しい
    }

    "Krangl 欠損値の検出" {
        // 欠損値を正しく検出できることを確認
        val df = dataFrameOf("A")(
            1.0,
            Double.NaN,
            3.0
        )

        val naCount = df["A"].values().count { it is Double && it.isNaN() }
        naCount shouldBe 1  // 1つ欠損値がある
    }

    "Krangl 欠損値の補完" {
        // 欠損値を平均値で補完できることを確認
        val df = dataFrameOf("A")(
            1.0,
            Double.NaN,
            3.0
        )

        val nonNullValues = df["A"].values().filterIsInstance<Double>().filter { !it.isNaN() }
        val meanValue = nonNullValues.average()  // 平均値を計算: (1 + 3) / 2 = 2.0
        val filled = df["A"].values().map { value ->
            if (value is Double && value.isNaN()) meanValue else value
        }

        filled.count { it is Double && it.isNaN() } shouldBe 0  // 欠損値が0個
        (filled[1] as Double) shouldBe 2.0         // 2番目の値が2.0に補完された
    }
})
