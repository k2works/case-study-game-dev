// <copyright file="PlayerTest.cs" company="PuyoPuyoTDD">
// Copyright (c) PuyoPuyoTDD. All rights reserved.
// </copyright>

using PuyoPuyoTDD.Models;
using Xunit;

namespace PuyoPuyoTDD.Tests.Models;

/// <summary>
/// Player クラスのテスト.
/// </summary>
public class PlayerTest
{
    private readonly Config config;
    private readonly Stage stage;
    private readonly Player player;

    /// <summary>
    /// Initializes a new instance of the <see cref="PlayerTest"/> class.
    /// </summary>
    public PlayerTest()
    {
        this.config = new Config();
        this.stage = new Stage(this.config);
        this.player = new Player(this.config, this.stage);
    }

    /// <summary>
    /// 左キーが押されると左向きの移動フラグが立つかテスト.
    /// </summary>
    [Fact]
    public void 左キーが押されると左向きの移動フラグが立つ()
    {
        // Act
        this.player.SetInputLeft(true);

        // Assert
        Assert.True(this.player.InputKeyLeft);
    }

    /// <summary>
    /// 右キーが押されると右向きの移動フラグが立つかテスト.
    /// </summary>
    [Fact]
    public void 右キーが押されると右向きの移動フラグが立つ()
    {
        // Act
        this.player.SetInputRight(true);

        // Assert
        Assert.True(this.player.InputKeyRight);
    }

    /// <summary>
    /// キーが離されると対応する移動フラグが下がるかテスト.
    /// </summary>
    [Fact]
    public void キーが離されると対応する移動フラグが下がる()
    {
        // Arrange
        this.player.SetInputLeft(true);
        Assert.True(this.player.InputKeyLeft);

        // Act
        this.player.SetInputLeft(false);

        // Assert
        Assert.False(this.player.InputKeyLeft);
    }

    /// <summary>
    /// 左に移動できる場合左に移動するかテスト.
    /// </summary>
    [Fact]
    public void 左に移動できる場合左に移動する()
    {
        // Arrange
        this.player.CreateNewPuyo();
        var initialX = this.player.PuyoX;

        // Act
        this.player.MoveLeft();

        // Assert
        Assert.Equal(initialX - 1, this.player.PuyoX);
    }

    /// <summary>
    /// 右に移動できる場合右に移動するかテスト.
    /// </summary>
    [Fact]
    public void 右に移動できる場合右に移動する()
    {
        // Arrange
        this.player.CreateNewPuyo();
        var initialX = this.player.PuyoX;

        // Act
        this.player.MoveRight();

        // Assert
        Assert.Equal(initialX + 1, this.player.PuyoX);
    }

    /// <summary>
    /// 左端にいる場合左に移動できないかテスト.
    /// </summary>
    [Fact]
    public void 左端にいる場合左に移動できない()
    {
        // Arrange
        this.player.CreateNewPuyo();
        this.player.SetPuyoX(0);

        // Act
        this.player.MoveLeft();

        // Assert
        Assert.Equal(0, this.player.PuyoX);
    }

    /// <summary>
    /// 右端にいる場合右に移動できないかテスト.
    /// </summary>
    [Fact]
    public void 右端にいる場合右に移動できない()
    {
        // Arrange
        this.player.CreateNewPuyo();
        this.player.SetPuyoX(this.config.StageWidth - 1);

        // Act
        this.player.MoveRight();

        // Assert
        Assert.Equal(this.config.StageWidth - 1, this.player.PuyoX);
    }
}
