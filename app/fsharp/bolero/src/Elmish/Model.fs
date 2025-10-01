module PuyoGame.Elmish.Model

open PuyoGame.Domain
open PuyoGame.Domain.Board
open Elmish

/// ゲームの状態
type GameStatus =
    | NotStarted
    | Playing
    | GameOver

/// Elmish Model
type Model = {
    Board: Board
    CurrentPiece: PuyoPair option
    NextPiece: PuyoPair option
    Score: int
    Level: int
    ChainCount: int
    GameTime: int
    GameStatus: GameStatus
}

/// Message
type Message =
    | StartGame
    | MoveLeft
    | MoveRight
    | MoveDown
    | Rotate
    | HardDrop
    | GameTick
    | NoOp

/// 初期モデル
let init () : Model * Cmd<Message> =
    {
        Board = createEmpty
        CurrentPiece = None
        NextPiece = None
        Score = 0
        Level = 1
        ChainCount = 0
        GameTime = 0
        GameStatus = NotStarted
    }, Cmd.none