namespace PuyoPuyoMAUI.Domain;

/// <summary>
/// ゲームボード
/// </summary>
public sealed record Board
{
    /// <summary>
    /// 列数
    /// </summary>
    public int Cols { get; init; }

    /// <summary>
    /// 行数
    /// </summary>
    public int Rows { get; init; }

    /// <summary>
    /// セルの配列（Y, X の順）
    /// </summary>
    private Cell[][] Cells { get; init; }

    private Board(int cols, int rows, Cell[][] cells)
    {
        Cols = cols;
        Rows = rows;
        Cells = cells;
    }

    /// <summary>
    /// 空のボードを作成
    /// </summary>
    public static Board Create(int cols, int rows)
    {
        var cells = new Cell[rows][];
        for (int y = 0; y < rows; y++)
        {
            cells[y] = new Cell[cols];
            for (int x = 0; x < cols; x++)
            {
                cells[y][x] = Cell.Empty;
            }
        }

        return new Board(cols, rows, cells);
    }

    /// <summary>
    /// セルの取得
    /// </summary>
    public Cell GetCell(int x, int y)
    {
        if (y >= 0 && y < Rows && x >= 0 && x < Cols)
        {
            return Cells[y][x];
        }

        return Cell.Empty;
    }

    /// <summary>
    /// セルの設定（イミュータブル）
    /// </summary>
    public Board SetCell(int x, int y, Cell cell)
    {
        if (y < 0 || y >= Rows || x < 0 || x >= Cols)
        {
            return this;
        }

        var newCells = new Cell[Rows][];
        for (int rowIndex = 0; rowIndex < Rows; rowIndex++)
        {
            newCells[rowIndex] = new Cell[Cols];
            for (int colIndex = 0; colIndex < Cols; colIndex++)
            {
                if (rowIndex == y && colIndex == x)
                {
                    newCells[rowIndex][colIndex] = cell;
                }
                else
                {
                    newCells[rowIndex][colIndex] = Cells[rowIndex][colIndex];
                }
            }
        }

        return this with { Cells = newCells };
    }

    /// <summary>
    /// ぷよペアをボードに固定
    /// </summary>
    public Board FixPuyoPair(PuyoPair pair)
    {
        var (pos1, pos2) = pair.GetPositions();

        return this
            .SetCell(pos1.X, pos1.Y, Cell.Filled(pair.Puyo1Color))
            .SetCell(pos2.X, pos2.Y, Cell.Filled(pair.Puyo2Color));
    }

    /// <summary>
    /// 4つ以上つながっているぷよグループを検出
    /// </summary>
    public List<List<(int X, int Y)>> FindConnectedGroups()
    {
        var visited = new HashSet<(int, int)>();
        var groups = new List<List<(int X, int Y)>>();

        for (int y = 0; y < Rows; y++)
        {
            for (int x = 0; x < Cols; x++)
            {
                if (visited.Contains((x, y)))
                {
                    continue;
                }

                var cell = GetCell(x, y);
                if (cell.IsEmpty)
                {
                    continue;
                }

                var group = FindConnectedPuyos(x, y, cell.Color!, visited);
                if (group.Count >= 4)
                {
                    groups.Add(group);
                }
            }
        }

        return groups;
    }

    /// <summary>
    /// BFSで同じ色のぷよをたどる
    /// </summary>
    private List<(int X, int Y)> FindConnectedPuyos(int startX, int startY, PuyoColor color, HashSet<(int, int)> visited)
    {
        var result = new List<(int X, int Y)>();
        var queue = new Queue<(int X, int Y)>();
        queue.Enqueue((startX, startY));

        while (queue.Count > 0)
        {
            var (x, y) = queue.Dequeue();

            if (visited.Contains((x, y)))
            {
                continue;
            }

            visited.Add((x, y));
            result.Add((x, y));

            // 隣接セル（上下左右）をチェック
            var neighbors = new[]
            {
                (x - 1, y),  // 左
                (x + 1, y),  // 右
                (x, y - 1),  // 上
                (x, y + 1),  // 下
            };

            foreach (var (nx, ny) in neighbors)
            {
                if (visited.Contains((nx, ny)))
                {
                    continue;
                }

                var cell = GetCell(nx, ny);
                if (!cell.IsEmpty && cell.Color == color)
                {
                    queue.Enqueue((nx, ny));
                }
            }
        }

        return result;
    }

    /// <summary>
    /// 指定された位置のぷよを消去
    /// </summary>
    public Board ClearPuyos(List<(int X, int Y)> positions)
    {
        var newBoard = this;
        foreach (var (x, y) in positions)
        {
            newBoard = newBoard.SetCell(x, y, Cell.Empty);
        }

        return newBoard;
    }

    /// <summary>
    /// 重力を適用してぷよを落下させる
    /// </summary>
    public Board ApplyGravity()
    {
        var newCells = new Cell[Rows][];
        for (int y = 0; y < Rows; y++)
        {
            newCells[y] = new Cell[Cols];
        }

        // 各列ごとに処理
        for (int x = 0; x < Cols; x++)
        {
            // 列の中で空でないセルを集める
            var column = new List<Cell>();
            for (int y = 0; y < Rows; y++)
            {
                var cell = GetCell(x, y);
                if (!cell.IsEmpty)
                {
                    column.Add(cell);
                }
            }

            // 下から詰める
            int startY = Rows - column.Count;
            for (int i = 0; i < column.Count; i++)
            {
                newCells[startY + i][x] = column[i];
            }

            // 上の空白を埋める
            for (int y = 0; y < startY; y++)
            {
                newCells[y][x] = Cell.Empty;
            }
        }

        return new Board(Cols, Rows, newCells);
    }

    /// <summary>
    /// 消去と重力を繰り返し適用する（連鎖処理）
    /// </summary>
    public Board ClearAndApplyGravityRepeatedly()
    {
        // まず重力を適用
        var boardAfterGravity = ApplyGravity();

        // 消去対象を検出
        var groups = boardAfterGravity.FindConnectedGroups();

        if (groups.Count == 0)
        {
            // 消去対象がない場合は終了
            return boardAfterGravity;
        }

        // 消去して再帰的に処理
        var positions = groups.SelectMany(g => g).ToList();
        var clearedBoard = boardAfterGravity.ClearPuyos(positions);

        // 再帰的に消去判定を繰り返す
        return clearedBoard.ClearAndApplyGravityRepeatedly();
    }

    /// <summary>
    /// 全消し判定
    /// </summary>
    public bool CheckZenkeshi()
    {
        for (int y = 0; y < Rows; y++)
        {
            for (int x = 0; x < Cols; x++)
            {
                if (!GetCell(x, y).IsEmpty)
                {
                    return false;
                }
            }
        }

        return true;
    }

    /// <summary>
    /// 消去と重力を繰り返し適用し、全消しフラグも返す
    /// </summary>
    public (Board FinalBoard, bool IsZenkeshi) ClearAndApplyGravityRepeatedlyWithZenkeshi()
    {
        var finalBoard = ClearAndApplyGravityRepeatedly();
        var isZenkeshi = finalBoard.CheckZenkeshi();
        return (finalBoard, isZenkeshi);
    }

    /// <summary>
    /// 消去と重力を繰り返し適用し、連鎖情報と全消しフラグも返す
    /// </summary>
    public (Board FinalBoard, List<int> ClearedCounts, bool IsZenkeshi) ClearAndApplyGravityRepeatedlyWithChainInfo()
    {
        return ClearAndApplyGravityRepeatedlyWithChainInfoRecursive(new List<int>());
    }

    /// <summary>
    /// 消去と重力を繰り返し適用し、連鎖情報を蓄積する（再帰処理）
    /// </summary>
    private (Board FinalBoard, List<int> ClearedCounts, bool IsZenkeshi) ClearAndApplyGravityRepeatedlyWithChainInfoRecursive(List<int> clearedCounts)
    {
        // まず重力を適用
        var boardAfterGravity = ApplyGravity();

        // 消去対象を検出
        var groups = boardAfterGravity.FindConnectedGroups();

        if (groups.Count == 0)
        {
            // 消去対象がない場合は終了
            var isZenkeshi = boardAfterGravity.CheckZenkeshi();
            return (boardAfterGravity, clearedCounts, isZenkeshi);
        }

        // 消去数をカウント
        var clearedCount = groups.SelectMany(g => g).Count();
        clearedCounts.Add(clearedCount);

        // 消去して再帰的に処理
        var positions = groups.SelectMany(g => g).ToList();
        var clearedBoard = boardAfterGravity.ClearPuyos(positions);

        // 再帰的に消去判定を繰り返す
        return clearedBoard.ClearAndApplyGravityRepeatedlyWithChainInfoRecursive(clearedCounts);
    }
}
