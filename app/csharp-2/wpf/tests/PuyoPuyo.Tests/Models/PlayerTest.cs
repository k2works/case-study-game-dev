using Xunit;
using PuyoPuyo.WPF.Models;

namespace PuyoPuyo.Tests.Models;

public class PlayerTest
{
    private readonly Config _config;
    private readonly Stage _stage;
    private readonly Player _player;

    public PlayerTest()
    {
        _config = new Config();
        _stage = new Stage(_config.StageWidth, _config.StageHeight);
        _player = new Player();
    }

    [Fact]
    public void 左キーが押されると左向きの移動フラグが立つ()
    {
        // Act
        _player.SetInputLeft(true);

        // Assert
        Assert.True(_player.InputKeyLeft);
    }

    [Fact]
    public void 右キーが押されると右向きの移動フラグが立つ()
    {
        // Act
        _player.SetInputRight(true);

        // Assert
        Assert.True(_player.InputKeyRight);
    }

    [Fact]
    public void キーが離されると対応する移動フラグが下がる()
    {
        // Arrange
        _player.SetInputLeft(true);
        Assert.True(_player.InputKeyLeft);

        // Act
        _player.SetInputLeft(false);

        // Assert
        Assert.False(_player.InputKeyLeft);
    }

    [Fact]
    public void 左に移動できる()
    {
        // Arrange
        int initialX = _player.CurrentX;

        // Act
        _player.MoveLeft(_stage);

        // Assert
        Assert.Equal(initialX - 1, _player.CurrentX);
    }

    [Fact]
    public void 右に移動できる()
    {
        // Arrange
        int initialX = _player.CurrentX;

        // Act
        _player.MoveRight(_stage);

        // Assert
        Assert.Equal(initialX + 1, _player.CurrentX);
    }

    [Fact]
    public void 左端では左に移動できない()
    {
        // Arrange
        _player.CurrentX = 0;

        // Act
        _player.MoveLeft(_stage);

        // Assert
        Assert.Equal(0, _player.CurrentX);
    }

    [Fact]
    public void 右端では右に移動できない()
    {
        // Arrange
        _player.CurrentX = _config.StageWidth - 1;

        // Act
        _player.MoveRight(_stage);

        // Assert
        Assert.Equal(_config.StageWidth - 1, _player.CurrentX);
    }

    [Fact]
    public void 時計回りに回転すると回転状態が1増える()
    {
        // Arrange
        int initialRotation = _player.Rotation;

        // Act
        _player.RotateRight(_stage);

        // Assert
        Assert.Equal((initialRotation + 1) % 4, _player.Rotation);
    }

    [Fact]
    public void 反時計回りに回転すると回転状態が1減る()
    {
        // Arrange
        _player.Rotation = 1;

        // Act
        _player.RotateLeft(_stage);

        // Assert
        Assert.Equal(0, _player.Rotation);
    }

    [Fact]
    public void 回転状態は0から3の範囲で循環する()
    {
        // Arrange
        _player.Rotation = 3;

        // Act
        _player.RotateRight(_stage);

        // Assert
        Assert.Equal(0, _player.Rotation);
    }

    [Fact]
    public void 回転状態が0から反時計回りに回転すると3になる()
    {
        // Arrange
        _player.Rotation = 0;

        // Act
        _player.RotateLeft(_stage);

        // Assert
        Assert.Equal(3, _player.Rotation);
    }

    [Fact]
    public void 下キーの入力フラグを設定できる()
    {
        // Act
        _player.SetInputDown(true);

        // Assert
        Assert.True(_player.InputKeyDown);
    }

    [Fact]
    public void 下に移動できる場合下に移動する()
    {
        // Arrange
        int initialY = _player.CurrentY;

        // Act
        bool moved = _player.MoveDown(_stage);

        // Assert
        Assert.True(moved);
        Assert.Equal(initialY + 1, _player.CurrentY);
    }

    [Fact]
    public void 下端では下に移動できない()
    {
        // Arrange
        _player.CurrentY = _config.StageHeight - 1;

        // Act
        bool moved = _player.MoveDown(_stage);

        // Assert
        Assert.False(moved);
        Assert.Equal(_config.StageHeight - 1, _player.CurrentY);
    }

    [Fact]
    public void 下にぷよがある場合下に移動できない()
    {
        // Arrange
        _player.CurrentY = 5;
        _stage.SetCell(_player.CurrentX, _player.CurrentY + 1, 1);

        // Act
        bool moved = _player.MoveDown(_stage);

        // Assert
        Assert.False(moved);
        Assert.Equal(5, _player.CurrentY);
    }

    [Fact]
    public void 高速落下フラグを取得できる()
    {
        // Arrange
        _player.SetInputDown(false);
        bool normalSpeed = _player.IsFastDrop;

        _player.SetInputDown(true);
        bool fastSpeed = _player.IsFastDrop;

        // Assert
        Assert.False(normalSpeed);
        Assert.True(fastSpeed);
    }

    [Fact]
    public void 着地時にぷよをステージに配置できる()
    {
        // Arrange
        _player.CurrentX = 2;
        _player.CurrentY = 11;
        _player.Rotation = 0; // 副ぷよは上
        if (_player.CurrentPuyo != null && _player.SubPuyo != null)
        {
            var mainColor = _player.CurrentPuyo.Color;
            var subColor = _player.SubPuyo.Color;

            // Act
            _player.PlacePuyoOnStage(_stage);

            // Assert
            Assert.Equal((int)mainColor, _stage.GetCell(2, 11));
            Assert.Equal((int)subColor, _stage.GetCell(2, 10));
        }
    }
}
