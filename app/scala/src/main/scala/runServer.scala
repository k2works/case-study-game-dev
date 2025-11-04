import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import ml.api.{ApiRoutes, SparkSessionManager}
import ml.api.domain.ModelPredictor
import ml.api.service.PredictionService

import scala.concurrent.ExecutionContextExecutor
import scala.io.StdIn
import java.io.File

object runServer {
  def main(args: Array[String]): Unit = {
    implicit val system: ActorSystem = ActorSystem("ml-api")
    implicit val executionContext: ExecutionContextExecutor = system.dispatcher

    println("=" * 50)
    println("ML API Server Starting...")
    println("=" * 50)
    println()

    val spark = SparkSessionManager.getOrCreate()

    val predictor = ModelPredictor(spark)

    // モデルファイルの存在確認とロード
    val modelPaths = Map(
      "iris" -> "model/iris_model",
      "cinema" -> "model/cinema_model",
      "survived" -> "model/survived_model",
      "boston" -> "model/boston_model"
    )

    modelPaths.foreach { case (name, path) =>
      if (new File(path).exists()) {
        try {
          name match {
            case "iris" => predictor.loadIrisModel(path)
            case "cinema" => predictor.loadCinemaModel(path)
            case "survived" => predictor.loadSurvivedModel(path)
            case "boston" => predictor.loadBostonModel(path)
          }
          println(s"✓ $name model loaded from $path")
        } catch {
          case e: Exception =>
            println(s"✗ Failed to load $name model: ${e.getMessage}")
        }
      } else {
        println(s"⚠ $name model not found at $path (skipping)")
      }
    }

    println()

    val service = PredictionService(predictor)
    val routes = ApiRoutes(service).routes

    val bindingFuture = Http().newServerAt("localhost", 8080).bind(routes)

    println("=" * 50)
    println("Server online at http://localhost:8080/")
    println("=" * 50)
    println()
    println("API Documentation:")
    println("  http://localhost:8080/swagger")
    println()
    println("Available endpoints:")
    println("  GET  /api/health          - Health check")
    println("  POST /api/predict/iris    - Iris classification")
    println("  POST /api/predict/cinema  - Cinema revenue prediction")
    println("  POST /api/predict/survived - Survived prediction")
    println("  POST /api/predict/boston  - Boston price prediction")
    println()
    println("Press RETURN to stop...")

    StdIn.readLine()

    bindingFuture
      .flatMap(_.unbind())
      .onComplete { _ =>
        SparkSessionManager.stop()
        system.terminate()
        println("\nServer stopped.")
      }
  }
}
