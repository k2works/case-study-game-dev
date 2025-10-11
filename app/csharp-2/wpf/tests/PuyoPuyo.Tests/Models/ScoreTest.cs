using Xunit;
using PuyoPuyo.WPF.Models;

namespace PuyoPuyo.Tests.Models;

public class ScoreTest
{
    private readonly Score _score;

    public ScoreTest()
    {
        _score = new Score();
    }

    [Fact]
    public void 初期スコアはゼロである()
    {
        // Arrange & Act
        // スコアは既にコンストラクタで初期化されている

        // Assert
        Assert.Equal(0, _score.CurrentScore);
        Assert.Equal(0, _score.ChainCount);
    }

    [Fact]
    public void ぷよ4個消去で40点加算される()
    {
        // Arrange
        int erasedCount = 4;

        // Act
        _score.AddScore(erasedCount, 1);

        // Assert
        Assert.Equal(40, _score.CurrentScore);
    }

    [Fact]
    public void ぷよ5個消去で50点加算される()
    {
        // Arrange
        int erasedCount = 5;

        // Act
        _score.AddScore(erasedCount, 1);

        // Assert
        Assert.Equal(50, _score.CurrentScore);
    }

    [Fact]
    public void 連鎖なしチェーン1ではボーナスなし()
    {
        // Arrange
        int erasedCount = 4;
        int chainCount = 1;

        // Act
        _score.AddScore(erasedCount, chainCount);

        // Assert
        Assert.Equal(40, _score.CurrentScore); // 4個 × 10点
    }

    [Fact]
    public void 連鎖2回目は2倍のボーナス()
    {
        // Arrange
        int erasedCount = 4;
        int chainCount = 2;

        // Act
        _score.AddScore(erasedCount, chainCount);

        // Assert
        // 基本スコア: 4個 × 10点 = 40点
        // ボーナス: 40点 × 2倍 = 80点
        Assert.Equal(120, _score.CurrentScore);
    }

    [Fact]
    public void 連鎖3回目は4倍のボーナス()
    {
        // Arrange
        int erasedCount = 4;
        int chainCount = 3;

        // Act
        _score.AddScore(erasedCount, chainCount);

        // Assert
        // 基本スコア: 4個 × 10点 = 40点
        // ボーナス: 40点 × 4倍 = 160点
        Assert.Equal(200, _score.CurrentScore);
    }

    [Fact]
    public void 複数回のスコア加算が累積される()
    {
        // Arrange & Act
        _score.AddScore(4, 1); // 40点
        _score.AddScore(5, 1); // 50点
        _score.AddScore(4, 2); // 120点

        // Assert
        Assert.Equal(210, _score.CurrentScore);
    }

    [Fact]
    public void チェーンカウントを更新できる()
    {
        // Arrange & Act
        _score.UpdateChainCount(3);

        // Assert
        Assert.Equal(3, _score.ChainCount);
    }

    [Fact]
    public void チェーンカウントをリセットできる()
    {
        // Arrange
        _score.UpdateChainCount(5);

        // Act
        _score.ResetChainCount();

        // Assert
        Assert.Equal(0, _score.ChainCount);
    }
}
