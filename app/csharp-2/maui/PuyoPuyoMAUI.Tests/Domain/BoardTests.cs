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

    [Fact]
    public void FindConnectedGroups_横一列の4つのぷよを検出できる()
    {
        // Arrange
        var board = Board.Create(6, 13);
        board = board
            .SetCell(0, 12, Cell.Filled(PuyoColor.Red))
            .SetCell(1, 12, Cell.Filled(PuyoColor.Red))
            .SetCell(2, 12, Cell.Filled(PuyoColor.Red))
            .SetCell(3, 12, Cell.Filled(PuyoColor.Red));

        // Act
        var groups = board.FindConnectedGroups();

        // Assert
        groups.Should().HaveCount(1);
        groups[0].Should().HaveCount(4);
    }

    [Fact]
    public void FindConnectedGroups_縦一列の4つのぷよを検出できる()
    {
        // Arrange
        var board = Board.Create(6, 13);
        board = board
            .SetCell(2, 9, Cell.Filled(PuyoColor.Green))
            .SetCell(2, 10, Cell.Filled(PuyoColor.Green))
            .SetCell(2, 11, Cell.Filled(PuyoColor.Green))
            .SetCell(2, 12, Cell.Filled(PuyoColor.Green));

        // Act
        var groups = board.FindConnectedGroups();

        // Assert
        groups.Should().HaveCount(1);
        groups[0].Should().HaveCount(4);
    }

    [Fact]
    public void FindConnectedGroups_L字型の5つのぷよを検出できる()
    {
        // Arrange
        var board = Board.Create(6, 13);
        board = board
            .SetCell(1, 10, Cell.Filled(PuyoColor.Blue))
            .SetCell(1, 11, Cell.Filled(PuyoColor.Blue))
            .SetCell(1, 12, Cell.Filled(PuyoColor.Blue))
            .SetCell(2, 12, Cell.Filled(PuyoColor.Blue))
            .SetCell(3, 12, Cell.Filled(PuyoColor.Blue));

        // Act
        var groups = board.FindConnectedGroups();

        // Assert
        groups.Should().HaveCount(1);
        groups[0].Should().HaveCount(5);
    }

    [Fact]
    public void FindConnectedGroups_3つ以下のグループは無視する()
    {
        // Arrange
        var board = Board.Create(6, 13);
        board = board
            .SetCell(0, 12, Cell.Filled(PuyoColor.Yellow))
            .SetCell(1, 12, Cell.Filled(PuyoColor.Yellow))
            .SetCell(2, 12, Cell.Filled(PuyoColor.Yellow));

        // Act
        var groups = board.FindConnectedGroups();

        // Assert
        groups.Should().BeEmpty();
    }

    [Fact]
    public void ClearPuyos_指定された位置のぷよを消去できる()
    {
        // Arrange
        var board = Board.Create(6, 13);
        board = board
            .SetCell(0, 12, Cell.Filled(PuyoColor.Red))
            .SetCell(1, 12, Cell.Filled(PuyoColor.Red))
            .SetCell(2, 12, Cell.Filled(PuyoColor.Red))
            .SetCell(3, 12, Cell.Filled(PuyoColor.Red));

        // Act
        var positions = new List<(int X, int Y)> { (0, 12), (1, 12), (2, 12), (3, 12) };
        var newBoard = board.ClearPuyos(positions);

        // Assert
        newBoard.GetCell(0, 12).Should().Be(Cell.Empty);
        newBoard.GetCell(1, 12).Should().Be(Cell.Empty);
        newBoard.GetCell(2, 12).Should().Be(Cell.Empty);
        newBoard.GetCell(3, 12).Should().Be(Cell.Empty);
    }

    [Fact]
    public void ApplyGravity_浮いているぷよが落下する()
    {
        // Arrange
        var board = Board.Create(6, 13);
        board = board
            .SetCell(2, 8, Cell.Filled(PuyoColor.Green))   // 浮いているぷよ
            .SetCell(2, 12, Cell.Filled(PuyoColor.Red));    // 下にあるぷよ

        // Act
        var newBoard = board.ApplyGravity();

        // Assert
        newBoard.GetCell(2, 8).Should().Be(Cell.Empty);
        newBoard.GetCell(2, 11).Should().Be(Cell.Filled(PuyoColor.Green));  // 落ちた
        newBoard.GetCell(2, 12).Should().Be(Cell.Filled(PuyoColor.Red));
    }

    [Fact]
    public void ApplyGravity_複数のぷよが落下する()
    {
        // Arrange
        var board = Board.Create(6, 13);
        board = board
            .SetCell(1, 5, Cell.Filled(PuyoColor.Blue))
            .SetCell(1, 6, Cell.Filled(PuyoColor.Yellow))
            .SetCell(1, 12, Cell.Filled(PuyoColor.Red));

        // Act
        var newBoard = board.ApplyGravity();

        // Assert
        newBoard.GetCell(1, 5).Should().Be(Cell.Empty);
        newBoard.GetCell(1, 6).Should().Be(Cell.Empty);
        newBoard.GetCell(1, 10).Should().Be(Cell.Filled(PuyoColor.Blue));
        newBoard.GetCell(1, 11).Should().Be(Cell.Filled(PuyoColor.Yellow));
        newBoard.GetCell(1, 12).Should().Be(Cell.Filled(PuyoColor.Red));
    }

    [Fact]
    public void 消去と重力の統合_消去後に上のぷよが落下する()
    {
        // Arrange
        var board = Board.Create(6, 13);
        board = board
            .SetCell(0, 12, Cell.Filled(PuyoColor.Red))
            .SetCell(1, 12, Cell.Filled(PuyoColor.Red))
            .SetCell(2, 12, Cell.Filled(PuyoColor.Red))
            .SetCell(3, 12, Cell.Filled(PuyoColor.Red))
            .SetCell(2, 10, Cell.Filled(PuyoColor.Blue));

        // Act - 消去して重力を適用
        var groups = board.FindConnectedGroups();
        var positions = groups.SelectMany(g => g).ToList();
        var clearedBoard = board.ClearPuyos(positions);
        var finalBoard = clearedBoard.ApplyGravity();

        // Assert
        finalBoard.GetCell(0, 12).Should().Be(Cell.Empty);
        finalBoard.GetCell(1, 12).Should().Be(Cell.Empty);
        finalBoard.GetCell(2, 12).Should().Be(Cell.Filled(PuyoColor.Blue));  // 青が落ちてきた
        finalBoard.GetCell(3, 12).Should().Be(Cell.Empty);
    }
}
