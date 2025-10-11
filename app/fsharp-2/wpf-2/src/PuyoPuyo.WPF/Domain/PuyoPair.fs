module Domain.PuyoPair

open System
open Domain.Puyo

// 位置
type Position = { X: int; Y: int }

// ぷよペア
type PuyoPair =
    { Axis: PuyoColor
      Child: PuyoColor
      AxisPosition: Position
      ChildPosition: Position
      Rotation: int }

// ぷよペアを生成
let generatePuyoPair (random: Random) =
    { Axis = randomPuyoColor random
      Child = randomPuyoColor random
      AxisPosition = { X = 2; Y = 0 }
      ChildPosition = { X = 2; Y = -1 }
      Rotation = 0 }

// ぷよペアの位置と色を取得
let getCurrentPairPuyos (puyoPair: PuyoPair option) =
    match puyoPair with
    | None -> []
    | Some pair ->
        [ (pair.AxisPosition.X, pair.AxisPosition.Y, pair.Axis)
          (pair.ChildPosition.X, pair.ChildPosition.Y, pair.Child) ]

// 回転状態に応じた子ぷよの相対位置を計算
let private getChildOffset rotation =
    match rotation with
    | 0 -> (0, -1) // 上
    | 1 -> (1, 0) // 右
    | 2 -> (0, 1) // 下
    | 3 -> (-1, 0) // 左
    | _ -> (0, -1) // デフォルト

// 時計回りに回転
let rotateClockwise (pair: PuyoPair) : PuyoPair =
    let newRotation = (pair.Rotation + 1) % 4
    let (offsetX, offsetY) = getChildOffset newRotation

    { pair with
        Rotation = newRotation
        ChildPosition =
            { X = pair.AxisPosition.X + offsetX
              Y = pair.AxisPosition.Y + offsetY } }

// 反時計回りに回転
let rotateCounterClockwise (pair: PuyoPair) : PuyoPair =
    let newRotation = (pair.Rotation + 3) % 4
    let (offsetX, offsetY) = getChildOffset newRotation

    { pair with
        Rotation = newRotation
        ChildPosition =
            { X = pair.AxisPosition.X + offsetX
              Y = pair.AxisPosition.Y + offsetY } }
