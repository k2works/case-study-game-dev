// src/Game.fs
module PuyoPuyo.Game

open PuyoPuyo.Types
open PuyoPuyo.Stage
open PuyoPuyo.Player

/// ゲームの状態
type GameState = {
    Stage: StageState
    Score: int
    CurrentPuyo: Puyo option
}

/// ゲームを初期化する
let init () : GameState =
    {
        Stage = Stage.create()
        Score = 0
        CurrentPuyo = Some (Player.createNewPuyo())
    }
