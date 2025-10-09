namespace PuyoPuyo

open System
open System.Windows
open System.Windows.Controls
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

        // メインパネルを作成
        let mainPanel = StackPanel(Orientation = Orientation.Vertical)

        // タイトル
        let title =
            TextBlock(
                Text = "ぷよぷよゲーム",
                FontSize = 24.0,
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = Thickness(10.0)
            )

        mainPanel.Children.Add(title) |> ignore

        // ボードパネル（後で更新）
        let boardContainer =
            Border(
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center,
                Margin = Thickness(10.0)
            )

        mainPanel.Children.Add(boardContainer) |> ignore

        // ゲーム開始ボタン
        let startButton =
            Button(Content = "ゲーム開始", Width = 120.0, Height = 40.0, FontSize = 16.0, Margin = Thickness(10.0))

        startButton.Click.Add(fun _ ->
            let (newModel, _) = Update.update StartGame currentModel
            currentModel <- newModel
            boardContainer.Child <- GameView.createBoardPanel currentModel)

        mainPanel.Children.Add(startButton) |> ignore

        // 初期ボード表示
        boardContainer.Child <- GameView.createBoardPanel currentModel

        // Windowをコードで作成
        let window =
            Window(Title = "PuyoPuyo", Width = 400.0, Height = 600.0, Content = mainPanel)

        Elmish.Program.mkProgram (fun () -> Model.init (), Cmd.none) Update.update bindings
        |> Program.withConsoleTrace
        |> Program.runWindowWithConfig
            { ElmConfig.Default with
                LogConsole = true
                Measure = true }
            window
        |> ignore

        0
