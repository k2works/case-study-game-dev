module BoardTests

open Xunit
open FsUnit.Xunit
open Puyo
open Puyo.BoardModule

[<Fact>]
let ``空のボードを作成できる`` () =
    let board = createEmptyBoard

    board.Width |> should equal 8
    board.Height |> should equal 12
    board.Cells |> Array.length |> should equal 12
    board.Cells.[0] |> Array.length |> should equal 8

[<Fact>]
let ``ボードの全セルが空である`` () =
    let board = createEmptyBoard

    board.Cells
    |> Array.forall (Array.forall ((=) Empty))
    |> should be True

[<Fact>]
let ``有効な座標を検証できる`` () =
    let board = createEmptyBoard

    isValidPosition board 0 0 |> should be True
    isValidPosition board 7 11 |> should be True
    isValidPosition board 4 6 |> should be True

[<Fact>]
let ``無効な座標を検証できる`` () =
    let board = createEmptyBoard

    isValidPosition board -1 0 |> should be False
    isValidPosition board 8 0 |> should be False
    isValidPosition board 0 12 |> should be False
    isValidPosition board 10 15 |> should be False

[<Fact>]
let ``セルを取得できる`` () =
    let board = createEmptyBoard
    let pos = { X = 3; Y = 5 }

    match getCellAt board pos with
    | Some Empty -> ()
    | _ -> failwith "Expected Empty cell"

[<Fact>]
let ``セルを更新できる`` () =
    let board = createEmptyBoard
    let pos = { X = 3; Y = 5 }
    let updatedBoard = setCellAt board pos (Filled Red)

    match getCellAt updatedBoard pos with
    | Some (Filled Red) -> ()
    | _ -> failwith "Expected Red puyo"