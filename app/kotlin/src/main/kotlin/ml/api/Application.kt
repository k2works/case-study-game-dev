package ml.api

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.openapi.*
import io.ktor.server.plugins.swagger.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException

val service = MLService()

@Serializable
data class MessageResponse(
    val message: String,
    val version: String,
    val endpoints: List<String>
)

@Serializable
data class HealthResponse(val status: String)

@Serializable
data class ErrorResponse(val error: String)

fun Application.configureRouting() {
    install(ContentNegotiation) {
        json()
    }

    routing {
        // Swagger UI と OpenAPI ドキュメント
        swaggerUI(path = "swagger-ui")
        openAPI(path = "openapi")

        get("/") {
            call.respond(
                MessageResponse(
                    message = "Machine Learning API with Kotlin",
                    version = "1.0.0",
                    endpoints = listOf("/iris", "/cinema", "/survived", "/boston")
                )
            )
        }

        get("/health") {
            call.respond(HealthResponse(status = "ok"))
        }

        post("/iris") {
            try {
                val request = call.receive<IrisRequest>()
                val X = arrayOf(
                    doubleArrayOf(
                        request.sepalLength,
                        request.sepalWidth,
                        request.petalLength,
                        request.petalWidth
                    )
                )
                val species = service.predictIris(X)
                call.respond(HttpStatusCode.OK, IrisResponse(species = species))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse(error = e.message ?: "Invalid request"))
            } catch (e: SerializationException) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse(error = e.message ?: "Invalid request"))
            } catch (e: Exception) {
                val errorMessage = e.message ?: "Internal server error"
                call.respond(HttpStatusCode.InternalServerError, ErrorResponse(error = errorMessage))
            }
        }

        post("/cinema") {
            try {
                val request = call.receive<CinemaRequest>()
                val X = arrayOf(
                    doubleArrayOf(
                        request.sns1.toDouble(),
                        request.sns2.toDouble(),
                        request.actor.toDouble(),
                        request.original.toDouble()
                    )
                )
                val predictedSales = service.predictCinema(X)
                call.respond(HttpStatusCode.OK, CinemaResponse(predictedSales = predictedSales))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.message))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to e.message))
            }
        }

        post("/survived") {
            try {
                val request = call.receive<SurvivedRequest>()
                val survived = service.predictSurvived(
                    pclass = request.pclass,
                    age = request.age,
                    sex = request.sex
                )
                call.respond(HttpStatusCode.OK, SurvivedResponse(survived = survived))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.message))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to e.message))
            }
        }

        post("/boston") {
            try {
                val request = call.receive<BostonRequest>()
                val predictedPrice = service.predictBoston(
                    rm = request.rm,
                    lstat = request.lstat,
                    ptratio = request.ptratio
                )
                call.respond(HttpStatusCode.OK, BostonResponse(predictedPrice = predictedPrice))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.message))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to e.message))
            }
        }
    }
}
