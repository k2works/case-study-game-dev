// src/Stage.fs
module PuyoPuyo.Stage

open PuyoPuyo.Types

/// ステージの状態
type StageState = {
    Cells: PuyoColor array array
    Rows: int
    Cols: int
}

/// ステージを作成する
let create () : StageState =
    let rows = 12
    let cols = 6
    let cells = Array.init rows (fun _ -> Array.create cols PuyoColor.Empty)
    {
        Cells = cells
        Rows = rows
        Cols = cols
    }
