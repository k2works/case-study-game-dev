module Program

open System.Windows
open Elmish
open Elmish.WPF

let main (window: Window) =
    let bindings (model: Counter.Model) (dispatch: Counter.Msg -> unit) =
        [
            "CounterValue" |> Binding.oneWay (fun (m: Counter.Model) -> m.Count)
            "Increment" |> Binding.cmd (fun _ -> Counter.Increment)
            "Decrement" |> Binding.cmd (fun _ -> Counter.Decrement)
            "StepSize" |> Binding.twoWay(
                (fun (m: Counter.Model) -> float m.StepSize),
                (fun newVal _ -> int newVal |> Counter.SetStepSize))
        ]

    Elmish.Program.mkProgram
        (fun () -> Counter.init (), Cmd.none)
        (fun msg model -> Counter.update msg model, Cmd.none)
        bindings
    |> Program.withConsoleTrace
    |> Program.startElmishLoop
        { ElmConfig.Default with LogConsole = true }
        window
