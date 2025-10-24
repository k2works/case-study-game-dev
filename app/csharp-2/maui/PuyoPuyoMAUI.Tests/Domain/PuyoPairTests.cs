using FluentAssertions;
using PuyoPuyoMAUI.Domain;
using Xunit;

namespace PuyoPuyoMAUI.Tests.Domain;

public class PuyoPairTests
{
    [Fact]
    public void ぷよペアを作成できる()
    {
        // Arrange & Act
        var pair = new PuyoPair(2, 0, PuyoColor.Red, PuyoColor.Green, 0);

        // Assert
        pair.X.Should().Be(2);
        pair.Y.Should().Be(0);
        pair.Puyo1Color.Should().Be(PuyoColor.Red);
        pair.Puyo2Color.Should().Be(PuyoColor.Green);
        pair.Rotation.Should().Be(0);
    }

    [Fact]
    public void 回転状態0のとき2つ目のぷよは上にある()
    {
        // Arrange
        var pair = new PuyoPair(2, 5, PuyoColor.Red, PuyoColor.Green, 0);

        // Act
        var (pos1, pos2) = pair.GetPositions();

        // Assert
        pos1.Should().Be((2, 5));  // 軸ぷよ
        pos2.Should().Be((2, 4));  // 2つ目のぷよは上
    }

    [Fact]
    public void 回転状態1のとき2つ目のぷよは右にある()
    {
        // Arrange
        var pair = new PuyoPair(2, 5, PuyoColor.Red, PuyoColor.Green, 1);

        // Act
        var (pos1, pos2) = pair.GetPositions();

        // Assert
        pos1.Should().Be((2, 5));  // 軸ぷよ
        pos2.Should().Be((3, 5));  // 2つ目のぷよは右
    }

    [Fact]
    public void 回転状態2のとき2つ目のぷよは下にある()
    {
        // Arrange
        var pair = new PuyoPair(2, 5, PuyoColor.Red, PuyoColor.Green, 2);

        // Act
        var (pos1, pos2) = pair.GetPositions();

        // Assert
        pos1.Should().Be((2, 5));  // 軸ぷよ
        pos2.Should().Be((2, 6));  // 2つ目のぷよは下
    }

    [Fact]
    public void 回転状態3のとき2つ目のぷよは左にある()
    {
        // Arrange
        var pair = new PuyoPair(2, 5, PuyoColor.Red, PuyoColor.Green, 3);

        // Act
        var (pos1, pos2) = pair.GetPositions();

        // Assert
        pos1.Should().Be((2, 5));  // 軸ぷよ
        pos2.Should().Be((1, 5));  // 2つ目のぷよは左
    }

    [Fact]
    public void 時計回りに回転すると回転状態が1増える()
    {
        // Arrange
        var pair = new PuyoPair(2, 5, PuyoColor.Red, PuyoColor.Green, 0);

        // Act
        var rotated = pair.RotateClockwise();

        // Assert
        rotated.Rotation.Should().Be(1);
    }

    [Fact]
    public void 回転状態3から時計回りに回転すると0に戻る()
    {
        // Arrange
        var pair = new PuyoPair(2, 5, PuyoColor.Red, PuyoColor.Green, 3);

        // Act
        var rotated = pair.RotateClockwise();

        // Assert
        rotated.Rotation.Should().Be(0);
    }

    [Fact]
    public void 回転すると2つ目のぷよの位置が変わる()
    {
        // Arrange
        var pair = new PuyoPair(3, 5, PuyoColor.Red, PuyoColor.Green, 0);  // 回転状態0（上）

        // Act
        var rotated = pair.RotateClockwise();  // 回転状態1（右）
        var (pos1, pos2) = rotated.GetPositions();

        // Assert
        pos1.Should().Be((3, 5));  // 軸ぷよは変わらない
        pos2.Should().Be((4, 5));  // 2つ目のぷよは右に
    }
}
