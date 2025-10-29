module MLWebApi.Application.SwaggerConfig

open Microsoft.Extensions.DependencyInjection
open Microsoft.OpenApi.Models
open Swashbuckle.AspNetCore.SwaggerGen

/// Swagger のエンドポイント定義を追加するカスタムフィルター
type ManualOperationFilter() =
    interface IDocumentFilter with
        member this.Apply(swaggerDoc: OpenApiDocument, context: DocumentFilterContext) =
            swaggerDoc.Paths.Clear()

            // Helper function to create OpenApiResponse
            let createResponse description contentType schema =
                let response = OpenApiResponse()
                response.Description <- description

                let mediaType = OpenApiMediaType()
                mediaType.Schema <- schema
                response.Content.Add(contentType, mediaType)
                response

            // Helper function to create simple object schema
            let createObjectSchema properties =
                let schema = OpenApiSchema()
                schema.Type <- "object"

                for (name, propSchema: OpenApiSchema) in properties do
                    schema.Properties.Add(name, propSchema)

                schema

            // GET /health
            let healthPath = OpenApiPathItem()

            let healthOp = OpenApiOperation()
            healthOp.Tags.Add(OpenApiTag(Name = "Health"))
            healthOp.Summary <- "ヘルスチェック"
            healthOp.Description <- "API の稼働状態を確認します"

            let healthSchema =
                createObjectSchema
                    [ ("status", OpenApiSchema(Type = "string"))
                      ("message", OpenApiSchema(Type = "string")) ]

            healthOp.Responses.Add("200", createResponse "Success" "application/json" healthSchema)

            healthPath.Operations.Add(OperationType.Get, healthOp)
            swaggerDoc.Paths.Add("/health", healthPath)

            // POST /predict/iris
            let irisPath = OpenApiPathItem()

            let irisOp = OpenApiOperation()
            irisOp.Tags.Add(OpenApiTag(Name = "Predictions"))
            irisOp.Summary <- "Iris 品種予測"
            irisOp.Description <- "花のがく片と花びらの測定値から Iris の品種を予測します"

            let irisRequestBody = OpenApiRequestBody()
            irisRequestBody.Required <- true

            let irisRequestSchema =
                createObjectSchema
                    [ ("SepalLength",
                       OpenApiSchema(Type = "number", Format = "float", Description = "がく片の長さ (cm)"))
                      ("SepalWidth",
                       OpenApiSchema(Type = "number", Format = "float", Description = "がく片の幅 (cm)"))
                      ("PetalLength",
                       OpenApiSchema(Type = "number", Format = "float", Description = "花びらの長さ (cm)"))
                      ("PetalWidth",
                       OpenApiSchema(Type = "number", Format = "float", Description = "花びらの幅 (cm)")) ]

            irisRequestSchema.Required.Add("SepalLength")
            irisRequestSchema.Required.Add("SepalWidth")
            irisRequestSchema.Required.Add("PetalLength")
            irisRequestSchema.Required.Add("PetalWidth")

            let irisRequestMedia = OpenApiMediaType()
            irisRequestMedia.Schema <- irisRequestSchema
            irisRequestBody.Content.Add("application/json", irisRequestMedia)

            irisOp.RequestBody <- irisRequestBody

            let irisResponseSchema =
                createObjectSchema
                    [ ("predictedSpecies", OpenApiSchema(Type = "string", Description = "予測された品種"))
                      ("confidence",
                       OpenApiSchema(Type = "number", Format = "float", Description = "予測の信頼度")) ]

            irisOp.Responses.Add("200", createResponse "Success" "application/json" irisResponseSchema)
            irisOp.Responses.Add("400", OpenApiResponse(Description = "Bad Request"))

            irisPath.Operations.Add(OperationType.Post, irisOp)
            swaggerDoc.Paths.Add("/predict/iris", irisPath)

            // POST /predict/cinema
            let cinemaPath = OpenApiPathItem()

            let cinemaOp = OpenApiOperation()
            cinemaOp.Tags.Add(OpenApiTag(Name = "Predictions"))
            cinemaOp.Summary <- "Cinema 売上予測"
            cinemaOp.Description <- "SNS、俳優、原作の有無から映画の売上を予測します"

            let cinemaRequestBody = OpenApiRequestBody()
            cinemaRequestBody.Required <- true

            let cinemaRequestSchema =
                createObjectSchema
                    [ ("SNS1", OpenApiSchema(Type = "number", Format = "float", Description = "SNS 露出度 1"))
                      ("SNS2", OpenApiSchema(Type = "number", Format = "float", Description = "SNS 露出度 2"))
                      ("Actor", OpenApiSchema(Type = "number", Format = "float", Description = "俳優の知名度"))
                      ("Original",
                       OpenApiSchema(Type = "number", Format = "float", Description = "原作有無 (0 or 1)")) ]

            cinemaRequestSchema.Required.Add("SNS1")
            cinemaRequestSchema.Required.Add("SNS2")
            cinemaRequestSchema.Required.Add("Actor")
            cinemaRequestSchema.Required.Add("Original")

            let cinemaRequestMedia = OpenApiMediaType()
            cinemaRequestMedia.Schema <- cinemaRequestSchema
            cinemaRequestBody.Content.Add("application/json", cinemaRequestMedia)

            cinemaOp.RequestBody <- cinemaRequestBody

            let cinemaResponseSchema =
                createObjectSchema
                    [ ("predictedSales",
                       OpenApiSchema(Type = "number", Format = "float", Description = "予測売上 (万円)")) ]

            cinemaOp.Responses.Add("200", createResponse "Success" "application/json" cinemaResponseSchema)
            cinemaOp.Responses.Add("400", OpenApiResponse(Description = "Bad Request"))

            cinemaPath.Operations.Add(OperationType.Post, cinemaOp)
            swaggerDoc.Paths.Add("/predict/cinema", cinemaPath)

            // POST /predict/survived
            let survivedPath = OpenApiPathItem()

            let survivedOp = OpenApiOperation()
            survivedOp.Tags.Add(OpenApiTag(Name = "Predictions"))
            survivedOp.Summary <- "Survived 生存予測"
            survivedOp.Description <- "タイタニック乗客の属性から生存確率を予測します"

            let survivedRequestBody = OpenApiRequestBody()
            survivedRequestBody.Required <- true

            let survivedRequestSchema =
                createObjectSchema
                    [ ("Pclass",
                       OpenApiSchema(Type = "number", Format = "float", Description = "客室クラス (1-3)"))
                      ("Sex", OpenApiSchema(Type = "string", Description = "性別 (male/female)"))
                      ("Age", OpenApiSchema(Type = "number", Format = "float", Description = "年齢")) ]

            survivedRequestSchema.Required.Add("Pclass")
            survivedRequestSchema.Required.Add("Sex")
            survivedRequestSchema.Required.Add("Age")

            let survivedRequestMedia = OpenApiMediaType()
            survivedRequestMedia.Schema <- survivedRequestSchema
            survivedRequestBody.Content.Add("application/json", survivedRequestMedia)

            survivedOp.RequestBody <- survivedRequestBody

            let survivedResponseSchema =
                createObjectSchema
                    [ ("survived", OpenApiSchema(Type = "boolean", Description = "生存予測"))
                      ("probability",
                       OpenApiSchema(Type = "number", Format = "float", Description = "生存確率")) ]

            survivedOp.Responses.Add("200", createResponse "Success" "application/json" survivedResponseSchema)
            survivedOp.Responses.Add("400", OpenApiResponse(Description = "Bad Request"))

            survivedPath.Operations.Add(OperationType.Post, survivedOp)
            swaggerDoc.Paths.Add("/predict/survived", survivedPath)

            // POST /predict/boston
            let bostonPath = OpenApiPathItem()

            let bostonOp = OpenApiOperation()
            bostonOp.Tags.Add(OpenApiTag(Name = "Predictions"))
            bostonOp.Summary <- "Boston 住宅価格予測"
            bostonOp.Description <- "住宅の特徴から価格を予測します"

            let bostonRequestBody = OpenApiRequestBody()
            bostonRequestBody.Required <- true

            let bostonRequestSchema =
                createObjectSchema
                    [ ("CRIME", OpenApiSchema(Type = "string", Description = "犯罪率カテゴリ"))
                      ("RM", OpenApiSchema(Type = "number", Format = "float", Description = "平均部屋数"))
                      ("LSTAT",
                       OpenApiSchema(Type = "number", Format = "float", Description = "低所得者の割合 (%)"))
                      ("PTRATIO",
                       OpenApiSchema(
                           Type = "number",
                           Format = "float",
                           Description = "教員 1 人当たりの児童生徒数"
                       )) ]

            bostonRequestSchema.Required.Add("CRIME")
            bostonRequestSchema.Required.Add("RM")
            bostonRequestSchema.Required.Add("LSTAT")
            bostonRequestSchema.Required.Add("PTRATIO")

            let bostonRequestMedia = OpenApiMediaType()
            bostonRequestMedia.Schema <- bostonRequestSchema
            bostonRequestBody.Content.Add("application/json", bostonRequestMedia)

            bostonOp.RequestBody <- bostonRequestBody

            let bostonResponseSchema =
                createObjectSchema
                    [ ("predictedPrice",
                       OpenApiSchema(Type = "number", Format = "float", Description = "予測価格 ($1000 単位)")) ]

            bostonOp.Responses.Add("200", createResponse "Success" "application/json" bostonResponseSchema)
            bostonOp.Responses.Add("400", OpenApiResponse(Description = "Bad Request"))

            bostonPath.Operations.Add(OperationType.Post, bostonOp)
            swaggerDoc.Paths.Add("/predict/boston", bostonPath)
