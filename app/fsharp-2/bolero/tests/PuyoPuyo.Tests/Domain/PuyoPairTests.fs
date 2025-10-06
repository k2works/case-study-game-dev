namespace PuyoPuyo.Tests.Domain

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Domain

module PuyoPairTests =

    [<Fact>]
    let ``ぷよペアを作成できる`` () =
        // Arrange & Act
        let pair = PuyoPair.create 2 0 Red Green 0

        // Assert
        pair.X |> should equal 2
        pair.Y |> should equal 0
        pair.Puyo1Color |> should equal Red
        pair.Puyo2Color |> should equal Green
        pair.Rotation |> should equal 0

    [<Fact>]
    let ``回転状態0のとき2つ目のぷよは上にある`` () =
        // Arrange
        let pair = PuyoPair.create 2 5 Red Green 0

        // Act
        let (pos1, pos2) = PuyoPair.getPositions pair

        // Assert
        pos1 |> should equal (2, 5)  // 軸ぷよ
        pos2 |> should equal (2, 4)  // 2つ目のぷよは上

    [<Fact>]
    let ``回転状態1のとき2つ目のぷよは右にある`` () =
        // Arrange
        let pair = PuyoPair.create 2 5 Red Green 1

        // Act
        let (pos1, pos2) = PuyoPair.getPositions pair

        // Assert
        pos1 |> should equal (2, 5)  // 軸ぷよ
        pos2 |> should equal (3, 5)  // 2つ目のぷよは右

    [<Fact>]
    let ``回転状態2のとき2つ目のぷよは下にある`` () =
        // Arrange
        let pair = PuyoPair.create 2 5 Red Green 2

        // Act
        let (pos1, pos2) = PuyoPair.getPositions pair

        // Assert
        pos1 |> should equal (2, 5)  // 軸ぷよ
        pos2 |> should equal (2, 6)  // 2つ目のぷよは下

    [<Fact>]
    let ``回転状態3のとき2つ目のぷよは左にある`` () =
        // Arrange
        let pair = PuyoPair.create 2 5 Red Green 3

        // Act
        let (pos1, pos2) = PuyoPair.getPositions pair

        // Assert
        pos1 |> should equal (2, 5)  // 軸ぷよ
        pos2 |> should equal (1, 5)  // 2つ目のぷよは左
