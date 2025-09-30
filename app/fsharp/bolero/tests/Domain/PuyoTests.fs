module PuyoTests

open Xunit
open FsUnit.Xunit
open PuyoGame.Domain
open PuyoGame.Domain.Puyo

[<Fact>]
let ``組ぷよを回転できる`` () =
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 1 }
        Rotation = Deg0
    }

    let rotated = rotatePuyoPair pair
    rotated.Rotation |> should equal Deg90

    let rotated2 = rotatePuyoPair rotated
    rotated2.Rotation |> should equal Deg180

    let rotated3 = rotatePuyoPair rotated2
    rotated3.Rotation |> should equal Deg270

    let rotated4 = rotatePuyoPair rotated3
    rotated4.Rotation |> should equal Deg0

[<Fact>]
let ``組ぷよの座標を取得できる - Deg0`` () =
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 1 }
        Rotation = Deg0
    }

    let (pos1, pos2) = getPuyoPairPositions pair
    pos1 |> should equal { X = 3; Y = 1 }
    pos2 |> should equal { X = 3; Y = 2 }

[<Fact>]
let ``組ぷよの座標を取得できる - Deg90`` () =
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 1 }
        Rotation = Deg90
    }

    let (pos1, pos2) = getPuyoPairPositions pair
    pos1 |> should equal { X = 3; Y = 1 }
    pos2 |> should equal { X = 4; Y = 1 }

[<Fact>]
let ``組ぷよの座標を取得できる - Deg180`` () =
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 1 }
        Rotation = Deg180
    }

    let (pos1, pos2) = getPuyoPairPositions pair
    pos1 |> should equal { X = 3; Y = 1 }
    pos2 |> should equal { X = 3; Y = 0 }

[<Fact>]
let ``組ぷよの座標を取得できる - Deg270`` () =
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 1 }
        Rotation = Deg270
    }

    let (pos1, pos2) = getPuyoPairPositions pair
    pos1 |> should equal { X = 3; Y = 1 }
    pos2 |> should equal { X = 2; Y = 1 }

[<Fact>]
let ``新しい組ぷよを生成できる`` () =
    let pair = spawnNewPuyoPair ()

    pair.BasePosition.X |> should equal 3
    pair.BasePosition.Y |> should equal 0
    pair.Rotation |> should equal Deg0

[<Fact>]
let ``ランダムな色を生成できる`` () =
    let colors = [ for _ in 1..100 -> generateRandomColor () ]

    // すべての色が有効な色であることを確認
    colors
    |> List.forall (fun c ->
        match c with
        | Red | Green | Blue | Yellow | Purple -> true
    )
    |> should be True

    // 複数の異なる色が生成されることを確認（ランダム性の検証）
    colors
    |> List.distinct
    |> List.length
    |> should be (greaterThan 1)