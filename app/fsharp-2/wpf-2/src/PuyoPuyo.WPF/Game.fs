module Game

open Elmish.WPF
open System

// ぷよの色定義
type PuyoColor =
    | Empty
    | Red
    | Blue
    | Green
    | Yellow

// 位置
type Position = { X: int; Y: int }

// ぷよペア
type PuyoPair =
    { Axis: PuyoColor
      Child: PuyoColor
      AxisPosition: Position
      ChildPosition: Position
      Rotation: int }

// ゲーム状態
type GameState =
    | Playing
    | Paused
    | GameOver

// ゲームモデル
type Model =
    { Board: PuyoColor[,]
      Score: int
      GameState: GameState
      CurrentPair: PuyoPair option }

// メッセージ定義
type Message =
    | StartGame
    | Tick

// ランダムなぷよ色を生成
let randomPuyoColor (random: Random) =
    match random.Next(4) with
    | 0 -> Red
    | 1 -> Blue
    | 2 -> Green
    | _ -> Yellow

// ぷよペアを生成
let generatePuyoPair (random: Random) =
    { Axis = randomPuyoColor random
      Child = randomPuyoColor random
      AxisPosition = { X = 2; Y = 0 }
      ChildPosition = { X = 2; Y = -1 }
      Rotation = 0 }

// 初期化関数
let init () =
    { Board = Array2D.create 6 12 Empty
      Score = 0
      GameState = Playing
      CurrentPair = None }

// ランダム生成器を受け取る更新関数（テスト用）
let updateWithRandom (random: Random) msg model =
    match msg with
    | StartGame -> { model with CurrentPair = Some(generatePuyoPair random) }
    | Tick -> model

// 更新関数（Elmish用）
let update msg model =
    let random = Random()
    updateWithRandom random msg model

// タイマーサブスクリプション（ゲームループ）
let timerSubscription (dispatch: Message -> unit) =
    let timer = new System.Timers.Timer(500.0) // 500ms間隔
    timer.Elapsed.Add(fun _ -> dispatch Tick)
    timer.Start()

// Elmish バインディング
let bindings () =
    [ "Score" |> Binding.oneWay (fun m -> m.Score)
      "StartGame" |> Binding.cmd (fun _ -> StartGame) ]
