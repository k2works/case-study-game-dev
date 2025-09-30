namespace PuyoGame.Domain

/// ぷよの色
type Color =
    | Red
    | Green
    | Blue
    | Yellow
    | Purple

    member this.ToHex() =
        match this with
        | Red -> "#ff4444"
        | Green -> "#44ff44"
        | Blue -> "#4444ff"
        | Yellow -> "#ffff44"
        | Purple -> "#ff44ff"

/// セルの状態
type Cell =
    | Empty
    | Filled of Color

    member this.ToHex() =
        match this with
        | Empty -> "#ffffff"
        | Filled color -> color.ToHex()

/// 座標
[<Struct>]
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

    member this.ToInt() =
        match this with
        | Deg0 -> 0
        | Deg90 -> 1
        | Deg180 -> 2
        | Deg270 -> 3

    static member FromInt(n: int) =
        match n % 4 with
        | 0 -> Deg0
        | 1 -> Deg90
        | 2 -> Deg180
        | _ -> Deg270

    member this.Rotate() =
        this.ToInt() + 1 |> Rotation.FromInt

/// 組ぷよ（2 個セット）
type PuyoPair = {
    Puyo1Color: Color
    Puyo2Color: Color
    BasePosition: Position
    Rotation: Rotation
}