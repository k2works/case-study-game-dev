using Xunit;
using FluentAssertions;
using PuyoPuyoMAUI.Domain;

namespace PuyoPuyoMAUI.Tests.Domain;

public class BoardTests
{
    [Fact]
    public void 空のボードを作成できる()
    {
        // Arrange & Act
        var board = Board.Create(6, 13);

        // Assert
        board.Cols.Should().Be(6);
        board.Rows.Should().Be(13);
    }

    [Fact]
    public void 作成直後のボードはすべて空である()
    {
        // Arrange & Act
        var board = Board.Create(6, 13);

        // Assert
        for (int y = 0; y < board.Rows; y++)
        {
            for (int x = 0; x < board.Cols; x++)
            {
                board.GetCell(x, y).Should().Be(Cell.Empty);
            }
        }
    }

    [Fact]
    public void ボードにぷよを配置できる()
    {
        // Arrange
        var board = Board.Create(6, 13);

        // Act
        var newBoard = board.SetCell(2, 10, Cell.Filled(PuyoColor.Red));

        // Assert
        newBoard.GetCell(2, 10).Should().Be(Cell.Filled(PuyoColor.Red));
    }

    [Fact]
    public void ボードにぷよを配置しても元のボードは変更されない()
    {
        // Arrange
        var board = Board.Create(6, 13);

        // Act
        var newBoard = board.SetCell(2, 10, Cell.Filled(PuyoColor.Red));

        // Assert
        board.GetCell(2, 10).Should().Be(Cell.Empty);
        newBoard.GetCell(2, 10).Should().Be(Cell.Filled(PuyoColor.Red));
    }

    [Fact]
    public void 範囲外のセルを取得すると空のセルが返される()
    {
        // Arrange
        var board = Board.Create(6, 13);

        // Act & Assert
        board.GetCell(-1, 0).Should().Be(Cell.Empty);
        board.GetCell(0, -1).Should().Be(Cell.Empty);
        board.GetCell(6, 0).Should().Be(Cell.Empty);
        board.GetCell(0, 13).Should().Be(Cell.Empty);
    }
}
