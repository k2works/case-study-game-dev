module DebugDropTest

open Xunit
open Puyo
open Puyo.BoardModule
open Puyo.GameLogic

[<Fact>]
let ``デバッグ: 落下ロジック詳細確認`` () =
    let board = createEmptyBoard

    // 縦に2つのぷよ (x=3, y=10-11)
    let board' =
        board
        |> fun b -> setCellAt b { X = 3; Y = 10 } (Filled Red)
        |> fun b -> setCellAt b { X = 3; Y = 11 } (Filled Blue)
        // 横向きに2つのぷよ (x=2-3, y=8) - 下に空白がある
        |> fun b -> setCellAt b { X = 2; Y = 8 } (Filled Green)
        |> fun b -> setCellAt b { X = 3; Y = 8 } (Filled Yellow)

    // ボードの状態を可視化
    printfn "\n=== 落下前のボード ==="
    for y in 0 .. 11 do
        printf "y=%2d: " y
        for x in 0 .. 7 do
            match getCellAt board' { X = x; Y = y } with
            | Some Empty -> printf ". "
            | Some (Filled Red) -> printf "R "
            | Some (Filled Blue) -> printf "B "
            | Some (Filled Green) -> printf "G "
            | Some (Filled Yellow) -> printf "Y "
            | _ -> printf "? "
        printfn ""

    let droppedBoard = dropFloatingPuyos board'

    printfn "\n=== 落下後のボード ==="
    for y in 0 .. 11 do
        printf "y=%2d: " y
        for x in 0 .. 7 do
            match getCellAt droppedBoard { X = x; Y = y } with
            | Some Empty -> printf ". "
            | Some (Filled Red) -> printf "R "
            | Some (Filled Blue) -> printf "B "
            | Some (Filled Green) -> printf "G "
            | Some (Filled Yellow) -> printf "Y "
            | _ -> printf "? "
        printfn ""

    // 結果の検証
    let greenAtBottom = getCellAt droppedBoard { X = 2; Y = 11 }
    let yellowAt9 = getCellAt droppedBoard { X = 3; Y = 9 }

    printfn "\nx=2, y=11: %A (期待: Green)" greenAtBottom
    printfn "x=3, y=9: %A (期待: Yellow)" yellowAt9

[<Fact>]
let ``デバッグ: 複数の縦積みぷよの落下確認`` () =
    let board = createEmptyBoard
    // 底にぷよを1つ (x=3, y=11)
    let board' =
        board
        |> fun b -> setCellAt b { X = 3; Y = 11 } (Filled Blue)
        // 浮遊ぷよを縦に3つ配置 (x=3, y=5,6,7)
        |> fun b -> setCellAt b { X = 3; Y = 5 } (Filled Red)
        |> fun b -> setCellAt b { X = 3; Y = 6 } (Filled Green)
        |> fun b -> setCellAt b { X = 3; Y = 7 } (Filled Yellow)

    printfn "\n=== 落下前のボード (複数縦積み) ==="
    for y in 0 .. 11 do
        printf "y=%2d: " y
        for x in 0 .. 7 do
            match getCellAt board' { X = x; Y = y } with
            | Some Empty -> printf ". "
            | Some (Filled Red) -> printf "R "
            | Some (Filled Blue) -> printf "B "
            | Some (Filled Green) -> printf "G "
            | Some (Filled Yellow) -> printf "Y "
            | _ -> printf "? "
        printfn ""

    let droppedBoard = dropFloatingPuyos board'

    printfn "\n=== 落下後のボード (複数縦積み) ==="
    for y in 0 .. 11 do
        printf "y=%2d: " y
        for x in 0 .. 7 do
            match getCellAt droppedBoard { X = x; Y = y } with
            | Some Empty -> printf ". "
            | Some (Filled Red) -> printf "R "
            | Some (Filled Blue) -> printf "B "
            | Some (Filled Green) -> printf "G "
            | Some (Filled Yellow) -> printf "Y "
            | _ -> printf "? "
        printfn ""

    printfn "\n期待される配置:"
    printfn "x=3, y=11: Blue (底)"
    printfn "x=3, y=10: Red"
    printfn "x=3, y=9: Green"
    printfn "x=3, y=8: Yellow"

    printfn "\n実際の配置:"
    printfn "x=3, y=11: %A" (getCellAt droppedBoard { X = 3; Y = 11 })
    printfn "x=3, y=10: %A" (getCellAt droppedBoard { X = 3; Y = 10 })
    printfn "x=3, y=9: %A" (getCellAt droppedBoard { X = 3; Y = 9 })
    printfn "x=3, y=8: %A" (getCellAt droppedBoard { X = 3; Y = 8 })

[<Fact>]
let ``デバッグ: 縦2つ+横2つの落下確認`` () =
    let board = createEmptyBoard
    // 縦に2つのぷよ (x=3, y=10-11)
    let board' =
        board
        |> fun b -> setCellAt b { X = 3; Y = 10 } (Filled Red)
        |> fun b -> setCellAt b { X = 3; Y = 11 } (Filled Blue)
        // 横向きに2つのぷよ (x=2-3, y=8) - 下に空白がある
        |> fun b -> setCellAt b { X = 2; Y = 8 } (Filled Green)
        |> fun b -> setCellAt b { X = 3; Y = 8 } (Filled Yellow)

    printfn "\n=== 落下前のボード (縦2+横2) ==="
    for y in 0 .. 11 do
        printf "y=%2d: " y
        for x in 0 .. 7 do
            match getCellAt board' { X = x; Y = y } with
            | Some Empty -> printf ". "
            | Some (Filled Red) -> printf "R "
            | Some (Filled Blue) -> printf "B "
            | Some (Filled Green) -> printf "G "
            | Some (Filled Yellow) -> printf "Y "
            | _ -> printf "? "
        printfn ""

    let droppedBoard = dropFloatingPuyos board'

    printfn "\n=== 落下後のボード (縦2+横2) ==="
    for y in 0 .. 11 do
        printf "y=%2d: " y
        for x in 0 .. 7 do
            match getCellAt droppedBoard { X = x; Y = y } with
            | Some Empty -> printf ". "
            | Some (Filled Red) -> printf "R "
            | Some (Filled Blue) -> printf "B "
            | Some (Filled Green) -> printf "G "
            | Some (Filled Yellow) -> printf "Y "
            | _ -> printf "? "
        printfn ""

    printfn "\n期待される配置:"
    printfn "x=2, y=11: Green (底まで落下)"
    printfn "x=3, y=9: Yellow (Red/Blueの上に落下)"
    printfn "x=3, y=10: Red"
    printfn "x=3, y=11: Blue"

    printfn "\n実際の配置:"
    printfn "x=2, y=11: %A" (getCellAt droppedBoard { X = 2; Y = 11 })
    printfn "x=3, y=9: %A" (getCellAt droppedBoard { X = 3; Y = 9 })
    printfn "x=3, y=10: %A" (getCellAt droppedBoard { X = 3; Y = 10 })
    printfn "x=3, y=11: %A" (getCellAt droppedBoard { X = 3; Y = 11 })
