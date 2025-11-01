package ml.api

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.types.shouldBeInstanceOf

class DomainTest : FunSpec({
    test("IrisDomain でモデルを読み込める") {
        val domain = IrisDomain()
        domain.model shouldNotBe null
    }

    test("IrisDomain で予測ができる") {
        val domain = IrisDomain()
        val X = arrayOf(doubleArrayOf(5.1, 3.5, 1.4, 0.2))
        val result = domain.predict(X)

        result.size shouldBe 1
        listOf("setosa", "versicolor", "virginica") shouldContain result[0]
    }

    test("CinemaDomain でモデルを読み込める") {
        val domain = CinemaDomain()
        domain.model shouldNotBe null
    }

    test("CinemaDomain で予測ができる") {
        val domain = CinemaDomain()
        val X = arrayOf(doubleArrayOf(500.0, 300.0, 70.0, 1.0))
        val result = domain.predict(X)

        result.size shouldBe 1
        result[0].shouldBeInstanceOf<Double>()
        (result[0] > 0) shouldBe true
    }

    test("SurvivedDomain でモデルを読み込める") {
        val domain = SurvivedDomain()
        domain.model shouldNotBe null
    }

    test("SurvivedDomain で予測ができる") {
        val domain = SurvivedDomain()
        val XDict = listOf(mapOf("Pclass" to 3.0, "Age" to 22.0, "male" to 1.0))
        val result = domain.predict(XDict)

        result.size shouldBe 1
        listOf(0, 1) shouldContain result[0]
    }

    test("BostonDomain でモデルを読み込める") {
        val domain = BostonDomain()
        domain.model shouldNotBe null
        domain.meanX shouldNotBe null
        domain.stdX shouldNotBe null
    }

    test("BostonDomain で予測ができる") {
        val domain = BostonDomain()
        val XDict = listOf(mapOf("RM" to 6.5, "LSTAT" to 4.98, "PTRATIO" to 15.3))
        val result = domain.predict(XDict)

        result.size shouldBe 1
        result[0].shouldBeInstanceOf<Double>()
        (result[0] > 0) shouldBe true
    }
})
