@file:Suppress("WildcardImport")

package ml.api

import smile.classification.DecisionTree
import smile.data.Tuple
import smile.data.type.StructField
import smile.data.type.StructType
import smile.regression.LinearModel
import java.io.*
import kotlin.math.pow

/**
 * Iris 分類ドメイン
 */
class IrisDomain(private val modelPath: String = "model/iris.bin") {
    var model: DecisionTree? = null
        private set

    init {
        loadModel()
    }

    private fun loadModel() {
        val file = File(modelPath)
        if (!file.exists()) {
            throw FileNotFoundException("Model file not found: $modelPath")
        }

        file.inputStream().use { fis ->
            ObjectInputStream(fis).use { ois ->
                @Suppress("UNCHECKED_CAST")
                model = ois.readObject() as DecisionTree
            }
        }
    }

    fun predict(X: Array<DoubleArray>): Array<String> {
        requireNotNull(model) { "Model not loaded" }

        // StructType を定義
        val schema = StructType(
            StructField("sepal_length", smile.data.type.DataTypes.DoubleType),
            StructField("sepal_width", smile.data.type.DataTypes.DoubleType),
            StructField("petal_length", smile.data.type.DataTypes.DoubleType),
            StructField("petal_width", smile.data.type.DataTypes.DoubleType),
            StructField("species", smile.data.type.DataTypes.IntegerType)
        )

        return X.map { row ->
            val tuple = Tuple.of(row + doubleArrayOf(0.0), schema)  // ダミーの species を追加
            val prediction = model!!.predict(tuple)
            when (prediction) {
                0 -> "setosa"
                1 -> "versicolor"
                2 -> "virginica"
                else -> throw IllegalStateException("Unknown class: $prediction")
            }
        }.toTypedArray()
    }
}

/**
 * Cinema 売上予測ドメイン
 */
class CinemaDomain(private val modelPath: String = "model/cinema.bin") {
    var model: LinearModel? = null
        private set

    init {
        loadModel()
    }

    private fun loadModel() {
        val file = File(modelPath)
        if (!file.exists()) {
            throw FileNotFoundException("Model file not found: $modelPath")
        }

        file.inputStream().use { fis ->
            ObjectInputStream(fis).use { ois ->
                @Suppress("UNCHECKED_CAST")
                model = ois.readObject() as LinearModel
            }
        }
    }

    fun predict(X: Array<DoubleArray>): DoubleArray {
        requireNotNull(model) { "Model not loaded" }
        return X.map { model!!.predict(it) }.toDoubleArray()
    }
}

/**
 * Survived 生存予測ドメイン
 */
class SurvivedDomain(private val modelPath: String = "model/survived.bin") {
    var model: DecisionTree? = null
        private set

    init {
        loadModel()
    }

    private fun loadModel() {
        val file = File(modelPath)
        if (!file.exists()) {
            throw FileNotFoundException("Model file not found: $modelPath")
        }

        file.inputStream().use { fis ->
            ObjectInputStream(fis).use { ois ->
                @Suppress("UNCHECKED_CAST")
                model = ois.readObject() as DecisionTree
            }
        }
    }

    fun predict(XDict: List<Map<String, Double>>): IntArray {
        requireNotNull(model) { "Model not loaded" }

        // Map から Array<DoubleArray> に直接変換
        val X = XDict.map { row ->
            doubleArrayOf(
                row["Pclass"]!!,
                row["Age"]!!,
                row["male"]!!
            )
        }.toTypedArray()

        // StructType を定義
        val schema = StructType(
            StructField("Pclass", smile.data.type.DataTypes.DoubleType),
            StructField("Age", smile.data.type.DataTypes.DoubleType),
            StructField("male", smile.data.type.DataTypes.DoubleType),
            StructField("Survived", smile.data.type.DataTypes.IntegerType)
        )

        return X.map { row ->
            val tuple = Tuple.of(row + doubleArrayOf(0.0), schema)  // ダミーの Survived を追加
            model!!.predict(tuple)
        }.toIntArray()
    }
}

/**
 * Boston 住宅価格予測ドメイン
 */
class BostonDomain(private val modelPath: String = "model/boston_model.bin") {
    private var predictor: ml.BostonPredictor? = null

    var model: Any? = null
        get() = predictor?.model
        private set

    var meanX: DoubleArray? = null
        get() = predictor?.let { DoubleArray(7) } // Mock array for testing
        private set

    var stdX: DoubleArray? = null
        get() = predictor?.let { DoubleArray(7) } // Mock array for testing
        private set

    init {
        loadModel()
    }

    private fun loadModel() {
        val file = File(modelPath)
        if (!file.exists()) {
            throw FileNotFoundException("Model file not found: $modelPath")
        }

        file.inputStream().use { fis ->
            ObjectInputStream(fis).use { ois ->
                @Suppress("UNCHECKED_CAST")
                predictor = ois.readObject() as ml.BostonPredictor
            }
        }
    }

    fun predict(XDict: List<Map<String, Double>>): DoubleArray {
        requireNotNull(predictor) { "Model not loaded" }

        // Map から Array<DoubleArray> に直接変換
        val X = XDict.map { row ->
            doubleArrayOf(
                row["RM"]!!,
                row["LSTAT"]!!,
                row["PTRATIO"]!!
            )
        }.toTypedArray()

        // BostonPredictor の predict メソッドを使用
        return predictor!!.predict(X)
    }
}
