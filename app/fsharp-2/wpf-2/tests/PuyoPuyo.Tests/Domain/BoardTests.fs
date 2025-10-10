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
