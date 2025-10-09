namespace PuyoPuyo

open System
open System.Windows
open System.Windows.Controls
open System.Windows.Input
open System.Windows.Threading
open Elmish
open Elmish.WPF
open PuyoPuyo.Game
open PuyoPuyo.Components

/// <summary>
/// Program module
/// </summary>
module Program =

    /// <summary>
    /// Bindings for Elmish.WPF
    /// </summary>
    let bindings _ _ : Binding<Model, Message> list =
        [ "StartGame" |> Binding.cmd (fun _ -> StartGame)
          "CanStartGame" |> Binding.oneWay (fun m -> m.Status = NotStarted) ]

    /// <summary>
    /// Main entry point
    /// </summary>
    [<EntryPoint; STAThread>]
    let main argv =
        let mutable currentModel = Model.init ()
        let mutable boardContainerRef: Border option = None

        // ゲームタイマー（1秒ごとに Tick メッセージを dispatch）
        let gameTimer = new DispatcherTimer()
        gameTimer.Interval <- TimeSpan.FromSeconds(1.0)

        // モデル更新とUI反映のヘルパー関数
        let updateModelAndUI (message: Message) =
            let (newModel, _) = Update.update message currentModel
            currentModel <- newModel

            match boardContainerRef with
            | Some container -> container.Child <- GameView.createBoardPanel currentModel
            | None -> ()

            // ゲーム状態に応じてタイマーを制御
            if currentModel.Status = Playing then
                if not gameTimer.IsEnabled then
                    gameTimer.Start()
            else if gameTimer.IsEnabled then
                gameTimer.Stop()

        // タイマーイベントハンドラ
        gameTimer.Tick.Add(fun _ -> updateModelAndUI Tick)

        // ゲーム開始時の処理
        let onStartGame () = updateModelAndUI StartGame

        // キーボードイベントハンドラ
        let handleKeyDown (e: KeyEventArgs) =
            match e.Key with
            | Key.Left -> updateModelAndUI MoveLeft
            | Key.Right -> updateModelAndUI MoveRight
            | Key.Up -> updateModelAndUI Rotate
            | _ -> ()

        // メインパネルとボードコンテナを作成
        let (mainPanel, boardContainer) =
            GameView.createMainPanel (ref currentModel) onStartGame

        boardContainerRef <- Some boardContainer

        // Windowをコードで作成
        let window =
            Window(Title = "PuyoPuyo", Width = 400.0, Height = 600.0, Content = mainPanel)

        // キーボードイベントを設定
        window.KeyDown.Add(handleKeyDown)

        Elmish.Program.mkProgram (fun () -> Model.init (), Cmd.none) Update.update bindings
        |> Program.withConsoleTrace
        |> Program.runWindowWithConfig
            { ElmConfig.Default with
                LogConsole = true
                Measure = true }
            window
        |> ignore

        0
