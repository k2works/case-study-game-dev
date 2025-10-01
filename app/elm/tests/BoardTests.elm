module BoardTests exposing (..)

import Board
import Expect
import Test exposing (..)
import Types exposing (..)


suite : Test
suite =
    describe "Board module"
        [ describe "createEmpty"
            [ test "creates a board with correct dimensions" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty
                    in
                    Expect.equal
                        { width = 8, height = 12 }
                        { width = Board.width board
                        , height = Board.height board
                        }
            , test "creates a board with all empty cells" <|
                \_ ->
                    Board.createEmpty
                        |> Board.allCellsEmpty
                        |> Expect.equal True
            ]
        , describe "isValidPosition"
            [ test "returns True for valid positions" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty
                    in
                    Expect.all
                        [ \b -> Board.isValidPosition b { x = 0, y = 0 } |> Expect.equal True
                        , \b -> Board.isValidPosition b { x = 7, y = 11 } |> Expect.equal True
                        , \b -> Board.isValidPosition b { x = 4, y = 6 } |> Expect.equal True
                        ]
                        board
            , test "returns False for invalid positions" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty
                    in
                    Expect.all
                        [ \b -> Board.isValidPosition b { x = -1, y = 0 } |> Expect.equal False
                        , \b -> Board.isValidPosition b { x = 8, y = 0 } |> Expect.equal False
                        , \b -> Board.isValidPosition b { x = 0, y = 12 } |> Expect.equal False
                        ]
                        board
            ]
        , describe "getCell and setCell"
            [ test "can get a cell value" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty

                        pos =
                            { x = 3, y = 5 }
                    in
                    Board.getCell board pos
                        |> Expect.equal (Just Empty)
            , test "can set a cell value (immutable)" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty

                        pos =
                            { x = 3, y = 5 }

                        updatedBoard =
                            Board.setCell board pos (Filled Red)
                    in
                    Expect.all
                        [ \_ -> Board.getCell board pos |> Expect.equal (Just Empty)
                        , \_ -> Board.getCell updatedBoard pos |> Expect.equal (Just (Filled Red))
                        ]
                        ()
            ]
        , describe "hasPuyo"
            [ test "returns True when cell has a puyo" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty

                        pos =
                            { x = 3, y = 5 }

                        boardWithPuyo =
                            Board.setCell board pos (Filled Blue)
                    in
                    Board.hasPuyo boardWithPuyo pos
                        |> Expect.equal True
            , test "returns False when cell is empty" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty

                        pos =
                            { x = 3, y = 5 }
                    in
                    Board.hasPuyo board pos
                        |> Expect.equal False
            ]
        , describe "isPerfectClear"
            [ test "returns True for empty board" <|
                \_ ->
                    Board.createEmpty
                        |> Board.isPerfectClear
                        |> Expect.equal True
            , test "returns False for board with puyos" <|
                \_ ->
                    let
                        board =
                            Board.createEmpty

                        boardWithPuyo =
                            Board.setCell board { x = 3, y = 5 } (Filled Red)
                    in
                    Board.isPerfectClear boardWithPuyo
                        |> Expect.equal False
            ]
        ]
