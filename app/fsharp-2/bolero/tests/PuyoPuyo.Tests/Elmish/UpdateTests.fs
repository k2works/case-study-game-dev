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
        let board = model.Board |> Board.setCell 4 5 (Filled Blue)
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

    [<Fact>]
    let ``MoveDownメッセージでぷよが下に移動する`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 3 5 Red Green 0
        let model = { model with CurrentPiece = Some pair; Status = Playing }

        // Act
        let (newModel, _) = Update.update MoveDown model

        // Assert
        match newModel.CurrentPiece with
        | Some newPair ->
            newPair.Y |> should equal 6
        | None ->
            failwith "ぷよが存在するはずです"

    [<Fact>]
    let ``下端に到達した場合は着地する`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 3 12 Red Green 0  // 下端
        let model = { model with CurrentPiece = Some pair; Status = Playing }

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
        let model = { model with Status = Playing; IsFastFalling = false }

        // Act
        let (newModel, _) = Update.update StartFastFall model

        // Assert
        newModel.IsFastFalling |> should equal true

    [<Fact>]
    let ``StopFastFallメッセージで高速落下モードが解除される`` () =
        // Arrange
        let model = Model.init ()
        let model = { model with Status = Playing; IsFastFalling = true }

        // Act
        let (newModel, _) = Update.update StopFastFall model

        // Assert
        newModel.IsFastFalling |> should equal false

    [<Fact>]
    let ``ゲーム中でない場合は高速落下モードにならない`` () =
        // Arrange
        let model = Model.init ()
        let model = { model with Status = NotStarted; IsFastFalling = false }

        // Act
        let (newModel, _) = Update.update StartFastFall model

        // Assert
        newModel.IsFastFalling |> should equal false

    [<Fact>]
    let ``着地時に4つ以上つながったぷよが消える`` () =
        // Arrange
        let model = Model.init ()
        // 下に3つ並べておく
        let board =
            model.Board
            |> Board.setCell 0 12 (Filled Red)
            |> Board.setCell 1 12 (Filled Red)
            |> Board.setCell 2 12 (Filled Red)

        // 4つ目のぷよを落とす（1回のTickで着地する位置に配置）
        let pair = PuyoPair.create 3 12 Red Green 0
        let model = { model with Board = board; CurrentPiece = Some pair; Status = Playing }

        // Act
        let (newModel, _) = Update.update Tick model  // 着地

        // Assert
        // 4つつながったので消えている
        Board.getCell newModel.Board 0 12 |> should equal Empty
        Board.getCell newModel.Board 1 12 |> should equal Empty
        Board.getCell newModel.Board 2 12 |> should equal Empty

        // 緑のぷよは重力で落ちて下端に残っている
        Board.getCell newModel.Board 3 12 |> should equal (Filled Green)

    [<Fact>]
    let ``着地時に消去されなくても重力が適用される`` () =
        // Arrange
        let model = Model.init ()
        // 縦向きのぷよペアを配置（下端）
        let board =
            model.Board
            |> Board.setCell 3 12 (Filled Red)   // 軸ぷよ
            |> Board.setCell 3 11 (Filled Green) // 子ぷよ

        // 横向きのぷよペアを重ねる（rotation=3で左向き、軸ぷよが右）
        let pair = PuyoPair.create 3 10 Blue Yellow 3
        let model = { model with Board = board; CurrentPiece = Some pair; Status = Playing }

        // Act
        let (newModel, _) = Update.update Tick model  // 着地

        // Assert
        // 軸ぷよ（Blue）は縦ぷよの上に着地
        Board.getCell newModel.Board 3 10 |> should equal (Filled Blue)

        // 子ぷよ（Yellow）は重力で(2,12)に落ちる
        Board.getCell newModel.Board 2 12 |> should equal (Filled Yellow)

        // (2,10)は空になっている
        Board.getCell newModel.Board 2 10 |> should equal Empty
