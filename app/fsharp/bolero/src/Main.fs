module PuyoPuyo.Main

open Bolero
open Bolero.Html
open Elmish

type Model = { message: string }

let initModel = { message = "Puyo Puyo Game Initialized!" }

type Message = unit

let update message model = model, Cmd.none

let view model dispatch =
    div {
        h1 { text "Puyo Puyo Game" }
        p { text model.message }
        canvas {
            attr.id "game-canvas"
            attr.width "400"
            attr.height "600"
        }
    }

type MyApp() =
    inherit ProgramComponent<Model, Message>()

    override this.Program =
        Program.mkProgram (fun _ -> initModel, Cmd.none) update view