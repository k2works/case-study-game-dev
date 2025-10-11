// <copyright file="ScoreTest.cs" company="PuyoPuyoTDD">
// Copyright (c) PuyoPuyoTDD. All rights reserved.
// </copyright>

using PuyoPuyoTDD.Models;
using Xunit;

namespace PuyoPuyoTDD.Tests.Models;

/// <summary>
/// Score クラスのテスト.
/// </summary>
public class ScoreTest
{
    private readonly Score score;

    /// <summary>
    /// Initializes a new instance of the <see cref="ScoreTest"/> class.
    /// </summary>
    public ScoreTest()
    {
        this.score = new Score();
    }

    /// <summary>
    /// スコアが正しく計算されるかテスト.
    /// </summary>
    [Fact]
    public void スコアが正しく計算される()
    {
        // Arrange
        int erasedCount = 4;
        int chainCount = 1;

        // Act
        int points = Score.Calculate(erasedCount, chainCount);

        // Assert
        // 4個消去 × 10 × 1連鎖 = 40点
        Assert.Equal(40, points);
    }

    /// <summary>
    /// 連鎖ボーナスが正しく計算されるかテスト.
    /// </summary>
    [Fact]
    public void 連鎖ボーナスが正しく計算される()
    {
        // Arrange
        int erasedCount = 4;
        int chainCount = 2;

        // Act
        int points = Score.Calculate(erasedCount, chainCount);

        // Assert
        // 4個消去 × 10 × 2連鎖ボーナス(8倍) = 320点
        Assert.Equal(320, points);
    }
}
