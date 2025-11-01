package ml

import smile.classification.DecisionTree
import smile.data.DataFrame
import smile.data.formula.Formula
import smile.data.vector.DoubleVector
import smile.data.vector.IntVector
import java.io.Serializable
import java.util.Properties

/**
 * Iris データセットを分類する決定木モデル
 *
 * @property maxDepth 決定木の最大深さ（デフォルト: 2）
 */
@Suppress("VariableNaming", "FunctionParameterNaming")
class IrisClassifier(val maxDepth: Int = 2) : Serializable {

    var model: DecisionTree? = null
        private set

    private var labelMapping: Map<Int, String> = emptyMap()

    init {
        require(maxDepth >= 1) { "maxDepth must be at least 1" }
    }

    companion object {
        private const val serialVersionUID = 1L

        // Feature indices
        private const val SEPAL_LENGTH_IDX = 0
        private const val SEPAL_WIDTH_IDX = 1
        private const val PETAL_LENGTH_IDX = 2
        private const val PETAL_WIDTH_IDX = 3
    }

    /**
     * CSV ファイルからデータを読み込む
     * 欠損値を含む行は除外される
     *
     * @param filePath CSV ファイルのパス
     * @return 特徴量と正解ラベルのペア
     */
    fun loadData(filePath: String): Pair<Array<DoubleArray>, Array<String>> {
        // CSVファイルを手動で読み込み（欠損値対応）
        val file = java.io.File(filePath)
        require(file.exists()) { "File not found: $filePath" }

        val lines = file.readLines()
        require(lines.isNotEmpty()) { "Empty file: $filePath" }

        // ヘッダー行を解析（BOMを除去）
        val headerLine = lines[0].replace("\uFEFF", "").trim()
        val header = headerLine.split(",").map { it.trim() }
        val sepalLengthIdx = header.indexOf("sepal_length")
        val sepalWidthIdx = header.indexOf("sepal_width")
        val petalLengthIdx = header.indexOf("petal_length")
        val petalWidthIdx = header.indexOf("petal_width")
        val speciesIdx = header.indexOf("species")

        requireAllColumnsPresent(sepalLengthIdx, sepalWidthIdx, petalLengthIdx, petalWidthIdx, speciesIdx)

        // データ行を読み込み（欠損値を含む行は除外）
        val validRows = mutableListOf<Pair<DoubleArray, String>>()

        for (i in 1 until lines.size) {
            val values = lines[i].split(",")
            if (values.size != header.size) continue

            parseDataRow(
                values,
                sepalLengthIdx,
                sepalWidthIdx,
                petalLengthIdx,
                petalWidthIdx,
                speciesIdx
            )?.let { validRows.add(it) }
        }

        require(validRows.isNotEmpty()) { "No valid data found in CSV" }

        val X = validRows.map { it.first }.toTypedArray()
        val y = validRows.map { it.second }.toTypedArray()

        return Pair(X, y)
    }

    /**
     * モデルを訓練する
     *
     * @param X 訓練用特徴量
     * @param y 訓練用正解ラベル
     */
    fun train(X: Array<DoubleArray>, y: Array<String>) {
        require(X.isNotEmpty() && y.isNotEmpty()) { "Training data cannot be empty" }
        require(X.size == y.size) {
            "X and y must have the same length: ${X.size} != ${y.size}"
        }

        // ラベルを整数にマッピング
        val uniqueLabels = y.distinct().sorted()
        val labelToInt = uniqueLabels.withIndex().associate { it.value to it.index }
        labelMapping = labelToInt.entries.associate { it.value to it.key }
        val yInt = y.map { labelToInt[it]!! }.toIntArray()

        // DataFrame を作成
        val data = DataFrame.of(
            DoubleVector.of("sepal_length", X.map { it[SEPAL_LENGTH_IDX] }.toDoubleArray()),
            DoubleVector.of("sepal_width", X.map { it[SEPAL_WIDTH_IDX] }.toDoubleArray()),
            DoubleVector.of("petal_length", X.map { it[PETAL_LENGTH_IDX] }.toDoubleArray()),
            DoubleVector.of("petal_width", X.map { it[PETAL_WIDTH_IDX] }.toDoubleArray()),
            IntVector.of("species", yInt)
        )

        // モデルの訓練
        val formula = Formula.lhs("species")
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
    fun predict(X: Array<DoubleArray>): Array<String> {
        requireNotNull(model) { "Model has not been trained yet" }

        // DataFrameを作成（ダミーのspecies列を含める）
        val dummySpecies = IntArray(X.size) { 0 }  // ダミー値
        val testData = DataFrame.of(
            DoubleVector.of("sepal_length", X.map { it[SEPAL_LENGTH_IDX] }.toDoubleArray()),
            DoubleVector.of("sepal_width", X.map { it[SEPAL_WIDTH_IDX] }.toDoubleArray()),
            DoubleVector.of("petal_length", X.map { it[PETAL_LENGTH_IDX] }.toDoubleArray()),
            DoubleVector.of("petal_width", X.map { it[PETAL_WIDTH_IDX] }.toDoubleArray()),
            IntVector.of("species", dummySpecies)
        )

        // 予測を実行
        val predictions = model!!.predict(testData)

        return predictions.map { prediction ->
            labelMapping[prediction] ?: error("Unknown prediction: $prediction")
        }.toTypedArray()
    }

    /**
     * モデルの性能を評価する
     *
     * @param X テスト用特徴量
     * @param y テスト用正解ラベル
     * @return 正解率（0.0 〜 1.0）
     */
    fun evaluate(X: Array<DoubleArray>, y: Array<String>): Double {
        requireNotNull(model) { "Model has not been trained yet" }

        val predictions = predict(X)
        val correct = predictions.zip(y).count { (pred, actual) -> pred == actual }
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
    @Suppress("LongParameterList")
    private fun requireAllColumnsPresent(
        sepalLengthIdx: Int,
        sepalWidthIdx: Int,
        petalLengthIdx: Int,
        petalWidthIdx: Int,
        speciesIdx: Int
    ) {
        require(sepalLengthIdx >= 0) { "sepal_length column not found" }
        require(sepalWidthIdx >= 0) { "sepal_width column not found" }
        require(petalLengthIdx >= 0) { "petal_length column not found" }
        require(petalWidthIdx >= 0) { "petal_width column not found" }
        require(speciesIdx >= 0) { "species column not found" }
    }

    /**
     * CSV の 1 行をパースして特徴量とラベルのペアを返す
     * 欠損値やパースエラーがある場合は null を返す
     */
    @Suppress("LongParameterList", "CyclomaticComplexMethod", "ComplexCondition")
    private fun parseDataRow(
        values: List<String>,
        sepalLengthIdx: Int,
        sepalWidthIdx: Int,
        petalLengthIdx: Int,
        petalWidthIdx: Int,
        speciesIdx: Int
    ): Pair<DoubleArray, String>? {
        // 全ての値が空でないか確認
        if (values[sepalLengthIdx].isBlank() ||
            values[sepalWidthIdx].isBlank() ||
            values[petalLengthIdx].isBlank() ||
            values[petalWidthIdx].isBlank() ||
            values[speciesIdx].isBlank()
        ) {
            return null
        }

        return try {
            val features = doubleArrayOf(
                values[sepalLengthIdx].toDouble(),
                values[sepalWidthIdx].toDouble(),
                values[petalLengthIdx].toDouble(),
                values[petalWidthIdx].toDouble()
            )
            val label = values[speciesIdx].trim()
            Pair(features, label)
        } catch (e: NumberFormatException) {
            null
        }
    }
}
