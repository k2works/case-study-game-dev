package ml.api.service

import ml.api.{IrisRequest, CinemaRequest, SurvivedRequest, BostonRequest, PredictionResponse}
import ml.api.domain.ModelPredictor

class PredictionService(predictor: ModelPredictor) {

  def predictIris(request: IrisRequest): Either[String, PredictionResponse] = {
    if (request.sepalLength <= 0 || request.sepalWidth <= 0 ||
        request.petalLength <= 0 || request.petalWidth <= 0) {
      Left("All measurements must be positive")
    } else {
      try {
        val prediction = predictor.predictIris(
          request.sepalLength,
          request.sepalWidth,
          request.petalLength,
          request.petalWidth
        )
        Right(PredictionResponse(prediction))
      } catch {
        case e: NoSuchElementException =>
          Left("Model not loaded. Please ensure the model is loaded before prediction.")
        case e: Exception =>
          Left(s"Prediction failed: ${e.getMessage}")
      }
    }
  }

  def predictCinema(request: CinemaRequest): Either[String, PredictionResponse] = {
    if (request.budget <= 0 || request.popularity <= 0 || request.runtime <= 0) {
      Left("Budget, popularity, and runtime must be positive")
    } else {
      try {
        val revenue = predictor.predictCinema(
          request.budget,
          request.popularity,
          request.runtime,
          request.voteAverage,
          request.genre
        )
        Right(PredictionResponse(f"$revenue%.2f"))
      } catch {
        case e: Exception => Left(s"Prediction failed: ${e.getMessage}")
      }
    }
  }

  def predictSurvived(request: SurvivedRequest): Either[String, PredictionResponse] = {
    if (request.age < 0 || request.fare < 0) {
      Left("Age and fare must be non-negative")
    } else {
      try {
        val survived = predictor.predictSurvived(
          request.pclass,
          request.sex,
          request.age,
          request.sibsp,
          request.parch,
          request.fare,
          request.embarked
        )
        Right(PredictionResponse(if (survived == 1) "Survived" else "Not Survived"))
      } catch {
        case e: Exception => Left(s"Prediction failed: ${e.getMessage}")
      }
    }
  }

  def predictBoston(request: BostonRequest): Either[String, PredictionResponse] = {
    try {
      val price = predictor.predictBoston(
        request.crim, request.zn, request.indus, request.chas,
        request.nox, request.rm, request.age, request.dis,
        request.rad, request.tax, request.ptratio, request.b, request.lstat
      )
      Right(PredictionResponse(f"$price%.2f"))
    } catch {
      case e: Exception => Left(s"Prediction failed: ${e.getMessage}")
    }
  }
}

object PredictionService {
  def apply(predictor: ModelPredictor): PredictionService = new PredictionService(predictor)
}
