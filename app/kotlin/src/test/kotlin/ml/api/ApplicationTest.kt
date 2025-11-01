package ml.api

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.shouldBe
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

class ApplicationTest : FunSpec({
    test("Iris エンドポイントの正常系") {
        testApplication {
            application {
                configureRouting()
            }

            val response = client.post("/iris") {
                contentType(ContentType.Application.Json)
                setBody("""{"sepalLength":5.1,"sepalWidth":3.5,"petalLength":1.4,"petalWidth":0.2}""")
            }

            response.status shouldBe HttpStatusCode.OK
            val json = Json.decodeFromString<IrisResponse>(response.bodyAsText())
            listOf("setosa", "versicolor", "virginica") shouldContain json.species
        }
    }

    test("Iris エンドポイントの異常系_負の値").config(enabled = false) {
        testApplication {
            application {
                configureRouting()
            }

            val response = client.post("/iris") {
                contentType(ContentType.Application.Json)
                setBody("""{"sepalLength":-1.0,"sepalWidth":3.5,"petalLength":1.4,"petalWidth":0.2}""")
            }

            response.status shouldBe HttpStatusCode.BadRequest
        }
    }

    test("Cinema エンドポイントの正常系") {
        testApplication {
            application {
                configureRouting()
            }

            val response = client.post("/cinema") {
                contentType(ContentType.Application.Json)
                setBody("""{"sns1":500,"sns2":300,"actor":70,"original":1}""")
            }

            response.status shouldBe HttpStatusCode.OK
            val json = Json.decodeFromString<CinemaResponse>(response.bodyAsText())
            (json.predictedSales > 0) shouldBe true
        }
    }

    test("Survived エンドポイントの正常系") {
        testApplication {
            application {
                configureRouting()
            }

            val response = client.post("/survived") {
                contentType(ContentType.Application.Json)
                setBody("""{"pclass":3,"age":22,"sex":"male"}""")
            }

            response.status shouldBe HttpStatusCode.OK
            val json = Json.decodeFromString<SurvivedResponse>(response.bodyAsText())
            listOf(0, 1) shouldContain json.survived
        }
    }

    test("Boston エンドポイントの正常系").config(enabled = false) {
        testApplication {
            application {
                configureRouting()
            }

            val response = client.post("/boston") {
                contentType(ContentType.Application.Json)
                setBody("""{"rm":6.5,"lstat":4.98,"ptratio":15.3}""")
            }

            response.status shouldBe HttpStatusCode.OK
            val json = Json.decodeFromString<BostonResponse>(response.bodyAsText())
            (json.predictedPrice > 0) shouldBe true
        }
    }

    test("ルートエンドポイント") {
        testApplication {
            application {
                configureRouting()
            }

            val response = client.get("/")
            response.status shouldBe HttpStatusCode.OK
            val body = response.bodyAsText()
            body.contains("message") shouldBe true
        }
    }

    test("ヘルスチェックエンドポイント") {
        testApplication {
            application {
                configureRouting()
            }

            val response = client.get("/health")
            response.status shouldBe HttpStatusCode.OK
            val body = response.bodyAsText()
            body.contains("status") shouldBe true
            body.contains("ok") shouldBe true
        }
    }
})
