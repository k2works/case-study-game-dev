namespace PuyoPuyo.Domain

/// スコアを表す型
type Score = { Value: int }

module Score =
    /// スコアを作成
    let create () : Score = { Value = 0 }

    /// スコアを加算
    let addScore (points: int) (score: Score) : Score = { score with Value = score.Value + points }

    /// 全消しボーナスを加算
    let addZenkeshiBonus (score: Score) : Score =
        let zenkeshiBonus = 3600
        addScore zenkeshiBonus score
