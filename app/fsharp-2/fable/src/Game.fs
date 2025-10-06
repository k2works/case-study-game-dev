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
    IsGameOver: bool
}

/// ゲームを初期化する
let init () : GameState =
    {
        Stage = Stage.create()
        Score = 0
        CurrentPuyo = Some (Player.createNewPuyoPair())
        IsGameOver = false
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

            // 消去があれば消去実行と重力適用を繰り返し、スコアを計算
            let rec processErase (currentStage: Stage.StageState) (chain: int) (accScore: int) : Stage.StageState * int =
                let info = Stage.checkErase currentStage
                if info.ErasePuyoCount > 0 then
                    let erasedStage = Stage.eraseBlocks info.ErasePositions currentStage
                    let fallenStage = Stage.applyGravity erasedStage

                    // 連鎖カウントを増加
                    let newChain = chain + 1

                    // スコアを計算
                    let chainScore = Score.calculateScore info.ErasePuyoCount newChain
                    let newScore = accScore + chainScore

                    processErase fallenStage newChain newScore
                else
                    (currentStage, accScore)

            let (finalStage, earnedScore) = processErase stageAfterGravity 0 0

            // 全消し判定
            let bonusScore =
                if Stage.checkZenkeshi finalStage then
                    Score.zenkeshiBonus
                else
                    0

            // ゲームオーバー判定
            if Player.checkGameOver finalStage then
                { state with
                    Stage = finalStage
                    Score = state.Score + earnedScore + bonusScore
                    CurrentPuyo = None
                    IsGameOver = true }
            else
                { state with
                    Stage = finalStage
                    Score = state.Score + earnedScore + bonusScore
                    CurrentPuyo = Some (Player.createNewPuyoPair())
                    IsGameOver = false }
    | None -> state
