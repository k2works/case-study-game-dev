module GameLogicTests exposing (..)

import Board
import Expect
import GameLogic
import Test exposing (..)
import Types exposing (..)


suite : Test
suite =
    describe "GameLogic module"
        [ describe "canMovePuyoPair"
            [ test "can move right when space is available" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty

                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 5 }
                            , rotation = Deg0
                            }
                    in
                    GameLogic.canMovePuyoPair board pair Right
                        |> Expect.equal True
            , test "cannot move when blocked by board edge" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty

                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 7, y = 5 }
                            , rotation = Deg0
                            }
                    in
                    GameLogic.canMovePuyoPair board pair Right
                        |> Expect.equal False
            , test "cannot move when blocked by existing puyo" <|
                \_ ->
                    let
                        board =
                            Board.setCell Board.createEmpty { x = 4, y = 5 } (Filled Green)

                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 5 }
                            , rotation = Deg0
                            }
                    in
                    GameLogic.canMovePuyoPair board pair Right
                        |> Expect.equal False
            ]
        , describe "movePuyoPair"
            [ test "moves pair to the right" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty

                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 5 }
                            , rotation = Deg0
                            }

                        moved =
                            GameLogic.movePuyoPair board pair Right
                    in
                    case moved of
                        Just movedPair ->
                            movedPair.basePosition
                                |> Expect.equal { x = 4, y = 5 }

                        Nothing ->
                            Expect.fail "Should be able to move"
            , test "returns Nothing when move is blocked" <|
                \_ ->
                    let
                        board =
                            Board.setCell Board.createEmpty { x = 4, y = 5 } (Filled Green)

                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 5 }
                            , rotation = Deg0
                            }
                    in
                    GameLogic.movePuyoPair board pair Right
                        |> Expect.equal Nothing
            ]
        , describe "canFall"
            [ test "returns True when space below is empty" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty

                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 5 }
                            , rotation = Deg0
                            }
                    in
                    GameLogic.canFall board pair
                        |> Expect.equal True
            , test "returns False when at bottom" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty

                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 10 }
                            , rotation = Deg0
                            }
                    in
                    GameLogic.canFall board pair
                        |> Expect.equal False
            ]
        , describe "fixPuyoPairToBoard"
            [ test "fixes puyo pair to board" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty

                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 5 }
                            , rotation = Deg0
                            }

                        fixedBoard =
                            GameLogic.fixPuyoPairToBoard board pair
                    in
                    Expect.all
                        [ \b -> Board.getCell b { x = 3, y = 5 } |> Expect.equal (Just (Filled Red))
                        , \b -> Board.getCell b { x = 3, y = 6 } |> Expect.equal (Just (Filled Blue))
                        ]
                        fixedBoard
            ]
        , describe "calculateChainBonus"
            [ test "returns 0 for chain count 1" <|
                \_ ->
                    GameLogic.calculateChainBonus 1
                        |> Expect.equal 0
            , test "returns 8 for chain count 2" <|
                \_ ->
                    GameLogic.calculateChainBonus 2
                        |> Expect.equal 8
            , test "returns 16 for chain count 3" <|
                \_ ->
                    GameLogic.calculateChainBonus 3
                        |> Expect.equal 16
            , test "returns n * 32 for chain count >= 8" <|
                \_ ->
                    GameLogic.calculateChainBonus 10
                        |> Expect.equal 320
            ]
        , describe "calculateClearScore"
            [ test "calculates basic clear score" <|
                \_ ->
                    GameLogic.calculateClearScore 4 0
                        |> Expect.equal 40
            , test "adds chain bonus to clear score" <|
                \_ ->
                    GameLogic.calculateClearScore 4 8
                        |> Expect.equal 48
            ]
        , describe "findAdjacentPuyos"
            [ test "finds single puyo when isolated" <|
                \_ ->
                    let
                        board =
                            Board.setCell Board.createEmpty { x = 3, y = 5 } (Filled Red)

                        adjacent =
                            GameLogic.findAdjacentPuyos board { x = 3, y = 5 }
                    in
                    List.length adjacent
                        |> Expect.equal 1
            , test "finds horizontal adjacent puyos" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty
                                |> (\b -> Board.setCell b { x = 3, y = 5 } (Filled Red))
                                |> (\b -> Board.setCell b { x = 4, y = 5 } (Filled Red))
                                |> (\b -> Board.setCell b { x = 5, y = 5 } (Filled Red))

                        adjacent =
                            GameLogic.findAdjacentPuyos board { x = 3, y = 5 }
                    in
                    List.length adjacent
                        |> Expect.equal 3
            , test "does not include different colored puyos" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty
                                |> (\b -> Board.setCell b { x = 3, y = 5 } (Filled Red))
                                |> (\b -> Board.setCell b { x = 4, y = 5 } (Filled Blue))

                        adjacent =
                            GameLogic.findAdjacentPuyos board { x = 3, y = 5 }
                    in
                    List.length adjacent
                        |> Expect.equal 1
            ]
        , describe "findGroupsToClear"
            [ test "returns empty list when no groups of 4+" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty
                                |> (\b -> Board.setCell b { x = 3, y = 5 } (Filled Red))
                                |> (\b -> Board.setCell b { x = 4, y = 5 } (Filled Red))
                                |> (\b -> Board.setCell b { x = 5, y = 5 } (Filled Red))

                        groups =
                            GameLogic.findGroupsToClear board
                    in
                    List.length groups
                        |> Expect.equal 0
            , test "finds group of 4 puyos" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty
                                |> (\b -> Board.setCell b { x = 3, y = 5 } (Filled Red))
                                |> (\b -> Board.setCell b { x = 4, y = 5 } (Filled Red))
                                |> (\b -> Board.setCell b { x = 5, y = 5 } (Filled Red))
                                |> (\b -> Board.setCell b { x = 6, y = 5 } (Filled Red))

                        groups =
                            GameLogic.findGroupsToClear board
                    in
                    List.length groups
                        |> Expect.equal 1
            ]
        , describe "isGameOver"
            [ test "returns False for empty board" <|
                \_ ->
                    Board.createEmpty
                        |> GameLogic.isGameOver
                        |> Expect.equal False
            , test "returns True when puyo in top row" <|
                \_ ->
                    let
                        board =
                            Board.setCell Board.createEmpty { x = 3, y = 0 } (Filled Red)
                    in
                    GameLogic.isGameOver board
                        |> Expect.equal True
            , test "returns True when puyo in second row" <|
                \_ ->
                    let
                        board =
                            Board.setCell Board.createEmpty { x = 3, y = 1 } (Filled Red)
                    in
                    GameLogic.isGameOver board
                        |> Expect.equal True
            , test "returns False when puyo only in third row and below" <|
                \_ ->
                    let
                        board =
                            Board.setCell Board.createEmpty { x = 3, y = 2 } (Filled Red)
                    in
                    GameLogic.isGameOver board
                        |> Expect.equal False
            ]
        ]
