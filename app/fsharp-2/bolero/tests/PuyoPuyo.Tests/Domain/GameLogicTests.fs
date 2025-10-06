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

    [<Fact>]
    let ``右端で回転すると左にキックされる`` () =
        // Arrange
        let board = Board.create 6 13
        let pair = PuyoPair.create 5 5 Red Green 0  // 右端、回転状態0（上）

        // Act
        let result = GameLogic.tryRotatePuyoPair board pair

        // Assert
        match result with
        | Some rotated ->
            rotated.Rotation |> should equal 1  // 回転成功
            rotated.X |> should equal 4  // 左に1マスキック
        | None ->
            failwith "回転できるはずです"

    [<Fact>]
    let ``左端で回転すると右にキックされる`` () =
        // Arrange
        let board = Board.create 6 13
        let pair = PuyoPair.create 0 5 Red Green 2  // 左端、回転状態2（下）

        // Act
        let result = GameLogic.tryRotatePuyoPair board pair

        // Assert
        match result with
        | Some kicked ->
            kicked.Rotation |> should equal 3  // 回転成功
            kicked.X |> should equal 1  // 右に1マスキック
        | None ->
            failwith "回転できるはずです"

    [<Fact>]
    let ``壁キックできない場合は回転しない`` () =
        // Arrange
        let board = Board.create 6 13
        // 右端にぷよを配置（壁キックできない状況を作る）
        let board = Board.setCell board 4 5 (Filled Blue)
        let pair = PuyoPair.create 5 5 Red Green 0

        // Act
        let result = GameLogic.tryRotatePuyoPair board pair

        // Assert
        result |> should equal None

    [<Fact>]
    let ``ぷよペアを下に移動できる`` () =
        // Arrange
        let board = Board.create 6 13
        let pair = PuyoPair.create 3 5 Red Green 0

        // Act
        let result = GameLogic.tryMovePuyoPair board pair Down

        // Assert
        match result with
        | Some movedPair ->
            movedPair.Y |> should equal 6
        | None ->
            failwith "下に移動できるはずです"

    [<Fact>]
    let ``下端では下に移動できない`` () =
        // Arrange
        let board = Board.create 6 13
        let pair = PuyoPair.create 3 12 Red Green 0  // 回転状態0（上）、軸ぷよが y=12（下端）

        // Act
        let result = GameLogic.tryMovePuyoPair board pair Down

        // Assert
        result |> should equal None

    [<Fact>]
    let ``下にぷよがある場合は移動できない`` () =
        // Arrange
        let board = Board.create 6 13
        let board = Board.setCell board 3 6 (Filled Blue)  // 軸ぷよの下に障害物
        let pair = PuyoPair.create 3 5 Red Green 0

        // Act
        let result = GameLogic.tryMovePuyoPair board pair Down

        // Assert
        result |> should equal None
