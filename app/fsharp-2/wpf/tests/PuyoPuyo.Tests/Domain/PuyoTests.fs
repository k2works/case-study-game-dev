module PuyoPuyo.Tests.Domain.PuyoTests

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Domain

[<Fact>]
let ``ぷよの色は4種類定義されている`` () =
    // Arrange & Act
    let colors = [ PuyoColor.Red; PuyoColor.Green; PuyoColor.Blue; PuyoColor.Yellow ]

    // Assert
    colors.Length |> should equal 4

[<Fact>]
let ``赤色のぷよが作成できる`` () =
    // Arrange & Act
    let puyo = PuyoColor.Red

    // Assert
    puyo |> should equal PuyoColor.Red

[<Fact>]
let ``緑色のぷよが作成できる`` () =
    // Arrange & Act
    let puyo = PuyoColor.Green

    // Assert
    puyo |> should equal PuyoColor.Green
