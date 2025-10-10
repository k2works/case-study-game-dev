module Domain.PuyoTests

open System
open Xunit
open FsUnit.Xunit
open Domain.Puyo

// ぷよ色生成のテスト
module ``ぷよ色生成`` =
    [<Fact>]
    let ``randomPuyoColorはEmptyを返さない`` () =
        // Arrange
        let random = Random(42)

        // Act
        let color = randomPuyoColor random

        // Assert
        color |> should not' (equal Empty)

    [<Fact>]
    let ``puyoColorToStringは正しい色文字列を返す`` () =
        // Assert
        puyoColorToString Red |> should equal "Red"
        puyoColorToString Blue |> should equal "Blue"
        puyoColorToString Green |> should equal "Green"
        puyoColorToString Yellow |> should equal "Yellow"
        puyoColorToString Empty |> should equal "Transparent"
