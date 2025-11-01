@file:Suppress("WildcardImport")

package ml

import krangl.*
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
import kotlin.math.pow
import kotlin.math.sqrt

/**
 * Boston 住宅価格予測器
 *
 * 特徴量エンジニアリング、データ標準化、データリーケージ防止を実装した
 * 高度な回帰予測モデル
 *
 * @property model 訓練済みの線形回帰モデル
 * @property meanX 特徴量の平均値（標準化用）
 * @property stdX 特徴量の標準偏差（標準化用）
 * @property meanY 目的変数の平均値（標準化用）
 * @property stdY 目的変数の標準偏差（標準化用）
 * @property trainMean 訓練データの列ごとの平均値（欠損値補完用）
 */
@Suppress("VariableNaming", "FunctionParameterNaming", "TooManyFunctions")
class BostonPredictor : Serializable {
    var model: LinearModel? = null
        private set

    private var meanX: DoubleArray? = null
    private var stdX: DoubleArray? = null
    private var meanY: Double? = null
    private var stdY: Double? = null
    private var trainMean: Map<String, Double>? = null

    companion object {
        private const val serialVersionUID = 1L
        private const val CRIME_THRESHOLD = 0.25
        private const val OUTLIER_RM_VALUE = 8.398
    }

    /**
     * CSV ファイルからデータを読み込む
     *
     * @param filePath CSV ファイルのパス
     * @return DataFrame
     * @throws IllegalArgumentException ファイルが存在しない、または必要な列が不足している場合
     */
    fun loadData(filePath: String): DataFrame {
        val file = File(filePath)
        require(file.exists()) { "File not found: $filePath" }

        val df = DataFrame.readCSV(filePath)

        // 必要な列の存在チェック
        val requiredColumns = listOf("CRIM", "RM", "LSTAT", "PTRATIO", "PRICE")
        val missingColumns = requiredColumns.filter { !df.names.contains(it) }
        require(missingColumns.isEmpty()) { "Missing required columns: $missingColumns" }

        return df
    }

    /**
     * CRIME 列をダミー変数化する
     *
     * CRIME >= 0.25 を「高」、それ以外を「低」として CRIM_high 列を作成
     *
     * @param df 入力DataFrame
     * @return ダミー変数化されたDataFrame
     */
    fun encodeCrime(df: DataFrame): DataFrame {
        val crimHigh = df["CRIM"].values().map { value ->
            val crim = (value as? Number)?.toDouble() ?: 0.0
            if (crim >= CRIME_THRESHOLD) 1.0 else 0.0
        }

        // CRIM列を除外して、CRIM_high列を追加
        return df.remove("CRIM").addColumn("CRIM_high") { crimHigh }
    }

    /**
     * 欠損値を補完する
     *
     * データリーケージ防止のため、訓練データの統計量のみを使用
     *
     * @param df 補完対象のDataFrame
     * @param dfTrain 訓練データ（統計量計算用）
     * @return 欠損値が補完されたDataFrame
     */
    fun fillMissingValues(df: DataFrame, dfTrain: DataFrame): DataFrame {
        // 訓練データの平均を計算（最初の呼び出し時のみ）
        if (trainMean == null) {
            trainMean = calculateColumnMeans(dfTrain)
        }

        // 欠損値を訓練データの平均で補完
        return fillMissingWithMean(df, trainMean!!)
    }

    /**
     * DataFrame の列ごとの平均値を計算する
     */
    private fun calculateColumnMeans(df: DataFrame): Map<String, Double> {
        val means = mutableMapOf<String, Double>()
        df.names.forEach { colName ->
            val values = extractValidNumbers(df[colName].values().toList())
            if (values.isNotEmpty()) {
                means[colName] = values.average()
            }
        }
        return means
    }

    /**
     * 有効な数値のみを抽出する
     */
    private fun extractValidNumbers(values: List<Any?>): List<Double> {
        return values.mapNotNull { value ->
            when {
                value is Double && !value.isNaN() -> value
                value is Number -> value.toDouble()
                else -> null
            }
        }
    }

    /**
     * 欠損値を平均値で補完する
     */
    private fun fillMissingWithMean(df: DataFrame, means: Map<String, Double>): DataFrame {
        var result = df
        df.names.forEach { colName ->
            val mean = means[colName] ?: 0.0
            val filledValues = fillColumnWithMean(df[colName].values().toList(), mean)
            result = result.remove(colName).addColumn(colName) { filledValues }
        }
        return result
    }

    /**
     * 列の欠損値を平均値で補完する
     */
    private fun fillColumnWithMean(values: List<Any?>, mean: Double): List<Double> {
        return values.map { value ->
            when {
                value == null -> mean
                value is Double && value.isNaN() -> mean
                value is Double -> value
                value is Number -> value.toDouble()
                else -> mean
            }
        }
    }

    /**
     * 外れ値を除外する
     *
     * Boston データセット特有の外れ値（RM=8.398）を除外
     *
     * @param df 入力DataFrame
     * @return 外れ値が除外されたDataFrame
     */
    fun removeOutliers(df: DataFrame): DataFrame {
        return df.filterByRow { row ->
            val rm = (row["RM"] as? Number)?.toDouble() ?: 0.0
            rm != OUTLIER_RM_VALUE
        }
    }

    /**
     * 2乗項を追加する
     *
     * 各特徴量の2乗項を新しい特徴量として追加
     *
     * @param X 入力特徴量
     * @return 2乗項が追加された特徴量
     */
    fun addPolynomialFeatures(X: Array<DoubleArray>): Array<DoubleArray> {
        return X.map { row ->
            val polynomial = row.map { it.pow(2) }.toDoubleArray()
            row + polynomial
        }.toTypedArray()
    }

    /**
     * 交互作用項を追加する
     *
     * 最初の2つの特徴量の積を新しい特徴量として追加
     *
     * @param X 入力特徴量
     * @return 交互作用項が追加された特徴量
     */
    fun addInteractionFeatures(X: Array<DoubleArray>): Array<DoubleArray> {
        return X.map { row ->
            if (row.size >= 2) {
                row + doubleArrayOf(row[0] * row[1])
            } else {
                row
            }
        }.toTypedArray()
    }

    /**
     * 特徴量の標準化をフィット
     *
     * @param X 訓練データ
     */
    fun fitScaler(X: Array<DoubleArray>) {
        val numFeatures = X[0].size

        meanX = DoubleArray(numFeatures) { featureIdx ->
            X.map { it[featureIdx] }.average()
        }

        stdX = DoubleArray(numFeatures) { featureIdx ->
            val mean = meanX!![featureIdx]
            val variance = X.map { (it[featureIdx] - mean).pow(2) }.average()
            sqrt(variance)
        }
    }

    /**
     * 特徴量を標準化する
     *
     * @param X 入力特徴量
     * @return 標準化された特徴量
     * @throws IllegalStateException fitScaler を先に呼び出していない場合
     */
    fun transformScaler(X: Array<DoubleArray>): Array<DoubleArray> {
        check(meanX != null && stdX != null) { "Scaler not fitted. Call fitScaler first." }

        return X.map { row ->
            DoubleArray(row.size) { idx ->
                val std = stdX!![idx]
                if (std == 0.0) {
                    0.0
                } else {
                    (row[idx] - meanX!![idx]) / std
                }
            }
        }.toTypedArray()
    }

    /**
     * 目的変数の標準化をフィット
     *
     * @param y 訓練データの目的変数
     */
    fun fitTargetScaler(y: DoubleArray) {
        meanY = y.average()
        val variance = y.map { (it - meanY!!).pow(2) }.average()
        stdY = sqrt(variance)
    }

    /**
     * 目的変数を標準化する
     *
     * @param y 入力目的変数
     * @return 標準化された目的変数
     */
    fun transformTargetScaler(y: DoubleArray): DoubleArray {
        return if (stdY == 0.0) {
            DoubleArray(y.size) { 0.0 }
        } else {
            y.map { (it - meanY!!) / stdY!! }.toDoubleArray()
        }
    }

    /**
     * 目的変数を逆標準化する
     *
     * @param yScaled 標準化された目的変数
     * @return 元のスケールに戻された目的変数
     */
    fun inverseTransformTargetScaler(yScaled: DoubleArray): DoubleArray {
        return yScaled.map { it * stdY!! + meanY!! }.toDoubleArray()
    }

    /**
     * モデルを訓練する
     *
     * @param X 訓練データの特徴量
     * @param y 訓練データの目的変数
     * @throws IllegalArgumentException 訓練データが空、またはXとyのサイズが異なる場合
     */
    fun train(X: Array<DoubleArray>, y: DoubleArray) {
        require(X.isNotEmpty()) { "Training data cannot be empty" }
        require(X.size == y.size) { "X and y must have the same number of samples" }

        // 特徴量エンジニアリング
        val XPoly = addPolynomialFeatures(X)
        val XEngineered = addInteractionFeatures(XPoly)

        // 標準化
        fitScaler(XEngineered)
        val XScaled = transformScaler(XEngineered)

        fitTargetScaler(y)
        val yScaled = transformTargetScaler(y)

        // モデル訓練（Smile の Formula API を使用）
        val numFeatures = XScaled[0].size
        val vectors = mutableListOf<DoubleVector>()

        for (idx in 0 until numFeatures) {
            vectors.add(DoubleVector.of("x$idx", XScaled.map { it[idx] }.toDoubleArray()))
        }
        vectors.add(DoubleVector.of("price", yScaled))

        @Suppress("SpreadOperator")
        val data = SmileDataFrame.of(*vectors.toTypedArray())
        val formula = Formula.lhs("price")
        model = OLS.fit(formula, data)
    }

    /**
     * 予測を実行する
     *
     * @param X テストデータの特徴量
     * @return 予測値
     * @throws IllegalStateException モデルが未訓練の場合
     */
    fun predict(X: Array<DoubleArray>): DoubleArray {
        check(model != null) { "Model not trained. Call train first." }

        // 訓練時と同じ特徴量エンジニアリングを適用
        val XPoly = addPolynomialFeatures(X)
        val XEngineered = addInteractionFeatures(XPoly)

        // 標準化
        val XScaled = transformScaler(XEngineered)

        // 予測（標準化されたスケール）
        val yScaledPred = XScaled.map { row ->
            model!!.predict(row)
        }.toDoubleArray()

        // 逆標準化して元のスケールに戻す
        return inverseTransformTargetScaler(yScaledPred)
    }

    /**
     * モデルを評価する
     *
     * @param X テストデータの特徴量
     * @param y テストデータの目的変数
     * @return R² 決定係数
     */
    fun evaluate(X: Array<DoubleArray>, y: DoubleArray): Double {
        val predictions = predict(X)

        // R² 計算
        val yMean = y.average()
        val ssTot = y.map { (it - yMean).pow(2) }.sum()
        val ssRes = y.zip(predictions).map { (actual, pred) ->
            (actual - pred).pow(2)
        }.sum()

        return 1.0 - (ssRes / ssTot)
    }

    /**
     * モデルとスケーラーを保存する
     *
     * @param filePath 保存先のファイルパス
     * @throws IllegalStateException モデルが未訓練の場合
     */
    fun saveModels(filePath: String) {
        check(model != null) { "Model not trained. Cannot save." }

        ObjectOutputStream(FileOutputStream(filePath)).use { oos ->
            oos.writeObject(this)
        }
    }

    /**
     * モデルとスケーラーを読み込む
     *
     * @param filePath 読み込み元のファイルパス
     */
    fun loadModels(filePath: String) {
        ObjectInputStream(FileInputStream(filePath)).use { ois ->
            val loaded = ois.readObject() as BostonPredictor
            this.model = loaded.model
            this.meanX = loaded.meanX
            this.stdX = loaded.stdX
            this.meanY = loaded.meanY
            this.stdY = loaded.stdY
            this.trainMean = loaded.trainMean
        }
    }
}
