module PuyoPuyo.Tests.Domain.ぷよテスト

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Domain

[<Fact>]
let ``ぷよの色は4種類定義されている`` () =
    // Arrange & Act
    let 色リスト = [ 赤; 緑; 青; 黄 ]

    // Assert
    色リスト.Length |> should equal 4

[<Fact>]
let ``赤色のぷよが作成できる`` () =
    // Arrange & Act
    let ぷよ = 赤

    // Assert
    ぷよ |> should equal 赤

[<Fact>]
let ``緑色のぷよが作成できる`` () =
    // Arrange & Act
    let ぷよ = 緑

    // Assert
    ぷよ |> should equal 緑
