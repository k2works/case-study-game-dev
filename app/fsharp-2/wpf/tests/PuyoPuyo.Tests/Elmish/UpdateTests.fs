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
    | None -> failwith "Tickメッセージ: ぷよが存在するはずです"

[<Fact>]
let ``着地したぷよはボードに固定され新しいぷよが生成される`` () =
    // Arrange
    let model = Model.init ()
    let pair = PuyoPair.create 3 11 Red Green 0 // 軸ぷよが最下端

    let model =
        { model with
            CurrentPiece = Some pair
            Status = Playing }

    // Act
    let (newModel, _) = Update.update Tick model

    // Assert
    // 着地したぷよがボードに固定されている
    Board.getCell newModel.Board 3 11 |> should equal (Filled Red)
    Board.getCell newModel.Board 3 10 |> should equal (Filled Green)

    // 新しいぷよが生成されている
    match newModel.CurrentPiece with
    | Some newPair ->
        newPair.X |> should equal 2
        newPair.Y |> should equal 1
    | None -> failwith "着地したぷよ: 新しいぷよが生成されるはずです"

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
    | None -> failwith "ゲーム中でない場合: ぷよが存在するはずです"

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
    | None -> failwith "MoveDownメッセージ: ぷよが存在するはずです"

[<Fact>]
let ``MoveDownで下端に到達した場合は着地する`` () =
    // Arrange
    let model = Model.init ()
    let pair = PuyoPair.create 3 11 Red Green 0 // 最下端

    let model =
        { model with
            CurrentPiece = Some pair
            Status = Playing }

    // Act
    let (newModel, _) = Update.update MoveDown model

    // Assert
    // 着地してボードに固定
    Board.getCell newModel.Board 3 11 |> should equal (Filled Red)
    Board.getCell newModel.Board 3 10 |> should equal (Filled Green)

    // 新しいぷよが生成
    match newModel.CurrentPiece with
    | Some _ -> ()
    | None -> failwith "MoveDown着地: 新しいぷよが生成されるはずです"

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
        |> Board.setCell 0 11 (Filled Red)
        |> Board.setCell 1 11 (Filled Red)
        |> Board.setCell 2 11 (Filled Red)

    // 赤いぷよペアを(3,11)に配置（着地すると横に4つ並ぶ）
    let pair = PuyoPair.create 3 11 Red Red 0

    let model =
        { model with
            Board = board
            CurrentPiece = Some pair
            Status = Playing }

    // Act
    let (newModel, _) = Update.update Tick model

    // Assert
    // 4つ並んだ赤いぷよが消えている
    Board.getCell newModel.Board 0 11 |> should equal Empty
    Board.getCell newModel.Board 1 11 |> should equal Empty
    Board.getCell newModel.Board 2 11 |> should equal Empty
    Board.getCell newModel.Board 3 11 |> should equal Empty

[<Fact>]
let ``着地時に宙に浮いたぷよに重力が適用される`` () =
    // Arrange
    let model = Model.init ()

    // ボードに浮いた赤ぷよと、その下に土台となる緑ぷよを配置
    let board =
        model.Board
        |> Board.setCell 3 10 (Filled Red) // 浮いているぷよ
        |> Board.setCell 3 11 (Filled Green) // 土台

    // 青いぷよペアを別の列の最下端に配置（消去が発生しない）
    let pair = PuyoPair.create 1 11 Blue Blue 0

    let model =
        { model with
            Board = board
            CurrentPiece = Some pair
            Status = Playing }

    // Act
    let (newModel, _) = Update.update Tick model

    // Assert
    // 浮いていた赤ぷよが土台の上に落下している
    Board.getCell newModel.Board 3 10 |> should equal (Filled Red) // 土台の上に落下
    Board.getCell newModel.Board 3 11 |> should equal (Filled Green) // 土台はそのまま

    // 着地した青ぷよも固定されている
    Board.getCell newModel.Board 1 11 |> should equal (Filled Blue)
    Board.getCell newModel.Board 1 10 |> should equal (Filled Blue)

[<Fact>]
let ``消去が発生しない着地でも重力が適用される`` () =
    // Arrange
    let model = Model.init ()

    // ボードに浮いた黄色ぷよを複数配置
    let board =
        model.Board
        |> Board.setCell 0 8 (Filled Yellow) // 浮いているぷよ
        |> Board.setCell 2 9 (Filled Yellow) // 浮いているぷよ
        |> Board.setCell 4 10 (Filled Yellow) // 浮いているぷよ

    // 赤いぷよペアを最下端に配置（消去が発生しない）
    let pair = PuyoPair.create 1 11 Red Red 0

    let model =
        { model with
            Board = board
            CurrentPiece = Some pair
            Status = Playing }

    // Act
    let (newModel, _) = Update.update Tick model

    // Assert
    // すべての浮いていたぷよが底まで落下している
    Board.getCell newModel.Board 0 8 |> should equal Empty
    Board.getCell newModel.Board 0 11 |> should equal (Filled Yellow)

    Board.getCell newModel.Board 2 9 |> should equal Empty
    Board.getCell newModel.Board 2 11 |> should equal (Filled Yellow)

    Board.getCell newModel.Board 4 10 |> should equal Empty
    Board.getCell newModel.Board 4 11 |> should equal (Filled Yellow)

[<Fact>]
let ``新しいぷよを配置できない場合はゲームオーバーになる`` () =
    // Arrange
    let model = Model.init ()

    // ボードの上部（新しいぷよが配置される位置(2,1)とその周辺）に異なる色のぷよを配置
    // 落下しないように最下段から積み上げる
    let board =
        model.Board
        // 土台（最下段）
        |> Board.setCell 1 11 (Filled Blue)
        |> Board.setCell 2 11 (Filled Blue)
        |> Board.setCell 3 11 (Filled Blue)
        // 新しいぷよの配置位置をブロック
        |> Board.setCell 2 0 (Filled Red) // 回転状態0の2つ目のぷよ位置
        |> Board.setCell 2 1 (Filled Blue) // 軸ぷよ位置
        |> Board.setCell 2 2 (Filled Green) // 回転状態2の2つ目のぷよ位置
        |> Board.setCell 2 3 (Filled Yellow)
        |> Board.setCell 2 4 (Filled Red)
        |> Board.setCell 2 5 (Filled Green)
        |> Board.setCell 2 6 (Filled Yellow)
        |> Board.setCell 2 7 (Filled Red)
        |> Board.setCell 2 8 (Filled Green)
        |> Board.setCell 2 9 (Filled Yellow)
        |> Board.setCell 2 10 (Filled Red)
        |> Board.setCell 2 11 (Filled Green)
        |> Board.setCell 1 1 (Filled Yellow) // 回転状態3の2つ目のぷよ位置
        |> Board.setCell 1 2 (Filled Red)
        |> Board.setCell 1 3 (Filled Green)
        |> Board.setCell 1 4 (Filled Yellow)
        |> Board.setCell 1 5 (Filled Red)
        |> Board.setCell 1 6 (Filled Green)
        |> Board.setCell 1 7 (Filled Yellow)
        |> Board.setCell 1 8 (Filled Red)
        |> Board.setCell 1 9 (Filled Green)
        |> Board.setCell 1 10 (Filled Yellow)
        |> Board.setCell 1 11 (Filled Red)
        |> Board.setCell 3 1 (Filled Red) // 回転状態1の2つ目のぷよ位置
        |> Board.setCell 3 2 (Filled Green)
        |> Board.setCell 3 3 (Filled Yellow)
        |> Board.setCell 3 4 (Filled Red)
        |> Board.setCell 3 5 (Filled Green)
        |> Board.setCell 3 6 (Filled Yellow)
        |> Board.setCell 3 7 (Filled Red)
        |> Board.setCell 3 8 (Filled Green)
        |> Board.setCell 3 9 (Filled Yellow)
        |> Board.setCell 3 10 (Filled Red)
        |> Board.setCell 3 11 (Filled Green)

    // 現在のぷよを最下端に配置（着地後に新しいぷよが生成される）
    let pair = PuyoPair.create 0 11 Blue Blue 0

    let model =
        { model with
            Board = board
            CurrentPiece = Some pair
            Status = Playing }

    // Act
    let (newModel, _) = Update.update Tick model

    // Assert
    // ゲームオーバーになっている
    newModel.Status |> should equal GameOver
    // CurrentPiece は None
    newModel.CurrentPiece |> should equal None

[<Fact>]
let ``ゲームオーバー時はTickメッセージを受け付けない`` () =
    // Arrange
    let model = Model.init ()

    let model =
        { model with
            CurrentPiece = None
            Status = GameOver }

    // Act
    let (newModel, _) = Update.update Tick model

    // Assert
    // 状態が変わらない
    newModel.Status |> should equal GameOver
    newModel.CurrentPiece |> should equal None
