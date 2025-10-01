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

[<Fact>]
let ``ゲーム実行フロー: 固定→落下→連鎖なし`` () =
    let board = createEmptyBoard
    // 縦に2つのぷよを配置 (x=3, y=10-11)
    let boardWithBase =
        board
        |> fun b -> setCellAt b { X = 3; Y = 10 } (Filled Red)
        |> fun b -> setCellAt b { X = 3; Y = 11 } (Filled Blue)

    // 横向きの組ぷよを上に配置 (x=2-3, y=8)
    let puyoPair = {
        Puyo1Color = Green
        Puyo2Color = Yellow
        BasePosition = { X = 2; Y = 8 }
        Rotation = Deg90  // 横向き: Green が左(x=2)、Yellow が右(x=3)
    }

    // 1. 固定
    let fixedBoard = fixPuyoPairToBoard boardWithBase puyoPair

    // 2. 落下
    let droppedBoard = dropFloatingPuyos fixedBoard

    // 3. 連鎖チェック
    let chainResult = executeChain droppedBoard

    // 検証: 落下後の配置
    // x=2: Green が底まで落下 (y=11)
    match getCellAt chainResult.Board { X = 2; Y = 11 } with
    | Some (Filled Green) -> ()
    | other -> failwith $"Expected Green at (2, 11) but got %A{other}"

    // x=3: Yellow が Red の上に落下 (y=9)
    match getCellAt chainResult.Board { X = 3; Y = 9 } with
    | Some (Filled Yellow) -> ()
    | other -> failwith $"Expected Yellow at (3, 9) but got %A{other}"

    // x=3: Red は y=10 のまま
    match getCellAt chainResult.Board { X = 3; Y = 10 } with
    | Some (Filled Red) -> ()
    | other -> failwith $"Expected Red at (3, 10) but got %A{other}"

    // x=3: Blue は y=11 のまま
    match getCellAt chainResult.Board { X = 3; Y = 11 } with
    | Some (Filled Blue) -> ()
    | other -> failwith $"Expected Blue at (3, 11) but got %A{other}"

    // 連鎖は発生しない
    chainResult.ChainCount |> should equal 0
    chainResult.TotalScore |> should equal 0

[<Fact>]
let ``縦2つのぷよの上に横向きぷよを配置した場合に全て底まで落下する`` () =
    let board = createEmptyBoard
    // 縦に2つのぷよ (x=3, y=10-11)
    let board' =
        board
        |> fun b -> setCellAt b { X = 3; Y = 10 } (Filled Red)
        |> fun b -> setCellAt b { X = 3; Y = 11 } (Filled Blue)
        // 横向きに2つのぷよ (x=2-3, y=8) - 下に空白がある
        |> fun b -> setCellAt b { X = 2; Y = 8 } (Filled Green)
        |> fun b -> setCellAt b { X = 3; Y = 8 } (Filled Yellow)

    let droppedBoard = dropFloatingPuyos board'

    // x=2のぷよは底まで落ちるべき (y=11)
    match getCellAt droppedBoard { X = 2; Y = 11 } with
    | Some (Filled Green) -> ()
    | _ -> failwith "Expected Green puyo at (2, 11)"

    // x=3のぷよは既存のぷよの上に積もるべき (y=9)
    match getCellAt droppedBoard { X = 3; Y = 9 } with
    | Some (Filled Yellow) -> ()
    | _ -> failwith "Expected Yellow puyo at (3, 9)"

    // 元の位置は空になっているべき
    match getCellAt droppedBoard { X = 2; Y = 8 } with
    | Some Empty -> ()
    | _ -> failwith "Expected empty cell at (2, 8)"

    match getCellAt droppedBoard { X = 3; Y = 8 } with
    | Some Empty -> ()
    | _ -> failwith "Expected empty cell at (3, 8)"

[<Fact>]
let ``複数の浮遊ぷよが縦に重なっていても全て正しく落下する`` () =
    let board = createEmptyBoard
    // 浮遊ぷよを縦に4つ配置 (x=3, y=5,6,7,8) - 底との間に空白がある
    let board' =
        board
        |> fun b -> setCellAt b { X = 3; Y = 5 } (Filled Blue)
        |> fun b -> setCellAt b { X = 3; Y = 6 } (Filled Red)
        |> fun b -> setCellAt b { X = 3; Y = 7 } (Filled Green)
        |> fun b -> setCellAt b { X = 3; Y = 8 } (Filled Yellow)

    let droppedBoard = dropFloatingPuyos board'

    // 全て底に詰まるべき (順序を保持: 上にあったものが上に、下にあったものが下に)
    // Blue (元y=5, 最上部) → y=8
    // Red (元y=6) → y=9
    // Green (元y=7) → y=10
    // Yellow (元y=8, 最下部) → y=11

    match getCellAt droppedBoard { X = 3; Y = 11 } with
    | Some (Filled Yellow) -> ()
    | _ -> failwith "Expected Yellow puyo at (3, 11)"

    match getCellAt droppedBoard { X = 3; Y = 10 } with
    | Some (Filled Green) -> ()
    | _ -> failwith "Expected Green puyo at (3, 10)"

    match getCellAt droppedBoard { X = 3; Y = 9 } with
    | Some (Filled Red) -> ()
    | _ -> failwith "Expected Red puyo at (3, 9)"

    match getCellAt droppedBoard { X = 3; Y = 8 } with
    | Some (Filled Blue) -> ()
    | _ -> failwith "Expected Blue puyo at (3, 8)"

    // 元の位置は空であるべき
    for y in 5 .. 7 do
        match getCellAt droppedBoard { X = 3; Y = y } with
        | Some Empty -> ()
        | _ -> failwith $"Expected empty cell at (3, {y})"