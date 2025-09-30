namespace Puyo

/// ぷよの色
type Color =
    | Red
    | Green
    | Blue
    | Yellow
    | Purple

/// セルの状態
type Cell =
    | Empty
    | Filled of Color

/// 座標
type Position = {
    X: int
    Y: int
}

/// 方向
type Direction =
    | Up
    | Down
    | Left
    | Right

/// 回転状態（0°、90°、180°、270°）
type Rotation =
    | Deg0
    | Deg90
    | Deg180
    | Deg270

/// ボード
type Board = {
    Width: int
    Height: int
    Cells: Cell array array
}

/// 組ぷよ（2 個セット）
type PuyoPair = {
    Puyo1Color: Color
    Puyo2Color: Color
    BasePosition: Position
    Rotation: Rotation
}