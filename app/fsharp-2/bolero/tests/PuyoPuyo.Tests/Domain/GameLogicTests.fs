namespace PuyoPuyo.Tests.Domain

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Domain

module GameLogicTests =

    [<Fact>]
    let ``ぷよペアを左に移動できる`` () =
        // Arrange
        let board = Board.create 6 13
        let pair = PuyoPair.create 3 5 Red Green 0

        // Act
        let result = GameLogic.tryMovePuyoPair board pair Left

        // Assert
        match result with
        | Some movedPair ->
            movedPair.X |> should equal 2
            movedPair.Y |> should equal 5
        | None ->
            failwith "移動できるはずです"

    [<Fact>]
    let ``ぷよペアを右に移動できる`` () =
        // Arrange
        let board = Board.create 6 13
        let pair = PuyoPair.create 2 5 Red Green 0

        // Act
        let result = GameLogic.tryMovePuyoPair board pair Right

        // Assert
        match result with
        | Some movedPair ->
            movedPair.X |> should equal 3
            movedPair.Y |> should equal 5
        | None ->
            failwith "移動できるはずです"

    [<Fact>]
    let ``左端では左に移動できない`` () =
        // Arrange
        let board = Board.create 6 13
        let pair = PuyoPair.create 0 5 Red Green 0

        // Act
        let result = GameLogic.tryMovePuyoPair board pair Left

        // Assert
        result |> should equal None

    [<Fact>]
    let ``右端では右に移動できない`` () =
        // Arrange
        let board = Board.create 6 13
        let pair = PuyoPair.create 5 5 Red Green 0

        // Act
        let result = GameLogic.tryMovePuyoPair board pair Right

        // Assert
        result |> should equal None
