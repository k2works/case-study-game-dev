module Puyo.Main

open Puyo.Game
open Puyo.Rendering
open Browser.Dom
open Browser.Types

[<EntryPoint>]
let main _ =
    match initCanvas "game-canvas" with
    | None ->
        console.error "Failed to initialize canvas"
        1
    | Some ctx ->
        // キーボードイベントリスナー
        document.addEventListener("keydown", fun (e: Event) ->
            let ke = e :?> KeyboardEvent
            ke.preventDefault()
            handleKeyInput ctx ke.key
        )

        // 落下タイマー（1 秒ごと）
        window.setInterval((fun () -> gameStep ctx), 1000) |> ignore

        // ゲーム時間タイマー（1 秒ごと）
        window.setInterval((fun () ->
            if gameState.GameRunning then
                gameState <- { gameState with GameTime = gameState.GameTime + 1 }
                updateTimeDisplay gameState.GameTime
        ), 1000) |> ignore

        // スタートボタン
        match document.getElementById "start-button" with
        | null -> ()
        | button ->
            button.addEventListener("click", fun _ ->
                startNewGame ctx
            )

        console.log "Puyo game initialized"
        0