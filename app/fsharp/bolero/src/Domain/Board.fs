module PuyoGame.Domain.Board

open PuyoGame.Domain

/// ボード
type Board = private {
    Width: int
    Height: int
    Cells: Cell array array
}

let width (board: Board) = board.Width
let height (board: Board) = board.Height
let getAllCells (board: Board) = board.Cells

/// 空のゲームボードを作成
let createEmpty : Board =
    {
        Width = 8
        Height = 12
        Cells = Array.init 12 (fun _ -> Array.create 8 Empty)
    }

/// 座標が有効な範囲内かチェック
let isValidPosition (board: Board) (pos: Position) : bool =
    pos.X >= 0 && pos.X < board.Width && pos.Y >= 0 && pos.Y < board.Height

/// 指定位置のセルを取得
let tryGetCell (board: Board) (pos: Position) : Cell option =
    if isValidPosition board pos then
        Some board.Cells.[pos.Y].[pos.X]
    else
        None

/// 指定位置にぷよがあるかチェック
let hasPuyo (board: Board) (pos: Position) : bool =
    match tryGetCell board pos with
    | Some (Filled _) -> true
    | _ -> false

/// 指定位置のセルを更新（不変）
let setCell (board: Board) (pos: Position) (cell: Cell) : Board =
    if not (isValidPosition board pos) then
        board
    else
        let newCells = Array.copy board.Cells
        newCells.[pos.Y] <- Array.copy newCells.[pos.Y]
        newCells.[pos.Y].[pos.X] <- cell
        { board with Cells = newCells }

/// 全消し判定
let isPerfectClear (board: Board) : bool =
    board.Cells
    |> Array.forall (Array.forall ((=) Empty))