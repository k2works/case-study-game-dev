module Domain.Board

open Domain.Puyo

// ボード定義
type Board = PuyoColor[,]

// 初期ボードを生成
let createBoard () : Board = Array2D.create 6 12 Empty

// セルの色を取得
let getCellColor x y (board: Board) = board.[x, y]

// セルに色を設定（イミュータブルに新しいボードを返す）
let setCellColor x y color (board: Board) =
    let newBoard = Array2D.copy board
    newBoard.[x, y] <- color
    newBoard
