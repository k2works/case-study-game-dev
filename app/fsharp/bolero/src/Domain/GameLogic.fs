module PuyoGame.Domain.GameLogic

open PuyoGame.Domain
open PuyoGame.Domain.Board
open PuyoGame.Domain.Puyo

/// 組ぷよが指定方向に移動可能かチェック
let canMovePuyoPair (board: Board) (pair: PuyoPair) (direction: Direction) : bool =
    let (pos1, pos2) = getPuyoPairPositions pair

    let offset =
        match direction with
        | Left -> { X = -1; Y = 0 }
        | Right -> { X = 1; Y = 0 }
        | Down -> { X = 0; Y = 1 }
        | Up -> { X = 0; Y = -1 }

    let newPos1 = { X = pos1.X + offset.X; Y = pos1.Y + offset.Y }
    let newPos2 = { X = pos2.X + offset.X; Y = pos2.Y + offset.Y }

    isValidPosition board newPos1 &&
    isValidPosition board newPos2 &&
    not (hasPuyo board newPos1) &&
    not (hasPuyo board newPos2)

/// 組ぷよを左に移動
let movePuyoPairLeft (board: Board) (pair: PuyoPair) : PuyoPair =
    if canMovePuyoPair board pair Left then
        { pair with BasePosition = { pair.BasePosition with X = pair.BasePosition.X - 1 } }
    else
        pair

/// 組ぷよを右に移動
let movePuyoPairRight (board: Board) (pair: PuyoPair) : PuyoPair =
    if canMovePuyoPair board pair Right then
        { pair with BasePosition = { pair.BasePosition with X = pair.BasePosition.X + 1 } }
    else
        pair

/// 組ぷよを下に移動
let movePuyoPairDown (board: Board) (pair: PuyoPair) : PuyoPair =
    if canMovePuyoPair board pair Down then
        { pair with BasePosition = { pair.BasePosition with Y = pair.BasePosition.Y + 1 } }
    else
        pair

/// 組ぷよが下に落下可能かチェック
let canFall (board: Board) (pair: PuyoPair) : bool =
    canMovePuyoPair board pair Down

/// 組ぷよを一気に底まで落下（ハードドロップ）
let hardDrop (board: Board) (pair: PuyoPair) : PuyoPair =
    let rec dropLoop currentPair =
        if canFall board currentPair then
            dropLoop (movePuyoPairDown board currentPair)
        else
            currentPair

    dropLoop pair

/// 組ぷよをボードに固定
let fixPuyoPairToBoard (board: Board) (pair: PuyoPair) : Board =
    let (pos1, pos2) = getPuyoPairPositions pair

    let board1 = setCell board pos1 (Filled pair.Puyo1Color)
    let board2 = setCell board1 pos2 (Filled pair.Puyo2Color)
    board2

/// 浮いているぷよを重力で落下させる
let dropFloatingPuyos (board: Board) : Board =
    let rec dropLoop currentBoard =
        let mutable changed = false
        let mutable newBoard = currentBoard

        // 下から 2 番目の行から上に向かって処理
        for y in (height board - 2) .. -1 .. 0 do
            for x in 0 .. (width board - 1) do
                match tryGetCell newBoard { X = x; Y = y } with
                | Some (Filled color) ->
                    // 下のセルが空なら落下
                    match tryGetCell newBoard { X = x; Y = y + 1 } with
                    | Some Empty ->
                        newBoard <- setCell newBoard { X = x; Y = y } Empty
                        newBoard <- setCell newBoard { X = x; Y = y + 1 } (Filled color)
                        changed <- true
                    | _ -> ()
                | _ -> ()

        if changed then
            dropLoop newBoard
        else
            currentBoard

    dropLoop board

/// 指定位置から隣接する同色ぷよを検索（幅優先探索）
let findAdjacentPuyos (board: Board) (startPos: Position) : Position list =
    match tryGetCell board startPos with
    | Some Empty | None -> []
    | Some (Filled targetColor) ->
        let rec bfs (visited: Set<Position>) (queue: Position list) (result: Position list) =
            match queue with
            | [] -> result
            | currentPos :: remainingQueue ->
                if Set.contains currentPos visited then
                    bfs visited remainingQueue result
                else
                    let newVisited = Set.add currentPos visited
                    let newResult = currentPos :: result

                    // 4 方向の隣接セルをチェック
                    let neighbors =
                        [
                            { X = currentPos.X - 1; Y = currentPos.Y }
                            { X = currentPos.X + 1; Y = currentPos.Y }
                            { X = currentPos.X; Y = currentPos.Y - 1 }
                            { X = currentPos.X; Y = currentPos.Y + 1 }
                        ]
                        |> List.filter (fun pos ->
                            isValidPosition board pos &&
                            not (Set.contains pos newVisited) &&
                            match tryGetCell board pos with
                            | Some (Filled color) -> color = targetColor
                            | _ -> false
                        )

                    let newQueue = remainingQueue @ neighbors
                    bfs newVisited newQueue newResult

        bfs Set.empty [startPos] []

/// 消去すべきぷよグループを検索（4 つ以上の連結成分）
let findGroupsToClear (board: Board) : Position list list =
    let allPositions =
        [
            for y in 0 .. (height board - 1) do
                for x in 0 .. (width board - 1) do
                    let pos = { X = x; Y = y }
                    match tryGetCell board pos with
                    | Some (Filled _) -> yield pos
                    | _ -> ()
        ]

    let rec findGroups (visited: Set<Position>) (positions: Position list) (groups: Position list list) =
        match positions with
        | [] -> groups
        | pos :: rest ->
            if Set.contains pos visited then
                findGroups visited rest groups
            else
                let group = findAdjacentPuyos board pos
                let newVisited = Set.union visited (Set.ofList group)

                if List.length group >= 4 then
                    findGroups newVisited rest (group :: groups)
                else
                    findGroups newVisited rest groups

    findGroups Set.empty allPositions []

/// 指定されたぷよグループをボードから消去
let clearPuyoGroups (board: Board) (groups: Position list list) : Board =
    groups
    |> List.concat
    |> List.fold (fun acc pos -> setCell acc pos Empty) board

/// 連鎖ボーナス計算
let calculateChainBonus (chainCount: int) : int =
    match chainCount with
    | 1 -> 0
    | 2 -> 8
    | 3 -> 16
    | 4 -> 32
    | 5 -> 64
    | 6 -> 96
    | 7 -> 128
    | n when n >= 8 -> n * 32
    | _ -> 0

/// 基本消去スコア計算
let calculateClearScore (clearedCount: int) (chainBonus: int) : int =
    let baseScore = clearedCount * 10
    baseScore + chainBonus

/// 全消しボーナス計算
let calculatePerfectClearBonus () : int =
    1000

/// 連鎖結果
type ChainResult = {
    Board: Board
    ChainCount: int
    TotalScore: int
}

/// 連鎖処理を実行
let executeChain (board: Board) : ChainResult =
    let rec chainLoop currentBoard chainCount totalScore =
        let groups = findGroupsToClear currentBoard

        if List.isEmpty groups then
            let finalScore =
                if isPerfectClear currentBoard then
                    totalScore + calculatePerfectClearBonus ()
                else
                    totalScore

            {
                Board = currentBoard
                ChainCount = chainCount
                TotalScore = finalScore
            }
        else
            let clearedBoard = clearPuyoGroups currentBoard groups
            let droppedBoard = dropFloatingPuyos clearedBoard

            let clearedCount = groups |> List.sumBy List.length
            let chainBonus = calculateChainBonus (chainCount + 1)
            let clearScore = calculateClearScore clearedCount chainBonus

            chainLoop droppedBoard (chainCount + 1) (totalScore + clearScore)

    chainLoop board 0 0