package ml

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.types.shouldBeInstanceOf
import io.kotest.matchers.collections.shouldContain
import krangl.DataFrame
import java.io.File

class DataLoaderTest : StringSpec({

    "CSV ファイルを読み込める" {
        // テストデータを作成
        val testData = """sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
7.0,3.2,4.7,1.4,versicolor"""

        val tempFile = File.createTempFile("iris_test", ".csv")
        tempFile.writeText(testData)
        tempFile.deleteOnExit()

        // DataLoader のインスタンス作成
        val loader = DataLoader()
        val df = loader.loadCsv(tempFile.absolutePath)

        df shouldNotBe null                 // データが読み込まれている
        df.shouldBeInstanceOf<DataFrame>()  // DataFrame 型である
        df.nrow shouldBe 3                  // 3行のデータ
    }

    "存在しないファイルの処理" {
        // 存在しないファイルを指定した場合に適切なエラーを返すことを確認
        val loader = DataLoader()

        shouldThrow<IllegalArgumentException> {
            loader.loadCsv("data/non_existent.csv")
        }
    }

    "空のファイルパスの処理" {
        // 空のファイルパスを指定した場合にエラーを返すことを確認
        val loader = DataLoader()

        shouldThrow<IllegalArgumentException> {
            loader.loadCsv("")
        }
    }

    "Iris データセットの読み込み" {
        // テストデータを作成
        val testData = """sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
7.0,3.2,4.7,1.4,versicolor
6.4,3.2,4.5,1.5,versicolor
6.3,3.3,6.0,2.5,virginica
5.8,2.7,5.1,1.9,virginica"""

        val tempFile = File.createTempFile("iris_full_test", ".csv")
        tempFile.writeText(testData)
        tempFile.deleteOnExit()

        // Iris データセットを正しく読み込めることを確認
        val loader = DataLoader()
        val df = loader.loadCsv(tempFile.absolutePath)

        // 📋 列名の確認
        val expectedColumns = listOf("sepal_length", "sepal_width", "petal_length",
                                     "petal_width", "species")
        df.names shouldBe expectedColumns

        // 🌸 種類の確認
        val species = df["species"].values().mapNotNull { it as? String }.distinct()
        species.size shouldBe 3
        species shouldContain "setosa"
        species shouldContain "versicolor"
        species shouldContain "virginica"
    }
})
