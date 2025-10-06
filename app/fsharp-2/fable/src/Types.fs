// src/Types.fs
module PuyoPuyo.Types

/// ぷよの色
type PuyoColor =
    | Red
    | Blue
    | Green
    | Yellow
    | Purple
    | Empty

/// 位置
type Position = {
    X: int
    Y: int
}

/// ぷよ
type Puyo = {
    Color: PuyoColor
    Position: Position
}

/// ぷよペア（軸ぷよと子ぷよ）
type PuyoPair = {
    Axis: Puyo    // 軸ぷよ（回転の中心）
    Child: Puyo   // 子ぷよ（回転する）
}

/// 消去情報
type EraseInfo = {
    ErasePuyoCount: int
    ErasePositions: (int * int * PuyoColor) list
}
