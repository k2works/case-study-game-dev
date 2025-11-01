package ml.api

/**
 * 機械学習サービス層（Lazy Loading 対応）
 */
class MLService {
    // 初回アクセス時にモデルを読み込み、以降は再利用
    private var _irisDomain: IrisDomain? = null
    private var _cinemaDomain: CinemaDomain? = null
    private var _survivedDomain: SurvivedDomain? = null
    private var _bostonDomain: BostonDomain? = null

    private val irisDomain: IrisDomain
        get() {
            if (_irisDomain == null) {
                _irisDomain = IrisDomain()
            }
            return _irisDomain!!
        }

    private val cinemaDomain: CinemaDomain
        get() {
            if (_cinemaDomain == null) {
                _cinemaDomain = CinemaDomain()
            }
            return _cinemaDomain!!
        }

    private val survivedDomain: SurvivedDomain
        get() {
            if (_survivedDomain == null) {
                _survivedDomain = SurvivedDomain()
            }
            return _survivedDomain!!
        }

    private val bostonDomain: BostonDomain
        get() {
            if (_bostonDomain == null) {
                _bostonDomain = BostonDomain()
            }
            return _bostonDomain!!
        }

    fun predictIris(features: Array<DoubleArray>): String {
        val predictions = irisDomain.predict(features)
        return predictions[0]
    }

    fun predictCinema(features: Array<DoubleArray>): Double {
        val predictions = cinemaDomain.predict(features)
        return predictions[0]
    }

    fun predictSurvived(pclass: Int, age: Int, sex: String): Int {
        val male = if (sex == "male") 1.0 else 0.0
        val XDict = listOf(
            mapOf(
                "Pclass" to pclass.toDouble(),
                "Age" to age.toDouble(),
                "male" to male
            )
        )
        val predictions = survivedDomain.predict(XDict)
        return predictions[0]
    }

    fun predictBoston(rm: Double, lstat: Double, ptratio: Double): Double {
        val XDict = listOf(
            mapOf(
                "RM" to rm,
                "LSTAT" to lstat,
                "PTRATIO" to ptratio
            )
        )
        val predictions = bostonDomain.predict(XDict)
        return predictions[0]
    }
}
