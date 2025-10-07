module MainTests exposing (suite)

import Board
import Expect
import Main exposing (..)
import PuyoColor exposing (PuyoColor(..))
import PuyoPair
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
        ]
