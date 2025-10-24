namespace PuyoPuyoMAUI.Domain;

/// <summary>
/// ゲームロジック
/// </summary>
public static class GameLogic
{
    /// <summary>
    /// 指定位置が有効かチェック
    /// </summary>
    private static bool IsValidPosition(Board board, int x, int y)
    {
        return y >= 0 && y < board.Rows && x >= 0 && x < board.Cols &&
               board.GetCell(x, y).IsEmpty;
    }

    /// <summary>
    /// ぷよペアが配置可能かチェック
    /// </summary>
    public static bool CanPlacePuyoPair(Board board, PuyoPair pair)
    {
        var (pos1, pos2) = pair.GetPositions();
        return IsValidPosition(board, pos1.X, pos1.Y) &&
               IsValidPosition(board, pos2.X, pos2.Y);
    }

    /// <summary>
    /// ぷよペアを指定方向に移動（可能な場合のみ）
    /// </summary>
    /// <returns>移動後のぷよペア。移動できない場合はnull</returns>
    public static PuyoPair? TryMovePuyoPair(Board board, PuyoPair pair, Direction direction)
    {
        var (dx, dy) = direction switch
        {
            Direction.Left => (-1, 0),
            Direction.Right => (1, 0),
            Direction.Down => (0, 1),
            _ => (0, 0)
        };

        var newPair = pair with { X = pair.X + dx, Y = pair.Y + dy };

        return CanPlacePuyoPair(board, newPair) ? newPair : null;
    }

    /// <summary>
    /// ぷよペアを回転（壁キック処理付き）
    /// </summary>
    /// <returns>回転後のぷよペア。回転できない場合はnull</returns>
    public static PuyoPair? TryRotatePuyoPair(Board board, PuyoPair pair)
    {
        // 通常回転を試す
        var rotated = pair.RotateClockwise();

        if (CanPlacePuyoPair(board, rotated))
        {
            return rotated;
        }

        // 壁キックを試す（左に1マス）
        var kickedLeft = rotated with { X = rotated.X - 1 };
        if (CanPlacePuyoPair(board, kickedLeft))
        {
            return kickedLeft;
        }

        // 壁キックを試す（右に1マス）
        var kickedRight = rotated with { X = rotated.X + 1 };
        if (CanPlacePuyoPair(board, kickedRight))
        {
            return kickedRight;
        }

        // 回転できない
        return null;
    }

    /// <summary>
    /// ゲームオーバー判定
    /// </summary>
    public static bool CheckGameOver(Board board, PuyoPair newPiece)
    {
        // 新しいぷよが配置できない場合はゲームオーバー
        return !CanPlacePuyoPair(board, newPiece);
    }
}
