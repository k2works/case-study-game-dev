module Elmish.Model

open Domain.Board
open Domain.GameLogic
open Domain.PuyoPair
open Domain.Score

// ゲームモデル
type Model =
    { Board: Board
      Score: Score
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

// 初期化関数
let init () =
    { Board = createBoard ()
      Score = initialScore
      GameState = NotStarted
      CurrentPair = None }
