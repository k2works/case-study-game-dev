namespace PuyoPuyo.Elmish

open Elmish
open System

module Subscription =
    /// ゲームタイマー（高速落下時は速く）
    let gameTimer (model: Model) : Sub<Message> =
        if model.Status = Playing then
            let interval = if model.IsFastFalling then 100.0 else 1000.0
            let sub dispatch =
                let timer = new System.Timers.Timer(interval)
                timer.Elapsed.Add(fun _ -> dispatch Tick)
                timer.Start()
                { new IDisposable with
                    member _.Dispose() = timer.Stop(); timer.Dispose() }
            [ [ "gameTimer" ], sub ]
        else
            []
