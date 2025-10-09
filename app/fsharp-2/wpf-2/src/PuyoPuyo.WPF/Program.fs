module Program

open Elmish
open Elmish.WPF

let main window =
    Program.mkProgram
        (fun () -> Counter.init (), Cmd.none)
        (fun msg model -> Counter.update msg model, Cmd.none)
        (fun _ _ -> Counter.bindings ())
    |> Program.withConsoleTrace
    |> Program.runWindowWithConfig
        { ElmConfig.Default with LogConsole = true }
        window
