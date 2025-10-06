// src/Player.fs
module PuyoPuyo.Player

open PuyoPuyo.Types

/// 回転方向
type RotationDirection =
    | Up
    | Right
    | Down
    | Left

/// 新しいぷよを作成する
let createNewPuyo () : Puyo =
    let colors = [| PuyoColor.Red; PuyoColor.Blue; PuyoColor.Green; PuyoColor.Yellow |]
    let random = System.Random()
    let color = colors.[random.Next(colors.Length)]

    {
        Color = color
        Position = { X = 2; Y = 0 }
    }

/// 新しいぷよペアを作成する
let createNewPuyoPair () : PuyoPair =
    let colors = [| PuyoColor.Red; PuyoColor.Blue; PuyoColor.Green; PuyoColor.Yellow |]
    let random = System.Random()
    let axisColor = colors.[random.Next(colors.Length)]
    let childColor = colors.[random.Next(colors.Length)]

    {
        Axis = { Color = axisColor; Position = { X = 2; Y = 0 } }
        Child = { Color = childColor; Position = { X = 2; Y = -1 } }
    }

/// ぷよを左に移動する
let moveLeft (puyo: Puyo) (stageCols: int) : Puyo =
    if puyo.Position.X > 0 then
        { puyo with Position = { puyo.Position with X = puyo.Position.X - 1 } }
    else
        puyo

/// ぷよを右に移動する
let moveRight (puyo: Puyo) (stageCols: int) : Puyo =
    if puyo.Position.X < stageCols - 1 then
        { puyo with Position = { puyo.Position with X = puyo.Position.X + 1 } }
    else
        puyo

/// 現在の回転方向を取得する
let getCurrentRotation (pair: PuyoPair) : RotationDirection =
    let dx = pair.Child.Position.X - pair.Axis.Position.X
    let dy = pair.Child.Position.Y - pair.Axis.Position.Y

    match (dx, dy) with
    | (0, -1) -> Up
    | (1, 0) -> Right
    | (0, 1) -> Down
    | (-1, 0) -> Left
    | _ -> Up  // デフォルトは上

/// ぷよペアを右回転する
let rotateRight (pair: PuyoPair) (stageCols: int) : PuyoPair =
    let currentRotation = getCurrentRotation pair

    let newRotation =
        match currentRotation with
        | Up -> Right
        | Right -> Down
        | Down -> Left
        | Left -> Up

    let (dx, dy) =
        match newRotation with
        | Up -> (0, -1)
        | Right -> (1, 0)
        | Down -> (0, 1)
        | Left -> (-1, 0)

    let newChildX = pair.Axis.Position.X + dx
    let newChildY = pair.Axis.Position.Y + dy

    // 壁キック: 回転後の位置が壁の外の場合、軸ぷよを移動
    let (adjustedAxisX, adjustedChildX) =
        if newChildX < 0 then
            (pair.Axis.Position.X + 1, newChildX + 1)
        elif newChildX >= stageCols then
            (pair.Axis.Position.X - 1, newChildX - 1)
        else
            (pair.Axis.Position.X, newChildX)

    {
        Axis = { pair.Axis with Position = { pair.Axis.Position with X = adjustedAxisX } }
        Child = { pair.Child with Position = { X = adjustedChildX; Y = newChildY } }
    }
