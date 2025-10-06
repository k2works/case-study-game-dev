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

/// ステージにぷよを設定する
let setPuyo (x: int) (y: int) (color: PuyoColor) (stage: StageState) : StageState =
    let newCells = Array.init stage.Rows (fun row ->
        if row = y then
            Array.init stage.Cols (fun col ->
                if col = x then color else stage.Cells.[row].[col]
            )
        else
            Array.copy stage.Cells.[row]
    )
    { stage with Cells = newCells }

/// 重力を適用する（すべてのぷよを下に落とす）
let applyGravity (stage: StageState) : StageState =
    let rec applyGravityOnce (currentStage: StageState) : StageState * bool =
        let mutable moved = false
        let newCells = Array.init stage.Rows (fun row -> Array.copy currentStage.Cells.[row])

        // 下から2番目の行から上へ走査
        for row = (stage.Rows - 2) downto 0 do
            for col = 0 to stage.Cols - 1 do
                let currentColor = currentStage.Cells.[row].[col]
                let belowColor = currentStage.Cells.[row + 1].[col]

                // 現在のセルにぷよがあり、下のセルが空の場合
                if currentColor <> PuyoColor.Empty && belowColor = PuyoColor.Empty then
                    // ぷよを下に移動
                    newCells.[row + 1].[col] <- currentColor
                    newCells.[row].[col] <- PuyoColor.Empty
                    moved <- true

        ({ currentStage with Cells = newCells }, moved)

    // すべてのぷよが安定するまで繰り返す
    let rec applyUntilStable (currentStage: StageState) : StageState =
        let (newStage, moved) = applyGravityOnce currentStage
        if moved then
            applyUntilStable newStage
        else
            newStage

    applyUntilStable stage
