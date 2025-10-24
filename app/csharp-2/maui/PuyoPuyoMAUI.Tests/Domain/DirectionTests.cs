using FluentAssertions;
using PuyoPuyoMAUI.Domain;
using Xunit;

namespace PuyoPuyoMAUI.Tests.Domain;

public class DirectionTests
{
    [Fact]
    public void 移動方向は3種類定義されている()
    {
        // Arrange & Act
        var directions = Enum.GetValues<Direction>();

        // Assert
        directions.Should().HaveCount(3);
    }

    [Fact]
    public void 左方向が定義されている()
    {
        // Arrange & Act
        var direction = Direction.Left;

        // Assert
        direction.Should().Be(Direction.Left);
    }

    [Fact]
    public void 右方向が定義されている()
    {
        // Arrange & Act
        var direction = Direction.Right;

        // Assert
        direction.Should().Be(Direction.Right);
    }

    [Fact]
    public void 下方向が定義されている()
    {
        // Arrange & Act
        var direction = Direction.Down;

        // Assert
        direction.Should().Be(Direction.Down);
    }
}
