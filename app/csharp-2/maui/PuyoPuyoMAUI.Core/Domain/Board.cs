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
}
