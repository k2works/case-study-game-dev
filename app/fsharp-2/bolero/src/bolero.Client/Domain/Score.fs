namespace PuyoPuyo.Domain

/// スコア計算モジュール
module Score =
    /// 全消しボーナスの点数
    let zenkeshiBonus = 3600

    /// 全消しボーナスをスコアに加算
    let addZenkeshiBonus (score: int) : int = score + zenkeshiBonus
