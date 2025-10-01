module GameLogic exposing
    ( ChainResult
    , calculateChainBonus
    , calculateClearScore
    , canFall
    , canMovePuyoPair
    , clearPuyoGroups
    , dropFloatingPuyos
    , executeChain
    , findAdjacentPuyos
    , findGroupsToClear
    , fixPuyoPairToBoard
    , hardDrop
    , isGameOver
    , movePuyoPair
    )

import Board exposing (Board)
import Puyo
import Set exposing (Set)
import Types exposing (..)


-- 組ぷよが指定方向に移動可能かチェック
canMovePuyoPair : Board -> PuyoPair -> Direction -> Bool
canMovePuyoPair board pair direction =
    let
        ( pos1, pos2 ) =
            Puyo.getPuyoPairPositions pair

        offset =
            case direction of
                Left ->
                    { x = -1, y = 0 }

                Right ->
                    { x = 1, y = 0 }

                Down ->
                    { x = 0, y = 1 }

                Up ->
                    { x = 0, y = -1 }

        newPos1 =
            { x = pos1.x + offset.x, y = pos1.y + offset.y }

        newPos2 =
            { x = pos2.x + offset.x, y = pos2.y + offset.y }
    in
    Board.isValidPosition board newPos1
        && Board.isValidPosition board newPos2
        && not (Board.hasPuyo board newPos1)
        && not (Board.hasPuyo board newPos2)


-- 組ぷよを移動
movePuyoPair : Board -> PuyoPair -> Direction -> Maybe PuyoPair
movePuyoPair board pair direction =
    if not (canMovePuyoPair board pair direction) then
        Nothing

    else
        let
            offset =
                case direction of
                    Left ->
                        { x = -1, y = 0 }

                    Right ->
                        { x = 1, y = 0 }

                    Down ->
                        { x = 0, y = 1 }

                    Up ->
                        { x = 0, y = -1 }

            newBasePosition =
                { x = pair.basePosition.x + offset.x
                , y = pair.basePosition.y + offset.y
                }
        in
        Just { pair | basePosition = newBasePosition }


-- 組ぷよが下に落下可能かチェック
canFall : Board -> PuyoPair -> Bool
canFall board pair =
    canMovePuyoPair board pair Down


-- 組ぷよを一気に底まで落下（ハードドロップ）
hardDrop : Board -> PuyoPair -> PuyoPair
hardDrop board pair =
    case movePuyoPair board pair Down of
        Just movedPair ->
            hardDrop board movedPair

        Nothing ->
            pair


-- 組ぷよをボードに固定
fixPuyoPairToBoard : Board -> PuyoPair -> Board
fixPuyoPairToBoard board pair =
    let
        ( pos1, pos2 ) =
            Puyo.getPuyoPairPositions pair
    in
    Board.setCell (Board.setCell board pos1 (Filled pair.puyo1Color)) pos2 (Filled pair.puyo2Color)


-- 浮いているぷよを重力で落下させる
dropFloatingPuyos : Board -> Board
dropFloatingPuyos board =
    let
        dropOnce currentBoard =
            let
                positions =
                    List.range 0 (Board.height currentBoard - 2)
                        |> List.reverse
                        |> List.concatMap
                            (\y ->
                                List.range 0 (Board.width currentBoard - 1)
                                    |> List.map (\x -> { x = x, y = y })
                            )

                dropCell pos bd =
                    case Board.getCell bd pos of
                        Just (Filled color) ->
                            let
                                belowPos =
                                    { x = pos.x, y = pos.y + 1 }
                            in
                            case Board.getCell bd belowPos of
                                Just Empty ->
                                    Board.setCell (Board.setCell bd pos Empty) belowPos (Filled color)

                                _ ->
                                    bd

                        _ ->
                            bd
            in
            List.foldl dropCell currentBoard positions

        dropUntilStable currentBoard =
            let
                nextBoard =
                    dropOnce currentBoard
            in
            if Board.toList nextBoard == Board.toList currentBoard then
                currentBoard

            else
                dropUntilStable nextBoard
    in
    dropUntilStable board


-- Positionを文字列に変換（Setに格納するため）
positionToString : Position -> String
positionToString pos =
    String.fromInt pos.x ++ "," ++ String.fromInt pos.y


-- 指定位置から隣接する同色ぷよを検索（幅優先探索）
findAdjacentPuyos : Board -> Position -> List Position
findAdjacentPuyos board startPos =
    case Board.getCell board startPos of
        Just Empty ->
            []

        Nothing ->
            []

        Just (Filled targetColor) ->
            let
                bfs visited queue result =
                    case queue of
                        [] ->
                            result

                        currentPos :: remainingQueue ->
                            if Set.member (positionToString currentPos) visited then
                                bfs visited remainingQueue result

                            else
                                let
                                    newVisited =
                                        Set.insert (positionToString currentPos) visited

                                    newResult =
                                        currentPos :: result

                                    neighbors =
                                        [ { x = currentPos.x - 1, y = currentPos.y }
                                        , { x = currentPos.x + 1, y = currentPos.y }
                                        , { x = currentPos.x, y = currentPos.y - 1 }
                                        , { x = currentPos.x, y = currentPos.y + 1 }
                                        ]
                                            |> List.filter
                                                (\pos ->
                                                    Board.isValidPosition board pos
                                                        && not (Set.member (positionToString pos) newVisited)
                                                        && (case Board.getCell board pos of
                                                                Just (Filled color) ->
                                                                    color == targetColor

                                                                _ ->
                                                                    False
                                                           )
                                                )

                                    newQueue =
                                        remainingQueue ++ neighbors
                                in
                                bfs newVisited newQueue newResult
            in
            bfs Set.empty [ startPos ] []


-- 消去すべきぷよグループを検索（4つ以上の連結成分）
findGroupsToClear : Board -> List (List Position)
findGroupsToClear board =
    let
        allPositions =
            List.range 0 (Board.height board - 1)
                |> List.concatMap
                    (\y ->
                        List.range 0 (Board.width board - 1)
                            |> List.map (\x -> { x = x, y = y })
                    )
                |> List.filter (\pos -> Board.hasPuyo board pos)

        findGroups checked positions groups =
            case positions of
                [] ->
                    groups

                pos :: rest ->
                    if Set.member (positionToString pos) checked then
                        findGroups checked rest groups

                    else
                        let
                            group =
                                findAdjacentPuyos board pos

                            newChecked =
                                group
                                    |> List.map positionToString
                                    |> Set.fromList
                                    |> Set.union checked
                        in
                        if List.length group >= 4 then
                            findGroups newChecked rest (group :: groups)

                        else
                            findGroups newChecked rest groups
    in
    findGroups Set.empty allPositions []


-- 指定されたぷよグループをボードから消去
clearPuyoGroups : Board -> List (List Position) -> Board
clearPuyoGroups board groups =
    groups
        |> List.concat
        |> List.foldl (\pos bd -> Board.setCell bd pos Empty) board


-- 連鎖ボーナス計算
calculateChainBonus : Int -> Int
calculateChainBonus chainCount =
    case chainCount of
        1 ->
            0

        2 ->
            8

        3 ->
            16

        4 ->
            32

        5 ->
            64

        6 ->
            96

        7 ->
            128

        n ->
            if n >= 8 then
                n * 32

            else
                0


-- 基本消去スコア計算
calculateClearScore : Int -> Int -> Int
calculateClearScore clearedCount chainBonus =
    let
        baseScore =
            clearedCount * 10
    in
    baseScore + chainBonus


-- 連鎖結果
type alias ChainResult =
    { board : Board
    , chainCount : Int
    , totalScore : Int
    }


-- 連鎖処理を実行
executeChain : Board -> ChainResult
executeChain board =
    let
        chainLoop currentBoard chainCount totalScore =
            let
                groups =
                    findGroupsToClear currentBoard
            in
            if List.isEmpty groups then
                let
                    finalScore =
                        if Board.isPerfectClear currentBoard then
                            totalScore + 1000

                        else
                            totalScore
                in
                { board = currentBoard
                , chainCount = chainCount
                , totalScore = finalScore
                }

            else
                let
                    clearedBoard =
                        clearPuyoGroups currentBoard groups

                    droppedBoard =
                        dropFloatingPuyos clearedBoard

                    clearedCount =
                        groups
                            |> List.map List.length
                            |> List.sum

                    chainBonus =
                        calculateChainBonus (chainCount + 1)

                    clearScore =
                        calculateClearScore clearedCount chainBonus
                in
                chainLoop droppedBoard (chainCount + 1) (totalScore + clearScore)
    in
    chainLoop board 0 0


-- ゲームオーバー判定（上部2行にぷよがある場合）
isGameOver : Board -> Bool
isGameOver board =
    [ 0, 1 ]
        |> List.any
            (\y ->
                List.range 0 (Board.width board - 1)
                    |> List.any (\x -> Board.hasPuyo board { x = x, y = y })
            )
