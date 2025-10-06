namespace PuyoPuyo.Tests.Domain

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Domain

module PuyoTests =

    [<Fact>]
    let ``ぷよの色は4種類定義されている`` () =
        // Arrange & Act
        let colors = [ Red; Green; Blue; Yellow ]

        // Assert
        colors.Length |> should equal 4

    [<Fact>]
    let ``赤色のぷよが作成できる`` () =
        // Arrange & Act
        let puyo = Red

        // Assert
        puyo |> should equal Red

    [<Fact>]
    let ``緑色のぷよが作成できる`` () =
        // Arrange & Act
        let puyo = Green

        // Assert
        puyo |> should equal Green

    [<Fact>]
    let ``青色のぷよが作成できる`` () =
        // Arrange & Act
        let puyo = Blue

        // Assert
        puyo |> should equal Blue

    [<Fact>]
    let ``黄色のぷよが作成できる`` () =
        // Arrange & Act
        let puyo = Yellow

        // Assert
        puyo |> should equal Yellow
