namespace PuyoPuyo.Game

open PuyoPuyo.Domain

/// ゲームの状態
type GameStatus =
    | NotStarted
    | Playing
    | GameOver

/// ゲームのModel
type Model =
    { Board: Board
      CurrentPiece: PuyoPair option
      NextPiece: PuyoPair option
      Score: int
      Level: int
      GameTime: int
      LastChainCount: int
      Status: GameStatus }

module Model =
    /// 初期状態
    let init () : Model =
        { Board = Board.create 6 13
          CurrentPiece = None
          NextPiece = None
          Score = 0
          Level = 1
          GameTime = 0
          LastChainCount = 0
          Status = NotStarted }
