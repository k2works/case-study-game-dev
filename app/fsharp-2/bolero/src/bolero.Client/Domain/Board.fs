namespace PuyoPuyo.Domain

/// セルの状態
type Cell =
    | Empty
    | Filled of PuyoColor

/// ゲームボード
type Board = {
    Cols: int
    Rows: int
    Cells: Cell array array
}

module Board =
    /// 空のボードを作成
    let create (cols: int) (rows: int) : Board =
        {
            Cols = cols
            Rows = rows
            Cells = Array.init rows (fun _ -> Array.create cols Empty)
        }

    /// セルの取得
    let getCell (board: Board) (x: int) (y: int) : Cell =
        if y >= 0 && y < board.Rows && x >= 0 && x < board.Cols then
            board.Cells.[y].[x]
        else
            Empty

    /// セルの設定（イミュータブル）
    let setCell (board: Board) (x: int) (y: int) (cell: Cell) : Board =
        if y >= 0 && y < board.Rows && x >= 0 && x < board.Cols then
            let newCells =
                board.Cells
                |> Array.mapi (fun rowIndex row ->
                    if rowIndex = y then
                        row |> Array.mapi (fun colIndex c ->
                            if colIndex = x then cell else c)
                    else
                        row)
            { board with Cells = newCells }
        else
            board
