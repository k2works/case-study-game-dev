module PuyoPuyo.Tests.Domain.BoardTests

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Domain

[<Fact>]
let ``空のボードを作成できる`` () =
    // Arrange & Act
    let board = Board.create 6 13

    // Assert
    board.Cols |> should equal 6
    board.Rows |> should equal 13

[<Fact>]
let ``作成直後のボードはすべて空である`` () =
    // Arrange & Act
    let board = Board.create 6 13

    // Assert
    for y in 0 .. board.Rows - 1 do
        for x in 0 .. board.Cols - 1 do
            Board.getCell board x y |> should equal Cell.Empty

[<Fact>]
let ``ボードにぷよを配置できる`` () =
    // Arrange
    let board = Board.create 6 13

    // Act
    let newBoard = board |> Board.setCell 2 10 (Cell.Filled PuyoColor.Red)

    // Assert
    Board.getCell newBoard 2 10 |> should equal (Cell.Filled PuyoColor.Red)

[<Fact>]
let ``ボードにぷよを配置しても元のボードは変更されない`` () =
    // Arrange
    let board = Board.create 6 13

    // Act
    let newBoard = board |> Board.setCell 2 10 (Cell.Filled PuyoColor.Red)

    // Assert
    Board.getCell board 2 10 |> should equal Cell.Empty
    Board.getCell newBoard 2 10 |> should equal (Cell.Filled PuyoColor.Red)
