namespace PuyoPuyo.Components

open Bolero
open Bolero.Html
open PuyoPuyo.Elmish
open PuyoPuyo.Domain

module ゲーム画面 =
    /// セルを描画
    let private viewCell (セル: セル) =
        let 色 =
            match セル with
            | 空 -> "#CCCCCC"
            | 埋まっている 色 -> ぷよ.HEX変換 色

        div {
            attr.``class`` "cell"
            attr.style $"background-color: {色}"
        }

    /// ボードを描画
    let private viewBoard (盤面: 盤面) (currentPiece: ぷよペア option) =
        // ボードのコピーを作成
        let displayBoard =
            Array.init 盤面.行数 (fun y ->
                Array.init 盤面.列数 (fun x ->
                    PuyoPuyo.Domain.盤面.セル取得 盤面 x y))

        // 現在のぷよを重ねて表示
        match currentPiece with
        | Some ピース ->
            let (位置1, 位置2) = ぷよペア.位置取得 ピース
            let (x1, y1) = 位置1
            let (x2, y2) = 位置2
            if y1 >= 0 && y1 < 盤面.行数 && x1 >= 0 && x1 < 盤面.列数 then
                displayBoard.[y1].[x1] <- 埋まっている ピース.ぷよ1の色
            if y2 >= 0 && y2 < 盤面.行数 && x2 >= 0 && x2 < 盤面.列数 then
                displayBoard.[y2].[x2] <- 埋まっている ピース.ぷよ2の色
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
    let ビュー (モデル: モデル) (ディスパッチ: メッセージ -> unit) =
        div {
            attr.``class`` "game-container"
            h1 { "ぷよぷよゲーム" }

            viewBoard モデル.盤面 モデル.現在のぷよ

            div {
                attr.``class`` "game-controls"

                match モデル.状態 with
                | 未開始 ->
                    button {
                        on.click (fun _ -> ディスパッチ ゲーム開始)
                        "ゲーム開始"
                    }

                | プレイ中 ->
                    button {
                        on.click (fun _ -> ディスパッチ ゲームリセット)
                        "リセット"
                    }

                | ゲームオーバー ->
                    div {
                        h2 { "ゲームオーバー" }
                        button {
                            on.click (fun _ -> ディスパッチ ゲームリセット)
                            "もう一度プレイ"
                        }
                    }
            }
        }
