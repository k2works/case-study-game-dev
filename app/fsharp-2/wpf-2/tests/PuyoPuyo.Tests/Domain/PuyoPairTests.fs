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

module ``ぷよペアの回転`` =
    [<Fact>]
    let ``時計回りに回転すると回転状態が1増える`` () =
        // Arrange
        let random = Random(42)
        let pair = generatePuyoPair random

        // Act
        let rotated = rotateClockwise pair

        // Assert
        rotated.Rotation |> should equal 1

    [<Fact>]
    let ``回転状態3から時計回りに回転すると0に戻る`` () =
        // Arrange
        let random = Random(42)
        let pair = generatePuyoPair random
        let pair = { pair with Rotation = 3 }

        // Act
        let rotated = rotateClockwise pair

        // Assert
        rotated.Rotation |> should equal 0

    [<Fact>]
    let ``回転すると2つ目のぷよの位置が変わる`` () =
        // Arrange
        let pair =
            { Axis = Red
              Child = Green
              AxisPosition = { X = 3; Y = 5 }
              ChildPosition = { X = 3; Y = 4 }
              Rotation = 0 }

        // Act
        let rotated = rotateClockwise pair

        // Assert
        rotated.AxisPosition.X |> should equal 3
        rotated.AxisPosition.Y |> should equal 5
        rotated.ChildPosition.X |> should equal 4
        rotated.ChildPosition.Y |> should equal 5

    [<Fact>]
    let ``反時計回りに回転すると回転状態が1減る`` () =
        // Arrange
        let random = Random(42)
        let pair = generatePuyoPair random
        let pair = { pair with Rotation = 1 }

        // Act
        let rotated = rotateCounterClockwise pair

        // Assert
        rotated.Rotation |> should equal 0
