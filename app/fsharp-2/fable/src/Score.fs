// src/Score.fs
module PuyoPuyo.Score

// 連鎖ボーナステーブル
let private chainBonusTable = [|
    0    // 0連鎖（使用しない）
    0    // 1連鎖
    8    // 2連鎖
    16   // 3連鎖
    32   // 4連鎖
    64   // 5連鎖
    96   // 6連鎖
    128  // 7連鎖
    160  // 8連鎖
    192  // 9連鎖
    224  // 10連鎖
    256  // 11連鎖以上
|]

// 連鎖ボーナスを取得
let private getChainBonus (chain: int) : int =
    if chain >= chainBonusTable.Length then
        chainBonusTable.[chainBonusTable.Length - 1]
    else
        chainBonusTable.[chain]

// スコアを計算する
// erasedCount: 消したぷよの数
// chain: 連鎖数
let calculateScore (erasedCount: int) (chain: int) : int =
    let chainBonus = getChainBonus chain
    let bonus = max 1 chainBonus
    erasedCount * 10 * bonus

// 全消しボーナス
let zenkeshiBonus = 3600
