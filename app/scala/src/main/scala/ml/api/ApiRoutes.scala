package ml.api

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.model.{StatusCodes, ContentTypes, HttpEntity}
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport._
import ml.api.service.PredictionService

class ApiRoutes(service: PredictionService) {

  // Swagger UI の HTML
  private val swaggerUiHtml = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>ML API Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui.css">
        <style>
            html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
            *, *:before, *:after { box-sizing: inherit; }
            body { margin:0; padding:0; }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-standalone-preset.js"></script>
        <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: "/api-docs/swagger.json",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
            window.ui = ui;
        }
        </script>
    </body>
    </html>
  """

  val routes: Route = concat(
    // Swagger UI
    pathPrefix("swagger") {
      pathEndOrSingleSlash {
        get {
          complete(HttpEntity(ContentTypes.`text/html(UTF-8)`, swaggerUiHtml))
        }
      }
    },
    // Swagger JSON
    new SwaggerDocService().routes,
    // API エンドポイント
    pathPrefix("api") {
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
  )
}

object ApiRoutes {
  def apply(service: PredictionService): ApiRoutes = new ApiRoutes(service)
}
