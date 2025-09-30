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
        div {
            attr.style $"position:absolute;left:{x*cellSize}px;top:{y*cellSize}px;width:{cellSize}px;height:{cellSize}px;border:1px solid #ddd;background-color:{color};"
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

/// ゲーム情報表示
let renderGameInfo (model: Model) =
    div {
        attr.``class`` "game-info"
        h3 { text "NEXT" }
        div {
            match model.NextPiece with
            | None -> text ""
            | Some piece ->
                div {
                    attr.style "display:flex;flex-direction:column;align-items:center;"
                    div {
                        attr.style $"width:15px;height:15px;background:{piece.Puyo1Color.ToHex()};border-radius:50%%;"
                    }
                    div {
                        attr.style $"width:15px;height:15px;background:{piece.Puyo2Color.ToHex()};border-radius:50%%;margin-top:5px;"
                    }
                }
        }
        div {
            attr.``class`` "stats"
            p { text $"Score: {model.Score}" }
            p { text $"Chain: {model.ChainCount}" }
            p {
                text (
                    match model.GameStatus with
                    | NotStarted -> "Press START"
                    | Playing -> "Playing"
                    | GameOver -> "Game Over"
                )
            }
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
            attr.style "display:flex;gap:30px;"

            div {
                attr.``class`` "board-section"
                renderBoard model.Board model.CurrentPiece
            }

            div {
                attr.``class`` "info-section"
                renderGameInfo model

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