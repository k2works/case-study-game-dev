module PuyoPuyo.Main

open Bolero
open Bolero.Html
open Elmish
open Microsoft.AspNetCore.Components
open Microsoft.AspNetCore.Components.Web
open PuyoGame.Elmish.Model
open PuyoGame.Elmish.Update
open PuyoGame.Domain
open PuyoGame.Domain.Board
open PuyoGame.Domain.Puyo
open System

let cellSize = 30

/// ボード描画
let renderBoard (board: Board) (currentPiece: PuyoPair option) =
    let renderCell x y (cell: Cell) =
        let color = cell.ToHex()
        let isEmpty = color = "#ffffff"

        div {
            attr.style $"position:absolute;left:{x*cellSize}px;top:{y*cellSize}px;width:{cellSize}px;height:{cellSize}px;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;"
            if not isEmpty then
                div {
                    attr.style $"width:{cellSize - 8}px;height:{cellSize - 8}px;background-color:{color};border-radius:50%%;border:2px solid #333;"
                }
        }

    let boardCells =
        [
            for y in 0 .. (height board - 1) do
                for x in 0 .. (width board - 1) do
                    match tryGetCell board { X = x; Y = y } with
                    | Some cell -> renderCell x y cell
                    | None -> ()
        ]

    let pieceCells =
        match currentPiece with
        | None -> []
        | Some piece ->
            let (pos1, pos2) = getPuyoPairPositions piece
            [
                renderCell pos1.X pos1.Y (Filled piece.Puyo1Color)
                renderCell pos2.X pos2.Y (Filled piece.Puyo2Color)
            ]

    div {
        attr.style $"position:relative;width:{width board * cellSize}px;height:{height board * cellSize}px;background:#f0f0f0;"
        forEach (boardCells @ pieceCells) id
    }

/// NEXT セクション表示
let renderNextSection (nextPiece: PuyoPair option) =
    div {
        attr.``class`` "next-section"
        h2 { text "NEXT" }
        div {
            match nextPiece with
            | None -> text ""
            | Some piece ->
                div {
                    attr.style "display:flex;flex-direction:column;align-items:center;padding:10px;"
                    div {
                        attr.style $"width:20px;height:20px;background:{piece.Puyo1Color.ToHex()};border-radius:50%%;"
                    }
                    div {
                        attr.style $"width:20px;height:20px;background:{piece.Puyo2Color.ToHex()};border-radius:50%%;margin-top:5px;"
                    }
                }
        }
    }

/// 統計情報セクション表示
let renderStatsSection (model: Model) =
    let formatTime (seconds: int) =
        let mins = seconds / 60
        let secs = seconds % 60
        $"{mins}:{secs:D2}"

    div {
        attr.``class`` "stats-section"
        div {
            attr.``class`` "stat-item"
            span { attr.``class`` "stat-label"; text "SCORE" }
            span { attr.``class`` "stat-value"; text $"{model.Score}" }
        }
        div {
            attr.``class`` "stat-item"
            span { attr.``class`` "stat-label"; text "LEVEL" }
            span { attr.``class`` "stat-value"; text $"{model.Level}" }
        }
        div {
            attr.``class`` "stat-item"
            span { attr.``class`` "stat-label"; text "CHAIN" }
            span { attr.``class`` "stat-value"; text $"{model.ChainCount}" }
        }
        div {
            attr.``class`` "stat-item"
            span { attr.``class`` "stat-label"; text "TIME" }
            span { attr.``class`` "stat-value"; text (formatTime model.GameTime) }
        }
    }

/// キーボードイベントハンドラ
let handleKeyDown (dispatch: Message -> unit) (e: KeyboardEventArgs) =
    match e.Key with
    | "ArrowLeft" -> dispatch MoveLeft
    | "ArrowRight" -> dispatch MoveRight
    | "ArrowDown" -> dispatch MoveDown
    | "ArrowUp" -> dispatch Rotate
    | " " -> dispatch HardDrop
    | _ -> ()

/// メインビュー
let view (model: Model) dispatch =
    div {
        attr.``class`` "container"
        attr.tabindex 0
        on.keydown (fun e -> handleKeyDown dispatch e)
        h1 { text "Puyo Puyo Game" }

        div {
            attr.``class`` "game-area"

            div {
                attr.``class`` "board-section"
                renderBoard model.Board model.CurrentPiece
            }

            div {
                attr.``class`` "info-section"
                renderNextSection model.NextPiece
                renderStatsSection model

                button {
                    attr.``class`` "start-button"
                    on.click (fun _ -> dispatch StartGame)
                    text "START"
                }
            }
        }

        div {
            attr.``class`` "controls"
            h3 { text "Controls" }
            ul {
                li { text "←/→: Move left/right" }
                li { text "↑: Rotate" }
                li { text "↓: Soft drop" }
                li { text "Space: Hard drop" }
            }
        }
    }

type MyApp() =
    inherit ProgramComponent<Model, Message>()

    override this.Program =
        Program.mkProgram (fun _ -> init ()) update view