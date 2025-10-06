namespace PuyoPuyo.Tests.Domain

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Domain

module BoardTests =

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
                Board.getCell board x y |> should equal Empty

    [<Fact>]
    let ``ボードにぷよを配置できる`` () =
        // Arrange
        let board = Board.create 6 13

        // Act
        let newBoard = board |> Board.setCell 2 10 (Filled Red)

        // Assert
        Board.getCell newBoard 2 10 |> should equal (Filled Red)

    [<Fact>]
    let ``ボードにぷよを配置しても元のボードは変更されない`` () =
        // Arrange
        let board = Board.create 6 13

        // Act
        let newBoard = board |> Board.setCell 2 10 (Filled Red)

        // Assert
        Board.getCell board 2 10 |> should equal Empty
        Board.getCell newBoard 2 10 |> should equal (Filled Red)

    [<Fact>]
    let ``ぷよペアをボードに固定できる`` () =
        // Arrange
        let board = Board.create 6 13
        let pair = PuyoPair.create 3 10 Red Green 0

        // Act
        let newBoard = Board.fixPuyoPair board pair

        // Assert
        let (pos1, pos2) = PuyoPair.getPositions pair
        let (x1, y1) = pos1
        let (x2, y2) = pos2
        Board.getCell newBoard x1 y1 |> should equal (Filled Red)
        Board.getCell newBoard x2 y2 |> should equal (Filled Green)

    [<Fact>]
    let ``ぷよペアを固定しても元のボードは変更されない`` () =
        // Arrange
        let board = Board.create 6 13
        let pair = PuyoPair.create 3 10 Red Green 0

        // Act
        let newBoard = Board.fixPuyoPair board pair

        // Assert
        let (pos1, pos2) = PuyoPair.getPositions pair
        let (x1, y1) = pos1
        Board.getCell board x1 y1 |> should equal Empty // 元のボードは空のまま
        Board.getCell newBoard x1 y1 |> should equal (Filled Red) // 新しいボードには固定

    [<Fact>]
    let ``横に4つ並んだぷよを検出できる`` () =
        // Arrange
        let board = Board.create 6 13

        let board =
            board
            |> Board.setCell 0 12 (Filled Red)
            |> Board.setCell 1 12 (Filled Red)
            |> Board.setCell 2 12 (Filled Red)
            |> Board.setCell 3 12 (Filled Red)

        // Act
        let groups = Board.findConnectedGroups board

        // Assert
        groups |> List.length |> should equal 1
        groups |> List.head |> List.length |> should equal 4

    [<Fact>]
    let ``縦に4つ並んだぷよを検出できる`` () =
        // Arrange
        let board = Board.create 6 13

        let board =
            board
            |> Board.setCell 2 9 (Filled Green)
            |> Board.setCell 2 10 (Filled Green)
            |> Board.setCell 2 11 (Filled Green)
            |> Board.setCell 2 12 (Filled Green)

        // Act
        let groups = Board.findConnectedGroups board

        // Assert
        groups |> List.length |> should equal 1
        groups |> List.head |> List.length |> should equal 4

    [<Fact>]
    let ``L字型につながった5つのぷよを検出できる`` () =
        // Arrange
        let board = Board.create 6 13

        let board =
            board
            |> Board.setCell 1 10 (Filled Blue)
            |> Board.setCell 1 11 (Filled Blue)
            |> Board.setCell 1 12 (Filled Blue)
            |> Board.setCell 2 12 (Filled Blue)
            |> Board.setCell 3 12 (Filled Blue)

        // Act
        let groups = Board.findConnectedGroups board

        // Assert
        groups |> List.length |> should equal 1
        groups |> List.head |> List.length |> should equal 5

    [<Fact>]
    let ``3つ以下のぷよは検出されない`` () =
        // Arrange
        let board = Board.create 6 13

        let board =
            board
            |> Board.setCell 0 12 (Filled Yellow)
            |> Board.setCell 1 12 (Filled Yellow)
            |> Board.setCell 2 12 (Filled Yellow)

        // Act
        let groups = Board.findConnectedGroups board

        // Assert
        groups |> List.length |> should equal 0

    [<Fact>]
    let ``指定した位置のぷよを消去できる`` () =
        // Arrange
        let board = Board.create 6 13

        let board =
            board
            |> Board.setCell 0 12 (Filled Red)
            |> Board.setCell 1 12 (Filled Red)
            |> Board.setCell 2 12 (Filled Red)
            |> Board.setCell 3 12 (Filled Red)

        // Act
        let positions = [ (0, 12); (1, 12); (2, 12); (3, 12) ]
        let newBoard = board |> Board.clearPuyos positions

        // Assert
        Board.getCell newBoard 0 12 |> should equal Empty
        Board.getCell newBoard 1 12 |> should equal Empty
        Board.getCell newBoard 2 12 |> should equal Empty
        Board.getCell newBoard 3 12 |> should equal Empty

    [<Fact>]
    let ``重力を適用すると浮いているぷよが落ちる`` () =
        // Arrange
        let board = Board.create 6 13

        let board =
            board
            |> Board.setCell 2 8 (Filled Green) // 浮いているぷよ
            |> Board.setCell 2 12 (Filled Red) // 下にあるぷよ

        // Act
        let newBoard = Board.applyGravity board

        // Assert
        Board.getCell newBoard 2 8 |> should equal Empty
        Board.getCell newBoard 2 11 |> should equal (Filled Green) // 落ちた
        Board.getCell newBoard 2 12 |> should equal (Filled Red)

    [<Fact>]
    let ``重力を適用すると複数のぷよが落ちる`` () =
        // Arrange
        let board = Board.create 6 13

        let board =
            board
            |> Board.setCell 1 5 (Filled Blue)
            |> Board.setCell 1 6 (Filled Yellow)
            |> Board.setCell 1 12 (Filled Red)

        // Act
        let newBoard = Board.applyGravity board

        // Assert
        Board.getCell newBoard 1 5 |> should equal Empty
        Board.getCell newBoard 1 6 |> should equal Empty
        Board.getCell newBoard 1 10 |> should equal (Filled Blue)
        Board.getCell newBoard 1 11 |> should equal (Filled Yellow)
        Board.getCell newBoard 1 12 |> should equal (Filled Red)
