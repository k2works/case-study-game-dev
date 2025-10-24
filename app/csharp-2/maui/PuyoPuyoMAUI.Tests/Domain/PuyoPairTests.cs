using Xunit;
using FluentAssertions;
using PuyoPuyoMAUI.Domain;

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
}
