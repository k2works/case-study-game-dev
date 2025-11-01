package ml.api

import kotlinx.serialization.Serializable

/**
 * Iris 分類のリクエストモデル
 */
@Serializable
data class IrisRequest(
    val sepalLength: Double,
    val sepalWidth: Double,
    val petalLength: Double,
    val petalWidth: Double
) {
    init {
        require(sepalLength >= 0) { "sepal_length must be >= 0" }
        require(sepalWidth >= 0) { "sepal_width must be >= 0" }
        require(petalLength >= 0) { "petal_length must be >= 0" }
        require(petalWidth >= 0) { "petal_width must be >= 0" }
    }
}

/**
 * Iris 分類のレスポンスモデル
 */
@Serializable
data class IrisResponse(val species: String)

/**
 * Cinema 売上予測のリクエストモデル
 */
@Serializable
data class CinemaRequest(
    val sns1: Int,
    val sns2: Int,
    val actor: Int,
    val original: Int
) {
    init {
        require(sns1 >= 0) { "sns1 must be >= 0" }
        require(sns2 >= 0) { "sns2 must be >= 0" }
        require(actor in 0..100) { "actor must be in 0..100" }
        require(original in 0..1) { "original must be 0 or 1" }
    }
}

/**
 * Cinema 売上予測のレスポンスモデル
 */
@Serializable
data class CinemaResponse(val predictedSales: Double)

/**
 * Survived 生存予測のリクエストモデル
 */
@Serializable
data class SurvivedRequest(
    val pclass: Int,
    val age: Int,
    val sex: String
) {
    init {
        require(pclass in 1..3) { "pclass must be in 1..3" }
        require(age in 0..100) { "age must be in 0..100" }
        require(sex in listOf("male", "female")) { "sex must be 'male' or 'female'" }
    }
}

/**
 * Survived 生存予測のレスポンスモデル
 */
@Serializable
data class SurvivedResponse(val survived: Int)

/**
 * Boston 住宅価格予測のリクエストモデル
 */
@Serializable
data class BostonRequest(
    val rm: Double,
    val lstat: Double,
    val ptratio: Double
) {
    init {
        require(rm > 0) { "rm must be > 0" }
        require(lstat >= 0) { "lstat must be >= 0" }
        require(lstat <= 100) { "lstat must be <= 100" }
        require(ptratio > 0) { "ptratio must be > 0" }
    }
}

/**
 * Boston 住宅価格予測のレスポンスモデル
 */
@Serializable
data class BostonResponse(val predictedPrice: Double)
