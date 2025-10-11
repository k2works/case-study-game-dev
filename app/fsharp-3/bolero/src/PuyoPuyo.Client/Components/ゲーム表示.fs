namespace PuyoPuyo.Components

open Bolero.Html
open Microsoft.AspNetCore.Components.Web
open PuyoPuyo.Domain
open PuyoPuyo.Elmish

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
            Array.init (int 盤面.行数) (fun 行 ->
                Array.init (int 盤面.列数) (fun 列 ->
                    PuyoPuyo.Domain.盤面.セル取得
                        盤面
                        (LanguagePrimitives.Int32WithMeasure<列> 列)
                        (LanguagePrimitives.Int32WithMeasure<行> 行)))

        // 現在のぷよを重ねて表示
        match 現在のぷよペア with
        | Some ピース ->
            let (位置1, 位置2) = ぷよペア.位置取得 ピース
            let (列1, 行1) = 位置1
            let (列2, 行2) = 位置2

            if 行1 >= 0<行> && 行1 < 盤面.行数 && 列1 >= 0<列> && 列1 < 盤面.列数 then
                ボードのコピー.[int 行1].[int 列1] <- 埋まっている ピース.ぷよ1の色

            if 行2 >= 0<行> && 行2 < 盤面.行数 && 列2 >= 0<列> && 列2 < 盤面.列数 then
                ボードのコピー.[int 行2].[int 列2] <- 埋まっている ピース.ぷよ2の色
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

    /// キーボード押下イベントハンドラー
    let private キー押下処理 (ディスパッチ: メッセージ -> unit) (e: KeyboardEventArgs) =
        match e.Key with
        | "ArrowLeft" -> ディスパッチ 左移動
        | "ArrowRight" -> ディスパッチ 右移動
        | "ArrowUp"
        | "z"
        | "Z" -> ディスパッチ 回転
        | "ArrowDown" ->
            ディスパッチ 下移動
            ディスパッチ 高速落下開始
        | _ -> ()

    /// キーボード解放イベントハンドラー
    let private キー解放処理 (ディスパッチ: メッセージ -> unit) (e: KeyboardEventArgs) =
        match e.Key with
        | "ArrowDown" -> ディスパッチ 高速落下停止
        | _ -> ()

    /// メインView
    let ビュー (モデル: モデル) (ディスパッチ: メッセージ -> unit) =
        div {
            attr.``class`` "game-container"
            attr.tabindex 0
            on.keydown (キー押下処理 ディスパッチ)
            on.keyup (キー解放処理 ディスパッチ)
            h1 { "ぷよぷよゲーム" }

            // スコアと連鎖数の表示
            div {
                attr.``class`` "game-info"

                div {
                    attr.``class`` "score-display"
                    p { $"スコア: {モデル.スコア.値}" }
                }

                div {
                    attr.``class`` "chain-display"
                    p { $"連鎖数: {モデル.最後の連鎖数}" }
                }
            }

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

                    div {
                        attr.``class`` "instructions"
                        p { "← → : 移動" }
                        p { "↑ / Z : 回転" }
                        p { "↓ : 高速落下" }
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
