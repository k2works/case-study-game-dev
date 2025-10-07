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
    | 高速落下
    | ゲームステップ
    | 時間ステップ
    | 新しいぷよ生成
    | ぷよ固定
    | 連鎖処理
    | ゲームオーバー確認

module 更新 =
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

        | _ -> モデル, Cmd.none
