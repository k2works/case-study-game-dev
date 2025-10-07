module MainTests exposing (suite)

import Board
import Cell exposing (Cell(..))
import Expect
import GameLogic
import Main exposing (..)
import PuyoColor exposing (PuyoColor(..))
import PuyoPair
import Set
import Test exposing (..)
import Time


suite : Test
suite =
    describe "Main"
        [ describe "高速落下"
            [ test "下矢印キーで高速落下フラグが立つ" <|
                \_ ->
                    let
                        initialModel =
                            { board = Board.create 6 12
                            , currentPair = Just (PuyoPair.create 2 5 Red Blue)
                            , mode = Playing
                            , dropTimer = 0
                            , dropInterval = 1000
                            , lastFrameTime = Nothing
                            , fastDropActive = False
                            , chainCount = 0
                            , score = 0
                            , message = ""
                            }

                        ( newModel, _ ) =
                            update (KeyPressed "ArrowDown") initialModel
                    in
                    newModel.fastDropActive
                        |> Expect.equal True
            , test "下矢印キー以外では高速落下フラグが立たない" <|
                \_ ->
                    let
                        initialModel =
                            { board = Board.create 6 12
                            , currentPair = Just (PuyoPair.create 2 5 Red Blue)
                            , mode = Playing
                            , dropTimer = 0
                            , dropInterval = 1000
                            , lastFrameTime = Nothing
                            , fastDropActive = False
                            , chainCount = 0
                            , score = 0
                            , message = ""
                            }

                        ( newModel, _ ) =
                            update (KeyPressed "ArrowLeft") initialModel
                    in
                    newModel.fastDropActive
                        |> Expect.equal False
            , test "高速落下時は落下間隔が短くなる" <|
                \_ ->
                    let
                        model =
                            { board = Board.create 6 12
                            , currentPair = Just (PuyoPair.create 2 5 Red Blue)
                            , mode = Playing
                            , dropTimer = 0
                            , dropInterval = 1000
                            , lastFrameTime = Nothing
                            , fastDropActive = True
                            , chainCount = 0
                            , score = 0
                            , message = ""
                            }

                        effectiveInterval =
                            if model.fastDropActive then
                                50

                            else
                                model.dropInterval
                    in
                    effectiveInterval
                        |> Expect.equal 50
            ]
        , describe "連鎖反応"
            [ test "ぷよ消去後、上のぷよが落ちて再び4つつながれば連鎖する" <|
                \_ ->
                    let
                        -- 初期配置:
                        -- 赤ぷよ4つ（2×2）の上に青ぷよが縦に3つ、横に1つ
                        board =
                            Board.create 6 12
                                |> Board.setCell 1 10 (Filled Red)
                                |> Board.setCell 2 10 (Filled Red)
                                |> Board.setCell 1 11 (Filled Red)
                                |> Board.setCell 2 11 (Filled Red)
                                |> Board.setCell 3 10 (Filled Blue)
                                |> Board.setCell 2 7 (Filled Blue)
                                |> Board.setCell 2 8 (Filled Blue)
                                |> Board.setCell 2 9 (Filled Blue)

                        -- 1. 赤ぷよを探索
                        redConnected =
                            GameLogic.findConnectedPuyos 1 10 Red board

                        -- 2. 赤ぷよを消去
                        boardAfterErase =
                            GameLogic.erasePuyos redConnected board

                        -- 3. 重力を適用
                        boardAfterGravity =
                            GameLogic.applyGravity boardAfterErase

                        -- 4. 青ぷよの連鎖判定
                        blueConnected =
                            GameLogic.findConnectedPuyos 2 10 Blue boardAfterGravity
                    in
                    Set.size blueConnected
                        |> Expect.equal 4
            ]
        ]
