module PuyoPuyo.Tests.IntegrationTests

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Core.Domain

[<Fact>]
let ``完全なゲームフロー: 着地→消去→重力→連鎖→スコア加算`` () =
    // Arrange: 初期ボード - 下に3つの赤ぷよが縦に配置されている
    let board =
        Board.create 6 13
        |> fun b -> Board.setCell b 1 10 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 1 11 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 1 12 (Cell.Filled PuyoColor.Red)

    // 新しいぷよペア: 赤+青（x=1から開始、rotation=0で上向き）
    let piece = PuyoPair.create 1 1 PuyoColor.Red PuyoColor.Blue 0

    // Act 1: ぷよペアを下まで移動
    let rec moveToBottom (currentPiece: PuyoPair) =
        match GameLogic.tryMovePuyoPair board currentPiece Direction.Down with
        | Some movedPiece -> moveToBottom movedPiece
        | None -> currentPiece

    let landedPiece = moveToBottom piece

    // Act 2: 着地処理
    let boardWithPuyo = Board.fixPuyoPair board landedPiece

    // Assert: ボードに赤ぷよ4つと青ぷよ1つが配置されているはず
    // rotation=0なので、軸ぷよ(Puyo1)がy=9、2つ目のぷよ(Puyo2)がy=8
    Board.getCell boardWithPuyo 1 9 |> should equal (Cell.Filled PuyoColor.Red) // Puyo1
    Board.getCell boardWithPuyo 1 8 |> should equal (Cell.Filled PuyoColor.Blue) // Puyo2
    Board.getCell boardWithPuyo 1 10 |> should equal (Cell.Filled PuyoColor.Red) // 既存
    Board.getCell boardWithPuyo 1 11 |> should equal (Cell.Filled PuyoColor.Red) // 既存
    Board.getCell boardWithPuyo 1 12 |> should equal (Cell.Filled PuyoColor.Red) // 既存

    // Act 3: 連鎖処理（消去と重力を繰り返し適用）、連鎖情報を取得
    let (finalBoard, chainInfo) =
        Board.clearAndApplyGravityRepeatedlyWithInfo boardWithPuyo

    // Assert: 赤ぷよが消えて青ぷよだけが残っているはず
    Board.getCell finalBoard 1 9 |> should equal Cell.Empty
    Board.getCell finalBoard 1 10 |> should equal Cell.Empty
    Board.getCell finalBoard 1 11 |> should equal Cell.Empty

    // Assert: 青ぷよは重力で下に落ちているはず
    Board.getCell finalBoard 1 12 |> should equal (Cell.Filled PuyoColor.Blue)

    // Assert: 連鎖情報を確認
    chainInfo.ChainCount |> should equal 1
    chainInfo.ClearedPuyoCount |> should equal 4

    // Assert: 全消しではない（青ぷよが残っている）
    chainInfo.IsZenkeshi |> should equal false

    // Assert: スコアが計算されている
    let score = Board.calculateScore chainInfo
    score |> should be (greaterThan 0)

[<Fact>]
let ``完全なゲームフロー: 全消しボーナス`` () =
    // Arrange: 初期ボード - 3つの赤ぷよのみ
    let board =
        Board.create 6 13
        |> fun b -> Board.setCell b 1 12 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 2 12 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 3 12 (Cell.Filled PuyoColor.Red)

    // 新しいぷよペア: 赤2つ
    let piece = PuyoPair.create 1 1 PuyoColor.Red PuyoColor.Red 0

    // Act: 着地まで移動
    let rec moveToBottom (currentPiece: PuyoPair) =
        match GameLogic.tryMovePuyoPair board currentPiece Direction.Down with
        | Some movedPiece -> moveToBottom movedPiece
        | None -> currentPiece

    let landedPiece = moveToBottom piece
    let boardWithPuyo = Board.fixPuyoPair board landedPiece

    // 連鎖処理
    let (finalBoard, chainInfo) =
        Board.clearAndApplyGravityRepeatedlyWithInfo boardWithPuyo

    // Assert: 全て消えているはず
    for y in 0 .. finalBoard.Rows - 1 do
        for x in 0 .. finalBoard.Cols - 1 do
            Board.getCell finalBoard x y |> should equal Cell.Empty

    // Assert: 全消し判定
    chainInfo.IsZenkeshi |> should equal true

    // Assert: 5個のぷよが消えている
    chainInfo.ClearedPuyoCount |> should equal 5

[<Fact>]
let ``完全なゲームフロー: ゲームオーバー判定`` () =
    // Arrange: 初期ボード - 上部までぷよで埋まっている
    let mutable board = Board.create 6 13

    // x=2の列を上部まで埋める（y=0とy=1も埋める）
    for y in 0..12 do
        board <- Board.setCell board 2 y (Cell.Filled PuyoColor.Red)

    // 新しいぷよペア（x=2, y=1が軸、rotation=0なので2つ目はy=0）
    let newPiece = PuyoPair.create 2 1 PuyoColor.Blue PuyoColor.Green 0

    // Act: ゲームオーバー判定
    let isGameOver = GameLogic.checkGameOver board newPiece

    // Assert: ゲームオーバーになるはず
    isGameOver |> should equal true
