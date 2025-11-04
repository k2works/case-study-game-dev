package ml.api

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import io.circe.parser._
import io.circe.syntax._

class ModelsSpec extends AnyFlatSpec with Matchers {

  "IrisRequest" should "JSON からデコードできる" in {
    val json = """
      {
        "sepalLength": 5.1,
        "sepalWidth": 3.5,
        "petalLength": 1.4,
        "petalWidth": 0.2
      }
    """

    val result = decode[IrisRequest](json)

    result.isRight shouldBe true
    result.toOption.get.sepalLength shouldBe 5.1
    result.toOption.get.sepalWidth shouldBe 3.5
  }

  "CinemaRequest" should "JSON からデコードできる" in {
    val json = """
      {
        "budget": 50000.0,
        "popularity": 85.5,
        "runtime": 120.0,
        "voteAverage": 7.5,
        "genre": "Action"
      }
    """

    val result = decode[CinemaRequest](json)

    result.isRight shouldBe true
    result.toOption.get.budget shouldBe 50000.0
    result.toOption.get.genre shouldBe "Action"
  }

  "SurvivedRequest" should "JSON からデコードできる" in {
    val json = """
      {
        "pclass": 1,
        "sex": "female",
        "age": 29.0,
        "sibsp": 0,
        "parch": 0,
        "fare": 211.34,
        "embarked": "S"
      }
    """

    val result = decode[SurvivedRequest](json)

    result.isRight shouldBe true
    result.toOption.get.pclass shouldBe 1
    result.toOption.get.sex shouldBe "female"
  }

  "BostonRequest" should "JSON からデコードできる" in {
    val json = """
      {
        "crim": 0.00632,
        "zn": 18.0,
        "indus": 2.31,
        "chas": 0,
        "nox": 0.538,
        "rm": 6.575,
        "age": 65.2,
        "dis": 4.09,
        "rad": 1,
        "tax": 296.0,
        "ptratio": 15.3,
        "b": 396.9,
        "lstat": 4.98
      }
    """

    val result = decode[BostonRequest](json)

    result.isRight shouldBe true
    result.toOption.get.rm shouldBe 6.575
    result.toOption.get.lstat shouldBe 4.98
  }

  "PredictionResponse" should "JSON にエンコードできる" in {
    val response = PredictionResponse("setosa")

    val json = response.asJson.noSpaces

    json should include("setosa")
  }

  "ErrorResponse" should "JSON にエンコードできる" in {
    val response = ErrorResponse("Invalid input")

    val json = response.asJson.noSpaces

    json should include("Invalid input")
  }
}
