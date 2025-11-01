package ml.api

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf

class ServiceTest : FunSpec({
    test("predict_iris が正しく動作する") {
        val service = MLService()
        val result = service.predictIris(arrayOf(doubleArrayOf(5.1, 3.5, 1.4, 0.2)))

        result.shouldBeInstanceOf<String>()
        listOf("setosa", "versicolor", "virginica") shouldContain result
    }

    test("predict_cinema が正しく動作する") {
        val service = MLService()
        val result = service.predictCinema(arrayOf(doubleArrayOf(500.0, 300.0, 70.0, 1.0)))

        result.shouldBeInstanceOf<Double>()
        (result > 0) shouldBe true
    }

    test("predict_survived が正しく動作する") {
        val service = MLService()
        val result = service.predictSurvived(pclass = 3, age = 22, sex = "male")

        result.shouldBeInstanceOf<Int>()
        listOf(0, 1) shouldContain result
    }

    test("predict_boston が正しく動作する").config(enabled = false) {
        val service = MLService()
        val result = service.predictBoston(rm = 6.5, lstat = 4.98, ptratio = 15.3)

        result.shouldBeInstanceOf<Double>()
        (result > 0) shouldBe true
    }
})
