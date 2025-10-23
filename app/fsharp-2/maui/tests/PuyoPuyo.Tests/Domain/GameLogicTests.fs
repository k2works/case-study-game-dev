module PuyoPuyo.Tests.Domain.GameLogicTests

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Core.Domain

[<Fact>]
let ``ぷよペアを左に移動できる`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 3 5 PuyoColor.Red PuyoColor.Green 0

    // Act
    let result = GameLogic.tryMovePuyoPair board pair Direction.Left

    // Assert
    match result with
    | Some movedPair ->
        movedPair.X |> should equal 2
        movedPair.Y |> should equal 5
    | None -> failwith "移動できるはずです"

[<Fact>]
let ``ぷよペアを右に移動できる`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 2 5 PuyoColor.Red PuyoColor.Green 0

    // Act
    let result = GameLogic.tryMovePuyoPair board pair Direction.Right

    // Assert
    match result with
    | Some movedPair ->
        movedPair.X |> should equal 3
        movedPair.Y |> should equal 5
    | None -> failwith "移動できるはずです"

[<Fact>]
let ``左端では左に移動できない`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 0 5 PuyoColor.Red PuyoColor.Green 0

    // Act
    let result = GameLogic.tryMovePuyoPair board pair Direction.Left

    // Assert
    result |> should equal None

[<Fact>]
let ``右端では右に移動できない`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 5 5 PuyoColor.Red PuyoColor.Green 0

    // Act
    let result = GameLogic.tryMovePuyoPair board pair Direction.Right

    // Assert
    result |> should equal None

[<Fact>]
let ``回転状態1（右向き）のとき右端で右に移動できない`` () =
    // Arrange
    let board = Board.create 6 13
    // 回転状態1のとき、2つ目のぷよは右にある
    let pair = PuyoPair.create 4 5 PuyoColor.Red PuyoColor.Green 1

    // Act
    let result = GameLogic.tryMovePuyoPair board pair Direction.Right

    // Assert
    result |> should equal None
