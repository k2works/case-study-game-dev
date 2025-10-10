module Game

open Elmish.WPF

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

// メッセージ定義
type Message =
    | StartGame
    | Tick

// 初期化関数
let init () =
    { Board = Array2D.create 6 12 Empty
      Score = 0
      GameState = Playing }

// 更新関数
let update msg model =
    match msg with
    | StartGame -> model
    | Tick -> model

// Elmish バインディング
let bindings () =
    [ "Score" |> Binding.oneWay (fun m -> m.Score)
      "StartGame" |> Binding.cmd (fun _ -> StartGame) ]
