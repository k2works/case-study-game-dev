namespace PuyoPuyo.App

open Fabulous
open Fabulous.Maui
open Microsoft.Maui.Graphics
open PuyoPuyo.Core.Domain

open type Fabulous.Maui.View

/// ゲームの状態
type GameStatus =
    | NotStarted
    | Playing
    | GameOver

/// ゲームのModel
type Model =
    { Board: Board
      CurrentPiece: PuyoPair option
      NextPiece: PuyoPair option
      Score: int
      Level: int
      GameTime: int
      LastChainCount: int
      Status: GameStatus
      IsFastFalling: bool }

/// ゲームのメッセージ
type Msg =
    | StartGame
    | ResetGame
    | MoveLeft
    | MoveRight
    | MoveDown
    | StartFastFall
    | StopFastFall
    | Rotate
    | HardDrop
    | GameStep
    | TimeStep
    | SpawnNewPiece
    | FixPiece
    | ProcessChain
    | CheckGameOver

module App =
    type CmdMsg =
        | NoOp
        | DispatchMsg of Msg
        | StartTimer
        | ScheduleNextTick of int

    let mapCmd cmdMsg =
        match cmdMsg with
        | NoOp -> Cmd.none
        | DispatchMsg msg -> Cmd.ofMsg msg
        | StartTimer ->
            let timerSub dispatch =
                let timerInterval = 500.0 // 500ms ごとに落下

                async {
                    while true do
                        do! Async.Sleep(int timerInterval)
                        dispatch TimeStep
                }
                |> Async.Start

            Cmd.ofSub timerSub
        | ScheduleNextTick interval ->
            let timerSub dispatch =
                async {
                    do! Async.Sleep interval
                    dispatch TimeStep
                }
                |> Async.Start

            Cmd.ofSub timerSub

    /// PuyoColor を MAUI Color に変換
    let private toColor (puyoColor: PuyoColor) =
        match puyoColor with
        | PuyoColor.Red -> Colors.Red
        | PuyoColor.Green -> Colors.Green
        | PuyoColor.Blue -> Colors.Blue
        | PuyoColor.Yellow -> Colors.Yellow

    /// 初期状態
    let private initModel () : Model =
        { Board = Board.create 6 13
          CurrentPiece = None
          NextPiece = None
          Score = 0
          Level = 1
          GameTime = 0
          LastChainCount = 0
          Status = NotStarted
          IsFastFalling = false }

    /// Init 関数
    let init () = initModel (), []

    /// ゲーム開始処理
    let private handleStartGame (model: Model) =
        let firstPiece = PuyoPair.createRandom 2 1 0
        let nextPiece = PuyoPair.createRandom 2 1 0

        { model with
            Board = Board.create 6 13
            CurrentPiece = Some firstPiece
            NextPiece = Some nextPiece
            Score = 0
            GameTime = 0
            Status = Playing
            IsFastFalling = false },
        [ StartTimer ]

    /// リセット処理
    let private handleResetGame () = initModel (), []

    /// 左移動処理
    let private handleMoveLeft (model: Model) =
        match model.CurrentPiece with
        | Some piece ->
            match GameLogic.tryMovePuyoPair model.Board piece Direction.Left with
            | Some movedPiece ->
                { model with
                    CurrentPiece = Some movedPiece },
                []
            | None -> model, []
        | None -> model, []

    /// 右移動処理
    let private handleMoveRight (model: Model) =
        match model.CurrentPiece with
        | Some piece ->
            match GameLogic.tryMovePuyoPair model.Board piece Direction.Right with
            | Some movedPiece ->
                { model with
                    CurrentPiece = Some movedPiece },
                []
            | None -> model, []
        | None -> model, []

    /// 回転処理
    let private handleRotate (model: Model) =
        match model.CurrentPiece with
        | Some piece ->
            match GameLogic.tryRotatePuyoPair model.Board piece with
            | Some rotatedPiece ->
                { model with
                    CurrentPiece = Some rotatedPiece },
                []
            | None -> model, []
        | None -> model, []

    /// 下移動処理
    let private handleMoveDown (model: Model) =
        match model.CurrentPiece with
        | Some piece ->
            match GameLogic.tryMovePuyoPair model.Board piece Direction.Down with
            | Some movedPiece ->
                { model with
                    CurrentPiece = Some movedPiece
                    IsFastFalling = true },
                []
            | None -> { model with IsFastFalling = false }, [ DispatchMsg FixPiece ]
        | None -> model, []

    /// ぷよ固定処理
    let private handleFixPiece (model: Model) =
        match model.CurrentPiece with
        | Some piece ->
            let boardWithPuyo = Board.fixPuyoPair model.Board piece

            // 消去処理
            let groups = Board.findConnectedGroups boardWithPuyo

            let boardAfterClear =
                if List.isEmpty groups then
                    Board.applyGravity boardWithPuyo
                else
                    let positions = groups |> List.concat

                    boardWithPuyo |> Board.clearPuyos positions |> Board.applyGravity

            { model with
                Board = boardAfterClear
                CurrentPiece = None },
            [ DispatchMsg SpawnNewPiece ]
        | None -> model, []

    /// 新規ぷよ生成処理
    let private handleSpawnNewPiece (model: Model) =
        let newPiece =
            match model.NextPiece with
            | Some next -> next
            | None -> PuyoPair.createRandom 2 1 0

        let nextPiece = PuyoPair.createRandom 2 1 0

        { model with
            CurrentPiece = Some newPiece
            NextPiece = Some nextPiece
            IsFastFalling = false },
        []

    /// タイマーステップ処理
    let private handleTimeStep (model: Model) =
        let interval = if model.IsFastFalling then 50 else 500

        match model.CurrentPiece with
        | Some piece ->
            match GameLogic.tryMovePuyoPair model.Board piece Direction.Down with
            | Some movedPiece ->
                { model with
                    CurrentPiece = Some movedPiece },
                [ ScheduleNextTick interval ]
            | None -> model, [ DispatchMsg FixPiece; ScheduleNextTick interval ]
        | None -> model, [ ScheduleNextTick interval ]

    /// 高速落下開始処理
    let private handleStartFastFall (model: Model) = { model with IsFastFalling = true }, []

    /// 高速落下停止処理
    let private handleStopFastFall (model: Model) =
        { model with IsFastFalling = false }, []

    /// Update 関数
    let update (msg: Msg) (model: Model) =
        match msg with
        | StartGame -> handleStartGame model
        | ResetGame -> handleResetGame ()
        | MoveLeft when model.Status = Playing -> handleMoveLeft model
        | MoveRight when model.Status = Playing -> handleMoveRight model
        | Rotate when model.Status = Playing -> handleRotate model
        | MoveDown when model.Status = Playing -> handleMoveDown model
        | FixPiece when model.Status = Playing -> handleFixPiece model
        | SpawnNewPiece when model.Status = Playing -> handleSpawnNewPiece model
        | TimeStep when model.Status = Playing -> handleTimeStep model
        | StartFastFall when model.Status = Playing -> handleStartFastFall model
        | StopFastFall when model.Status = Playing -> handleStopFastFall model
        | _ -> model, []

    /// セルを描画
    let private viewCell (cell: Cell) =
        let color =
            match cell with
            | Cell.Empty -> Colors.LightGray
            | Cell.Filled puyoColor -> toColor puyoColor

        Ellipse().fill(color).size(28., 28.).margin (2.)

    /// ボードを描画
    let private viewBoard (board: Board) (currentPiece: PuyoPair option) =
        // ボードのコピーを作成
        let displayBoard =
            Array.init board.Rows (fun y -> Array.init board.Cols (fun x -> Board.getCell board x y))

        // 現在のぷよを重ねて表示
        match currentPiece with
        | Some piece ->
            let (pos1, pos2) = PuyoPair.getPositions piece
            let (x1, y1) = pos1
            let (x2, y2) = pos2

            if y1 >= 0 && y1 < board.Rows && x1 >= 0 && x1 < board.Cols then
                displayBoard.[y1].[x1] <- Cell.Filled piece.Puyo1Color

            if y2 >= 0 && y2 < board.Rows && x2 >= 0 && x2 < board.Cols then
                displayBoard.[y2].[x2] <- Cell.Filled piece.Puyo2Color
        | None -> ()

        // ボードを描画
        VStack(spacing = 0.) {
            for y in 0 .. board.Rows - 1 do
                HStack(spacing = 0.) {
                    for x in 0 .. board.Cols - 1 do
                        viewCell displayBoard.[y].[x]
                }
        }

    /// View 関数
    let view model =
        Application(
            ContentPage(
                (ScrollView(
                    (VStack(spacing = 20.) {
                        Label($"Score: {model.Score}").font(size = 24.).centerTextHorizontal ()

                        Label($"Level: {model.Level}").font(size = 18.).centerTextHorizontal ()

                        viewBoard model.Board model.CurrentPiece

                        match model.Status with
                        | NotStarted -> Button("Start Game", StartGame).centerHorizontal ()
                        | Playing ->
                            (HStack(spacing = 10.) {
                                Button("Left", MoveLeft)
                                Button("Down", MoveDown)
                                Button("Right", MoveRight)
                                Button("Rotate", Rotate)
                                Button("Drop", HardDrop)
                            })
                                .centerHorizontal ()

                            Button("Reset", ResetGame).centerHorizontal ()
                        | GameOver ->
                            Label("Game Over!").font(size = 32.).centerTextHorizontal ()

                            Button("New Game", ResetGame).centerHorizontal ()
                    })
                        .padding(20.)
                        .centerVertical ()
                ))
            )
                .title ("ぷよぷよ")
        )

    let program = Program.statefulWithCmdMsg init update view mapCmd
