namespace PuyoPuyo.Elmish

open Elmish
open PuyoPuyo.Domain

/// ゲームのメッセージ
type Message =
    | StartGame
    | ResetGame
    | MoveLeft
    | MoveRight
    | MoveDown
    | Rotate
    | HardDrop
    | GameStep
    | TimeStep
    | SpawnNewPiece
    | FixPiece
    | ProcessChain
    | CheckGameOver

module Update =
    /// Update 関数
    let update (message: Message) (model: Model) : Model * Cmd<Message> =
        match message with
        | StartGame ->
            let firstPiece = PuyoPair.createRandom 2 1 0
            let nextPiece = PuyoPair.createRandom 2 1 0

            {
                model with
                    Board = Board.create 6 13
                    CurrentPiece = Some firstPiece
                    NextPiece = Some nextPiece
                    Score = 0
                    GameTime = 0
                    Status = Playing
            }, Cmd.none

        | ResetGame ->
            Model.init (), Cmd.none

        | MoveLeft when model.Status = Playing ->
            match model.CurrentPiece with
            | Some piece ->
                match GameLogic.tryMovePuyoPair model.Board piece Left with
                | Some movedPiece ->
                    { model with CurrentPiece = Some movedPiece }, Cmd.none
                | None ->
                    model, Cmd.none
            | None ->
                model, Cmd.none

        | MoveRight when model.Status = Playing ->
            match model.CurrentPiece with
            | Some piece ->
                match GameLogic.tryMovePuyoPair model.Board piece Right with
                | Some movedPiece ->
                    { model with CurrentPiece = Some movedPiece }, Cmd.none
                | None ->
                    model, Cmd.none
            | None ->
                model, Cmd.none

        | Rotate when model.Status = Playing ->
            match model.CurrentPiece with
            | Some piece ->
                match GameLogic.tryRotatePuyoPair model.Board piece with
                | Some rotatedPiece ->
                    { model with CurrentPiece = Some rotatedPiece }, Cmd.none
                | None ->
                    model, Cmd.none
            | None ->
                model, Cmd.none

        | _ ->
            model, Cmd.none
