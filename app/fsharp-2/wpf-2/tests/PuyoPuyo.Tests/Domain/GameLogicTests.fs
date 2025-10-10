module Domain.GameLogicTests

open Xunit
open FsUnit.Xunit
open Domain.Board
open Domain.GameLogic
open Domain.Puyo
open Domain.PuyoPair

module ``ゲーム状態`` =
    [<Fact>]
    let ``GameStateにはNotStarted状態がある`` () =
        // Assert
        NotStarted |> should equal NotStarted

    [<Fact>]
    let ``GameStateにはPlaying状態がある`` () =
        // Assert
        Playing |> should equal Playing

    [<Fact>]
    let ``GameStateにはPaused状態がある`` () =
        // Assert
        Paused |> should equal Paused

    [<Fact>]
    let ``GameStateにはGameOver状態がある`` () =
        // Assert
        GameOver |> should equal GameOver

module ``ぷよペアの移動`` =
    [<Fact>]
    let ``ぷよペアを左に移動できる`` () =
        // Arrange
        let board = createBoard ()

        let pair =
            { Axis = Red
              Child = Blue
              AxisPosition = { X = 3; Y = 5 }
              ChildPosition = { X = 3; Y = 4 }
              Rotation = 0 }

        // Act
        let result = tryMovePuyoPair board pair Left

        // Assert
        match result with
        | Some movedPair ->
            movedPair.AxisPosition.X |> should equal 2
            movedPair.ChildPosition.X |> should equal 2
        | None -> failwith "移動できるはずです"

    [<Fact>]
    let ``ぷよペアを右に移動できる`` () =
        // Arrange
        let board = createBoard ()

        let pair =
            { Axis = Red
              Child = Blue
              AxisPosition = { X = 2; Y = 5 }
              ChildPosition = { X = 2; Y = 4 }
              Rotation = 0 }

        // Act
        let result = tryMovePuyoPair board pair Right

        // Assert
        match result with
        | Some movedPair ->
            movedPair.AxisPosition.X |> should equal 3
            movedPair.ChildPosition.X |> should equal 3
        | None -> failwith "移動できるはずです"

    [<Fact>]
    let ``左端では左に移動できない`` () =
        // Arrange
        let board = createBoard ()

        let pair =
            { Axis = Red
              Child = Blue
              AxisPosition = { X = 0; Y = 5 }
              ChildPosition = { X = 0; Y = 4 }
              Rotation = 0 }

        // Act
        let result = tryMovePuyoPair board pair Left

        // Assert
        result |> should equal None

    [<Fact>]
    let ``右端では右に移動できない`` () =
        // Arrange
        let board = createBoard ()

        let pair =
            { Axis = Red
              Child = Blue
              AxisPosition = { X = 5; Y = 5 }
              ChildPosition = { X = 5; Y = 4 }
              Rotation = 0 }

        // Act
        let result = tryMovePuyoPair board pair Right

        // Assert
        result |> should equal None

    [<Fact>]
    let ``スポーンエリア（Y<0）でも左に移動できる`` () =
        // Arrange
        let board = createBoard ()

        let pair =
            { Axis = Red
              Child = Blue
              AxisPosition = { X = 2; Y = 0 }
              ChildPosition = { X = 2; Y = -1 }
              Rotation = 0 }

        // Act
        let result = tryMovePuyoPair board pair Left

        // Assert
        match result with
        | Some movedPair ->
            movedPair.AxisPosition.X |> should equal 1
            movedPair.AxisPosition.Y |> should equal 0
            movedPair.ChildPosition.X |> should equal 1
            movedPair.ChildPosition.Y |> should equal -1
        | None -> failwith "スポーンエリアでも左に移動できるはずです"

    [<Fact>]
    let ``スポーンエリア（Y<0）でも右に移動できる`` () =
        // Arrange
        let board = createBoard ()

        let pair =
            { Axis = Red
              Child = Blue
              AxisPosition = { X = 2; Y = 0 }
              ChildPosition = { X = 2; Y = -1 }
              Rotation = 0 }

        // Act
        let result = tryMovePuyoPair board pair Right

        // Assert
        match result with
        | Some movedPair ->
            movedPair.AxisPosition.X |> should equal 3
            movedPair.AxisPosition.Y |> should equal 0
            movedPair.ChildPosition.X |> should equal 3
            movedPair.ChildPosition.Y |> should equal -1
        | None -> failwith "スポーンエリアでも右に移動できるはずです"

    [<Fact>]
    let ``スポーンエリアでも左端では左に移動できない`` () =
        // Arrange
        let board = createBoard ()

        let pair =
            { Axis = Red
              Child = Blue
              AxisPosition = { X = 0; Y = 0 }
              ChildPosition = { X = 0; Y = -1 }
              Rotation = 0 }

        // Act
        let result = tryMovePuyoPair board pair Left

        // Assert
        result |> should equal None

    [<Fact>]
    let ``スポーンエリアでも右端では右に移動できない`` () =
        // Arrange
        let board = createBoard ()

        let pair =
            { Axis = Red
              Child = Blue
              AxisPosition = { X = 5; Y = 0 }
              ChildPosition = { X = 5; Y = -1 }
              Rotation = 0 }

        // Act
        let result = tryMovePuyoPair board pair Right

        // Assert
        result |> should equal None
