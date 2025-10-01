module Types exposing
    ( Cell(..)
    , Color(..)
    , Direction(..)
    , Position
    , PuyoPair
    , Rotation(..)
    , cellToHex
    , colorToHex
    )


-- ぷよの色
type Color
    = Red
    | Green
    | Blue
    | Yellow
    | Purple


-- セルの状態
type Cell
    = Empty
    | Filled Color


-- 座標
type alias Position =
    { x : Int
    , y : Int
    }


-- 方向
type Direction
    = Up
    | Down
    | Left
    | Right


-- 回転状態（0°、90°、180°、270°）
type Rotation
    = Deg0
    | Deg90
    | Deg180
    | Deg270


-- 組ぷよ（2個セット）
type alias PuyoPair =
    { puyo1Color : Color
    , puyo2Color : Color
    , basePosition : Position
    , rotation : Rotation
    }


-- 色をCSSカラーコードに変換
colorToHex : Color -> String
colorToHex color =
    case color of
        Red ->
            "#ff4444"

        Green ->
            "#44ff44"

        Blue ->
            "#4444ff"

        Yellow ->
            "#ffff44"

        Purple ->
            "#ff44ff"


-- セルをCSSカラーコードに変換
cellToHex : Cell -> String
cellToHex cell =
    case cell of
        Empty ->
            "#ffffff"

        Filled color ->
            colorToHex color
