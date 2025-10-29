module MLWebApi.Application.Handlers

open Giraffe
open Microsoft.AspNetCore.Http
open MLWebApi.Service
open MLWebApi.Domain.Models

/// Iris 予測ハンドラ
let predictIrisHandler (service: PredictionService) : HttpHandler =
    fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            let! request = ctx.BindJsonAsync<IrisPredictRequest>()

            match service.PredictIris(request) with
            | Ok response -> return! json response next ctx
            | Error msg -> return! RequestErrors.BAD_REQUEST msg next ctx
        }

/// Cinema 予測ハンドラ
let predictCinemaHandler (service: PredictionService) : HttpHandler =
    fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            let! request = ctx.BindJsonAsync<CinemaPredictRequest>()

            match service.PredictCinema(request) with
            | Ok response -> return! json response next ctx
            | Error msg -> return! RequestErrors.BAD_REQUEST msg next ctx
        }

/// Survived 予測ハンドラ
let predictSurvivedHandler (service: PredictionService) : HttpHandler =
    fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            let! request = ctx.BindJsonAsync<SurvivedPredictRequest>()

            match service.PredictSurvived(request) with
            | Ok response -> return! json response next ctx
            | Error msg -> return! RequestErrors.BAD_REQUEST msg next ctx
        }

/// Boston 予測ハンドラ
let predictBostonHandler (service: PredictionService) : HttpHandler =
    fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            let! request = ctx.BindJsonAsync<BostonPredictRequest>()

            match service.PredictBoston(request) with
            | Ok response -> return! json response next ctx
            | Error msg -> return! RequestErrors.BAD_REQUEST msg next ctx
        }

/// ヘルスチェックハンドラ
let healthCheckHandler : HttpHandler =
    fun (next: HttpFunc) (ctx: HttpContext) ->
        let response =
            {| status = "healthy"
               message = "ML Web API is running" |}

        json response next ctx
