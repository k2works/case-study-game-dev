using Xunit;
using PuyoPuyo.WPF.Models;

namespace PuyoPuyo.Tests.Models;

public class GameTest
{
    [Fact]
    public void ゲームを初期化すると必要なコンポーネントが作成される()
    {
        // Arrange & Act
        var game = new Game();
        game.Initialize();

        // Assert
        Assert.NotNull(game.Config);
        Assert.NotNull(game.Stage);
        Assert.NotNull(game.Player);
        Assert.NotNull(game.Score);
    }

    [Fact]
    public void ゲームを初期化するとゲームモードがStartになる()
    {
        // Arrange
        var game = new Game();

        // Act
        game.Initialize();

        // Assert
        Assert.Equal(GameMode.Start, game.Mode);
    }

    [Fact]
    public void 新しいぷよが出現位置に配置できない場合ゲームオーバーになる()
    {
        // Arrange
        var game = new Game();
        game.Initialize();
        game.Start();

        // ステージの出現位置（中央上部）をぷよで埋める
        if (game.Stage != null)
        {
            game.Stage.SetCell(2, 0, 1); // 出現位置を塞ぐ
        }

        // Act
        bool isGameOver = game.CheckGameOver();

        // Assert
        Assert.True(isGameOver);
    }

    [Fact]
    public void 新しいぷよが出現位置に配置できる場合ゲームオーバーにならない()
    {
        // Arrange
        var game = new Game();
        game.Initialize();
        game.Start();

        // Act
        bool isGameOver = game.CheckGameOver();

        // Assert
        Assert.False(isGameOver);
    }

    [Fact]
    public void ゲームオーバー時にゲームモードがGameOverになる()
    {
        // Arrange
        var game = new Game();
        game.Initialize();
        game.Start();

        // ステージの出現位置を塞ぐ
        if (game.Stage != null)
        {
            game.Stage.SetCell(2, 0, 1);
        }

        // Act
        game.CheckAndSetGameOver();

        // Assert
        Assert.Equal(GameMode.GameOver, game.Mode);
    }
}
