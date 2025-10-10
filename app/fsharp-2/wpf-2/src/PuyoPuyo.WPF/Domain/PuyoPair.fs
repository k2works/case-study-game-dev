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
