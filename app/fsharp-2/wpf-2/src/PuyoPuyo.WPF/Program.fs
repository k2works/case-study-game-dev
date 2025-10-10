module Program

open Elmish
open Elmish.WPF

let main window =
    let config = ElmConfig.Default

    Program.mkProgram
        (fun () -> Game.init (), Cmd.none)
        (fun msg model -> Game.update msg model, Cmd.none)
        (fun _ _ -> Game.bindings ())
    |> Program.withConsoleTrace
    |> Program.startElmishLoop config window
