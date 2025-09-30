module GameLogicTests

open Xunit
open FsUnit.Xunit
open Puyo
open Puyo.BoardModule
open Puyo.PuyoManagement
open Puyo.GameLogic

[<Fact>]
let ``空のボードで組ぷよを左に移動できる`` () =
    let board = createEmptyBoard
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 0 }
        Rotation = Deg0
    }

    let movedPair = movePuyoPairLeft board pair
    movedPair.BasePosition.X |> should equal 2

[<Fact>]
let ``左端で組ぷよを左に移動できない`` () =
    let board = createEmptyBoard
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 0; Y = 0 }
        Rotation = Deg0
    }

    let movedPair = movePuyoPairLeft board pair
    movedPair.BasePosition.X |> should equal 0

[<Fact>]
let ``空のボードで組ぷよを右に移動できる`` () =
    let board = createEmptyBoard
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 0 }
        Rotation = Deg0
    }

    let movedPair = movePuyoPairRight board pair
    movedPair.BasePosition.X |> should equal 4

[<Fact>]
let ``右端で組ぷよを右に移動できない`` () =
    let board = createEmptyBoard
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 7; Y = 0 }
        Rotation = Deg0
    }

    let movedPair = movePuyoPairRight board pair
    movedPair.BasePosition.X |> should equal 7

[<Fact>]
let ``空のボードで組ぷよを下に移動できる`` () =
    let board = createEmptyBoard
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 0 }
        Rotation = Deg0
    }

    let movedPair = movePuyoPairDown board pair
    movedPair.BasePosition.Y |> should equal 1

[<Fact>]
let ``組ぷよがボード底に到達すると落下できない`` () =
    let board = createEmptyBoard
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 10 }
        Rotation = Deg0
    }

    canFall board pair |> should be False

[<Fact>]
let ``ハードドロップで組ぷよが底まで落下する`` () =
    let board = createEmptyBoard
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 0 }
        Rotation = Deg0
    }

    let droppedPair = hardDrop board pair
    droppedPair.BasePosition.Y |> should equal 10

[<Fact>]
let ``組ぷよをボードに固定できる`` () =
    let board = createEmptyBoard
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 10 }
        Rotation = Deg0
    }

    let fixedBoard = fixPuyoPairToBoard board pair

    match getCellAt fixedBoard { X = 3; Y = 10 } with
    | Some (Filled Red) -> ()
    | _ -> failwith "Expected Red puyo"

    match getCellAt fixedBoard { X = 3; Y = 11 } with
    | Some (Filled Blue) -> ()
    | _ -> failwith "Expected Blue puyo"

[<Fact>]
let ``浮いているぷよが落下する`` () =
    let board = createEmptyBoard
    let board' = setCellAt board { X = 3; Y = 5 } (Filled Red)

    let droppedBoard = dropFloatingPuyos board'

    match getCellAt droppedBoard { X = 3; Y = 5 } with
    | Some Empty -> ()
    | _ -> failwith "Expected empty cell"

    match getCellAt droppedBoard { X = 3; Y = 11 } with
    | Some (Filled Red) -> ()
    | _ -> failwith "Expected Red puyo at bottom"

[<Fact>]
let ``隣接する同色ぷよを検索できる`` () =
    let board = createEmptyBoard
    let board' =
        board
        |> fun b -> setCellAt b { X = 3; Y = 10 } (Filled Red)
        |> fun b -> setCellAt b { X = 3; Y = 11 } (Filled Red)
        |> fun b -> setCellAt b { X = 4; Y = 11 } (Filled Red)
        |> fun b -> setCellAt b { X = 5; Y = 11 } (Filled Red)

    let adjacent = findAdjacentPuyos board' { X = 3; Y = 10 }

    List.length adjacent |> should equal 4

[<Fact>]
let ``4つ以上の連結成分を検索できる`` () =
    let board = createEmptyBoard
    let board' =
        board
        |> fun b -> setCellAt b { X = 3; Y = 10 } (Filled Red)
        |> fun b -> setCellAt b { X = 3; Y = 11 } (Filled Red)
        |> fun b -> setCellAt b { X = 4; Y = 11 } (Filled Red)
        |> fun b -> setCellAt b { X = 5; Y = 11 } (Filled Red)

    let groups = findGroupsToClear board'

    List.length groups |> should equal 1
    List.length groups.[0] |> should equal 4

[<Fact>]
let ``4つ未満の連結成分は検索されない`` () =
    let board = createEmptyBoard
    let board' =
        board
        |> fun b -> setCellAt b { X = 3; Y = 10 } (Filled Red)
        |> fun b -> setCellAt b { X = 3; Y = 11 } (Filled Red)
        |> fun b -> setCellAt b { X = 4; Y = 11 } (Filled Red)

    let groups = findGroupsToClear board'

    List.length groups |> should equal 0

[<Fact>]
let ``ぷよグループを消去できる`` () =
    let board = createEmptyBoard
    let board' =
        board
        |> fun b -> setCellAt b { X = 3; Y = 10 } (Filled Red)
        |> fun b -> setCellAt b { X = 3; Y = 11 } (Filled Red)
        |> fun b -> setCellAt b { X = 4; Y = 11 } (Filled Red)
        |> fun b -> setCellAt b { X = 5; Y = 11 } (Filled Red)

    let groups = findGroupsToClear board'
    let clearedBoard = clearPuyoGroups board' groups

    match getCellAt clearedBoard { X = 3; Y = 10 } with
    | Some Empty -> ()
    | _ -> failwith "Expected empty cell"

[<Fact>]
let ``連鎖ボーナスを計算できる`` () =
    calculateChainBonus 1 |> should equal 0
    calculateChainBonus 2 |> should equal 8
    calculateChainBonus 3 |> should equal 16
    calculateChainBonus 8 |> should equal 256

[<Fact>]
let ``基本消去スコアを計算できる`` () =
    calculateClearScore 4 0 |> should equal 40
    calculateClearScore 4 8 |> should equal 48

[<Fact>]
let ``全消し判定ができる`` () =
    let emptyBoard = createEmptyBoard
    isPerfectClear emptyBoard |> should be True

    let boardWithPuyo = setCellAt emptyBoard { X = 0; Y = 0 } (Filled Red)
    isPerfectClear boardWithPuyo |> should be False

[<Fact>]
let ``連鎖処理を実行できる`` () =
    let board = createEmptyBoard
    // 4 つの赤ぷよを配置
    let board' =
        board
        |> fun b -> setCellAt b { X = 3; Y = 8 } (Filled Red)
        |> fun b -> setCellAt b { X = 3; Y = 9 } (Filled Red)
        |> fun b -> setCellAt b { X = 3; Y = 10 } (Filled Red)
        |> fun b -> setCellAt b { X = 3; Y = 11 } (Filled Red)

    let result = executeChain board'

    result.ChainCount |> should equal 1
    result.TotalScore |> should equal 1040  // 基本スコア 40 + 全消しボーナス 1000
    isPerfectClear result.Board |> should be True