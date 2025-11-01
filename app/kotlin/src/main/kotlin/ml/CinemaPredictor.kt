package ml

import smile.data.DataFrame as SmileDataFrame
import smile.data.formula.Formula
import smile.data.vector.DoubleVector
import smile.regression.LinearModel
import smile.regression.OLS
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.ObjectInputStream
import java.io.ObjectOutputStream
import java.io.Serializable
import kotlin.math.abs
import kotlin.math.pow
import kotlin.math.sqrt

/**
 * 映画興行収入を予測する線形回帰モデル
 *
 * @property model 訓練済みの線形回帰モデル（未訓練時は null）
 */
class CinemaPredictor : Serializable {

    var model: LinearModel? = null
        private set

    companion object {
        private const val serialVersionUID = 1L
        private const val OUTLIER_SNS2_THRESHOLD = 1000.0
        private const val OUTLIER_SALES_THRESHOLD = 8500.0

        // 特徴量のインデックス
        private const val FEATURE_SNS1_IDX = 0
        private const val FEATURE_SNS2_IDX = 1
        private const val FEATURE_ACTOR_IDX = 2
        private const val FEATURE_ORIGINAL_IDX = 3
    }

    /**
     * CSV ファイルからデータを読み込む
     *
     * @param filePath CSV ファイルのパス
     * @param removeOutliers 外れ値を除外するかどうか
     * @return 特徴量と目的変数のペア
     */
    fun loadData(filePath: String, removeOutliers: Boolean = true): Pair<Array<DoubleArray>, DoubleArray> {
        val file = File(filePath)
        require(file.exists()) { "File not found: $filePath" }

        val lines = file.readLines()
        require(lines.isNotEmpty()) { "Empty file: $filePath" }

        // ヘッダー行を解析（BOMを除去）
        val headerLine = lines[0].replace("\uFEFF", "").trim()
        val header = headerLine.split(",").map { it.trim() }

        // 必要な列のインデックスを取得
        val sns1Idx = header.indexOfFirst { it.equals("SNS1", ignoreCase = true) }
        val sns2Idx = header.indexOfFirst { it.equals("SNS2", ignoreCase = true) }
        val actorIdx = header.indexOfFirst { it.equals("actor", ignoreCase = true) }
        val originalIdx = header.indexOfFirst { it.equals("original", ignoreCase = true) }
        val salesIdx = header.indexOfFirst { it.equals("sales", ignoreCase = true) }

        require(sns1Idx >= 0 && sns2Idx >= 0 && actorIdx >= 0 && originalIdx >= 0 && salesIdx >= 0) {
            "Required columns not found in CSV"
        }

        // 第1パス: 欠損値を含まない行から平均値を計算
        val sns1Values = mutableListOf<Double>()
        val sns2Values = mutableListOf<Double>()
        val actorValues = mutableListOf<Double>()
        val originalValues = mutableListOf<Double>()
        val salesValues = mutableListOf<Double>()

        for (i in 1 until lines.size) {
            val values = lines[i].split(",")
            if (values.size != header.size) continue

            // 値を取得（空白でない場合のみ）
            values.getOrNull(sns1Idx)?.trim()?.toDoubleOrNull()?.let { sns1Values.add(it) }
            values.getOrNull(sns2Idx)?.trim()?.toDoubleOrNull()?.let { sns2Values.add(it) }
            values.getOrNull(actorIdx)?.trim()?.toDoubleOrNull()?.let { actorValues.add(it) }
            values.getOrNull(originalIdx)?.trim()?.toDoubleOrNull()?.let { originalValues.add(it) }
            values.getOrNull(salesIdx)?.trim()?.toDoubleOrNull()?.let { salesValues.add(it) }
        }

        // 平均値を計算
        val sns1Mean = if (sns1Values.isNotEmpty()) sns1Values.average() else 0.0
        val sns2Mean = if (sns2Values.isNotEmpty()) sns2Values.average() else 0.0
        val actorMean = if (actorValues.isNotEmpty()) actorValues.average() else 0.0
        val originalMean = if (originalValues.isNotEmpty()) originalValues.average() else 0.0

        // 第2パス: データ行を読み込み（欠損値を平均値で補完）
        val dataRows = lines.drop(1)
            .map { it.split(",") }
            .filter { it.size == header.size }
            .mapNotNull { values ->
                parseDataRow(
                    values, sns1Idx, sns2Idx, actorIdx, originalIdx, salesIdx,
                    sns1Mean, sns2Mean, actorMean, originalMean, removeOutliers
                )
            }

        // X と y に分割
        val X = Array(dataRows.size) { dataRows[it].first }
        val y = DoubleArray(dataRows.size) { dataRows[it].second }

        return Pair(X, y)
    }

    /**
     * CSVの1行をパースしてデータ行に変換する
     */
    private fun parseDataRow(
        values: List<String>,
        sns1Idx: Int,
        sns2Idx: Int,
        actorIdx: Int,
        originalIdx: Int,
        salesIdx: Int,
        sns1Mean: Double,
        sns2Mean: Double,
        actorMean: Double,
        originalMean: Double,
        removeOutliers: Boolean
    ): Pair<DoubleArray, Double>? {
        return try {
            // 各値を取得（欠損値は平均値で補完）
            val sns1 = values[sns1Idx].trim().toDoubleOrNull() ?: sns1Mean
            val sns2 = values[sns2Idx].trim().toDoubleOrNull() ?: sns2Mean
            val actor = values[actorIdx].trim().toDoubleOrNull() ?: actorMean
            val original = values[originalIdx].trim().toDoubleOrNull() ?: originalMean
            val sales = values[salesIdx].trim().toDoubleOrNull() ?: return null

            // 外れ値チェック
            if (removeOutliers && isOutlier(sns2, sales)) {
                return null
            }

            val features = doubleArrayOf(sns1, sns2, actor, original)
            Pair(features, sales)
        } catch (e: Exception) {
            null
        }
    }

    /**
     * 外れ値かどうかを判定する
     */
    private fun isOutlier(sns2: Double, sales: Double): Boolean {
        return sns2 > OUTLIER_SNS2_THRESHOLD && sales < OUTLIER_SALES_THRESHOLD
    }

    /**
     * 線形回帰モデルを訓練する
     *
     * @param X 訓練用特徴量
     * @param y 訓練用目的変数
     */
    fun train(X: Array<DoubleArray>, y: DoubleArray) {
        require(X.isNotEmpty() && y.isNotEmpty()) { "Training data cannot be empty" }
        require(X.size == y.size) {
            "X and y must have the same length: ${X.size} != ${y.size}"
        }

        // DataFrame を作成
        val data = SmileDataFrame.of(
            DoubleVector.of("SNS1", X.map { it[FEATURE_SNS1_IDX] }.toDoubleArray()),
            DoubleVector.of("SNS2", X.map { it[FEATURE_SNS2_IDX] }.toDoubleArray()),
            DoubleVector.of("actor", X.map { it[FEATURE_ACTOR_IDX] }.toDoubleArray()),
            DoubleVector.of("original", X.map { it[FEATURE_ORIGINAL_IDX] }.toDoubleArray()),
            DoubleVector.of("sales", y)
        )

        // モデルの訓練
        val formula = Formula.lhs("sales")
        model = OLS.fit(formula, data)
    }

    /**
     * 興行収入を予測する
     *
     * @param X テスト用特徴量
     * @return 予測された興行収入の配列
     */
    fun predict(X: Array<DoubleArray>): DoubleArray {
        requireNotNull(model) { "Model has not been trained yet" }

        return X.map { x ->
            model!!.predict(x)
        }.toDoubleArray()
    }

    /**
     * モデルの性能を評価する
     *
     * @param X テスト用特徴量
     * @param y テスト用目的変数
     * @return 評価指標のマップ（r2Score, mae, rmse）
     */
    fun evaluate(X: Array<DoubleArray>, y: DoubleArray): Map<String, Double> {
        requireNotNull(model) { "Model has not been trained yet" }

        val predictions = predict(X)

        // R² スコアの計算
        val yMean = y.average()
        val ssTot = y.sumOf { (it - yMean).pow(2) }
        val ssRes = y.zip(predictions).sumOf { (actual, pred) -> (actual - pred).pow(2) }
        val r2Score = 1.0 - (ssRes / ssTot)

        // MAE (Mean Absolute Error) の計算
        val mae = y.zip(predictions).sumOf { (actual, pred) -> abs(actual - pred) } / y.size

        // RMSE (Root Mean Squared Error) の計算
        val mse = y.zip(predictions).sumOf { (actual, pred) -> (actual - pred).pow(2) } / y.size
        val rmse = sqrt(mse)

        return mapOf(
            "r2Score" to r2Score,
            "mae" to mae,
            "rmse" to rmse
        )
    }

    /**
     * 訓練済みモデルをファイルに保存する
     */
    fun saveModel(filePath: String) {
        requireNotNull(model) { "No trained model to save" }

        ObjectOutputStream(FileOutputStream(filePath)).use { oos ->
            oos.writeObject(model)
        }
    }

    /**
     * 保存されたモデルをファイルから読み込む
     */
    fun loadModel(filePath: String) {
        ObjectInputStream(FileInputStream(filePath)).use { ois ->
            @Suppress("UNCHECKED_CAST")
            model = ois.readObject() as LinearModel
        }
    }
}
