using FluentAssertions;
using PuyoPuyoMAUI.Domain;
using Xunit;

namespace PuyoPuyoMAUI.Tests;

public class IntegrationTests
{
    [Fact]
    public void 完全なゲームフロー_着地から消去_重力_連鎖_スコア加算()
    {
        // 初期ボード: 下に縦に3つの赤ぷよが配置されている
        var board = Board.Create(6, 13)
            .SetCell(2, 10, Cell.Filled(PuyoColor.Red))
            .SetCell(2, 11, Cell.Filled(PuyoColor.Red))
            .SetCell(2, 12, Cell.Filled(PuyoColor.Red));

        // 新しいぷよペア: 赤と青のペア（縦向き、回転状態0）
        var piece = new PuyoPair(2, 1, PuyoColor.Red, PuyoColor.Blue, 0);

        // 1. ぷよペアを下まで移動
        PuyoPair MoveToBottom(PuyoPair currentPiece)
        {
            var movedPiece = GameLogic.TryMovePuyoPair(board, currentPiece, Direction.Down);
            if (movedPiece != null)
            {
                return MoveToBottom(movedPiece);
            }

            return currentPiece;
        }

        var landedPiece = MoveToBottom(piece);

        // 2. 着地処理
        var boardWithPuyo = board.FixPuyoPair(landedPiece);

        // ボードに赤ぷよが4つ縦に並んでいるはず
        boardWithPuyo.GetCell(2, 9).Color.Should().Be(PuyoColor.Red);  // 新規 Puyo1
        boardWithPuyo.GetCell(2, 10).Color.Should().Be(PuyoColor.Red); // 既存
        boardWithPuyo.GetCell(2, 11).Color.Should().Be(PuyoColor.Red); // 既存
        boardWithPuyo.GetCell(2, 12).Color.Should().Be(PuyoColor.Red); // 既存

        // 青ぷよは上にあるはず
        boardWithPuyo.GetCell(2, 8).Color.Should().Be(PuyoColor.Blue); // 新規 Puyo2

        // 3. 連鎖処理（消去と重力を繰り返し適用）
        var (finalBoard, clearedCounts, isZenkeshi) = boardWithPuyo.ClearAndApplyGravityRepeatedlyWithChainInfo();

        // 4. 赤ぷよが4つ消えているはず
        finalBoard.GetCell(2, 9).IsEmpty.Should().BeTrue();
        finalBoard.GetCell(2, 10).IsEmpty.Should().BeTrue();
        finalBoard.GetCell(2, 11).IsEmpty.Should().BeTrue();
        finalBoard.GetCell(2, 12).IsEmpty.Should().BeFalse(); // 青ぷよが落ちてくる

        // 5. 青ぷよは重力で下に落ちているはず
        finalBoard.GetCell(2, 12).Color.Should().Be(PuyoColor.Blue);

        // 6. 全消しではない（青ぷよが残っている）
        isZenkeshi.Should().BeFalse();

        // 7. 連鎖数は1回
        clearedCounts.Count.Should().Be(1);

        // 8. 消去数は4個
        clearedCounts[0].Should().Be(4);
    }

    [Fact]
    public void 完全なゲームフロー_全消しボーナス()
    {
        // 初期ボード: 3つの赤ぷよのみ
        var board = Board.Create(6, 13)
            .SetCell(1, 12, Cell.Filled(PuyoColor.Red))
            .SetCell(2, 12, Cell.Filled(PuyoColor.Red))
            .SetCell(3, 12, Cell.Filled(PuyoColor.Red));

        // 新しいぷよペア: 赤2つ
        var piece = new PuyoPair(1, 1, PuyoColor.Red, PuyoColor.Red, 0);

        // 着地まで移動
        PuyoPair MoveToBottom(PuyoPair currentPiece)
        {
            var movedPiece = GameLogic.TryMovePuyoPair(board, currentPiece, Direction.Down);
            if (movedPiece != null)
            {
                return MoveToBottom(movedPiece);
            }

            return currentPiece;
        }

        var landedPiece = MoveToBottom(piece);
        var boardWithPuyo = board.FixPuyoPair(landedPiece);

        // 連鎖処理
        var (finalBoard, clearedCounts, isZenkeshi) = boardWithPuyo.ClearAndApplyGravityRepeatedlyWithChainInfo();

        // 全て消えているはず
        for (int y = 0; y < finalBoard.Rows; y++)
        {
            for (int x = 0; x < finalBoard.Cols; x++)
            {
                finalBoard.GetCell(x, y).IsEmpty.Should().BeTrue();
            }
        }

        // 全消し判定
        isZenkeshi.Should().BeTrue();

        // 連鎖数は1回
        clearedCounts.Count.Should().Be(1);

        // 消去数は5個（既存3個 + 新規2個）
        clearedCounts[0].Should().Be(5);
    }

    [Fact]
    public void 完全なゲームフロー_ゲームオーバー判定()
    {
        // 初期ボード: 上部までぷよで埋まっている
        var board = Board.Create(6, 13);
        for (int y = 1; y <= 12; y++)
        {
            board = board.SetCell(2, y, Cell.Filled(PuyoColor.Red));
        }

        // 新しいぷよペア
        var newPiece = new PuyoPair(2, 1, PuyoColor.Blue, PuyoColor.Green, 0);

        // ゲームオーバー判定
        var isGameOver = GameLogic.CheckGameOver(board, newPiece);

        // ゲームオーバーになるはず
        isGameOver.Should().BeTrue();
    }
}
