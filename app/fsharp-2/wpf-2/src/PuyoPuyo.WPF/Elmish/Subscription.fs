module Elmish.Subscription

open System
open Elmish
open Domain.GameLogic
open Elmish.Model

// タイマーサブスクリプション（ゲームループ）
let timerSubscription (model: Model) : Cmd<Message> =
    let sub dispatch =
        let timer = new System.Timers.Timer(500.0) // 500ms間隔
        timer.AutoReset <- true
        timer.Elapsed.Add(fun _ -> dispatch Tick)
        timer.Start()

    Cmd.ofSub sub
