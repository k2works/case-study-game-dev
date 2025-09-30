module GameLogicTests

open Xunit
open FsUnit.Xunit
open PuyoGame.Domain
open PuyoGame.Domain.Board
open PuyoGame.Domain.Puyo
open PuyoGame.Domain.GameLogic

[<Fact>]
let ``組ぷよが下に移動可能かチェックできる`` () =
    let board = createEmpty
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 5 }
        Rotation = Deg0
    }

    canFall board pair |> should be True

[<Fact>]
let ``組ぷよが底に達すると移動不可`` () =
    let board = createEmpty
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 10 }
        Rotation = Deg0
    }

    canFall board pair |> should be False

[<Fact>]
let ``組ぷよを左に移動できる`` () =
    let board = createEmpty
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 5 }
        Rotation = Deg0
    }

    let moved = movePuyoPairLeft board pair
    moved.BasePosition.X |> should equal 2

[<Fact>]
let ``組ぷよを右に移動できる`` () =
    let board = createEmpty
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 5 }
        Rotation = Deg0
    }

    let moved = movePuyoPairRight board pair
    moved.BasePosition.X |> should equal 4

[<Fact>]
let ``組ぷよを下に移動できる`` () =
    let board = createEmpty
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 5 }
        Rotation = Deg0
    }

    let moved = movePuyoPairDown board pair
    moved.BasePosition.Y |> should equal 6

[<Fact>]
let ``壁際では移動できない`` () =
    let board = createEmpty
    let leftEdge = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 0; Y = 5 }
        Rotation = Deg0
    }
    let rightEdge = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 7; Y = 5 }
        Rotation = Deg0
    }

    let movedLeft = movePuyoPairLeft board leftEdge
    movedLeft.BasePosition.X |> should equal 0

    let movedRight = movePuyoPairRight board rightEdge
    movedRight.BasePosition.X |> should equal 7

[<Fact>]
let ``ハードドロップで底まで落下できる`` () =
    let board = createEmpty
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 0 }
        Rotation = Deg0
    }

    let dropped = hardDrop board pair
    dropped.BasePosition.Y |> should equal 10

[<Fact>]
let ``組ぷよをボードに固定できる`` () =
    let board = createEmpty
    let pair = {
        Puyo1Color = Red
        Puyo2Color = Blue
        BasePosition = { X = 3; Y = 10 }
        Rotation = Deg0
    }

    let fixedBoard = fixPuyoPairToBoard board pair

    match tryGetCell fixedBoard { X = 3; Y = 10 } with
    | Some (Filled Red) -> ()
    | _ -> failwith "Expected Red puyo"

    match tryGetCell fixedBoard { X = 3; Y = 11 } with
    | Some (Filled Blue) -> ()
    | _ -> failwith "Expected Blue puyo"

[<Fact>]
let ``隣接する同色ぷよを検索できる`` () =
    let board = createEmpty
    let board1 = setCell board { X = 3; Y = 10 } (Filled Red)
    let board2 = setCell board1 { X = 3; Y = 11 } (Filled Red)
    let board3 = setCell board2 { X = 4; Y = 10 } (Filled Red)
    let board4 = setCell board3 { X = 4; Y = 11 } (Filled Red)

    let adjacentPuyos = findAdjacentPuyos board4 { X = 3; Y = 10 }
    List.length adjacentPuyos |> should equal 4

[<Fact>]
let ``4つ未満の同色ぷよは消去対象外`` () =
    let board = createEmpty
    let board1 = setCell board { X = 3; Y = 10 } (Filled Red)
    let board2 = setCell board1 { X = 3; Y = 11 } (Filled Red)
    let board3 = setCell board2 { X = 4; Y = 10 } (Filled Red)

    let groups = findGroupsToClear board3
    List.isEmpty groups |> should be True

[<Fact>]
let ``4つ以上の同色ぷよは消去対象`` () =
    let board = createEmpty
    let board1 = setCell board { X = 3; Y = 10 } (Filled Red)
    let board2 = setCell board1 { X = 3; Y = 11 } (Filled Red)
    let board3 = setCell board2 { X = 4; Y = 10 } (Filled Red)
    let board4 = setCell board3 { X = 4; Y = 11 } (Filled Red)

    let groups = findGroupsToClear board4
    List.length groups |> should equal 1
    List.head groups |> List.length |> should equal 4

[<Fact>]
let ``浮いているぷよが落下する`` () =
    let board = createEmpty
    let board1 = setCell board { X = 3; Y = 5 } (Filled Red)
    let board2 = setCell board1 { X = 3; Y = 11 } (Filled Blue)

    let droppedBoard = dropFloatingPuyos board2

    // 浮いていた赤ぷよが青ぷよの上に落下
    match tryGetCell droppedBoard { X = 3; Y = 10 } with
    | Some (Filled Red) -> ()
    | _ -> failwith "Expected Red puyo at (3, 10)"

    match tryGetCell droppedBoard { X = 3; Y = 5 } with
    | Some Empty -> ()
    | _ -> failwith "Expected Empty at (3, 5)"

[<Fact>]
let ``連鎖ボーナスが正しく計算される`` () =
    calculateChainBonus 1 |> should equal 0
    calculateChainBonus 2 |> should equal 8
    calculateChainBonus 3 |> should equal 16
    calculateChainBonus 4 |> should equal 32
    calculateChainBonus 5 |> should equal 64

[<Fact>]
let ``連鎖処理が正しく実行される`` () =
    let board = createEmpty
    // 4つの赤ぷよを配置
    let board1 = setCell board { X = 3; Y = 10 } (Filled Red)
    let board2 = setCell board1 { X = 3; Y = 11 } (Filled Red)
    let board3 = setCell board2 { X = 4; Y = 10 } (Filled Red)
    let board4 = setCell board3 { X = 4; Y = 11 } (Filled Red)

    let result = executeChain board4

    result.ChainCount |> should equal 1
    result.TotalScore |> should be (greaterThan 0)
    isPerfectClear result.Board |> should be True