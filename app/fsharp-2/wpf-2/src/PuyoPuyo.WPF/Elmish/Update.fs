module Elmish.Update

open System
open Domain.PuyoPair
open Elmish.Model

// ランダム生成器を受け取る更新関数（テスト用）
let updateWithRandom (random: Random) msg model =
    match msg with
    | StartGame ->
        { model with
            CurrentPair = Some(generatePuyoPair random) }
    | Tick -> model

// 更新関数（Elmish用）
let update msg model =
    let random = Random()
    updateWithRandom random msg model
