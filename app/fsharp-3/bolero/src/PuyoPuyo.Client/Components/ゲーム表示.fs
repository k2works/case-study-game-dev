namespace PuyoPuyo.Components

open Bolero.Html
open PuyoPuyo.Elmish
open PuyoPuyo.Domain

module ゲーム画面 =
    let private セルを描画 (セル: セル) =
        let 色 =
            match セル with
            | 空 -> "#CCCCCC"
            | 埋まっている 色 -> ぷよ.HEX変換 色

        div {
            attr.``class`` "cell"
            attr.style $"background-color: {色}"
        }

    let private ボードを描画 (盤面: 盤面) (現在のぷよペア: ぷよペア option) =
        let ボードのコピー =
            Array.init 盤面.行数 (fun 行 -> Array.init 盤面.列数 (fun 列 -> PuyoPuyo.Domain.盤面.セル取得 盤面 列 行))

        // 現在のぷよを重ねて表示
        match 現在のぷよペア with
        | Some ピース ->
            let (位置1, 位置2) = ぷよペア.位置取得 ピース
            let (列1, 行1) = 位置1
            let (列2, 行2) = 位置2

            if 行1 >= 0 && 行1 < 盤面.行数 && 列1 >= 0 && 列1 < 盤面.列数 then
                ボードのコピー.[行1].[列1] <- 埋まっている ピース.ぷよ1の色

            if 行2 >= 0 && 行2 < 盤面.行数 && 列2 >= 0 && 列2 < 盤面.列数 then
                ボードのコピー.[行2].[列2] <- 埋まっている ピース.ぷよ2の色
        | None -> ()

        div {
            attr.``class`` "board"

            for row in ボードのコピー do
                div {
                    attr.``class`` "board-row"

                    for cell in row do
                        セルを描画 cell
                }
        }

    /// メインView
    let ビュー (モデル: モデル) (ディスパッチ: メッセージ -> unit) =
        div {
            attr.``class`` "game-container"
            h1 { "ぷよぷよゲーム" }

            ボードを描画 モデル.盤面 モデル.現在のぷよ

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
