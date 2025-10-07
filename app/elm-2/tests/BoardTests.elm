module BoardTests exposing (suite)

import Array
import Board exposing (Board)
import Cell exposing (Cell(..))
import Expect
import PuyoColor exposing (PuyoColor(..))
import Test exposing (Test, describe, test)


suite : Test
suite =
    describe "Board"
        [ describe "create"
            [ test "指定したサイズの空のボードを作成できる" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                    in
                    Expect.all
                        [ \b -> Expect.equal 6 b.cols
                        , \b -> Expect.equal 12 b.rows
                        , \b -> Expect.equal 12 (Array.length b.cells)
                        ]
                        board
            ]
        , describe "getCell"
            [ test "範囲内のセルを取得できる" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                    in
                    Board.getCell 0 0 board
                        |> Expect.equal (Just Empty)
            , test "範囲外のセルは Nothing を返す" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                    in
                    Board.getCell 10 10 board
                        |> Expect.equal Nothing
            ]
        , describe "setCell"
            [ test "セルに値を設定できる" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        updatedBoard =
                            Board.setCell 2 3 (Filled Red) board
                    in
                    Board.getCell 2 3 updatedBoard
                        |> Expect.equal (Just (Filled Red))
            , test "範囲外のセルへの設定は無視される" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        updatedBoard =
                            Board.setCell 10 10 (Filled Red) board
                    in
                    Expect.equal board updatedBoard
            ]
        ]
