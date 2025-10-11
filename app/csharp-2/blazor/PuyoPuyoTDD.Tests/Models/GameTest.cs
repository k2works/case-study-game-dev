// <copyright file="GameTest.cs" company="PuyoPuyoTDD">
// Copyright (c) PuyoPuyoTDD. All rights reserved.
// </copyright>

using PuyoPuyoTDD.Models;
using Xunit;

namespace PuyoPuyoTDD.Tests.Models;

/// <summary>
/// Game クラスのテスト.
/// </summary>
public class GameTest
{
    /// <summary>
    /// ゲームを初期化すると必要なコンポーネントが作成されるかテスト.
    /// </summary>
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

    /// <summary>
    /// ゲームを初期化するとゲームモードがStartになるかテスト.
    /// </summary>
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

    /// <summary>
    /// リスタートするとゲームモードがStartに戻るかテスト.
    /// </summary>
    [Fact]
    public void リスタートするとゲームモードがStartに戻る()
    {
        // Arrange
        var game = new Game();
        game.Initialize();

        // ゲームオーバー状態にする
        game.Stage.SetPuyo(2, 0, 1);
        game.Player.CreateNewPuyo();

        // Act
        game.Restart();

        // Assert
        Assert.Equal(GameMode.Start, game.Mode);
    }

    /// <summary>
    /// リスタートするとステージが初期化されるかテスト.
    /// </summary>
    [Fact]
    public void リスタートするとステージが初期化される()
    {
        // Arrange
        var game = new Game();
        game.Initialize();

        // ステージにぷよを配置
        game.Stage.SetPuyo(2, 10, 1);
        game.Stage.SetPuyo(3, 10, 2);

        // Act
        game.Restart();

        // Assert
        Assert.Equal(0, game.Stage.GetPuyo(2, 10));
        Assert.Equal(0, game.Stage.GetPuyo(3, 10));
    }

    /// <summary>
    /// リスタートするとスコアがリセットされるかテスト.
    /// </summary>
    [Fact]
    public void リスタートするとスコアがリセットされる()
    {
        // Arrange
        var game = new Game();
        game.Initialize();

        // スコアを加算
        game.Score.Add(1000);

        // Act
        game.Restart();

        // Assert
        Assert.Equal(0, game.Score.Value);
    }
}
