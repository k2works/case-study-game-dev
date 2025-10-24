using FluentAssertions;
using PuyoPuyoMAUI.Domain;
using Xunit;

namespace PuyoPuyoMAUI.Tests.Domain;

public class CellTests
{
    [Fact]
    public void 空のセルが作成できる()
    {
        // Arrange & Act
        var cell = Cell.Empty;

        // Assert
        cell.IsEmpty.Should().BeTrue();
        cell.IsFilled.Should().BeFalse();
    }

    [Fact]
    public void 赤ぷよで埋まったセルが作成できる()
    {
        // Arrange & Act
        var cell = Cell.Filled(PuyoColor.Red);

        // Assert
        cell.IsEmpty.Should().BeFalse();
        cell.IsFilled.Should().BeTrue();
        cell.Color.Should().Be(PuyoColor.Red);
    }

    [Fact]
    public void 空のセルから色を取得しようとすると例外が発生する()
    {
        // Arrange
        var cell = Cell.Empty;

        // Act & Assert
        var act = () => cell.Color;
        act.Should().Throw<InvalidOperationException>();
    }
}
