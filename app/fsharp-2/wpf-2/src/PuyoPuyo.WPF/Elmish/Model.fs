module Elmish.Model

open Domain.Board
open Domain.GameLogic
open Domain.PuyoPair
open Domain.Score

// ゲームモデル
type Model =
    { Board: Board
      Score: Score
      Chain: int
      GameState: GameState
      CurrentPair: PuyoPair option }

// メッセージ定義
type Message =
    | StartGame
    | Tick
    | MoveLeft
    | MoveRight
    | MoveDown
    | Rotate
    | RestartGame

// 初期化関数
let init () =
    { Board = createBoard ()
      Score = initialScore
      Chain = 0
      GameState = NotStarted
      CurrentPair = None }
