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

    /// <summary>
    /// 時計回りに回転すると回転状態が1増えるかテスト.
    /// </summary>
    [Fact]
    public void 時計回りに回転すると回転状態が1増える()
    {
        // Arrange
        this.stage.Initialize();
        this.player.CreateNewPuyo();
        this.player.SetPuyoY(5); // 安全な位置に配置
        var initialRotation = this.player.Rotation;

        // Act
        this.player.RotateRight();

        // Assert
        Assert.Equal((initialRotation + 1) % 4, this.player.Rotation);
    }

    /// <summary>
    /// 反時計回りに回転すると回転状態が1減るかテスト.
    /// </summary>
    [Fact]
    public void 反時計回りに回転すると回転状態が1減る()
    {
        // Arrange
        this.stage.Initialize();
        this.player.CreateNewPuyo();
        this.player.SetPuyoY(5); // 安全な位置に配置
        var initialRotation = this.player.Rotation;

        // Act
        this.player.RotateLeft();

        // Assert
        Assert.Equal((initialRotation + 3) % 4, this.player.Rotation);
    }

    /// <summary>
    /// 回転状態が4になると0に戻るかテスト.
    /// </summary>
    [Fact]
    public void 回転状態が4になると0に戻る()
    {
        // Arrange
        this.stage.Initialize();
        this.player.CreateNewPuyo();
        this.player.SetPuyoY(5); // 安全な位置に配置
        this.player.SetRotation(3);

        // Act
        this.player.RotateRight();

        // Assert
        Assert.Equal(0, this.player.Rotation);
    }

    /// <summary>
    /// 下キーが押されていると落下速度が上がるかテスト.
    /// </summary>
    [Fact]
    public void 下キーが押されていると落下速度が上がる()
    {
        // Arrange
        this.player.SetInputDown(true);

        // Act
        var dropSpeed = this.player.GetDropSpeed();

        // Assert
        Assert.True(dropSpeed > 1);
    }

    /// <summary>
    /// 下に移動できる場合下に移動するかテスト.
    /// </summary>
    [Fact]
    public void 下に移動できる場合下に移動する()
    {
        // Arrange
        this.player.CreateNewPuyo();
        var initialY = this.player.PuyoY;

        // Act
        var canMove = this.player.MoveDown();

        // Assert
        Assert.True(canMove);
        Assert.Equal(initialY + 1, this.player.PuyoY);
    }

    /// <summary>
    /// 下に障害物がある場合下に移動できないかテスト.
    /// </summary>
    [Fact]
    public void 下に障害物がある場合下に移動できない()
    {
        // Arrange
        this.player.CreateNewPuyo();
        this.player.SetPuyoY(this.config.StageHeight - 1);

        // Act
        var canMove = this.player.MoveDown();

        // Assert
        Assert.False(canMove);
        Assert.Equal(this.config.StageHeight - 1, this.player.PuyoY);
    }

    /// <summary>
    /// 回転が下向き(2)の場合子ぷよが地面にめり込まないかテスト.
    /// </summary>
    [Fact]
    public void 回転が下向きの場合子ぷよが地面にめり込まない()
    {
        // Arrange
        this.player.CreateNewPuyo();
        this.player.SetRotation(2); // 下向き
        this.player.SetPuyoY(this.config.StageHeight - 2);

        // Act
        var canMove = this.player.MoveDown();

        // Assert
        Assert.False(canMove);
        Assert.Equal(this.config.StageHeight - 2, this.player.PuyoY);
    }

    /// <summary>
    /// 回転が上向き(0)の場合は最下段まで移動できるかテスト.
    /// </summary>
    [Fact]
    public void 回転が上向きの場合は最下段まで移動できる()
    {
        // Arrange
        this.player.CreateNewPuyo();
        this.player.SetRotation(0); // 上向き
        this.player.SetPuyoY(this.config.StageHeight - 2);

        // Act
        var canMove = this.player.MoveDown();

        // Assert
        Assert.True(canMove);
        Assert.Equal(this.config.StageHeight - 1, this.player.PuyoY);
    }

    /// <summary>
    /// ぷよが着地したかどうかを判定できるかテスト.
    /// </summary>
    [Fact]
    public void ぷよが着地したかどうかを判定できる()
    {
        // Arrange
        this.player.CreateNewPuyo();
        this.player.SetPuyoY(this.config.StageHeight - 1);

        // Act
        var hasLanded = this.player.HasLanded();

        // Assert
        Assert.True(hasLanded);
    }

    /// <summary>
    /// ぷよが空中にいる場合は着地していないと判定されるかテスト.
    /// </summary>
    [Fact]
    public void ぷよが空中にいる場合は着地していないと判定される()
    {
        // Arrange
        this.player.CreateNewPuyo();
        this.player.SetPuyoY(5);

        // Act
        var hasLanded = this.player.HasLanded();

        // Assert
        Assert.False(hasLanded);
    }

    /// <summary>
    /// 着地したぷよをステージに配置できるかテスト.
    /// </summary>
    [Fact]
    public void 着地したぷよをステージに配置できる()
    {
        // Arrange
        this.stage.Initialize();
        this.player.CreateNewPuyo();
        this.player.SetPuyoX(1);
        this.player.SetPuyoY(11);
        this.player.SetRotation(0); // 上向き
        var puyoType = this.player.PuyoType;

        // Act
        this.player.PlacePuyoOnStage();

        // Assert
        // 軸ぷよ (1, 11) と子ぷよ (1, 10) がステージに配置される
        Assert.Equal(puyoType, this.stage.GetPuyo(1, 11));
        Assert.Equal(puyoType, this.stage.GetPuyo(1, 10));
    }

    /// <summary>
    /// ステージのぷよと衝突する場合は下に移動できないかテスト.
    /// </summary>
    [Fact]
    public void ステージのぷよと衝突する場合は下に移動できない()
    {
        // Arrange
        this.stage.Initialize();
        this.stage.SetPuyo(2, 10, 1); // ステージにぷよを配置
        this.player.CreateNewPuyo();
        this.player.SetPuyoX(2);
        this.player.SetPuyoY(9);
        this.player.SetRotation(0); // 上向き

        // Act
        var canMove = this.player.MoveDown();

        // Assert
        Assert.False(canMove);
    }

    /// <summary>
    /// 子ぷよがステージのぷよと衝突する場合は下に移動できないかテスト.
    /// </summary>
    [Fact]
    public void 子ぷよがステージのぷよと衝突する場合は下に移動できない()
    {
        // Arrange
        this.stage.Initialize();
        this.stage.SetPuyo(2, 9, 1); // ステージにぷよを配置
        this.player.CreateNewPuyo();
        this.player.SetPuyoX(2);
        this.player.SetPuyoY(9);
        this.player.SetRotation(0); // 上向き（子ぷよが y=8 にある）

        // Act
        var canMove = this.player.MoveDown();

        // Assert
        // 下に移動すると子ぷよが (2, 9) に衝突するので移動できない
        Assert.False(canMove);
    }

    /// <summary>
    /// ステージのぷよと衝突する場合は左に移動できないかテスト.
    /// </summary>
    [Fact]
    public void ステージのぷよと衝突する場合は左に移動できない()
    {
        // Arrange
        this.stage.Initialize();
        this.stage.SetPuyo(1, 5, 1); // ステージにぷよを配置
        this.player.CreateNewPuyo();
        this.player.SetPuyoX(2);
        this.player.SetPuyoY(5);
        this.player.SetRotation(0); // 上向き

        // Act
        this.player.MoveLeft();

        // Assert
        Assert.Equal(2, this.player.PuyoX); // 移動できないので位置は変わらない
    }

    /// <summary>
    /// ステージのぷよと衝突する場合は右に移動できないかテスト.
    /// </summary>
    [Fact]
    public void ステージのぷよと衝突する場合は右に移動できない()
    {
        // Arrange
        this.stage.Initialize();
        this.stage.SetPuyo(3, 5, 1); // ステージにぷよを配置
        this.player.CreateNewPuyo();
        this.player.SetPuyoX(2);
        this.player.SetPuyoY(5);
        this.player.SetRotation(0); // 上向き

        // Act
        this.player.MoveRight();

        // Assert
        Assert.Equal(2, this.player.PuyoX); // 移動できないので位置は変わらない
    }

    /// <summary>
    /// 子ぷよがステージのぷよと衝突する場合は左に移動できないかテスト.
    /// </summary>
    [Fact]
    public void 子ぷよがステージのぷよと衝突する場合は左に移動できない()
    {
        // Arrange
        this.stage.Initialize();
        this.stage.SetPuyo(2, 5, 1); // ステージにぷよを配置
        this.player.CreateNewPuyo();
        this.player.SetPuyoX(3);
        this.player.SetPuyoY(5);
        this.player.SetRotation(3); // 左向き（子ぷよが x=2 にある）

        // Act
        this.player.MoveLeft();

        // Assert
        Assert.Equal(3, this.player.PuyoX); // 移動できないので位置は変わらない
    }

    /// <summary>
    /// 子ぷよがステージのぷよと衝突する場合は右に移動できないかテスト.
    /// </summary>
    [Fact]
    public void 子ぷよがステージのぷよと衝突する場合は右に移動できない()
    {
        // Arrange
        this.stage.Initialize();
        this.stage.SetPuyo(3, 5, 1); // ステージにぷよを配置
        this.player.CreateNewPuyo();
        this.player.SetPuyoX(2);
        this.player.SetPuyoY(5);
        this.player.SetRotation(1); // 右向き（子ぷよが x=3 にある）

        // Act
        this.player.MoveRight();

        // Assert
        Assert.Equal(2, this.player.PuyoX); // 移動できないので位置は変わらない
    }

    /// <summary>
    /// 右端で右回転した時に左にがべキックされるかテスト.
    /// </summary>
    [Fact]
    public void 右端で右回転した時に左にがべキックされる()
    {
        // Arrange
        this.stage.Initialize();
        this.player.CreateNewPuyo();
        this.player.SetPuyoX(this.config.StageWidth - 1); // 右端に配置
        this.player.SetPuyoY(5);
        this.player.SetRotation(0); // 上向き
        var initialX = this.player.PuyoX;

        // Act
        this.player.RotateRight(); // 右回転すると子ぷよが右端を超える

        // Assert
        Assert.Equal(1, this.player.Rotation); // 回転は成功
        Assert.Equal(initialX - 1, this.player.PuyoX); // 左に1マスずれる
    }

    /// <summary>
    /// 左端で左回転した時に右にがべキックされるかテスト.
    /// </summary>
    [Fact]
    public void 左端で左回転した時に右にがべキックされる()
    {
        // Arrange
        this.stage.Initialize();
        this.player.CreateNewPuyo();
        this.player.SetPuyoX(0); // 左端に配置
        this.player.SetPuyoY(5);
        this.player.SetRotation(0); // 上向き
        var initialX = this.player.PuyoX;

        // Act
        this.player.RotateLeft(); // 左回転すると子ぷよが左端を超える

        // Assert
        Assert.Equal(3, this.player.Rotation); // 回転は成功
        Assert.Equal(initialX + 1, this.player.PuyoX); // 右に1マスずれる
    }

    /// <summary>
    /// 回転時に他のぷよと衝突する場合は回転できないかテスト.
    /// </summary>
    [Fact]
    public void 回転時に他のぷよと衝突する場合は回転できない()
    {
        // Arrange
        this.stage.Initialize();
        this.stage.SetPuyo(3, 5, 1); // 回転先にぷよを配置
        this.player.CreateNewPuyo();
        this.player.SetPuyoX(2);
        this.player.SetPuyoY(5);
        this.player.SetRotation(0); // 上向き
        var initialRotation = this.player.Rotation;

        // Act
        this.player.RotateRight(); // 右回転すると子ぷよが (3, 5) に衝突

        // Assert
        Assert.Equal(initialRotation, this.player.Rotation); // 回転できない
    }
}
