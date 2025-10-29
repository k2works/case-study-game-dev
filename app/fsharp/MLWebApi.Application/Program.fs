open System
open System.IO
open Giraffe
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.Extensions.DependencyInjection
open Microsoft.Extensions.Hosting
open Microsoft.OpenApi.Models
open MLWebApi.Service
open MLWebApi.Application.Handlers

// ルーティング設定
let webApp (service: PredictionService) =
    choose
        [ GET >=> route "/health" >=> healthCheckHandler
          POST
          >=> choose
              [ route "/predict/iris" >=> predictIrisHandler service
                route "/predict/cinema" >=> predictCinemaHandler service
                route "/predict/survived" >=> predictSurvivedHandler service
                route "/predict/boston" >=> predictBostonHandler service ]
          RequestErrors.NOT_FOUND "Not Found" ]

// サービス設定
let configureServices (services: IServiceCollection) =
    // モデルディレクトリのパスを設定（環境変数から取得、なければデフォルト）
    let modelDirectory =
        match Environment.GetEnvironmentVariable("MODEL_DIRECTORY") with
        | null
        | "" ->
            let currentDir = Directory.GetCurrentDirectory()
            let modelPath = Path.Combine(currentDir, "..", "model")
            Path.GetFullPath(modelPath)
        | path -> path

    printfn $"モデルディレクトリ: {modelDirectory}"

    // PredictionService をシングルトンとして登録
    let predictionService = PredictionService(modelDirectory)
    services.AddSingleton<PredictionService>(predictionService) |> ignore

    services.AddGiraffe() |> ignore

    // Swagger を追加
    services.AddEndpointsApiExplorer() |> ignore

    services.AddSwaggerGen(fun c ->
        c.SwaggerDoc(
            "v1",
            OpenApiInfo(
                Title = "ML Web API",
                Version = "v1",
                Description = "F# 機械学習 Web API - Iris, Cinema, Survived, Boston の予測エンドポイント",
                Contact = OpenApiContact(Name = "ML TDD F# Project")
            )
        )

        c.DocumentFilter<MLWebApi.Application.SwaggerConfig.ManualOperationFilter>()) |> ignore

// アプリケーション設定
let configureApp (service: PredictionService) (app: IApplicationBuilder) =
    // Swagger を有効化
    app.UseSwagger() |> ignore
    app.UseSwaggerUI(fun c -> c.SwaggerEndpoint("/swagger/v1/swagger.json", "ML Web API v1"))
    |> ignore

    app.UseGiraffe(webApp service)

[<EntryPoint>]
let main args =
    let builder = WebApplication.CreateBuilder(args)

    // サービスを設定
    configureServices builder.Services

    let app = builder.Build()

    // PredictionService を取得
    let service = app.Services.GetRequiredService<PredictionService>()

    // アプリケーションを設定
    configureApp service app

    app.Run()

    0 // Exit code

