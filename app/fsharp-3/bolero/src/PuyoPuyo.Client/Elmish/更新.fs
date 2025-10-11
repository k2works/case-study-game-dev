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
                let 固定後の盤面 =
                    盤面.ぷよ2つ固定 モデル.盤面 (ぷよペア.位置取得 ペア |> fst) ペア.ぷよ1の色 (ぷよペア.位置取得 ペア |> snd) ペア.ぷよ2の色

                // 連鎖処理（消去と重力を繰り返し適用、連鎖数をカウント）
                let (最終盤面, 連鎖数) = 盤面.連鎖数を数えながら処理 固定後の盤面

                // スコア計算
                let 連鎖スコア = if 連鎖数 > 0 then ゲームロジック.連鎖スコア計算 連鎖数 else 0

                // スコア更新
                let 更新されたスコア = スコア.スコア加算 モデル.スコア 連鎖スコア

                // 全消し判定とボーナス加算
                let 最終スコア = if 盤面.全消し判定 最終盤面 then スコア.全消しボーナス加算 更新されたスコア else 更新されたスコア

                let 次のペア = ぷよペア.ランダム作成 2 1 0

                { モデル with
                    盤面 = 最終盤面
                    現在のぷよ = モデル.次のぷよ
                    次のぷよ = Some 次のペア
                    スコア = 最終スコア
                    最後の連鎖数 = 連鎖数 },
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
                スコア = スコア.作成 ()
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
