module PuyoPuyo.Tests.Domain.PuyoTests

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Core.Domain

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

[<Fact>]
let ``青色のぷよが作成できる`` () =
    // Arrange & Act
    let puyo = PuyoColor.Blue

    // Assert
    puyo |> should equal PuyoColor.Blue

[<Fact>]
let ``黄色のぷよが作成できる`` () =
    // Arrange & Act
    let puyo = PuyoColor.Yellow

    // Assert
    puyo |> should equal PuyoColor.Yellow
