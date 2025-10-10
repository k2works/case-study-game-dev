module Domain.BoardTests

open Xunit
open FsUnit.Xunit
open Domain.Board
open Domain.Puyo

module ``ボード操作`` =
    [<Fact>]
    let ``createBoardは6x12の空ボードを作成する`` () =
        // Act
        let board = createBoard ()

        // Assert
        board |> should equal (Array2D.create 6 12 Empty)

    [<Fact>]
    let ``getCellColorは指定位置のぷよ色を返す`` () =
        // Arrange
        let board = createBoard ()
        board.[1, 2] <- Red

        // Act
        let color = getCellColor 1 2 board

        // Assert
        color |> should equal Red

    [<Fact>]
    let ``getCellColorは空のセルでEmptyを返す`` () =
        // Arrange
        let board = createBoard ()

        // Act
        let color = getCellColor 0 0 board

        // Assert
        color |> should equal Empty

module ``ぷよの消去`` =
    [<Fact>]
    let ``横に4つ並んだぷよを検出できる`` () =
        // Arrange
        let board = createBoard ()

        let board =
            board
            |> setCellColor 0 11 Red
            |> setCellColor 1 11 Red
            |> setCellColor 2 11 Red
            |> setCellColor 3 11 Red

        // Act
        let groups = findConnectedGroups board

        // Assert
        groups |> List.length |> should equal 1
        groups |> List.head |> List.length |> should equal 4

    [<Fact>]
    let ``縦に4つ並んだぷよを検出できる`` () =
        // Arrange
        let board = createBoard ()

        let board =
            board
            |> setCellColor 2 8 Green
            |> setCellColor 2 9 Green
            |> setCellColor 2 10 Green
            |> setCellColor 2 11 Green

        // Act
        let groups = findConnectedGroups board

        // Assert
        groups |> List.length |> should equal 1
        groups |> List.head |> List.length |> should equal 4

    [<Fact>]
    let ``L字型につながった5つのぷよを検出できる`` () =
        // Arrange
        let board = createBoard ()

        let board =
            board
            |> setCellColor 1 9 Blue
            |> setCellColor 1 10 Blue
            |> setCellColor 1 11 Blue
            |> setCellColor 2 11 Blue
            |> setCellColor 3 11 Blue

        // Act
        let groups = findConnectedGroups board

        // Assert
        groups |> List.length |> should equal 1
        groups |> List.head |> List.length |> should equal 5

    [<Fact>]
    let ``3つ以下のぷよは検出されない`` () =
        // Arrange
        let board = createBoard ()

        let board =
            board
            |> setCellColor 0 11 Yellow
            |> setCellColor 1 11 Yellow
            |> setCellColor 2 11 Yellow

        // Act
        let groups = findConnectedGroups board

        // Assert
        groups |> List.length |> should equal 0

    [<Fact>]
    let ``指定した位置のぷよを消去できる`` () =
        // Arrange
        let board = createBoard ()

        let board =
            board
            |> setCellColor 0 11 Red
            |> setCellColor 1 11 Red
            |> setCellColor 2 11 Red
            |> setCellColor 3 11 Red

        // Act
        let positions = [ (0, 11); (1, 11); (2, 11); (3, 11) ]
        let newBoard = board |> clearPuyos positions

        // Assert
        getCellColor 0 11 newBoard |> should equal Empty
        getCellColor 1 11 newBoard |> should equal Empty
        getCellColor 2 11 newBoard |> should equal Empty
        getCellColor 3 11 newBoard |> should equal Empty

    [<Fact>]
    let ``消去後にぷよが落下する`` () =
        // Arrange
        let board = createBoard ()
        let board = board |> setCellColor 0 8 Red |> setCellColor 0 11 Green

        // Act - (0, 11) のぷよを消去
        let newBoard = board |> clearPuyos [ (0, 11) ]
        let droppedBoard = newBoard |> applyGravity

        // Assert - (0, 8) にあった赤いぷよが (0, 11) に落下
        getCellColor 0 11 droppedBoard |> should equal Red
        getCellColor 0 8 droppedBoard |> should equal Empty
