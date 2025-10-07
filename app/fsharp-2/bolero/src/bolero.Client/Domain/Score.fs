namespace PuyoPuyo.Domain

/// スコア計算モジュール
module Score =
    /// 全消しボーナスの点数
    let zenkeshiBonus = 3600

    /// 全消しボーナスをスコアに加算
    let addZenkeshiBonus (score: int) : int = score + zenkeshiBonus

    /// 連鎖ボーナステーブル
    let private chainBonusTable =
        [| 0
           8
           16
           32
           64
           96
           128
           160
           192
           224
           256
           288
           320
           352
           384
           416
           448
           480
           512 |]

    /// 連鎖ボーナスを取得
    let private getChainBonus (chainCount: int) : int =
        if chainCount = 0 then
            0
        elif chainCount < chainBonusTable.Length then
            chainBonusTable.[chainCount]
        else
            chainBonusTable.[chainBonusTable.Length - 1]

    /// ぷよ消去のスコアを計算
    /// clearedCount: 消去したぷよの数
    /// chainCount: 連鎖数
    let calculateClearScore (clearedCount: int) (chainCount: int) : int =
        if clearedCount = 0 then
            0
        else
            let chainBonus = getChainBonus chainCount
            let bonus = max 1 chainBonus
            clearedCount * 10 * bonus
