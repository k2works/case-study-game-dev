using FluentAssertions;
using PuyoPuyoMAUI.Domain;
using Xunit;

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

    [Fact]
    public void ぷよペアをボードに固定できる()
    {
        // Arrange
        var board = Board.Create(6, 13);
        var pair = new PuyoPair(3, 11, PuyoColor.Red, PuyoColor.Green, 0);

        // Act
        var newBoard = board.FixPuyoPair(pair);

        // Assert
        newBoard.GetCell(3, 11).Should().Be(Cell.Filled(PuyoColor.Red));
        newBoard.GetCell(3, 10).Should().Be(Cell.Filled(PuyoColor.Green));
    }

    [Fact]
    public void ぷよペアを固定しても元のボードは変更されない()
    {
        // Arrange
        var board = Board.Create(6, 13);
        var pair = new PuyoPair(3, 11, PuyoColor.Red, PuyoColor.Green, 0);

        // Act
        var newBoard = board.FixPuyoPair(pair);

        // Assert
        board.GetCell(3, 11).Should().Be(Cell.Empty);
        board.GetCell(3, 10).Should().Be(Cell.Empty);
        newBoard.GetCell(3, 11).Should().Be(Cell.Filled(PuyoColor.Red));
        newBoard.GetCell(3, 10).Should().Be(Cell.Filled(PuyoColor.Green));
    }
}
