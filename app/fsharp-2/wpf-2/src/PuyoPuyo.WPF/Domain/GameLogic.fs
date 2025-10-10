module Domain.GameLogic

open Domain.Board
open Domain.Puyo
open Domain.PuyoPair
open Domain.Score

// ゲーム状態
type GameState =
    | NotStarted
    | Playing
    | Paused
    | GameOver
