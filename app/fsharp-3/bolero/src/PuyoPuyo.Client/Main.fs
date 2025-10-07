module PuyoPuyo.Client.Main

open Elmish
open Bolero
open Bolero.Html

type Model = { message: string }

type Message =
    | SetMessage of string

module Model =
    let init () =
        { message = "Hello, Bolero!" }

module Update =
    let update (msg: Message) (model: Model) =
        match msg with
        | SetMessage text ->
            { model with message = text }, Cmd.none

module View =
    let view (model: Model) (dispatch: Message -> unit) =
        div {
            h1 { "ぷよぷよゲーム" }
            p { model.message }
            button {
                on.click (fun _ -> dispatch (SetMessage "ボタンがクリックされました！"))
                "クリック"
            }
        }

type MyApp() =
    inherit ProgramComponent<Model, Message>()

    override this.Program =
        Program.mkProgram (fun _ -> Model.init (), Cmd.none) Update.update View.view
