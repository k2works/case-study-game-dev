namespace PuyoPuyo.Elmish

open Elmish
open System

module Subscription =
    /// ゲームタイマー（1秒ごとにTickメッセージを発行）
    let gameTimer (model: Model) : Sub<Message> =
        if model.Status = Playing then
            let sub dispatch =
                let timer = new System.Timers.Timer(1000.0)
                timer.Elapsed.Add(fun _ -> dispatch Tick)
                timer.Start()
                { new IDisposable with
                    member _.Dispose() = timer.Stop(); timer.Dispose() }
            [ [ "gameTimer" ], sub ]
        else
            []
