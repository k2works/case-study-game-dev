module Program

open Elmish
open Elmish.WPF
open Elmish.Model
open Elmish.Update
open Elmish.Subscription
open Components.GameView

let main window =
    let config = ElmConfig.Default

    Program.mkProgram (fun () -> init (), Cmd.none) (fun msg model -> update msg model, Cmd.none) (fun _ _ ->
        bindings ())
    |> Program.withSubscription timerSubscription
    |> Program.withConsoleTrace
    |> Program.startElmishLoop config window
