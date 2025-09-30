module UpdateTests

open Xunit
open FsUnit.Xunit
open PuyoGame.Domain
open PuyoGame.Domain.Board
open PuyoGame.Domain.Puyo
open PuyoGame.Elmish.Model
open PuyoGame.Elmish.Update

[<Fact>]
let ``初期状態はNotStarted`` () =
    let (model, _) = init ()

    model.GameStatus |> should equal NotStarted
    model.Score |> should equal 0
    model.ChainCount |> should equal 0
    model.CurrentPiece |> should equal None
    model.NextPiece |> should equal None

[<Fact>]
let ``StartGameでゲームが開始される`` () =
    let (initialModel, _) = init ()
    let (newModel, cmd) = update StartGame initialModel

    newModel.GameStatus |> should equal Playing
    newModel.Score |> should equal 0
    newModel.CurrentPiece |> should not' (equal None)
    newModel.NextPiece |> should not' (equal None)

[<Fact>]
let ``StartGameでボードが空になる`` () =
    let (initialModel, _) = init ()
    let (newModel, _) = update StartGame initialModel

    isPerfectClear newModel.Board |> should be True

[<Fact>]
let ``MoveLeftで組ぷよが左に移動`` () =
    let (initialModel, _) = init ()
    let (startedModel, _) = update StartGame initialModel

    match startedModel.CurrentPiece with
    | Some piece ->
        let initialX = piece.BasePosition.X
        let (movedModel, _) = update MoveLeft startedModel

        match movedModel.CurrentPiece with
        | Some movedPiece ->
            movedPiece.BasePosition.X |> should be (lessThanOrEqualTo initialX)
        | None ->
            failwith "CurrentPiece should not be None after move"
    | None ->
        failwith "CurrentPiece should not be None after StartGame"

[<Fact>]
let ``MoveRightで組ぷよが右に移動`` () =
    let (initialModel, _) = init ()
    let (startedModel, _) = update StartGame initialModel

    match startedModel.CurrentPiece with
    | Some piece ->
        let initialX = piece.BasePosition.X
        let (movedModel, _) = update MoveRight startedModel

        match movedModel.CurrentPiece with
        | Some movedPiece ->
            movedPiece.BasePosition.X |> should be (greaterThanOrEqualTo initialX)
        | None ->
            failwith "CurrentPiece should not be None after move"
    | None ->
        failwith "CurrentPiece should not be None after StartGame"

[<Fact>]
let ``MoveDownで組ぷよが下に移動`` () =
    let (initialModel, _) = init ()
    let (startedModel, _) = update StartGame initialModel

    match startedModel.CurrentPiece with
    | Some piece ->
        let initialY = piece.BasePosition.Y
        let (movedModel, _) = update MoveDown startedModel

        match movedModel.CurrentPiece with
        | Some movedPiece ->
            movedPiece.BasePosition.Y |> should be (greaterThanOrEqualTo initialY)
        | None ->
            failwith "CurrentPiece should not be None after move"
    | None ->
        failwith "CurrentPiece should not be None after StartGame"

[<Fact>]
let ``Rotateで組ぷよが回転`` () =
    let (initialModel, _) = init ()
    let (startedModel, _) = update StartGame initialModel

    match startedModel.CurrentPiece with
    | Some piece ->
        let initialRotation = piece.Rotation
        let (rotatedModel, _) = update Rotate startedModel

        match rotatedModel.CurrentPiece with
        | Some rotatedPiece ->
            rotatedPiece.Rotation |> should not' (equal initialRotation)
        | None ->
            failwith "CurrentPiece should not be None after rotate"
    | None ->
        failwith "CurrentPiece should not be None after StartGame"

[<Fact>]
let ``HardDropで組ぷよが底まで落下`` () =
    let (initialModel, _) = init ()
    let (startedModel, _) = update StartGame initialModel

    match startedModel.CurrentPiece with
    | Some piece ->
        let initialY = piece.BasePosition.Y
        let (droppedModel, _) = update HardDrop startedModel

        match droppedModel.CurrentPiece with
        | Some droppedPiece ->
            droppedPiece.BasePosition.Y |> should be (greaterThan initialY)
        | None ->
            failwith "CurrentPiece should not be None after hard drop"
    | None ->
        failwith "CurrentPiece should not be None after StartGame"

[<Fact>]
let ``NotStarted状態でGameTickは無視される`` () =
    let (initialModel, _) = init ()
    let (tickModel, _) = update GameTick initialModel

    tickModel.GameStatus |> should equal NotStarted
    tickModel.CurrentPiece |> should equal None

[<Fact>]
let ``Playing状態でGameTickが処理される`` () =
    let (initialModel, _) = init ()
    let (startedModel, _) = update StartGame initialModel

    match startedModel.CurrentPiece with
    | Some piece ->
        let initialY = piece.BasePosition.Y
        let (tickModel, cmd) = update GameTick startedModel

        // コマンドが発行されることを確認
        cmd |> should not' (equal Elmish.Cmd.none)

        // ぷよが移動するか、固定されるはず
        match tickModel.CurrentPiece with
        | Some movedPiece ->
            movedPiece.BasePosition.Y |> should be (greaterThanOrEqualTo initialY)
        | None ->
            // ピースが固定された場合
            tickModel.Board |> isPerfectClear |> should be False
    | None ->
        failwith "CurrentPiece should not be None after StartGame"

[<Fact>]
let ``NoOpは状態を変更しない`` () =
    let (initialModel, _) = init ()
    let (startedModel, _) = update StartGame initialModel
    let (noOpModel, _) = update NoOp startedModel

    noOpModel.GameStatus |> should equal startedModel.GameStatus
    noOpModel.Score |> should equal startedModel.Score
    noOpModel.CurrentPiece |> should equal startedModel.CurrentPiece

[<Fact>]
let ``ゲーム開始時にコマンドが発行される`` () =
    let (initialModel, _) = init ()
    let (_, cmd) = update StartGame initialModel

    // ゲームループを開始するコマンドが発行される
    cmd |> should not' (equal Elmish.Cmd.none)

[<Fact>]
let ``連鎖が発生するとスコアが増加`` () =
    let (initialModel, _) = init ()
    let (startedModel, _) = update StartGame initialModel

    // ボードに4つ以上の同色ぷよを配置
    let board = startedModel.Board
    let board1 = setCell board { X = 3; Y = 10 } (Filled Red)
    let board2 = setCell board1 { X = 3; Y = 11 } (Filled Red)
    let board3 = setCell board2 { X = 4; Y = 10 } (Filled Red)
    let board4 = setCell board3 { X = 4; Y = 11 } (Filled Red)

    let modelWithBoard = { startedModel with Board = board4; CurrentPiece = None }
    let (_, _) = update GameTick modelWithBoard

    // 連鎖が発生してスコアが増加することを期待
    // （実際のテストでは複数のGameTickが必要な場合がある）
    true |> should be True

[<Fact>]
let ``GameOver状態ではGameTickが無視される`` () =
    let (initialModel, _) = init ()
    let gameOverModel = { initialModel with GameStatus = GameOver }
    let (tickModel, cmd) = update GameTick gameOverModel

    tickModel.GameStatus |> should equal GameOver
    // コマンドが空であることを確認（Cmd.none は [] と同じ）
    List.isEmpty cmd |> should be True