module Counter

open Elmish.WPF

type Model =
    { Count: int
      StepSize: int }

type Msg =
    | Increment
    | Decrement
    | SetStepSize of int

let init () =
    { Count = 0
      StepSize = 1 }

let update msg m =
    match msg with
    | Increment -> { m with Count = m.Count + m.StepSize }
    | Decrement -> { m with Count = m.Count - m.StepSize }
    | SetStepSize x -> { m with StepSize = x }

let bindings () =
    [
        "CounterValue" |> Binding.oneWay (fun m -> m.Count)
        "Increment" |> Binding.cmd (fun m -> Increment)
        "Decrement" |> Binding.cmd (fun m -> Decrement)
        "StepSize" |> Binding.twoWay(
            (fun m -> float m.StepSize),
            (fun newVal m -> int newVal |> SetStepSize))
    ]
