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
type Model = {
    Board: Board
    CurrentPiece: PuyoPair option
    NextPiece: PuyoPair option
    Score: int
    Level: int
    GameTime: int
    LastChainCount: int
    Status: GameStatus
}

/// ゲームのメッセージ
type Msg =
    | StartGame
    | ResetGame
    | MoveLeft
    | MoveRight
    | MoveDown
    | Rotate
    | HardDrop
    | GameStep
    | TimeStep
    | SpawnNewPiece
    | FixPiece
    | ProcessChain
    | CheckGameOver

module App =
    type CmdMsg = | NoOp

    let mapCmd cmdMsg =
        match cmdMsg with
        | NoOp -> Cmd.none

    /// PuyoColor を MAUI Color に変換
    let private toColor (puyoColor: PuyoColor) =
        match puyoColor with
        | PuyoColor.Red -> Colors.Red
        | PuyoColor.Green -> Colors.Green
        | PuyoColor.Blue -> Colors.Blue
        | PuyoColor.Yellow -> Colors.Yellow

    /// 初期状態
    let private initModel () : Model =
        {
            Board = Board.create 6 13
            CurrentPiece = None
            NextPiece = None
            Score = 0
            Level = 1
            GameTime = 0
            LastChainCount = 0
            Status = NotStarted
        }

    /// Init 関数
    let init () =
        initModel (), []

    /// Update 関数
    let update (msg: Msg) (model: Model) =
        match msg with
        | StartGame ->
            let firstPiece = PuyoPair.createRandom 2 1 0
            let nextPiece = PuyoPair.createRandom 2 1 0

            {
                model with
                    Board = Board.create 6 13
                    CurrentPiece = Some firstPiece
                    NextPiece = Some nextPiece
                    Score = 0
                    GameTime = 0
                    Status = Playing
            }, []

        | ResetGame ->
            initModel (), []

        | _ ->
            model, []

    /// セルを描画
    let private viewCell (cell: Cell) =
        let color =
            match cell with
            | Cell.Empty -> Colors.LightGray
            | Cell.Filled puyoColor -> toColor puyoColor

        Ellipse()
            .fill(color)
            .size(28., 28.)
            .margin(2.)

    /// ボードを描画
    let private viewBoard (board: Board) (currentPiece: PuyoPair option) =
        // ボードのコピーを作成
        let displayBoard =
            Array.init board.Rows (fun y ->
                Array.init board.Cols (fun x ->
                    Board.getCell board x y))

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
                        Label($"Score: {model.Score}")
                            .font(size = 24.)
                            .centerTextHorizontal()

                        Label($"Level: {model.Level}")
                            .font(size = 18.)
                            .centerTextHorizontal()

                        viewBoard model.Board model.CurrentPiece

                        match model.Status with
                        | NotStarted ->
                            Button("Start Game", StartGame)
                                .centerHorizontal()
                        | Playing ->
                            (HStack(spacing = 10.) {
                                Button("Left", MoveLeft)
                                Button("Right", MoveRight)
                                Button("Rotate", Rotate)
                                Button("Drop", HardDrop)
                            })
                                .centerHorizontal()

                            Button("Reset", ResetGame)
                                .centerHorizontal()
                        | GameOver ->
                            Label("Game Over!")
                                .font(size = 32.)
                                .centerTextHorizontal()

                            Button("New Game", ResetGame)
                                .centerHorizontal()
                    })
                        .padding(20.)
                        .centerVertical()
                ))
            ).title("ぷよぷよ")
        )

    let program = Program.statefulWithCmdMsg init update view mapCmd
