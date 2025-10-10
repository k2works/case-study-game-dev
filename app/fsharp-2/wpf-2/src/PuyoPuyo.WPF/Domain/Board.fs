module Domain.Board

open Domain.Puyo

// ボード定義
type Board = PuyoColor[,]

// 初期ボードを生成
let createBoard () : Board = Array2D.create 6 12 Empty

// セルの色を取得
let getCellColor x y (board: Board) = board.[x, y]

// セルに色を設定（イミュータブルに新しいボードを返す）
let setCellColor x y color (board: Board) =
    let newBoard = Array2D.copy board
    newBoard.[x, y] <- color
    newBoard

// 隣接するセルの座標を取得
let private getNeighbors (x: int) (y: int) : (int * int) list =
    [
        (x - 1, y)  // 左
        (x + 1, y)  // 右
        (x, y - 1)  // 上
        (x, y + 1)  // 下
    ]

// ボードの範囲内かチェック
let private isInBounds (board: Board) (x: int) (y: int) : bool =
    x >= 0 && x < Array2D.length1 board && y >= 0 && y < Array2D.length2 board

// 指定位置から同じ色のつながったぷよを探索（BFS）
let private findConnectedPuyos (board: Board) (startX: int) (startY: int) (color: PuyoColor) (visited: Set<int * int>) : (int * int) list =
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
                        not (Set.contains (nx, ny) newVisited) &&
                        isInBounds board nx ny &&
                        getCellColor nx ny board = color)
                bfs (rest @ neighbors) newVisited ((x, y) :: result)

    bfs [(startX, startY)] visited []

// 4つ以上つながっているぷよのグループを検出
let findConnectedGroups (board: Board) : ((int * int) list) list =
    let mutable visited = Set.empty
    let mutable groups = []

    for y in 0 .. (Array2D.length2 board - 1) do
        for x in 0 .. (Array2D.length1 board - 1) do
            if not (Set.contains (x, y) visited) then
                let color = getCellColor x y board
                if color <> Empty then
                    let group = findConnectedPuyos board x y color visited
                    if List.length group >= 4 then
                        groups <- group :: groups
                    visited <- visited + Set.ofList group

    groups

// 指定した位置のぷよを消去
let clearPuyos (positions: (int * int) list) (board: Board) : Board =
    let newBoard = Array2D.copy board
    positions |> List.iter (fun (x, y) -> newBoard.[x, y] <- Empty)
    newBoard

// 重力を適用してぷよを落下させる
let applyGravity (board: Board) : Board =
    let newBoard = Array2D.copy board
    let width = Array2D.length1 board
    let height = Array2D.length2 board

    // 各列ごとに処理
    for x in 0 .. width - 1 do
        // 下から上に向かって詰める
        let mutable writeY = height - 1
        for y in (height - 1) .. -1 .. 0 do
            let color = newBoard.[x, y]
            if color <> Empty then
                if y <> writeY then
                    newBoard.[x, writeY] <- color
                    newBoard.[x, y] <- Empty
                writeY <- writeY - 1

    newBoard
