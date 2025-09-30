module BoardTests

open Xunit
open FsUnit.Xunit
open PuyoGame.Domain
open PuyoGame.Domain.Board

[<Fact>]
let ``空のボードを作成できる`` () =
    let board = createEmpty

    width board |> should equal 8
    height board |> should equal 12

[<Fact>]
let ``ボードの全セルが空である`` () =
    let board = createEmpty

    board
    |> getAllCells
    |> Array.forall (Array.forall ((=) Empty))
    |> should be True

[<Fact>]
let ``有効な座標を検証できる`` () =
    let board = createEmpty

    isValidPosition board { X = 0; Y = 0 } |> should be True
    isValidPosition board { X = 7; Y = 11 } |> should be True

[<Fact>]
let ``無効な座標を検証できる`` () =
    let board = createEmpty

    isValidPosition board { X = -1; Y = 0 } |> should be False
    isValidPosition board { X = 8; Y = 0 } |> should be False
    isValidPosition board { X = 0; Y = -1 } |> should be False
    isValidPosition board { X = 0; Y = 12 } |> should be False

[<Fact>]
let ``セルを取得できる`` () =
    let board = createEmpty
    let pos = { X = 3; Y = 5 }

    match tryGetCell board pos with
    | Some Empty -> ()
    | _ -> failwith "Expected Empty cell"

[<Fact>]
let ``セルを更新できる（不変）`` () =
    let board = createEmpty
    let pos = { X = 3; Y = 5 }
    let updatedBoard = setCell board pos (Filled Red)

    // 元のボードは変更されない
    match tryGetCell board pos with
    | Some Empty -> ()
    | _ -> failwith "Original board should be unchanged"

    // 新しいボードは更新されている
    match tryGetCell updatedBoard pos with
    | Some (Filled Red) -> ()
    | _ -> failwith "Updated board should have Red puyo"

[<Fact>]
let ``ぷよの存在を確認できる`` () =
    let board = createEmpty
    let pos = { X = 3; Y = 5 }
    let boardWithPuyo = setCell board pos (Filled Red)

    hasPuyo board pos |> should be False
    hasPuyo boardWithPuyo pos |> should be True

[<Fact>]
let ``全消し判定が正しく動作する`` () =
    let emptyBoard = createEmpty
    let boardWithPuyo = setCell emptyBoard { X = 0; Y = 0 } (Filled Red)

    isPerfectClear emptyBoard |> should be True
    isPerfectClear boardWithPuyo |> should be False