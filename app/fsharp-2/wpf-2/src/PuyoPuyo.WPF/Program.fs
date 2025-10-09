module Program

open Elmish
open Elmish.WPF

let main window =
    let config = ElmConfig.Default

    Program.mkProgram
        (fun () -> Counter.init (), Cmd.none)
        (fun msg model -> Counter.update msg model, Cmd.none)
        (fun _ _ -> Counter.bindings ())
    |> Program.withConsoleTrace
    |> Program.startElmishLoop config window
