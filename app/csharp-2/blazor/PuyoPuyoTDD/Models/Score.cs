// <copyright file="Score.cs" company="PuyoPuyoTDD">
// Copyright (c) PuyoPuyoTDD. All rights reserved.
// </copyright>

namespace PuyoPuyoTDD.Models;

/// <summary>
/// スコアクラス.
/// </summary>
public class Score
{
    /// <summary>
    /// Gets 現在のスコアを取得します.
    /// </summary>
    public int Value { get; private set; }

    /// <summary>
    /// スコアを計算します.
    /// </summary>
    /// <param name="erasedCount">消去したぷよの数.</param>
    /// <param name="chainCount">連鎖数.</param>
    /// <returns>計算されたスコア.</returns>
    public static int Calculate(int erasedCount, int chainCount)
    {
        // 基本点: 消去数 × 10
        int basePoints = erasedCount * 10;

        // 連鎖ボーナス倍率
        int chainBonus = chainCount switch
        {
            1 => 1,   // 1連鎖: ×1
            2 => 8,   // 2連鎖: ×8
            3 => 16,  // 3連鎖: ×16
            4 => 32,  // 4連鎖: ×32
            5 => 64,  // 5連鎖: ×64
            6 => 96,  // 6連鎖: ×96
            7 => 128, // 7連鎖: ×128
            _ => 160, // 8連鎖以上: ×160
        };

        return basePoints * chainBonus;
    }

    /// <summary>
    /// 全消しボーナスを計算します.
    /// </summary>
    /// <returns>全消しボーナスのポイント.</returns>
    public static int CalculateAllClearBonus()
    {
        return 3600;
    }

    /// <summary>
    /// スコアをリセットします.
    /// </summary>
    public void Reset()
    {
        this.Value = 0;
    }

    /// <summary>
    /// スコアを追加します.
    /// </summary>
    /// <param name="points">追加するポイント.</param>
    public void Add(int points)
    {
        this.Value += points;
    }
}
