package ml.api

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

// Iris 分類のリクエスト
case class IrisRequest(
  sepalLength: Double,
  sepalWidth: Double,
  petalLength: Double,
  petalWidth: Double
)

object IrisRequest {
  implicit val decoder: Decoder[IrisRequest] = deriveDecoder[IrisRequest]
}

// Cinema 興行収入予測のリクエスト
case class CinemaRequest(
  budget: Double,
  popularity: Double,
  runtime: Double,
  voteAverage: Double,
  genre: String
)

object CinemaRequest {
  implicit val decoder: Decoder[CinemaRequest] = deriveDecoder[CinemaRequest]
}

// Survived 生存予測のリクエスト
case class SurvivedRequest(
  pclass: Int,
  sex: String,
  age: Double,
  sibsp: Int,
  parch: Int,
  fare: Double,
  embarked: String
)

object SurvivedRequest {
  implicit val decoder: Decoder[SurvivedRequest] = deriveDecoder[SurvivedRequest]
}

// Boston 住宅価格予測のリクエスト
case class BostonRequest(
  crim: Double,
  zn: Double,
  indus: Double,
  chas: Int,
  nox: Double,
  rm: Double,
  age: Double,
  dis: Double,
  rad: Int,
  tax: Double,
  ptratio: Double,
  b: Double,
  lstat: Double
)

object BostonRequest {
  implicit val decoder: Decoder[BostonRequest] = deriveDecoder[BostonRequest]
}

// 予測結果のレスポンス
case class PredictionResponse(
  prediction: String
)

object PredictionResponse {
  implicit val encoder: Encoder[PredictionResponse] = deriveEncoder[PredictionResponse]
}

// エラーレスポンス
case class ErrorResponse(
  error: String
)

object ErrorResponse {
  implicit val encoder: Encoder[ErrorResponse] = deriveEncoder[ErrorResponse]
}
