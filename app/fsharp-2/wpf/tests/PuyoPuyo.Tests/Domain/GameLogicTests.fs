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
        | None -> failwith "移動できるはずです"

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
        | None -> failwith "移動できるはずです"

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

    [<Fact>]
    let ``回転を考慮して右端で右に移動できない`` () =
        // Arrange
        let board = Board.create 6 13
        // 回転=1(右向き)の場合、2つ目のぷよは右に配置される
        let pair = PuyoPair.create 4 5 Red Green 1

        // Act
        let result = GameLogic.tryMovePuyoPair board pair Right

        // Assert
        result |> should equal None

    [<Fact>]
    let ``通常の回転ができる`` () =
        // Arrange
        let board = Board.create 6 13
        let pair = PuyoPair.create 3 5 Red Green 0

        // Act
        let result = GameLogic.tryRotatePuyoPair board pair

        // Assert
        match result with
        | Some rotated -> rotated.Rotation |> should equal 1
        | None -> failwith "回転できるはずです"

    [<Fact>]
    let ``右端で回転すると左にキックされる`` () =
        // Arrange
        let board = Board.create 6 13
        let pair = PuyoPair.create 5 5 Red Green 0 // 右端、回転状態0（上）

        // Act
        let result = GameLogic.tryRotatePuyoPair board pair

        // Assert
        match result with
        | Some rotated ->
            rotated.Rotation |> should equal 1 // 回転成功
            rotated.X |> should equal 4 // 左に1マスキック
        | None -> failwith "回転できるはずです"

    [<Fact>]
    let ``左端で回転状態2から回転すると右にキックされる`` () =
        // Arrange
        let board = Board.create 6 13
        let pair = PuyoPair.create 0 5 Red Green 2 // 左端、回転状態2（下）

        // Act
        let result = GameLogic.tryRotatePuyoPair board pair

        // Assert
        match result with
        | Some rotated ->
            // 回転状態2→3では2つ目のぷよが左にはみ出すため、右に1マスキック
            rotated.Rotation |> should equal 3 // 回転成功（2→3）
            rotated.X |> should equal 1 // 右に1マスキック
        | None -> failwith "回転できるはずです"

    [<Fact>]
    let ``壁キックできない場合は回転しない`` () =
        // Arrange
        let board = Board.create 6 13
        // 右隣にぷよを配置（壁キックできない状況を作る）
        let board = Board.setCell 4 5 (Filled Blue) board
        let pair = PuyoPair.create 5 5 Red Green 0

        // Act
        let result = GameLogic.tryRotatePuyoPair board pair

        // Assert
        result |> should equal None
