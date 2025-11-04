package ml.api

import com.github.swagger.akka.SwaggerHttpService
import com.github.swagger.akka.model.Info
import io.swagger.v3.oas.models.ExternalDocumentation

class SwaggerDocService extends SwaggerHttpService {
  override val apiClasses: Set[Class[_]] = Set(classOf[ApiRoutes])
  override val host = "localhost:8080"
  override val basePath = "/api"
  override val apiDocsPath = "api-docs"

  override val info: Info = Info(
    description = "Machine Learning Prediction API",
    version = "1.0.0",
    title = "ML API",
    termsOfService = "",
    contact = None,
    license = None
  )

  override val externalDocs: Option[ExternalDocumentation] = Some(
    new ExternalDocumentation()
      .description("ML API Documentation")
      .url("https://github.com/k2works/ai-programing-exercise")
  )

  override val unwantedDefinitions: Seq[String] = Seq(
    "Function1",
    "Function1RequestImpl"
  )
}
