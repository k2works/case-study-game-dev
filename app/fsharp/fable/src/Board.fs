module Puyo.BoardModule

open Puyo

let boardWidth = 8
let boardHeight = 12

/// 空のゲームボードを作成
let createEmptyBoard : Board =
    {
        Width = boardWidth
        Height = boardHeight
        Cells = Array.init boardHeight (fun _ -> Array.create boardWidth Empty)
    }

/// 座標が有効な範囲内かチェック
let isValidPosition (board: Board) (x: int) (y: int) : bool =
    x >= 0 && x < board.Width && y >= 0 && y < board.Height

/// 指定位置のセルを取得
let getCellAt (board: Board) (pos: Position) : Cell option =
    if isValidPosition board pos.X pos.Y then
        Some board.Cells.[pos.Y].[pos.X]
    else
        None

/// 指定位置にぷよがあるかチェック
let hasPuyoAt (board: Board) (pos: Position) : bool =
    match getCellAt board pos with
    | Some (Filled _) -> true
    | _ -> false

/// 指定位置のセルを更新
let setCellAt (board: Board) (pos: Position) (cell: Cell) : Board =
    if not (isValidPosition board pos.X pos.Y) then
        board
    else
        let newCells = Array.copy board.Cells
        newCells.[pos.Y] <- Array.copy newCells.[pos.Y]
        newCells.[pos.Y].[pos.X] <- cell
        { board with Cells = newCells }