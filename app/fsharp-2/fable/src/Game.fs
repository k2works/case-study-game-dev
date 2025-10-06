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
        let movedPair = Player.movePairLeft pair state.Stage.Cols
        { state with CurrentPuyo = Some movedPair }
    | None -> state

/// ぷよペアを右に移動する
let movePuyoRight (state: GameState) : GameState =
    match state.CurrentPuyo with
    | Some pair ->
        let movedPair = Player.movePairRight pair state.Stage.Cols
        { state with CurrentPuyo = Some movedPair }
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
            // 下に移動できない場合はステージに固定
            let stageWithPuyo = Player.fixToStage pair state.Stage

            // 重力を適用
            let stageAfterGravity = Stage.applyGravity stageWithPuyo

            // 消去判定
            let eraseInfo = Stage.checkErase stageAfterGravity

            // 消去があれば消去実行と重力適用を繰り返す
            let rec processErase (currentStage: Stage.StageState) : Stage.StageState =
                let info = Stage.checkErase currentStage
                if info.ErasePuyoCount > 0 then
                    let erasedStage = Stage.eraseBlocks info.ErasePositions currentStage
                    let fallenStage = Stage.applyGravity erasedStage
                    processErase fallenStage
                else
                    currentStage

            let finalStage = processErase stageAfterGravity

            { state with
                Stage = finalStage
                CurrentPuyo = Some (Player.createNewPuyoPair()) }
    | None -> state
