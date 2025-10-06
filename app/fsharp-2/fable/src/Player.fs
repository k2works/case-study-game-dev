// src/Player.fs
module PuyoPuyo.Player

open PuyoPuyo.Types

/// 新しいぷよを作成する
let createNewPuyo () : Puyo =
    let colors = [| PuyoColor.Red; PuyoColor.Blue; PuyoColor.Green; PuyoColor.Yellow |]
    let random = System.Random()
    let color = colors.[random.Next(colors.Length)]

    {
        Color = color
        Position = { X = 2; Y = 0 }
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
