module Elmish.Subscription

open System
open Domain.GameLogic
open Elmish.Model

// タイマーインスタンスを保持（グローバル）
let mutable private gameTimer: System.Timers.Timer option = None

// タイマーサブスクリプション（ゲームループ）
let timerSubscription (model: Model) (dispatch: Message -> unit) =
    match model.GameState, gameTimer with
    | Playing, None ->
        // Playing状態になったらタイマー開始
        let timer = new System.Timers.Timer(500.0) // 500ms間隔
        timer.AutoReset <- true
        timer.Elapsed.Add(fun _ -> dispatch Tick)
        timer.Start()
        gameTimer <- Some timer
    | Playing, Some _ ->
        // 既にタイマーが動作中
        ()
    | _, Some timer ->
        // Playing状態でなくなったらタイマー停止
        timer.Stop()
        timer.Dispose()
        gameTimer <- None
    | _, None ->
        // タイマーなし、何もしない
        ()
