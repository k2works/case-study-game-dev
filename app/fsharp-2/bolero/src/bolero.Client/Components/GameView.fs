namespace PuyoPuyo.Components

open Bolero
open Bolero.Html
open PuyoPuyo.Elmish
open PuyoPuyo.Domain

module GameView =
    /// キーボードイベントハンドラ
    let private handleKeyDown (dispatch: Message -> unit) (e: Microsoft.AspNetCore.Components.Web.KeyboardEventArgs) =
        match e.Key with
        | "ArrowLeft" -> dispatch MoveLeft
        | "ArrowRight" -> dispatch MoveRight
        | "ArrowUp" -> dispatch Rotate
        | "ArrowDown" ->
            dispatch MoveDown
            dispatch StartFastFall
        | _ -> ()

    let private handleKeyUp (dispatch: Message -> unit) (e: Microsoft.AspNetCore.Components.Web.KeyboardEventArgs) =
        match e.Key with
        | "ArrowDown" -> dispatch StopFastFall
        | _ -> ()

    /// セルを描画
    let private viewCell (cell: Cell) =
        let color =
            match cell with
            | Empty -> "#CCCCCC"
            | Filled color -> Puyo.toHex color

        div {
            attr.``class`` "cell"
            attr.style $"background-color: {color}"
        }

    /// ボードを描画
    let private viewBoard (board: Board) (currentPiece: PuyoPair option) =
        // ボードのコピーを作成
        let displayBoard =
            Array.init board.Rows (fun y ->
                Array.init board.Cols (fun x ->
                    Board.getCell board x y))

        // 現在のぷよを重ねて表示
        match currentPiece with
        | Some piece ->
            let (pos1, pos2) = PuyoPair.getPositions piece
            let (x1, y1) = pos1
            let (x2, y2) = pos2
            if y1 >= 0 && y1 < board.Rows && x1 >= 0 && x1 < board.Cols then
                displayBoard.[y1].[x1] <- Filled piece.Puyo1Color
            if y2 >= 0 && y2 < board.Rows && x2 >= 0 && x2 < board.Cols then
                displayBoard.[y2].[x2] <- Filled piece.Puyo2Color
        | None -> ()

        div {
            attr.``class`` "board"
            for row in displayBoard do
                div {
                    attr.``class`` "board-row"
                    for cell in row do
                        viewCell cell
                }
        }

    /// メインView
    let view (model: Model) (dispatch: Message -> unit) =
        div {
            attr.``class`` "game-container"
            attr.tabindex 0  // キーボードフォーカスを受け取れるようにする
            on.keydown (handleKeyDown dispatch)
            on.keyup (handleKeyUp dispatch)
            h1 { "ぷよぷよゲーム" }

            viewBoard model.Board model.CurrentPiece

            div {
                attr.``class`` "game-controls"
                match model.Status with
                | NotStarted ->
                    button {
                        on.click (fun _ -> dispatch StartGame)
                        "ゲーム開始"
                    }

                | Playing ->
                    div {
                        p { "← →: 左右移動" }
                        p { "↑: 回転" }
                        p { "↓: 高速落下" }
                        button {
                            on.click (fun _ -> dispatch ResetGame)
                            "リセット"
                        }
                    }

                | GameOver ->
                    div {
                        h2 { "ゲームオーバー" }
                        button {
                            on.click (fun _ -> dispatch ResetGame)
                            "もう一度プレイ"
                        }
                    }
            }
        }
