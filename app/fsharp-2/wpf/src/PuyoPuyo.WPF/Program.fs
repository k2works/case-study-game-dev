namespace PuyoPuyo

open System
open System.Windows
open System.Windows.Controls
open Elmish
open Elmish.WPF

/// <summary>
/// Program module
/// </summary>
module Program =

    type Model = { Message: string }
    type Message = unit

    /// <summary>
    /// Bindings for Elmish.WPF
    /// </summary>
    let bindings () : Binding<Model, Message> list =
        [ "Message" |> Binding.oneWay (fun m -> m.Message) ]

    /// <summary>
    /// Main entry point
    /// </summary>
    [<EntryPoint; STAThread>]
    let main argv =
        // TextBlockをコードで作成
        let textBlock =
            TextBlock(
                FontSize = 24.0,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center
            )

        textBlock.SetBinding(TextBlock.TextProperty, "Message") |> ignore

        // Windowをコードで作成
        let window = Window(Title = "PuyoPuyo", Width = 800.0, Height = 600.0, Content = textBlock)

        let init () = { Message = "ぷよぷよゲーム" }
        let update msg model = model

        Program.mkSimpleWpf init update bindings
        |> Program.withConsoleTrace
        |> Program.runWindowWithConfig
            { ElmConfig.Default with
                LogConsole = true
                Measure = true }
            window
        |> ignore

        0
