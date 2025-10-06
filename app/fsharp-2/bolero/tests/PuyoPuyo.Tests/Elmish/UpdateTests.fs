namespace PuyoPuyo.Tests.Elmish

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Elmish
open PuyoPuyo.Domain

module UpdateTests =

    [<Fact>]
    let ``MoveLeftメッセージでぷよが左に移動する`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 3 1 Red Green 0
        let model = { model with CurrentPiece = Some pair; Status = Playing }

        // Act
        let (newModel, _) = Update.update MoveLeft model

        // Assert
        match newModel.CurrentPiece with
        | Some newPair ->
            newPair.X |> should equal 2
        | None ->
            failwith "ぷよが存在するはずです"

    [<Fact>]
    let ``MoveRightメッセージでぷよが右に移動する`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 2 1 Red Green 0
        let model = { model with CurrentPiece = Some pair; Status = Playing }

        // Act
        let (newModel, _) = Update.update MoveRight model

        // Assert
        match newModel.CurrentPiece with
        | Some newPair ->
            newPair.X |> should equal 3
        | None ->
            failwith "ぷよが存在するはずです"

    [<Fact>]
    let ``左端では左に移動できない`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 0 1 Red Green 0
        let model = { model with CurrentPiece = Some pair; Status = Playing }

        // Act
        let (newModel, _) = Update.update MoveLeft model

        // Assert
        match newModel.CurrentPiece with
        | Some newPair ->
            newPair.X |> should equal 0  // 位置が変わらない
        | None ->
            failwith "ぷよが存在するはずです"

    [<Fact>]
    let ``ゲーム中でない場合は移動できない`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 2 1 Red Green 0
        let model = { model with CurrentPiece = Some pair; Status = NotStarted }

        // Act
        let (newModel, _) = Update.update MoveLeft model

        // Assert
        match newModel.CurrentPiece with
        | Some newPair ->
            newPair.X |> should equal 2  // 位置が変わらない
        | None ->
            failwith "ぷよが存在するはずです"

    [<Fact>]
    let ``Rotateメッセージでぷよが回転する`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 3 5 Red Green 0
        let model = { model with CurrentPiece = Some pair; Status = Playing }

        // Act
        let (newModel, _) = Update.update Rotate model

        // Assert
        match newModel.CurrentPiece with
        | Some newPair ->
            newPair.Rotation |> should equal 1
        | None ->
            failwith "ぷよが存在するはずです"

    [<Fact>]
    let ``回転時に壁キックが発生する`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 5 5 Red Green 0  // 右端
        let model = { model with CurrentPiece = Some pair; Status = Playing }

        // Act
        let (newModel, _) = Update.update Rotate model

        // Assert
        match newModel.CurrentPiece with
        | Some newPair ->
            newPair.Rotation |> should equal 1
            newPair.X |> should equal 4  // 左にキック
        | None ->
            failwith "ぷよが存在するはずです"

    [<Fact>]
    let ``回転できない場合は状態が変わらない`` () =
        // Arrange
        let model = Model.init ()
        let board = Board.setCell model.Board 4 5 (Filled Blue)
        let pair = PuyoPair.create 5 5 Red Green 0
        let model = { model with Board = board; CurrentPiece = Some pair; Status = Playing }

        // Act
        let (newModel, _) = Update.update Rotate model

        // Assert
        match newModel.CurrentPiece with
        | Some newPair ->
            newPair.Rotation |> should equal 0  // 回転していない
            newPair.X |> should equal 5  // 位置も変わらない
        | None ->
            failwith "ぷよが存在するはずです"

    [<Fact>]
    let ``Tickメッセージでぷよが下に移動する`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 3 5 Red Green 0
        let model = { model with CurrentPiece = Some pair; Status = Playing }

        // Act
        let (newModel, _) = Update.update Tick model

        // Assert
        match newModel.CurrentPiece with
        | Some newPair ->
            newPair.Y |> should equal 6
        | None ->
            failwith "ぷよが存在するはずです"

    [<Fact>]
    let ``着地したぷよはボードに固定され新しいぷよが生成される`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 3 12 Red Green 0  // 下端（y=12）
        let model = { model with CurrentPiece = Some pair; Status = Playing }

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
        | None ->
            failwith "新しいぷよが生成されるはずです"

    [<Fact>]
    let ``ゲーム中でない場合は落下しない`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 3 5 Red Green 0
        let model = { model with CurrentPiece = Some pair; Status = NotStarted }

        // Act
        let (newModel, _) = Update.update Tick model

        // Assert
        match newModel.CurrentPiece with
        | Some newPair ->
            newPair.Y |> should equal 5  // 位置が変わらない
        | None ->
            failwith "ぷよが存在するはずです"
