namespace PuyoPuyo.Domain

/// セルの状態
type Cell =
    | Empty
    | Filled of PuyoColor

/// ゲームボード
type Board =
    { Cols: int
      Rows: int
      Cells: Cell[][] }

module Board =
    /// 空のボードを作成
    let create (cols: int) (rows: int) : Board =
        { Cols = cols
          Rows = rows
          Cells = Array.init rows (fun _ -> Array.create cols Empty) }

    /// セルの取得
    let getCell (board: Board) (x: int) (y: int) : Cell =
        if y >= 0 && y < board.Rows && x >= 0 && x < board.Cols then
            board.Cells.[y].[x]
        else
            Empty

    /// セルの設定（イミュータブル）
    let setCell (x: int) (y: int) (cell: Cell) (board: Board) : Board =
        if y >= 0 && y < board.Rows && x >= 0 && x < board.Cols then
            let newCells =
                board.Cells
                |> Array.mapi (fun rowIndex row ->
                    if rowIndex = y then
                        row |> Array.mapi (fun colIndex c -> if colIndex = x then cell else c)
                    else
                        row)

            { board with Cells = newCells }
        else
            board

    /// ぷよペアをボードに固定
    let fixPuyoPair (board: Board) (pair: PuyoPair) : Board =
        let (pos1, pos2) = PuyoPair.getPositions pair
        let (x1, y1) = pos1
        let (x2, y2) = pos2

        board
        |> setCell x1 y1 (Filled pair.Puyo1Color)
        |> setCell x2 y2 (Filled pair.Puyo2Color)

    /// 隣接するセルの座標を取得
    let private getNeighbors (x: int) (y: int) : (int * int) list =
        [ (x - 1, y) // 左
          (x + 1, y) // 右
          (x, y - 1) // 上
          (x, y + 1) ] // 下

    /// 指定位置から同じ色のつながったぷよを探索（BFS）
    let private findConnectedPuyos
        (board: Board)
        (startX: int)
        (startY: int)
        (color: PuyoColor)
        (visited: Set<int * int>)
        : (int * int) list =
        let rec bfs (queue: (int * int) list) (visited: Set<int * int>) (result: (int * int) list) =
            match queue with
            | [] -> result
            | (x, y) :: rest ->
                if Set.contains (x, y) visited then
                    bfs rest visited result
                else
                    let newVisited = Set.add (x, y) visited

                    let neighbors =
                        getNeighbors x y
                        |> List.filter (fun (nx, ny) ->
                            not (Set.contains (nx, ny) newVisited)
                            && match getCell board nx ny with
                               | Filled c when c = color -> true
                               | _ -> false)

                    bfs (rest @ neighbors) newVisited ((x, y) :: result)

        bfs [ (startX, startY) ] visited []

    /// 4つ以上つながっているぷよのグループを検出
    let findConnectedGroups (board: Board) : ((int * int) list) list =
        let mutable visited = Set.empty
        let mutable groups = []

        for y in 0 .. board.Rows - 1 do
            for x in 0 .. board.Cols - 1 do
                if not (Set.contains (x, y) visited) then
                    match getCell board x y with
                    | Filled color ->
                        let group = findConnectedPuyos board x y color visited

                        if List.length group >= 4 then
                            groups <- group :: groups

                        visited <- visited + Set.ofList group
                    | Empty -> ()

        groups

    /// 指定位置のぷよを消去
    let clearPuyos (positions: (int * int) list) (board: Board) : Board =
        positions |> List.fold (fun b (x, y) -> setCell x y Empty b) board

    /// 重力を適用（浮いているぷよを落とす）
    let applyGravity (board: Board) : Board =
        let mutable newCells =
            Array.init board.Rows (fun _ -> Array.create board.Cols Empty)

        // 各列ごとに処理
        for x in 0 .. board.Cols - 1 do
            let column =
                [| for y in 0 .. board.Rows - 1 -> board.Cells.[y].[x] |]
                |> Array.filter (fun cell -> cell <> Empty)

            // 下から詰める
            let startY = board.Rows - column.Length

            for i in 0 .. column.Length - 1 do
                newCells.[startY + i].[x] <- column.[i]

        { board with Cells = newCells }

    /// 消去と重力を繰り返し適用（連鎖処理）
    let rec clearAndApplyGravityRepeatedly (board: Board) : Board =
        let groups = findConnectedGroups board

        if List.isEmpty groups then
            // 消去対象がない場合は終了
            board
        else
            // 消去して重力を適用
            let positions = groups |> List.concat
            let clearedBoard = clearPuyos positions board
            let boardAfterGravity = applyGravity clearedBoard

            // 再帰的に消去判定を繰り返す
            clearAndApplyGravityRepeatedly boardAfterGravity

    /// 全消し判定（盤面上にぷよがあるかチェック）
    let checkZenkeshi (board: Board) : bool =
        board.Cells
        |> Array.forall (fun row -> row |> Array.forall (fun cell -> cell = Empty))
