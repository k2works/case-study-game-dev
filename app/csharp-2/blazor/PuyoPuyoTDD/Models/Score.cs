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
