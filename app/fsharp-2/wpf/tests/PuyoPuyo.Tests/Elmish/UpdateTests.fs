module PuyoPuyo.Tests.Elmish.UpdateTests

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Domain
open PuyoPuyo.Game

[<Fact>]
let ``Tickメッセージでぷよが下に移動する`` () =
    // Arrange
    let model = Model.init ()
    let pair = PuyoPair.create 3 5 Red Green 0

    let model =
        { model with
            CurrentPiece = Some pair
            Status = Playing }

    // Act
    let (newModel, _) = Update.update Tick model

    // Assert
    match newModel.CurrentPiece with
    | Some newPair -> newPair.Y |> should equal 6
    | None -> failwith "ぷよが存在するはずです"

[<Fact>]
let ``着地したぷよはボードに固定され新しいぷよが生成される`` () =
    // Arrange
    let model = Model.init ()
    let pair = PuyoPair.create 3 12 Red Green 0 // 軸ぷよが最下端

    let model =
        { model with
            CurrentPiece = Some pair
            Status = Playing }

    // Act
    let (newModel, _) = Update.update Tick model

    // Assert
    // 着地したぷよがボードに固定されている
    Board.getCell newModel.Board 3 12 |> should equal (Filled Red)
    Board.getCell newModel.Board 3 11 |> should equal (Filled Green)

    // 新しいぷよが生成されている
    match newModel.CurrentPiece with
    | Some newPair ->
        newPair.X |> should equal 2
        newPair.Y |> should equal 1
    | None -> failwith "新しいぷよが生成されるはずです"

[<Fact>]
let ``ゲーム中でない場合は落下しない`` () =
    // Arrange
    let model = Model.init ()
    let pair = PuyoPair.create 3 5 Red Green 0

    let model =
        { model with
            CurrentPiece = Some pair
            Status = NotStarted }

    // Act
    let (newModel, _) = Update.update Tick model

    // Assert
    match newModel.CurrentPiece with
    | Some newPair -> newPair.Y |> should equal 5 // 位置が変わらない
    | None -> failwith "ぷよが存在するはずです"

[<Fact>]
let ``MoveDownメッセージでぷよが下に移動する`` () =
    // Arrange
    let model = Model.init ()
    let pair = PuyoPair.create 3 5 Red Green 0

    let model =
        { model with
            CurrentPiece = Some pair
            Status = Playing }

    // Act
    let (newModel, _) = Update.update MoveDown model

    // Assert
    match newModel.CurrentPiece with
    | Some newPair -> newPair.Y |> should equal 6
    | None -> failwith "ぷよが存在するはずです"

[<Fact>]
let ``MoveDownで下端に到達した場合は着地する`` () =
    // Arrange
    let model = Model.init ()
    let pair = PuyoPair.create 3 12 Red Green 0 // 最下端

    let model =
        { model with
            CurrentPiece = Some pair
            Status = Playing }

    // Act
    let (newModel, _) = Update.update MoveDown model

    // Assert
    // 着地してボードに固定
    Board.getCell newModel.Board 3 12 |> should equal (Filled Red)
    Board.getCell newModel.Board 3 11 |> should equal (Filled Green)

    // 新しいぷよが生成
    match newModel.CurrentPiece with
    | Some _ -> ()
    | None -> failwith "新しいぷよが生成されるはずです"

[<Fact>]
let ``StartFastFallメッセージで高速落下モードになる`` () =
    // Arrange
    let model = Model.init ()

    let model =
        { model with
            Status = Playing
            IsFastFalling = false }

    // Act
    let (newModel, _) = Update.update StartFastFall model

    // Assert
    newModel.IsFastFalling |> should equal true

[<Fact>]
let ``StopFastFallメッセージで高速落下モードが解除される`` () =
    // Arrange
    let model = Model.init ()

    let model =
        { model with
            Status = Playing
            IsFastFalling = true }

    // Act
    let (newModel, _) = Update.update StopFastFall model

    // Assert
    newModel.IsFastFalling |> should equal false

[<Fact>]
let ``ゲーム中でない場合は高速落下モードにならない`` () =
    // Arrange
    let model = Model.init ()

    let model =
        { model with
            Status = NotStarted
            IsFastFalling = false }

    // Act
    let (newModel, _) = Update.update StartFastFall model

    // Assert
    newModel.IsFastFalling |> should equal false

[<Fact>]
let ``着地時に4つ以上つながったぷよが消去される`` () =
    // Arrange
    let model = Model.init ()

    // ボードに赤いぷよを3つ横に配置
    let board =
        model.Board
        |> Board.setCell 0 12 (Filled Red)
        |> Board.setCell 1 12 (Filled Red)
        |> Board.setCell 2 12 (Filled Red)

    // 赤いぷよペアを(3,12)に配置（着地すると横に4つ並ぶ）
    let pair = PuyoPair.create 3 12 Red Red 0

    let model =
        { model with
            Board = board
            CurrentPiece = Some pair
            Status = Playing }

    // Act
    let (newModel, _) = Update.update Tick model

    // Assert
    // 4つ並んだ赤いぷよが消えている
    Board.getCell newModel.Board 0 12 |> should equal Empty
    Board.getCell newModel.Board 1 12 |> should equal Empty
    Board.getCell newModel.Board 2 12 |> should equal Empty
    Board.getCell newModel.Board 3 12 |> should equal Empty
