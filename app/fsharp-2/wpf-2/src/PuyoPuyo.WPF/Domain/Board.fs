module Domain.Board

open Domain.Puyo

// ボード定義
type Board = PuyoColor[,]

// 初期ボードを生成
let createBoard () : Board = Array2D.create 6 12 Empty

// セルの色を取得
let getCellColor x y (board: Board) = board.[x, y]
