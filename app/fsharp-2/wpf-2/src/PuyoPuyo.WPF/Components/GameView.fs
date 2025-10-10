module Components.GameView

open Elmish.WPF
open Domain.Board
open Domain.Puyo
open Domain.PuyoPair
open Elmish.Model

// ぷよ表示用ViewModel
type PuyoViewModel = { X: float; Y: float; Color: string }

let getAllPuyos (model: Model) =
    let cellSize = 40.0
    // ボード上のぷよを収集
    let boardPuyos =
        [ for x in 0..5 do
              for y in 0..11 do
                  let color = getCellColor x y model.Board

                  if color <> Empty then
                      yield
                          { X = float x * cellSize
                            Y = float y * cellSize
                            Color = puyoColorToString color } ]
    // 現在のぷよペアを追加
    let pairPuyos =
        match model.CurrentPair with
        | None -> []
        | Some pair ->
            [ { X = float pair.AxisPosition.X * cellSize
                Y = float pair.AxisPosition.Y * cellSize
                Color = puyoColorToString pair.Axis }
              { X = float pair.ChildPosition.X * cellSize
                Y = float pair.ChildPosition.Y * cellSize
                Color = puyoColorToString pair.Child } ]

    List.append boardPuyos pairPuyos

// Elmish バインディング
let bindings () =
    [ "Score" |> Binding.oneWay (fun m -> m.Score)
      "Chain" |> Binding.oneWay (fun _ -> 0) // 連鎖数（将来実装予定）
      "Puyos" |> Binding.oneWay (fun m -> getAllPuyos m)
      "StartGame" |> Binding.cmd (fun _ -> StartGame) ]
