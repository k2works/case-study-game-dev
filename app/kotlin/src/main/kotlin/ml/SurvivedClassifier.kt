package ml

import smile.classification.DecisionTree
import smile.data.DataFrame
import smile.data.formula.Formula
import smile.data.vector.DoubleVector
import smile.data.vector.IntVector
import java.io.Serializable
import java.util.Properties

/**
 * Survived データセットを分類する決定木モデル
 * Titanic の生存予測を行う
 *
 * @property maxDepth 決定木の最大深さ（デフォルト: 9）
 */
@Suppress("VariableNaming", "FunctionParameterNaming")
class SurvivedClassifier(val maxDepth: Int = 9) : Serializable {

    var model: DecisionTree? = null
        private set

    init {
        require(maxDepth >= 1) { "maxDepth must be at least 1" }
    }

    companion object {
        private const val serialVersionUID = 1L

        // Feature indices
        private const val PCLASS_IDX = 0
        private const val AGE_IDX = 1
        private const val MALE_IDX = 2
    }

    /**
     * CSV ファイルからデータを読み込む
     * 欠損値は Pclass ごとの平均値で補完される
     * Sex 列は male ダミー変数にエンコードされる (male=1, female=0)
     *
     * @param filePath CSV ファイルのパス
     * @return 特徴量と正解ラベルのペア
     */
    @Suppress("CyclomaticComplexMethod", "LoopWithTooManyJumpStatements")
    fun loadData(filePath: String): Pair<Array<DoubleArray>, IntArray> {
        val file = java.io.File(filePath)
        require(file.exists()) { "File not found: $filePath" }

        val lines = file.readLines()
        require(lines.isNotEmpty()) { "Empty file: $filePath" }

        // ヘッダー行を解析（BOMを除去）
        val headerLine = lines[0].replace("\uFEFF", "").trim()
        val header = headerLine.split(",").map { it.trim() }
        val pclassIdx = header.indexOf("Pclass")
        val ageIdx = header.indexOf("Age")
        val sexIdx = header.indexOf("Sex")
        val survivedIdx = header.indexOf("Survived")

        requireAllColumnsPresent(pclassIdx, ageIdx, sexIdx, survivedIdx)

        // 第1パス: Pclass ごとの Age 平均値を計算
        val ageByPclass = mutableMapOf<Int, MutableList<Double>>()

        for (i in 1 until lines.size) {
            val values = lines[i].split(",")
            if (values.size != header.size) continue

            val pclass = values[pclassIdx].trim().toIntOrNull() ?: continue
            val age = values[ageIdx].trim().toDoubleOrNull() ?: continue

            ageByPclass.getOrPut(pclass) { mutableListOf() }.add(age)
        }

        // Pclass ごとの Age 平均値
        val ageMeanByPclass = ageByPclass.mapValues { (_, ages) ->
            if (ages.isNotEmpty()) ages.average() else 0.0
        }

        // 第2パス: データ行を読み込み（欠損値を補完）
        val validRows = mutableListOf<Pair<DoubleArray, Int>>()

        for (i in 1 until lines.size) {
            val values = lines[i].split(",")
            if (values.size != header.size) continue

            parseDataRow(
                values,
                pclassIdx,
                ageIdx,
                sexIdx,
                survivedIdx,
                ageMeanByPclass
            )?.let { validRows.add(it) }
        }

        require(validRows.isNotEmpty()) { "No valid data found in CSV" }

        val X = validRows.map { it.first }.toTypedArray()
        val y = validRows.map { it.second }.toIntArray()

        return Pair(X, y)
    }

    /**
     * モデルを訓練する
     *
     * @param X 訓練用特徴量
     * @param y 訓練用正解ラベル
     */
    fun train(X: Array<DoubleArray>, y: IntArray) {
        require(X.isNotEmpty() && y.isNotEmpty()) { "Training data cannot be empty" }
        require(X.size == y.size) {
            "X and y must have the same length: ${X.size} != ${y.size}"
        }

        // DataFrame を作成
        val data = DataFrame.of(
            DoubleVector.of("Pclass", X.map { it[PCLASS_IDX] }.toDoubleArray()),
            DoubleVector.of("Age", X.map { it[AGE_IDX] }.toDoubleArray()),
            DoubleVector.of("male", X.map { it[MALE_IDX] }.toDoubleArray()),
            IntVector.of("Survived", y)
        )

        // モデルの訓練
        val formula = Formula.lhs("Survived")
        val props = Properties()
        props.setProperty("smile.decision_tree.max_depth", maxDepth.toString())
        model = DecisionTree.fit(formula, data, props)
    }

    /**
     * 予測を実行する
     *
     * @param X テスト用特徴量
     * @return 予測されたクラスラベルの配列
     */
    fun predict(X: Array<DoubleArray>): IntArray {
        requireNotNull(model) { "Model has not been trained yet" }

        // DataFrameを作成（ダミーのSurvived列を含める）
        val dummySurvived = IntArray(X.size) { 0 }  // ダミー値
        val testData = DataFrame.of(
            DoubleVector.of("Pclass", X.map { it[PCLASS_IDX] }.toDoubleArray()),
            DoubleVector.of("Age", X.map { it[AGE_IDX] }.toDoubleArray()),
            DoubleVector.of("male", X.map { it[MALE_IDX] }.toDoubleArray()),
            IntVector.of("Survived", dummySurvived)
        )

        // 予測を実行
        return model!!.predict(testData)
    }

    /**
     * モデルの性能を評価する
     *
     * @param X テスト用特徴量
     * @param y テスト用正解ラベル
     * @return 正解率（0.0 〜 1.0）
     */
    fun evaluate(X: Array<DoubleArray>, y: IntArray): Double {
        requireNotNull(model) { "Model has not been trained yet" }

        val predictions = predict(X)
        val correct = predictions.zip(y.toTypedArray()).count { (pred, actual) -> pred == actual }
        return correct.toDouble() / y.size
    }

    /**
     * 訓練済みモデルをファイルに保存する
     *
     * @param filePath 保存先のファイルパス
     */
    fun saveModel(filePath: String) {
        requireNotNull(model) { "No trained model to save" }

        java.io.ObjectOutputStream(java.io.FileOutputStream(filePath)).use { oos ->
            oos.writeObject(model)
        }
    }

    /**
     * 保存されたモデルをファイルから読み込む
     *
     * @param filePath 読み込むファイルのパス
     */
    fun loadModel(filePath: String) {
        java.io.ObjectInputStream(java.io.FileInputStream(filePath)).use { ois ->
            @Suppress("UNCHECKED_CAST")
            model = ois.readObject() as DecisionTree
        }
    }

    /**
     * すべての必須列が存在するか確認する
     */
    private fun requireAllColumnsPresent(
        pclassIdx: Int,
        ageIdx: Int,
        sexIdx: Int,
        survivedIdx: Int
    ) {
        require(pclassIdx >= 0) { "Pclass column not found" }
        require(ageIdx >= 0) { "Age column not found" }
        require(sexIdx >= 0) { "Sex column not found" }
        require(survivedIdx >= 0) { "Survived column not found" }
    }

    /**
     * CSV の 1 行をパースして特徴量とラベルのペアを返す
     * 欠損値は平均値で補完される
     */
    @Suppress("LongParameterList", "CyclomaticComplexMethod", "ReturnCount")
    private fun parseDataRow(
        values: List<String>,
        pclassIdx: Int,
        ageIdx: Int,
        sexIdx: Int,
        survivedIdx: Int,
        ageMeanByPclass: Map<Int, Double>
    ): Pair<DoubleArray, Int>? {
        return try {
            val pclass = values[pclassIdx].trim().toIntOrNull() ?: return null
            val survived = values[survivedIdx].trim().toIntOrNull() ?: return null

            // Age は欠損値の場合、Pclass ごとの平均値で補完
            val age = values[ageIdx].trim().toDoubleOrNull()
                ?: ageMeanByPclass[pclass]
                ?: return null

            // Sex を male ダミー変数にエンコード (male=1, female=0)
            val sex = values[sexIdx].trim().lowercase()
            val male = if (sex == "male") 1.0 else 0.0

            val features = doubleArrayOf(pclass.toDouble(), age, male)
            Pair(features, survived)
        } catch (e: NumberFormatException) {
            null
        }
    }
}
