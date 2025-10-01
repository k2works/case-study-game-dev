module Update.Messages exposing (Msg(..))

import Time
import Types exposing (PuyoPair)


type Msg
    = -- ゲーム制御
      StartGame
    | ResetGame
    | GameStep Time.Posix
      -- ユーザー操作
    | MoveLeft
    | MoveRight
    | MoveDown
    | Rotate
    | HardDrop
      -- 内部イベント
    | NewPuyoPairGenerated PuyoPair
    | NextPuyoPairGenerated PuyoPair
