namespace PuyoPuyo.Elmish

open Elmish
open PuyoPuyo.Domain

/// ゲームのメッセージ
type メッセージ =
    | ゲーム開始
    | ゲームリセット
    | 左移動
    | 右移動
    | 下移動
    | 回転
    | 高速落下開始
    | 高速落下停止
    | タイマー刻み
    | 新しいぷよ生成
    | ぷよ固定
    | 連鎖処理
    | ゲームオーバー確認

module 更新 =
    /// ぷよを下に移動させる（共通処理）
    let private ぷよを落下 (モデル: モデル) : モデル * Cmd<メッセージ> =
        match モデル.現在のぷよ with
        | Some ペア ->
            match ゲームロジック.ぷよペア移動を試行 モデル.盤面 ペア 下 with
            | Some 移動後のペア -> { モデル with 現在のぷよ = Some 移動後のペア }, Cmd.none
            | None ->
                // 移動できない（着地）
                let 固定後の盤面 = 盤面操作.ぷよペア固定 モデル.盤面 ペア

                // つながっているぷよを検出して消去
                let グループリスト = 盤面.つながったグループ検出 固定後の盤面

                let 最終盤面 =
                    if List.isEmpty グループリスト then
                        // 消去がない場合も重力を適用
                        盤面.重力適用 固定後の盤面
                    else
                        // すべてのグループを消去
                        let 消去位置リスト = グループリスト |> List.concat
                        let 消去後の盤面 = 盤面.ぷよ消去 固定後の盤面 消去位置リスト
                        // 重力を適用
                        盤面.重力適用 消去後の盤面

                let 次のペア = ぷよペア.ランダム作成 2 1 0

                { モデル with
                    盤面 = 最終盤面
                    現在のぷよ = モデル.次のぷよ
                    次のぷよ = Some 次のペア },
                Cmd.none
        | None -> モデル, Cmd.none

    /// Update 関数
    let 更新 (メッセージ: メッセージ) (モデル: モデル) : モデル * Cmd<メッセージ> =
        match メッセージ with
        | ゲーム開始 ->
            let firstPiece = ぷよペア.ランダム作成 2 1 0
            let nextPiece = ぷよペア.ランダム作成 2 1 0

            { モデル with
                盤面 = 盤面.作成 6 13
                現在のぷよ = Some firstPiece
                次のぷよ = Some nextPiece
                スコア = 0
                ゲーム時間 = 0
                状態 = プレイ中 },
            Cmd.none

        | ゲームリセット -> PuyoPuyo.Elmish.モデル.初期化 (), Cmd.none

        | 左移動 ->
            match モデル.現在のぷよ with
            | Some ぷよペア ->
                match ゲームロジック.ぷよペア移動を試行 モデル.盤面 ぷよペア 左 with
                | Some 移動後のぷよペア -> { モデル with 現在のぷよ = Some 移動後のぷよペア }, Cmd.none
                | None -> モデル, Cmd.none
            | None -> モデル, Cmd.none

        | 右移動 ->
            match モデル.現在のぷよ with
            | Some ぷよペア ->
                match ゲームロジック.ぷよペア移動を試行 モデル.盤面 ぷよペア 右 with
                | Some 移動後のぷよペア -> { モデル with 現在のぷよ = Some 移動後のぷよペア }, Cmd.none
                | None -> モデル, Cmd.none
            | None -> モデル, Cmd.none

        | 回転 ->
            match モデル.現在のぷよ with
            | Some ぷよペア ->
                match ゲームロジック.ぷよペア壁キック回転 モデル.盤面 ぷよペア PuyoPuyo.Domain.ぷよペア.時計回り回転 with
                | Some 回転後のぷよペア -> { モデル with 現在のぷよ = Some 回転後のぷよペア }, Cmd.none
                | None -> モデル, Cmd.none
            | None -> モデル, Cmd.none

        | 下移動 when モデル.状態 = プレイ中 -> ぷよを落下 モデル

        | 高速落下開始 when モデル.状態 = プレイ中 -> { モデル with 高速落下中 = true }, Cmd.none

        | 高速落下停止 when モデル.状態 = プレイ中 -> { モデル with 高速落下中 = false }, Cmd.none

        | タイマー刻み when モデル.状態 = プレイ中 -> ぷよを落下 モデル

        | _ -> モデル, Cmd.none
