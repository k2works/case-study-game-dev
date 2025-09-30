module PuyoTests

open Xunit
open FsUnit.Xunit
open Puyo
open Puyo.PuyoManagement

[<Fact>]
let ``組ぷよを作成できる`` () =
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 0 }
        Rotation = Deg0
    }

    pair.Puyo1Color |> should equal Red
    pair.Puyo2Color |> should equal Blue
    pair.BasePosition.X |> should equal 3
    pair.BasePosition.Y |> should equal 0
    pair.Rotation |> should equal Deg0

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

[<Fact>]
let ``回転状態0度で2つのぷよの座標を取得できる`` () =
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 1 }
        Rotation = Deg0
    }

    let (pos1, pos2) = getPuyoPairPositions pair

    pos1.X |> should equal 3
    pos1.Y |> should equal 1
    pos2.X |> should equal 3
    pos2.Y |> should equal 2

[<Fact>]
let ``回転状態90度で2つのぷよの座標を取得できる`` () =
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 1 }
        Rotation = Deg90
    }

    let (pos1, pos2) = getPuyoPairPositions pair

    pos1.X |> should equal 3
    pos1.Y |> should equal 1
    pos2.X |> should equal 4
    pos2.Y |> should equal 1

[<Fact>]
let ``ランダムな組ぷよを生成できる`` () =
    let pair = generateRandomPuyoPair 3 0

    pair.BasePosition.X |> should equal 3
    pair.BasePosition.Y |> should equal 0
    pair.Rotation |> should equal Deg0