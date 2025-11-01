package ml.api

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class ModelsTest : FunSpec({
    test("IrisRequest の正常な値") {
        val model = IrisRequest(
            sepalLength = 5.1,
            sepalWidth = 3.5,
            petalLength = 1.4,
            petalWidth = 0.2
        )

        model.sepalLength shouldBe 5.1
        model.sepalWidth shouldBe 3.5
        model.petalLength shouldBe 1.4
        model.petalWidth shouldBe 0.2
    }

    test("IrisRequest の負の値でエラー") {
        shouldThrow<IllegalArgumentException> {
            IrisRequest(
                sepalLength = -1.0,
                sepalWidth = 3.5,
                petalLength = 1.4,
                petalWidth = 0.2
            )
        }
    }

    test("CinemaRequest の正常な値") {
        val model = CinemaRequest(
            sns1 = 500,
            sns2 = 300,
            actor = 70,
            original = 1
        )

        model.sns1 shouldBe 500
        model.sns2 shouldBe 300
        model.actor shouldBe 70
        model.original shouldBe 1
    }

    test("CinemaRequest の actor 範囲外でエラー") {
        shouldThrow<IllegalArgumentException> {
            CinemaRequest(
                sns1 = 500,
                sns2 = 300,
                actor = 150,  // 100 を超える
                original = 1
            )
        }
    }

    test("SurvivedRequest の正常な値") {
        val model = SurvivedRequest(
            pclass = 3,
            age = 22,
            sex = "male"
        )

        model.pclass shouldBe 3
        model.age shouldBe 22
        model.sex shouldBe "male"
    }

    test("SurvivedRequest の不正な sex でエラー") {
        shouldThrow<IllegalArgumentException> {
            SurvivedRequest(pclass = 1, age = 30, sex = "unknown")
        }
    }

    test("BostonRequest の正常な値") {
        val model = BostonRequest(
            rm = 6.5,
            lstat = 4.98,
            ptratio = 15.3
        )

        model.rm shouldBe 6.5
        model.lstat shouldBe 4.98
        model.ptratio shouldBe 15.3
    }

    test("BostonRequest の負の rm でエラー") {
        shouldThrow<IllegalArgumentException> {
            BostonRequest(rm = -1.0, lstat = 4.98, ptratio = 15.3)
        }
    }
})
