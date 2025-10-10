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
}
