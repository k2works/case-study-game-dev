module bolero.Client.Main

open Elmish
open Bolero
open PuyoPuyo.Elmish
open PuyoPuyo.Components

type MyApp() =
    inherit ProgramComponent<Model, Message>()

    override this.Program =
        Program.mkProgram (fun _ -> Model.init (), Cmd.none) Update.update GameView.view
        |> Program.withSubscription (fun model -> Subscription.gameTimer model)
