module Game

// ぷよの色定義
type PuyoColor =
    | Empty
    | Red
    | Blue
    | Green
    | Yellow

// ゲーム状態
type GameState =
    | Playing
    | Paused
    | GameOver

// ゲームモデル
type Model =
    { Board: PuyoColor[,]
      Score: int
      GameState: GameState }

// 初期化関数
let init () =
    { Board = Array2D.create 6 12 Empty
      Score = 0
      GameState = Playing }
