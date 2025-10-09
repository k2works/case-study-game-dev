namespace PuyoPuyo.Game

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

        | _ ->
            model, Cmd.none
