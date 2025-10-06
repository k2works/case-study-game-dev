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

/// ぷよの消去判定を行う
let checkErase (stage: StageState) : Types.EraseInfo =
    // チェック済みフラグ
    let visited = Array.init stage.Rows (fun _ -> Array.create stage.Cols false)

    let mutable erasePositions: (int * int * Types.PuyoColor) list = []

    // 接続しているぷよを探索する（深さ優先探索）
    let rec searchConnected (x: int) (y: int) (color: Types.PuyoColor) (connected: (int * int) list) : (int * int) list =
        // すでにチェック済みまたは範囲外
        if x < 0 || x >= stage.Cols || y < 0 || y >= stage.Rows || visited.[y].[x] then
            connected
        else
            let cellColor = stage.Cells.[y].[x]

            // 同じ色でない、または空
            if cellColor <> color || cellColor = Types.PuyoColor.Empty then
                connected
            else
                // チェック済みにする
                visited.[y].[x] <- true

                // 現在の位置を追加
                let newConnected = (x, y) :: connected

                // 4方向を探索（右、左、下、上）
                newConnected
                |> searchConnected (x + 1) y color
                |> searchConnected (x - 1) y color
                |> searchConnected x (y + 1) color
                |> searchConnected x (y - 1) color

    // 全マスをチェック
    for y in 0 .. stage.Rows - 1 do
        for x in 0 .. stage.Cols - 1 do
            let color = stage.Cells.[y].[x]

            // ぷよがあり、まだチェックしていない場合
            if color <> Types.PuyoColor.Empty && not visited.[y].[x] then
                // 接続しているぷよを探索
                let connected = searchConnected x y color []

                // 4つ以上つながっている場合は消去対象
                if connected.Length >= 4 then
                    let positions =
                        connected
                        |> List.map (fun (px, py) -> (px, py, color))
                    erasePositions <- erasePositions @ positions

    { ErasePuyoCount = erasePositions.Length
      ErasePositions = erasePositions }

/// ぷよを消去する
let eraseBlocks (positions: (int * int * Types.PuyoColor) list) (stage: StageState) : StageState =
    let newCells =
        stage.Cells
        |> Array.mapi (fun y row ->
            row |> Array.mapi (fun x cell ->
                // この位置が消去対象に含まれているかチェック
                let shouldErase =
                    positions
                    |> List.exists (fun (ex, ey, _) -> ex = x && ey = y)

                if shouldErase then Types.PuyoColor.Empty else cell))

    { stage with Cells = newCells }
