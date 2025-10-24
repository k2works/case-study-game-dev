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
}
