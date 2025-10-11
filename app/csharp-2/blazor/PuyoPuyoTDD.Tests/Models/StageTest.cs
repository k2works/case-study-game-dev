// <copyright file="StageTest.cs" company="PuyoPuyoTDD">
// Copyright (c) PuyoPuyoTDD. All rights reserved.
// </copyright>

using PuyoPuyoTDD.Models;
using Xunit;

namespace PuyoPuyoTDD.Tests.Models;

/// <summary>
/// Stage クラスのテスト.
/// </summary>
public class StageTest
{
    private readonly Config config;
    private readonly Stage stage;

    /// <summary>
    /// Initializes a new instance of the <see cref="StageTest"/> class.
    /// </summary>
    public StageTest()
    {
        this.config = new Config();
        this.stage = new Stage(this.config);
    }

    /// <summary>
    /// 同じ色のぷよが4つつながっていると消去対象になるかテスト.
    /// </summary>
    [Fact]
    public void 同じ色のぷよが4つつながっていると消去対象になる()
    {
        // Arrange
        this.stage.Initialize();
        this.stage.SetPuyo(1, 10, 1);
        this.stage.SetPuyo(2, 10, 1);
        this.stage.SetPuyo(1, 11, 1);
        this.stage.SetPuyo(2, 11, 1);

        // Act
        var eraseInfo = this.stage.CheckErase();

        // Assert
        Assert.Equal(4, eraseInfo.erasePuyoCount);
        Assert.NotEmpty(eraseInfo.eraseList);
    }

    /// <summary>
    /// 異なる色のぷよは消去対象にならないかテスト.
    /// </summary>
    [Fact]
    public void 異なる色のぷよは消去対象にならない()
    {
        // Arrange
        this.stage.Initialize();
        this.stage.SetPuyo(1, 10, 1);
        this.stage.SetPuyo(2, 10, 2);
        this.stage.SetPuyo(1, 11, 3);
        this.stage.SetPuyo(2, 11, 4);

        // Act
        var eraseInfo = this.stage.CheckErase();

        // Assert
        Assert.Equal(0, eraseInfo.erasePuyoCount);
        Assert.Empty(eraseInfo.eraseList);
    }

    /// <summary>
    /// 消去対象のぷよを実際に消去するかテスト.
    /// </summary>
    [Fact]
    public void 消去対象のぷよを実際に消去する()
    {
        // Arrange
        this.stage.Initialize();
        this.stage.SetPuyo(1, 10, 1);
        this.stage.SetPuyo(2, 10, 1);
        this.stage.SetPuyo(1, 11, 1);
        this.stage.SetPuyo(2, 11, 1);

        // Act
        var eraseInfo = this.stage.CheckErase();
        this.stage.ExecuteErase(eraseInfo.eraseList);

        // Assert
        Assert.Equal(0, this.stage.GetPuyo(1, 10));
        Assert.Equal(0, this.stage.GetPuyo(2, 10));
        Assert.Equal(0, this.stage.GetPuyo(1, 11));
        Assert.Equal(0, this.stage.GetPuyo(2, 11));
    }

    /// <summary>
    /// ぷよ消去後に上のぷよが落下するかテスト.
    /// </summary>
    [Fact]
    public void ぷよ消去後に上のぷよが落下する()
    {
        // Arrange
        this.stage.Initialize();

        // 下段に消去対象のぷよを配置
        this.stage.SetPuyo(1, 10, 1);
        this.stage.SetPuyo(2, 10, 1);
        this.stage.SetPuyo(1, 11, 1);
        this.stage.SetPuyo(2, 11, 1);

        // 上段に別の色のぷよを配置
        this.stage.SetPuyo(1, 9, 2);
        this.stage.SetPuyo(2, 8, 3);

        // Act
        var eraseInfo = this.stage.CheckErase();
        this.stage.ExecuteErase(eraseInfo.eraseList);
        this.stage.ApplyGravity();

        // Assert
        // 上にあったぷよが落下している
        Assert.Equal(2, this.stage.GetPuyo(1, 11)); // Y=9 -> Y=11
        Assert.Equal(3, this.stage.GetPuyo(2, 11)); // Y=8 -> Y=11

        // 元の位置は空
        Assert.Equal(0, this.stage.GetPuyo(1, 9));
        Assert.Equal(0, this.stage.GetPuyo(2, 8));
    }
}
