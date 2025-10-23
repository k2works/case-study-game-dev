module PuyoPuyo.Tests.Domain.GameLogicTests

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Core.Domain

[<Fact>]
let ``ぷよペアを左に移動できる`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 3 5 PuyoColor.Red PuyoColor.Green 0

    // Act
    let result = GameLogic.tryMovePuyoPair board pair Direction.Left

    // Assert
    match result with
    | Some movedPair ->
        movedPair.X |> should equal 2
        movedPair.Y |> should equal 5
    | None -> failwith "移動できるはずです"

[<Fact>]
let ``ぷよペアを右に移動できる`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 2 5 PuyoColor.Red PuyoColor.Green 0

    // Act
    let result = GameLogic.tryMovePuyoPair board pair Direction.Right

    // Assert
    match result with
    | Some movedPair ->
        movedPair.X |> should equal 3
        movedPair.Y |> should equal 5
    | None -> failwith "移動できるはずです"

[<Fact>]
let ``左端では左に移動できない`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 0 5 PuyoColor.Red PuyoColor.Green 0

    // Act
    let result = GameLogic.tryMovePuyoPair board pair Direction.Left

    // Assert
    result |> should equal None

[<Fact>]
let ``右端では右に移動できない`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 5 5 PuyoColor.Red PuyoColor.Green 0

    // Act
    let result = GameLogic.tryMovePuyoPair board pair Direction.Right

    // Assert
    result |> should equal None

[<Fact>]
let ``回転状態1（右向き）のとき右端で右に移動できない`` () =
    // Arrange
    let board = Board.create 6 13
    // 回転状態1のとき、2つ目のぷよは右にある
    let pair = PuyoPair.create 4 5 PuyoColor.Red PuyoColor.Green 1

    // Act
    let result = GameLogic.tryMovePuyoPair board pair Direction.Right

    // Assert
    result |> should equal None

[<Fact>]
let ``右端で回転すると左にキックされる`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 5 5 PuyoColor.Red PuyoColor.Green 0 // 右端、回転状態0（上）

    // Act
    let result = GameLogic.tryRotatePuyoPair board pair

    // Assert
    match result with
    | Some rotated ->
        rotated.Rotation |> should equal 1 // 回転成功
        rotated.X |> should equal 4 // 左に1マスキック
    | None -> failwith "回転できるはずです"

[<Fact>]
let ``左端で回転すると右にキックされる`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 0 5 PuyoColor.Red PuyoColor.Green 2 // 左端、回転状態2（下向き）

    // Act
    let result = GameLogic.tryRotatePuyoPair board pair

    // Assert
    match result with
    | Some kicked ->
        kicked.Rotation |> should equal 3 // 回転成功（3: 左向き）
        kicked.X |> should equal 1 // 右に1マスキック
    | None -> failwith "回転できるはずです"

[<Fact>]
let ``壁キックできない場合は回転しない`` () =
    // Arrange
    let board = Board.create 6 13
    // 右端にぷよを配置（壁キックできない状況を作る）
    let board = Board.setCell board 4 5 (Cell.Filled PuyoColor.Blue)
    let pair = PuyoPair.create 5 5 PuyoColor.Red PuyoColor.Green 0

    // Act
    let result = GameLogic.tryRotatePuyoPair board pair

    // Assert
    result |> should equal None

[<Fact>]
let ``ぷよペアを下に移動できる`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 3 5 PuyoColor.Red PuyoColor.Green 0

    // Act
    let result = GameLogic.tryMovePuyoPair board pair Direction.Down

    // Assert
    match result with
    | Some movedPair -> movedPair.Y |> should equal 6
    | None -> failwith "下に移動できるはずです"

[<Fact>]
let ``下端では下に移動できない`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 3 12 PuyoColor.Red PuyoColor.Green 0 // 軸ぷよがy=12（下端）、2つ目のぷよは y=11

    // Act
    let result = GameLogic.tryMovePuyoPair board pair Direction.Down

    // Assert
    result |> should equal None

[<Fact>]
let ``下にぷよがある場合は移動できない`` () =
    // Arrange
    let board = Board.create 6 13
    let board = Board.setCell board 3 6 (Cell.Filled PuyoColor.Blue) // 軸ぷよの下に障害物
    let pair = PuyoPair.create 3 5 PuyoColor.Red PuyoColor.Green 0

    // Act
    let result = GameLogic.tryMovePuyoPair board pair Direction.Down

    // Assert
    result |> should equal None

[<Fact>]
let ``回転後も下に移動できる`` () =
    // Arrange
    let board = Board.create 6 13
    let pair = PuyoPair.create 2 1 PuyoColor.Red PuyoColor.Green 0 // 初期位置（上向き）

    // Act
    let rotated = GameLogic.tryRotatePuyoPair board pair // 回転（右向きになる）

    // Assert - 回転後も下に移動できることを確認
    match rotated with
    | Some rotatedPair ->
        let movedDown = GameLogic.tryMovePuyoPair board rotatedPair Direction.Down
        movedDown |> should not' (equal None)
    | None -> failwith "回転できるはずです"

[<Fact>]
let ``新しいぷよを配置できない場合_ゲームオーバーになる`` () =
    // Arrange: ボードの上部（新しいぷよが配置される位置）にぷよを配置
    let board = Board.create 6 13

    let board =
        board
        |> fun b -> Board.setCell b 2 0 (Cell.Filled PuyoColor.Red)
        |> fun b -> Board.setCell b 2 1 (Cell.Filled PuyoColor.Red)

    // 新しいぷよペア（x=2, y=1 が軸、rotation=0 なので上方向の x=2, y=0 に2つ目）
    let newPiece = PuyoPair.create 2 1 PuyoColor.Blue PuyoColor.Green 0

    // Act: ゲームオーバー判定
    let isGameOver = GameLogic.checkGameOver board newPiece

    // Assert: ゲームオーバーになっていることを確認
    isGameOver |> should equal true

[<Fact>]
let ``新しいぷよを配置できる場合_ゲームオーバーにならない`` () =
    // Arrange: 空のボード
    let board = Board.create 6 13

    // 新しいぷよペア（x=2, y=1 が軸、rotation=0 なので上方向の x=2, y=0 に2つ目）
    let newPiece = PuyoPair.create 2 1 PuyoColor.Blue PuyoColor.Green 0

    // Act: ゲームオーバー判定
    let isGameOver = GameLogic.checkGameOver board newPiece

    // Assert: ゲームオーバーにならないことを確認
    isGameOver |> should equal false
