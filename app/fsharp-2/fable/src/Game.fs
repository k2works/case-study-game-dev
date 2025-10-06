// src/Game.fs
module PuyoPuyo.Game

open PuyoPuyo.Types
open PuyoPuyo.Stage
open PuyoPuyo.Player

/// ゲームの状態
type GameState = {
    Stage: StageState
    Score: int
    CurrentPuyo: PuyoPair option
}

/// ゲームを初期化する
let init () : GameState =
    {
        Stage = Stage.create()
        Score = 0
        CurrentPuyo = Some (Player.createNewPuyoPair())
    }

/// ぷよペアを左に移動する
let movePuyoLeft (state: GameState) : GameState =
    match state.CurrentPuyo with
    | Some pair ->
        let movedAxis = Player.moveLeft pair.Axis state.Stage.Cols
        let dx = movedAxis.Position.X - pair.Axis.Position.X
        let movedChild = { pair.Child with Position = { pair.Child.Position with X = pair.Child.Position.X + dx } }
        { state with CurrentPuyo = Some { Axis = movedAxis; Child = movedChild } }
    | None -> state

/// ぷよペアを右に移動する
let movePuyoRight (state: GameState) : GameState =
    match state.CurrentPuyo with
    | Some pair ->
        let movedAxis = Player.moveRight pair.Axis state.Stage.Cols
        let dx = movedAxis.Position.X - pair.Axis.Position.X
        let movedChild = { pair.Child with Position = { pair.Child.Position with X = pair.Child.Position.X + dx } }
        { state with CurrentPuyo = Some { Axis = movedAxis; Child = movedChild } }
    | None -> state

/// ぷよペアを回転する
let rotatePuyo (state: GameState) : GameState =
    match state.CurrentPuyo with
    | Some pair ->
        let rotatedPair = Player.rotateRight pair state.Stage.Cols
        { state with CurrentPuyo = Some rotatedPair }
    | None -> state

/// ぷよペアを自動落下させる
let autoFall (state: GameState) : GameState =
    match state.CurrentPuyo with
    | Some pair ->
        if Player.canMoveDown pair state.Stage then
            // 下に移動できる場合は移動
            let movedPair = Player.moveDown pair state.Stage.Rows
            { state with CurrentPuyo = Some movedPair }
        else
            // 下に移動できない場合はステージに固定して重力を適用してから新しいぷよペアを生成
            let stageWithPuyo = Player.fixToStage pair state.Stage
            let stageAfterGravity = Stage.applyGravity stageWithPuyo
            { state with
                Stage = stageAfterGravity
                CurrentPuyo = Some (Player.createNewPuyoPair()) }
    | None -> state
