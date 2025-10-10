module Domain.PuyoPairTests

open System
open Xunit
open FsUnit.Xunit
open Domain.Puyo
open Domain.PuyoPair

module ``ぷよペア生成`` =
    [<Fact>]
    let ``generatePuyoPairは2つのぷよを含むペアを生成する`` () =
        // Arrange
        let random = Random(42)

        // Act
        let pair = generatePuyoPair random

        // Assert
        pair.Axis |> should not' (equal Empty)
        pair.Child |> should not' (equal Empty)

    [<Fact>]
    let ``generatePuyoPairは初期位置を設定する`` () =
        // Arrange
        let random = Random(42)

        // Act
        let pair = generatePuyoPair random

        // Assert
        pair.AxisPosition.X |> should equal 2
        pair.AxisPosition.Y |> should equal 0
        pair.ChildPosition.X |> should equal 2
        pair.ChildPosition.Y |> should equal -1

    [<Fact>]
    let ``generatePuyoPairは回転方向を0に設定する`` () =
        // Arrange
        let random = Random(42)

        // Act
        let pair = generatePuyoPair random

        // Assert
        pair.Rotation |> should equal 0

    [<Fact>]
    let ``getCurrentPairPuyosはぷよペアの位置と色を返す`` () =
        // Arrange
        let random = Random(42)
        let pair = generatePuyoPair random

        // Act
        let puyos = getCurrentPairPuyos (Some pair)

        // Assert
        puyos |> List.length |> should equal 2

    [<Fact>]
    let ``getCurrentPairPuyosはNoneで空リストを返す`` () =
        // Act
        let puyos = getCurrentPairPuyos None

        // Assert
        puyos |> List.length |> should equal 0
