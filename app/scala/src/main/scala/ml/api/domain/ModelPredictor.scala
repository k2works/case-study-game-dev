package ml.api.domain

import org.apache.spark.ml.PipelineModel
import org.apache.spark.sql.{DataFrame, SparkSession}

class ModelPredictor(spark: SparkSession) {

  private var irisModel: Option[PipelineModel] = None
  private var cinemaModel: Option[PipelineModel] = None
  private var survivedModel: Option[PipelineModel] = None
  private var bostonModel: Option[PipelineModel] = None

  // Iris モデルのロード
  def loadIrisModel(path: String): Unit = {
    irisModel = Some(PipelineModel.load(path))
  }

  // Iris 予測
  def predictIris(sepalLength: Double, sepalWidth: Double,
                  petalLength: Double, petalWidth: Double): String = {
    import spark.implicits._

    val data = Seq((sepalLength, sepalWidth, petalLength, petalWidth))
      .toDF("sepal_length", "sepal_width", "petal_length", "petal_width")

    val predictions = irisModel.get.transform(data)
    val predictionValue = predictions.select("prediction").first().getDouble(0).toInt

    predictionValue match {
      case 0 => "setosa"
      case 1 => "versicolor"
      case 2 => "virginica"
      case _ => "unknown"
    }
  }

  // Cinema モデルのロード
  def loadCinemaModel(path: String): Unit = {
    cinemaModel = Some(PipelineModel.load(path))
  }

  // Cinema 予測
  def predictCinema(budget: Double, popularity: Double,
                    runtime: Double, voteAverage: Double, genre: String): Double = {
    import spark.implicits._

    val data = Seq((budget, popularity, runtime, voteAverage, genre))
      .toDF("budget", "popularity", "runtime", "vote_average", "genre")

    val predictions = cinemaModel.get.transform(data)
    predictions.select("prediction").first().getDouble(0)
  }

  // Survived モデルのロード
  def loadSurvivedModel(path: String): Unit = {
    survivedModel = Some(PipelineModel.load(path))
  }

  // Survived 予測
  def predictSurvived(pclass: Int, sex: String, age: Double,
                      sibsp: Int, parch: Int, fare: Double, embarked: String): Int = {
    import spark.implicits._

    val data = Seq((pclass, sex, age, sibsp, parch, fare, embarked))
      .toDF("pclass", "sex", "age", "sibsp", "parch", "fare", "embarked")

    val predictions = survivedModel.get.transform(data)
    predictions.select("prediction").first().getDouble(0).toInt
  }

  // Boston モデルのロード
  def loadBostonModel(path: String): Unit = {
    bostonModel = Some(PipelineModel.load(path))
  }

  // Boston 予測
  def predictBoston(crim: Double, zn: Double, indus: Double, chas: Int,
                    nox: Double, rm: Double, age: Double, dis: Double,
                    rad: Int, tax: Double, ptratio: Double, b: Double,
                    lstat: Double): Double = {
    import spark.implicits._

    val data = Seq((crim, zn, indus, chas, nox, rm, age, dis, rad, tax, ptratio, b, lstat))
      .toDF("CRIM", "ZN", "INDUS", "CHAS", "NOX", "RM", "AGE", "DIS", "RAD", "TAX", "PTRATIO", "B", "LSTAT")

    val predictions = bostonModel.get.transform(data)
    predictions.select("prediction").first().getDouble(0)
  }
}

object ModelPredictor {
  def apply(spark: SparkSession): ModelPredictor = new ModelPredictor(spark)
}
