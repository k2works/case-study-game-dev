package ml.api

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.model.StatusCodes
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport._
import ml.api.service.PredictionService

class ApiRoutes(service: PredictionService) {

  val routes: Route = pathPrefix("api") {
    concat(
      path("health") {
        get {
          complete(StatusCodes.OK, "OK")
        }
      },
      path("predict" / "iris") {
        post {
          entity(as[IrisRequest]) { request =>
            service.predictIris(request) match {
              case Right(response) =>
                complete(StatusCodes.OK, response)
              case Left(error) =>
                complete(StatusCodes.BadRequest, ErrorResponse(error))
            }
          }
        }
      },
      path("predict" / "cinema") {
        post {
          entity(as[CinemaRequest]) { request =>
            service.predictCinema(request) match {
              case Right(response) =>
                complete(StatusCodes.OK, response)
              case Left(error) =>
                complete(StatusCodes.BadRequest, ErrorResponse(error))
            }
          }
        }
      },
      path("predict" / "survived") {
        post {
          entity(as[SurvivedRequest]) { request =>
            service.predictSurvived(request) match {
              case Right(response) =>
                complete(StatusCodes.OK, response)
              case Left(error) =>
                complete(StatusCodes.BadRequest, ErrorResponse(error))
            }
          }
        }
      },
      path("predict" / "boston") {
        post {
          entity(as[BostonRequest]) { request =>
            service.predictBoston(request) match {
              case Right(response) =>
                complete(StatusCodes.OK, response)
              case Left(error) =>
                complete(StatusCodes.BadRequest, ErrorResponse(error))
            }
          }
        }
      }
    )
  }
}

object ApiRoutes {
  def apply(service: PredictionService): ApiRoutes = new ApiRoutes(service)
}
