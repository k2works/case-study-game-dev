namespace PuyoPuyo.Domain

/// スコアを表す型
type Score = { Value: int }

module Score =
    /// スコアを作成
    let create () : Score = { Value = 0 }

    /// スコアを加算
    let addScore (points: int) (score: Score) : Score =
        { score with
            Value = score.Value + points }

    /// 連鎖によるスコアを計算
    /// chainCount: 連鎖数、clearedCount: 消去したぷよの数
    let calculateChainScore (chainCount: int) (clearedCount: int) : int =
        if chainCount = 0 then
            0
        else
            // 基本点 = 消去数 × 10
            // 連鎖ボーナス = 連鎖数 × 連鎖数 × 50
            let basePoints = clearedCount * 10
            let chainBonus = chainCount * chainCount * 50
            basePoints + chainBonus

    /// 連鎖スコアを加算
    let addChainScore (chainCount: int) (clearedCount: int) (score: Score) : Score =
        let points = calculateChainScore chainCount clearedCount
        addScore points score

    /// 全消しボーナスを加算
    let addZenkeshiBonus (score: Score) : Score =
        let zenkeshiBonus = 3600
        addScore zenkeshiBonus score
