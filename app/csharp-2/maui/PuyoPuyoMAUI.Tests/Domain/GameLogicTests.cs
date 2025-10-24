using FluentAssertions;
using PuyoPuyoMAUI.Domain;
using Xunit;

namespace PuyoPuyoMAUI.Tests.Domain;

public class GameLogicTests
{
    [Fact]
    public void ぷよペアを左に移動できる()
    {
        // Arrange
        var board = Board.Create(6, 13);
        var pair = new PuyoPair(3, 5, PuyoColor.Red, PuyoColor.Green, 0);

        // Act
        var result = GameLogic.TryMovePuyoPair(board, pair, Direction.Left);

        // Assert
        result.Should().NotBeNull();
        result!.X.Should().Be(2);
        result.Y.Should().Be(5);
    }

    [Fact]
    public void ぷよペアを右に移動できる()
    {
        // Arrange
        var board = Board.Create(6, 13);
        var pair = new PuyoPair(2, 5, PuyoColor.Red, PuyoColor.Green, 0);

        // Act
        var result = GameLogic.TryMovePuyoPair(board, pair, Direction.Right);

        // Assert
        result.Should().NotBeNull();
        result!.X.Should().Be(3);
        result.Y.Should().Be(5);
    }

    [Fact]
    public void 左端では左に移動できない()
    {
        // Arrange
        var board = Board.Create(6, 13);
        var pair = new PuyoPair(0, 5, PuyoColor.Red, PuyoColor.Green, 0);

        // Act
        var result = GameLogic.TryMovePuyoPair(board, pair, Direction.Left);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void 右端では右に移動できない()
    {
        // Arrange
        var board = Board.Create(6, 13);
        var pair = new PuyoPair(5, 5, PuyoColor.Red, PuyoColor.Green, 0);

        // Act
        var result = GameLogic.TryMovePuyoPair(board, pair, Direction.Right);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void 回転状態1_右向き_のとき右端で右に移動できない()
    {
        // Arrange
        var board = Board.Create(6, 13);
        // 回転状態1のとき、2つ目のぷよは右にある
        var pair = new PuyoPair(4, 5, PuyoColor.Red, PuyoColor.Green, 1);

        // Act
        var result = GameLogic.TryMovePuyoPair(board, pair, Direction.Right);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void ぷよペアが配置可能な位置かチェックできる()
    {
        // Arrange
        var board = Board.Create(6, 13);
        var pair = new PuyoPair(2, 5, PuyoColor.Red, PuyoColor.Green, 0);

        // Act
        var result = GameLogic.CanPlacePuyoPair(board, pair);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void ボードの外は配置不可能()
    {
        // Arrange
        var board = Board.Create(6, 13);
        var pair = new PuyoPair(-1, 5, PuyoColor.Red, PuyoColor.Green, 0);

        // Act
        var result = GameLogic.CanPlacePuyoPair(board, pair);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void 他のぷよがある場所は配置不可能()
    {
        // Arrange
        var board = Board.Create(6, 13)
            .SetCell(2, 5, Cell.Filled(PuyoColor.Blue));
        var pair = new PuyoPair(2, 5, PuyoColor.Red, PuyoColor.Green, 0);

        // Act
        var result = GameLogic.CanPlacePuyoPair(board, pair);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void 右端で回転すると左にキックされる()
    {
        // Arrange
        var board = Board.Create(6, 13);
        var pair = new PuyoPair(5, 5, PuyoColor.Red, PuyoColor.Green, 0);  // 右端、回転状態0（上）

        // Act
        var result = GameLogic.TryRotatePuyoPair(board, pair);

        // Assert
        result.Should().NotBeNull();
        result!.Rotation.Should().Be(1);  // 回転成功
        result.X.Should().Be(4);  // 左に1マスキック
    }

    [Fact]
    public void 左端で左向きから回転すると右にキックされる()
    {
        // Arrange
        var board = Board.Create(6, 13)
            .SetCell(0, 4, Cell.Filled(PuyoColor.Blue));  // 上に障害物
        var pair = new PuyoPair(0, 5, PuyoColor.Red, PuyoColor.Green, 3);  // 左端、回転状態3（左）

        // Act
        var result = GameLogic.TryRotatePuyoPair(board, pair);

        // Assert
        result.Should().NotBeNull();
        result!.Rotation.Should().Be(0);  // 回転成功
        result.X.Should().Be(1);  // 右に1マスキック
    }

    [Fact]
    public void 壁キックできない場合は回転しない()
    {
        // Arrange
        var board = Board.Create(6, 13);
        // 右端にぷよを配置（壁キックできない状況を作る）
        var board2 = board.SetCell(4, 5, Cell.Filled(PuyoColor.Blue));
        var pair = new PuyoPair(5, 5, PuyoColor.Red, PuyoColor.Green, 0);

        // Act
        var result = GameLogic.TryRotatePuyoPair(board2, pair);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void 通常の回転が可能な場合は壁キックしない()
    {
        // Arrange
        var board = Board.Create(6, 13);
        var pair = new PuyoPair(3, 5, PuyoColor.Red, PuyoColor.Green, 0);

        // Act
        var result = GameLogic.TryRotatePuyoPair(board, pair);

        // Assert
        result.Should().NotBeNull();
        result!.Rotation.Should().Be(1);
        result.X.Should().Be(3);  // 位置は変わらない
    }
}
