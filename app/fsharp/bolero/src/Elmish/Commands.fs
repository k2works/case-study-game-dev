module PuyoGame.Elmish.Commands

open PuyoGame.Elmish.Model
open Elmish
open System.Threading.Tasks

/// 指定したミリ秒後にメッセージを返す async 処理
let private delayAsync (milliseconds: int) : Async<Message> =
    async {
        do! Async.Sleep milliseconds
        return GameTick
    }

/// ゲームループ用のタイマー（500ms ごとに GameTick を発行）
let startGameLoop () : Cmd<Message> =
    Cmd.OfAsync.perform delayAsync 500 id

/// 次のゲームティックをスケジュール
let scheduleNextTick () : Cmd<Message> =
    Cmd.OfAsync.perform delayAsync 500 id