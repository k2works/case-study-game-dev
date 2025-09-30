module Puyo.Game

open Puyo
open Puyo.BoardModule
open Puyo.PuyoManagement
open Puyo.GameLogic
open Puyo.Rendering
open Browser.Types
open Browser.Dom

/// ゲーム状態
type GameState = {
    Board: Board
    CurrentPiece: PuyoPair option
    NextPiece: PuyoPair option
    Score: int
    Level: int
    ChainCount: int
    GameTime: int
    GameRunning: bool
}

let mutable gameState = {
    Board = createEmptyBoard
    CurrentPiece = None
    NextPiece = None
    Score = 0
    Level = 1
    ChainCount = 0
    GameTime = 0
    GameRunning = false
}

/// ゲーム状態をリセット
let resetGameState () : unit =
    gameState <- {
        Board = createEmptyBoard
        CurrentPiece = None
        NextPiece = None
        Score = 0
        Level = 1
        ChainCount = 0
        GameTime = 0
        GameRunning = false
    }

/// 新しいゲームを開始
let startNewGame (ctx: CanvasRenderingContext2D) : unit =
    resetGameState ()

    let firstPiece = spawnNewPuyoPair ()
    let nextPiece = spawnNewPuyoPair ()

    gameState <- {
        gameState with
            Board = createEmptyBoard
            CurrentPiece = Some firstPiece
            NextPiece = Some nextPiece
            GameRunning = true
    }

    renderBoard ctx gameState.Board
    renderPuyoPair ctx firstPiece
    renderNextPuyo "next-canvas" (Some nextPiece)

    updateScoreDisplay 0
    updateLevelDisplay 1
    updateChainDisplay 0
    updateTimeDisplay 0

/// ゲームオーバー判定（上部 2 行にぷよがある場合）
let isGameOver (board: Board) : bool =
    [0; 1]
    |> List.exists (fun y ->
        [0 .. (board.Width - 1)]
        |> List.exists (fun x ->
            match getCellAt board { X = x; Y = y } with
            | Some (Filled _) -> true
            | _ -> false
        )
    )

/// ゲームオーバー処理
let processGameOver () : unit =
    gameState <- { gameState with GameRunning = false }
    window.alert (sprintf "Game Over! Score: %d" gameState.Score)

/// ゲームオーバーチェックと処理
let checkAndHandleGameOver () : bool =
    if isGameOver gameState.Board then
        processGameOver ()
        true
    else
        false

/// キー入力処理
let handleKeyInput (ctx: CanvasRenderingContext2D) (keyCode: string) : unit =
    if gameState.GameRunning then
        match gameState.CurrentPiece with
        | None -> ()
        | Some currentPiece ->
            match keyCode with
            | "ArrowLeft" ->
                let movedPiece = movePuyoPairLeft gameState.Board currentPiece
                gameState <- { gameState with CurrentPiece = Some movedPiece }
                renderBoard ctx gameState.Board
                renderPuyoPair ctx movedPiece

            | "ArrowRight" ->
                let movedPiece = movePuyoPairRight gameState.Board currentPiece
                gameState <- { gameState with CurrentPiece = Some movedPiece }
                renderBoard ctx gameState.Board
                renderPuyoPair ctx movedPiece

            | "ArrowUp" ->
                let rotatedPiece = rotatePuyoPair currentPiece
                // 回転後の位置が有効かチェック
                if canMovePuyoPair gameState.Board rotatedPiece Down ||
                   not (canFall gameState.Board rotatedPiece) then
                    gameState <- { gameState with CurrentPiece = Some rotatedPiece }
                    renderBoard ctx gameState.Board
                    renderPuyoPair ctx rotatedPiece

            | "ArrowDown" ->
                let movedPiece = movePuyoPairDown gameState.Board currentPiece
                gameState <- { gameState with CurrentPiece = Some movedPiece }
                renderBoard ctx gameState.Board
                renderPuyoPair ctx movedPiece

            | " " -> // スペースキー（ハードドロップ）
                let droppedPiece = hardDrop gameState.Board currentPiece
                gameState <- { gameState with CurrentPiece = Some droppedPiece }
                renderBoard ctx gameState.Board
                renderPuyoPair ctx droppedPiece

            | _ -> ()

/// ゲームの 1 ステップ処理
let gameStep (ctx: CanvasRenderingContext2D) : unit =
    if gameState.GameRunning then
        match gameState.CurrentPiece with
        | None ->
            // 現在のピースがない場合、新しいピースを生成
            match gameState.NextPiece with
            | None ->
                let newPiece = spawnNewPuyoPair ()
                let nextPiece = spawnNewPuyoPair ()
                gameState <- {
                    gameState with
                        CurrentPiece = Some newPiece
                        NextPiece = Some nextPiece
                }
                renderNextPuyo "next-canvas" (Some nextPiece)

            | Some nextPiece ->
                let newNextPiece = spawnNewPuyoPair ()
                gameState <- {
                    gameState with
                        CurrentPiece = Some nextPiece
                        NextPiece = Some newNextPiece
                }
                renderNextPuyo "next-canvas" (Some newNextPiece)

        | Some currentPiece ->
            if canFall gameState.Board currentPiece then
                // まだ落下できる場合
                let movedPiece = movePuyoPairDown gameState.Board currentPiece
                gameState <- { gameState with CurrentPiece = Some movedPiece }
            else
                // 落下できない場合 - 固定処理
                let fixedBoard = fixPuyoPairToBoard gameState.Board currentPiece
                gameState <- {
                    gameState with
                        Board = fixedBoard
                        CurrentPiece = None
                }

                // 連鎖処理
                let chainResult = executeChain fixedBoard
                gameState <- {
                    gameState with
                        Board = chainResult.Board
                        Score = gameState.Score + chainResult.TotalScore
                        ChainCount = chainResult.ChainCount
                }

                updateScoreDisplay gameState.Score
                updateChainDisplay chainResult.ChainCount

                // ゲームオーバーチェック
                if not (checkAndHandleGameOver ()) then
                    // 次のピースを生成
                    match gameState.NextPiece with
                    | Some nextPiece ->
                        let newNextPiece = spawnNewPuyoPair ()
                        gameState <- {
                            gameState with
                                CurrentPiece = Some nextPiece
                                NextPiece = Some newNextPiece
                        }
                        renderNextPuyo "next-canvas" (Some newNextPiece)
                    | None -> ()

        // 描画
        renderBoard ctx gameState.Board
        match gameState.CurrentPiece with
        | Some piece -> renderPuyoPair ctx piece
        | None -> ()