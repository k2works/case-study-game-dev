module GameLogic exposing (applyGravity, erasePuyos, findConnectedPuyos)

import Board exposing (Board)
import Cell exposing (Cell(..))
import PuyoColor exposing (PuyoColor)
import Set exposing (Set)


{-| 指定位置から連結している同色のぷよを探索する
-}
findConnectedPuyos : Int -> Int -> PuyoColor -> Board -> Set ( Int, Int )
findConnectedPuyos x y color board =
    findConnectedHelper x y color board Set.empty


{-| 再帰的に連結ぷよを探索するヘルパー関数
-}
findConnectedHelper : Int -> Int -> PuyoColor -> Board -> Set ( Int, Int ) -> Set ( Int, Int )
findConnectedHelper x y color board visited =
    -- すでに訪問済みの場合は何もしない
    if Set.member ( x, y ) visited then
        visited

    else
        case Board.getCell x y board of
            Just (Filled cellColor) ->
                if cellColor == color then
                    let
                        -- 現在位置を訪問済みに追加
                        newVisited =
                            Set.insert ( x, y ) visited

                        -- 4方向（上下左右）を探索
                        directions =
                            [ ( 0, -1 ) -- 上
                            , ( 0, 1 ) -- 下
                            , ( -1, 0 ) -- 左
                            , ( 1, 0 ) -- 右
                            ]

                        -- 各方向を再帰的に探索
                        searchNeighbor ( dx, dy ) visited2 =
                            findConnectedHelper (x + dx) (y + dy) color board visited2
                    in
                    List.foldl searchNeighbor newVisited directions

                else
                    -- 色が違う場合は探索しない
                    visited

            _ ->
                -- セルが空か範囲外の場合は探索しない
                visited


{-| 指定した位置のぷよを消去する
-}
erasePuyos : Set ( Int, Int ) -> Board -> Board
erasePuyos positions board =
    Set.foldl
        (\( x, y ) b -> Board.setCell x y Empty b)
        board
        positions


{-| 重力を適用して浮いているぷよを落下させる
-}
applyGravity : Board -> Board
applyGravity board =
    let
        cols =
            Board.getCols board

        rows =
            Board.getRows board

        -- 各列に対して重力を適用
        applyGravityToColumn : Int -> Board -> Board
        applyGravityToColumn col b =
            -- 下から上に向かって処理
            let
                applyToRow : Int -> Board -> Board
                applyToRow row currentBoard =
                    if row < 0 then
                        currentBoard

                    else
                        case Board.getCell col row currentBoard of
                            Just (Filled color) ->
                                -- 下に落とせるだけ落とす
                                let
                                    finalRow =
                                        findBottomRow col row currentBoard
                                in
                                if finalRow /= row then
                                    currentBoard
                                        |> Board.setCell col row Empty
                                        |> Board.setCell col finalRow (Filled color)
                                        |> applyToRow (row - 1)

                                else
                                    applyToRow (row - 1) currentBoard

                            _ ->
                                applyToRow (row - 1) currentBoard
            in
            applyToRow (rows - 1) b

        -- 下に落とせる最終行を見つける
        findBottomRow : Int -> Int -> Board -> Int
        findBottomRow col row currentBoard =
            if row >= rows - 1 then
                row

            else
                case Board.getCell col (row + 1) currentBoard of
                    Just Empty ->
                        findBottomRow col (row + 1) currentBoard

                    _ ->
                        row
    in
    List.foldl applyGravityToColumn board (List.range 0 (cols - 1))
