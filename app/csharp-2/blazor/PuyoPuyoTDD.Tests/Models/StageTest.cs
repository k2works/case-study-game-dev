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
}
