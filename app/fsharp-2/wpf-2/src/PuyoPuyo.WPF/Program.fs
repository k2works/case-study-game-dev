module Program

open Elmish.WPF

let main window =
    Program.mkSimpleWpf Counter.init Counter.update Counter.bindings
    |> Program.runWindow window
