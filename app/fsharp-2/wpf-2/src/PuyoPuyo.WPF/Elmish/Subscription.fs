module Elmish.Subscription

open Elmish.Model

// タイマーサブスクリプション（ゲームループ）
let timerSubscription (dispatch: Message -> unit) =
    let timer = new System.Timers.Timer(500.0) // 500ms間隔
    timer.Elapsed.Add(fun _ -> dispatch Tick)
    timer.Start()
