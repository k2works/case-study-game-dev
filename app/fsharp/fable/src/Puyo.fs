module Puyo.PuyoManagement

open Puyo
open System

/// 回転を数値に変換
let rotationToInt (rotation: Rotation) : int =
    match rotation with
    | Deg0 -> 0
    | Deg90 -> 1
    | Deg180 -> 2
    | Deg270 -> 3

/// 数値を回転に変換
let intToRotation (n: int) : Rotation =
    match n % 4 with
    | 0 -> Deg0
    | 1 -> Deg90
    | 2 -> Deg180
    | _ -> Deg270

/// 組ぷよを時計回りに 90 度回転
let rotatePuyoPair (pair: PuyoPair) : PuyoPair =
    let nextRotation =
        pair.Rotation
        |> rotationToInt
        |> (+) 1
        |> intToRotation

    { pair with Rotation = nextRotation }

/// 組ぷよの 2 つのぷよの実際の座標を計算
let getPuyoPairPositions (pair: PuyoPair) : Position * Position =
    let basePos = pair.BasePosition
    let pos1 = basePos

    let pos2 =
        match pair.Rotation with
        | Deg0 ->   // 縦（上下）
            { X = basePos.X; Y = basePos.Y + 1 }
        | Deg90 ->  // 右（左右）
            { X = basePos.X + 1; Y = basePos.Y }
        | Deg180 -> // 逆縦（下上）
            { X = basePos.X; Y = basePos.Y - 1 }
        | Deg270 -> // 左（右左）
            { X = basePos.X - 1; Y = basePos.Y }

    (pos1, pos2)

/// ランダムな色を生成
let generateRandomColor () : Color =
    let colors = [| Red; Green; Blue; Yellow; Purple |]
    colors.[Random().Next(colors.Length)]

/// ランダムな組ぷよを生成
let generateRandomPuyoPair (x: int) (y: int) : PuyoPair =
    {
        Puyo1Color = generateRandomColor ()
        Puyo2Color = generateRandomColor ()
        BasePosition = { X = x; Y = y }
        Rotation = Deg0
    }

/// 新しい組ぷよを画面上部に生成
let spawnNewPuyoPair () : PuyoPair =
    generateRandomPuyoPair (BoardModule.boardWidth / 2) 0