namespace PuyoPuyo.Domain

/// スコアを表す型
type スコア = { 値: int }

module スコア =
    /// スコアを作成
    let 作成 () : スコア = { 値 = 0 }

    /// スコアを加算
    let スコア加算 (スコア: スコア) (points: int) : スコア = { スコア with 値 = スコア.値 + points }

    /// 全消しボーナスを加算
    let 全消しボーナス加算 (スコア: スコア) : スコア =
        let 全消しボーナス = 3600
        スコア加算 スコア 全消しボーナス
