using Xunit;
using FluentAssertions;
using PuyoPuyoMAUI.Domain;

namespace PuyoPuyoMAUI.Tests.Domain;

public class PuyoColorTests
{
    [Fact]
    public void ぷよの色は4種類定義されている()
    {
        // Arrange & Act
        var colors = Enum.GetValues<PuyoColor>();

        // Assert
        colors.Should().HaveCount(4);
    }

    [Fact]
    public void 赤色のぷよが作成できる()
    {
        // Arrange & Act
        var puyo = PuyoColor.Red;

        // Assert
        puyo.Should().Be(PuyoColor.Red);
    }

    [Fact]
    public void 緑色のぷよが作成できる()
    {
        // Arrange & Act
        var puyo = PuyoColor.Green;

        // Assert
        puyo.Should().Be(PuyoColor.Green);
    }

    [Fact]
    public void 青色のぷよが作成できる()
    {
        // Arrange & Act
        var puyo = PuyoColor.Blue;

        // Assert
        puyo.Should().Be(PuyoColor.Blue);
    }

    [Fact]
    public void 黄色のぷよが作成できる()
    {
        // Arrange & Act
        var puyo = PuyoColor.Yellow;

        // Assert
        puyo.Should().Be(PuyoColor.Yellow);
    }
}
