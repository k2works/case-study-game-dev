module GameLogicTests exposing (suite)

import Board
import Cell exposing (Cell(..))
import Expect
import GameLogic
import PuyoColor exposing (PuyoColor(..))
import Set
import Test exposing (..)


suite : Test
suite =
    describe "GameLogic"
        [ describe "findConnectedPuyos"
            [ test "同じ色のぷよが4つつながっている場合、4つすべてを検出する" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 1 10 (Filled Red)
                                |> Board.setCell 2 10 (Filled Red)
                                |> Board.setCell 1 11 (Filled Red)
                                |> Board.setCell 2 11 (Filled Red)

                        connected =
                            GameLogic.findConnectedPuyos 1 10 Red board
                    in
                    Set.size connected
                        |> Expect.equal 4
            , test "異なる色のぷよは接続されない" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 1 10 (Filled Red)
                                |> Board.setCell 2 10 (Filled Blue)
                                |> Board.setCell 1 11 (Filled Red)
                                |> Board.setCell 2 11 (Filled Red)

                        connected =
                            GameLogic.findConnectedPuyos 1 10 Red board
                    in
                    Set.size connected
                        |> Expect.equal 3
            , test "3つ以下のつながりも正しく検出する" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 1 10 (Filled Red)
                                |> Board.setCell 2 10 (Filled Red)
                                |> Board.setCell 3 10 (Filled Red)

                        connected =
                            GameLogic.findConnectedPuyos 1 10 Red board
                    in
                    Set.size connected
                        |> Expect.equal 3
            ]
        , describe "erasePuyos"
            [ test "指定した位置のぷよを消去する" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 1 10 (Filled Red)
                                |> Board.setCell 2 10 (Filled Red)
                                |> Board.setCell 1 11 (Filled Red)
                                |> Board.setCell 2 11 (Filled Red)

                        positions =
                            Set.fromList [ ( 1, 10 ), ( 2, 10 ), ( 1, 11 ), ( 2, 11 ) ]

                        newBoard =
                            GameLogic.erasePuyos positions board
                    in
                    Expect.all
                        [ \b -> Board.getCell 1 10 b |> Expect.equal (Just Empty)
                        , \b -> Board.getCell 2 10 b |> Expect.equal (Just Empty)
                        , \b -> Board.getCell 1 11 b |> Expect.equal (Just Empty)
                        , \b -> Board.getCell 2 11 b |> Expect.equal (Just Empty)
                        ]
                        newBoard
            ]
        , describe "applyGravity"
            [ test "浮いているぷよが落下する" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 2 8 (Filled Blue)
                                |> Board.setCell 2 9 (Filled Blue)

                        newBoard =
                            GameLogic.applyGravity board
                    in
                    Expect.all
                        [ \b -> Board.getCell 2 8 b |> Expect.equal (Just Empty)
                        , \b -> Board.getCell 2 9 b |> Expect.equal (Just Empty)
                        , \b -> Board.getCell 2 10 b |> Expect.equal (Just (Filled Blue))
                        , \b -> Board.getCell 2 11 b |> Expect.equal (Just (Filled Blue))
                        ]
                        newBoard
            , test "浮いていないぷよは動かない" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 2 11 (Filled Blue)

                        newBoard =
                            GameLogic.applyGravity board
                    in
                    Board.getCell 2 11 newBoard
                        |> Expect.equal (Just (Filled Blue))
            ]
        ]
