module PuyoPuyo.Tests.Domain.BoardTests

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Core.Domain

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
    let newBoard = Board.setCell board 2 10 (Cell.Filled PuyoColor.Red)

    // Assert
    Board.getCell newBoard 2 10 |> should equal (Cell.Filled PuyoColor.Red)

[<Fact>]
let ``ボードにぷよを配置しても元のボードは変更されない`` () =
    // Arrange
    let board = Board.create 6 13

    // Act
    let newBoard = Board.setCell board 2 10 (Cell.Filled PuyoColor.Red)

    // Assert
    Board.getCell board 2 10 |> should equal Cell.Empty
    Board.getCell newBoard 2 10 |> should equal (Cell.Filled PuyoColor.Red)

[<Fact>]
let ``ぷよペアをボードに固定できる`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 3 10 PuyoColor.Red PuyoColor.Green 0

    // Act
    let newBoard = Board.fixPuyoPair board pair

    // Assert
    let (pos1, pos2) = PuyoPair.getPositions pair
    let (x1, y1) = pos1
    let (x2, y2) = pos2
    Board.getCell newBoard x1 y1 |> should equal (Cell.Filled PuyoColor.Red)
    Board.getCell newBoard x2 y2 |> should equal (Cell.Filled PuyoColor.Green)

[<Fact>]
let ``ぷよペアを固定しても元のボードは変更されない`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 3 10 PuyoColor.Red PuyoColor.Green 0

    // Act
    let newBoard = Board.fixPuyoPair board pair

    // Assert
    let (pos1, pos2) = PuyoPair.getPositions pair
    let (x1, y1) = pos1
    Board.getCell board x1 y1 |> should equal Cell.Empty // 元のボードは空のまま
    Board.getCell newBoard x1 y1 |> should equal (Cell.Filled PuyoColor.Red) // 新しいボードには固定

[<Fact>]
let ``横に4つ並んだぷよを検出できる`` () =
    // Arrange
    let board = Board.create 6 13

    let board =
        board
        |> fun b -> Board.setCell b 0 12 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 1 12 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 2 12 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 3 12 (Cell.Filled PuyoColor.Red)

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
        |> fun b -> Board.setCell b 2 9 (Cell.Filled PuyoColor.Green)
        |> fun b -> Board.setCell b 2 10 (Cell.Filled PuyoColor.Green)
        |> fun b -> Board.setCell b 2 11 (Cell.Filled PuyoColor.Green)
        |> fun b -> Board.setCell b 2 12 (Cell.Filled PuyoColor.Green)

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
        |> fun b -> Board.setCell b 1 10 (Cell.Filled PuyoColor.Blue)
        |> fun b -> Board.setCell b 1 11 (Cell.Filled PuyoColor.Blue)
        |> fun b -> Board.setCell b 1 12 (Cell.Filled PuyoColor.Blue)
        |> fun b -> Board.setCell b 2 12 (Cell.Filled PuyoColor.Blue)
        |> fun b -> Board.setCell b 3 12 (Cell.Filled PuyoColor.Blue)

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
        |> fun b -> Board.setCell b 0 12 (Cell.Filled PuyoColor.Yellow)
        |> fun b -> Board.setCell b 1 12 (Cell.Filled PuyoColor.Yellow)
        |> fun b -> Board.setCell b 2 12 (Cell.Filled PuyoColor.Yellow)

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
        |> fun b -> Board.setCell b 0 12 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 1 12 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 2 12 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 3 12 (Cell.Filled PuyoColor.Red)

    // Act
    let positions = [ (0, 12); (1, 12); (2, 12); (3, 12) ]
    let newBoard = board |> Board.clearPuyos positions

    // Assert
    Board.getCell newBoard 0 12 |> should equal Cell.Empty
    Board.getCell newBoard 1 12 |> should equal Cell.Empty
    Board.getCell newBoard 2 12 |> should equal Cell.Empty
    Board.getCell newBoard 3 12 |> should equal Cell.Empty

[<Fact>]
let ``重力を適用すると浮いているぷよが落ちる`` () =
    // Arrange
    let board = Board.create 6 13

    let board =
        board
        |> fun b -> Board.setCell b 2 8 (Cell.Filled PuyoColor.Green) // 浮いているぷよ
        |> fun b -> Board.setCell b 2 12 (Cell.Filled PuyoColor.Red) // 下にあるぷよ

    // Act
    let newBoard = Board.applyGravity board

    // Assert
    Board.getCell newBoard 2 8 |> should equal Cell.Empty
    Board.getCell newBoard 2 11 |> should equal (Cell.Filled PuyoColor.Green) // 落ちた
    Board.getCell newBoard 2 12 |> should equal (Cell.Filled PuyoColor.Red)

[<Fact>]
let ``重力を適用すると複数のぷよが落ちる`` () =
    // Arrange
    let board = Board.create 6 13

    let board =
        board
        |> fun b -> Board.setCell b 1 5 (Cell.Filled PuyoColor.Blue)
        |> fun b -> Board.setCell b 1 6 (Cell.Filled PuyoColor.Yellow)
        |> fun b -> Board.setCell b 1 12 (Cell.Filled PuyoColor.Red)

    // Act
    let newBoard = Board.applyGravity board

    // Assert
    Board.getCell newBoard 1 5 |> should equal Cell.Empty
    Board.getCell newBoard 1 6 |> should equal Cell.Empty
    Board.getCell newBoard 1 10 |> should equal (Cell.Filled PuyoColor.Blue)
    Board.getCell newBoard 1 11 |> should equal (Cell.Filled PuyoColor.Yellow)
    Board.getCell newBoard 1 12 |> should equal (Cell.Filled PuyoColor.Red)

[<Fact>]
let ``連鎖が発生する_基本ケース`` () =
    // Arrange: 赤ぷよ2x2と青ぷよ縦3+横1を配置
    // 赤ぷよが消えると青ぷよが落下して4つつながる
    let board = Board.create 6 13

    let board =
        board
        |> fun b -> Board.setCell b 1 11 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 2 11 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 1 12 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 2 12 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 3 11 (Cell.Filled PuyoColor.Blue)
        |> fun b -> Board.setCell b 2 8 (Cell.Filled PuyoColor.Blue)
        |> fun b -> Board.setCell b 2 9 (Cell.Filled PuyoColor.Blue)
        |> fun b -> Board.setCell b 2 10 (Cell.Filled PuyoColor.Blue)

    // Act: 再帰的に消去と重力を適用
    let (finalBoard, isZenkeshi) = Board.clearAndApplyGravityRepeatedly board

    // Assert: 全て消えているはず（2連鎖発生）
    Board.getCell finalBoard 1 11 |> should equal Cell.Empty
    Board.getCell finalBoard 2 11 |> should equal Cell.Empty
    Board.getCell finalBoard 3 11 |> should equal Cell.Empty
    // 全消しになっている
    isZenkeshi |> should equal true

[<Fact>]
let ``連鎖が発生しない_消去パターンなし`` () =
    // Arrange: 消去パターンがない状態
    let board = Board.create 6 13

    let board =
        board
        |> fun b -> Board.setCell b 1 12 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 2 12 (Cell.Filled PuyoColor.Blue)
        |> fun b -> Board.setCell b 3 12 (Cell.Filled PuyoColor.Green)

    // Act
    let (finalBoard, isZenkeshi) = Board.clearAndApplyGravityRepeatedly board

    // Assert: 何も変わっていないはず
    Board.getCell finalBoard 1 12 |> should equal (Cell.Filled PuyoColor.Red)
    Board.getCell finalBoard 2 12 |> should equal (Cell.Filled PuyoColor.Blue)
    Board.getCell finalBoard 3 12 |> should equal (Cell.Filled PuyoColor.Green)
    // 全消しにならない
    isZenkeshi |> should equal false

[<Fact>]
let ``盤面上のぷよがすべて消えると全消しになる`` () =
    // Arrange: 4つの赤ぷよを配置
    let board = Board.create 6 13

    let board =
        board
        |> fun b -> Board.setCell b 1 10 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 2 10 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 1 11 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 2 11 (Cell.Filled PuyoColor.Red)

    // Act: 消去判定と実行
    let groups = Board.findConnectedGroups board
    let positions = groups |> List.concat
    let clearedBoard = Board.clearPuyos positions board

    // 全消し判定
    let isZenkeshi = Board.checkZenkeshi clearedBoard

    // Assert: 全消しになっていることを確認
    isZenkeshi |> should equal true

[<Fact>]
let ``盤面上にぷよが残っていると全消しにならない`` () =
    // Arrange: 赤ぷよ4つと青ぷよ1つを配置
    let board = Board.create 6 13

    let board =
        board
        |> fun b -> Board.setCell b 1 10 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 2 10 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 1 11 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 2 11 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 3 11 (Cell.Filled PuyoColor.Blue)

    // Act: 消去判定と実行（赤ぷよのみ消える）
    let groups = Board.findConnectedGroups board
    let positions = groups |> List.concat
    let clearedBoard = Board.clearPuyos positions board

    // 全消し判定
    let isZenkeshi = Board.checkZenkeshi clearedBoard

    // Assert: 全消しにならない（青ぷよが残る）
    isZenkeshi |> should equal false

[<Fact>]
let ``消去パターンがない場合でも着地後は重力が適用される`` () =
    // Arrange: 空中に浮いたぷよと下にぷよがある状態
    let board = Board.create 6 13

    let board =
        board
        |> fun b -> Board.setCell b 2 8 (Cell.Filled PuyoColor.Red) // 空中に浮いている
        |> fun b -> Board.setCell b 2 12 (Cell.Filled PuyoColor.Blue) // 下にある
        |> fun b -> Board.setCell b 3 12 (Cell.Filled PuyoColor.Green) // 下にある

    // Act: 消去パターンがないが、連鎖処理を実行（重力が適用されるべき）
    let (finalBoard, isZenkeshi) = Board.clearAndApplyGravityRepeatedly board

    // Assert: 赤ぷよが落下している
    Board.getCell finalBoard 2 8 |> should equal Cell.Empty // 元の位置は空
    Board.getCell finalBoard 2 11 |> should equal (Cell.Filled PuyoColor.Red) // 落下した位置
    Board.getCell finalBoard 2 12 |> should equal (Cell.Filled PuyoColor.Blue) // 元のまま
    Board.getCell finalBoard 3 12 |> should equal (Cell.Filled PuyoColor.Green) // 元のまま
