module PuyoPairTests exposing (suite)

import Board
import Cell exposing (Cell(..))
import Expect
import PuyoColor exposing (PuyoColor(..))
import PuyoPair
import Test exposing (Test, describe, test)


suite : Test
suite =
    describe "PuyoPair"
        [ describe "moveLeft"
            [ test "左に移動できる場合、左に移動する" <|
                \_ ->
                    let
                        pair =
                            PuyoPair.create 2 5 Red Blue

                        movedPair =
                            PuyoPair.moveLeft pair
                    in
                    Expect.equal 1 movedPair.axis.x
            , test "左端にいる場合でも移動する（衝突判定は別で行う）" <|
                \_ ->
                    let
                        pair =
                            PuyoPair.create 0 5 Red Blue

                        movedPair =
                            PuyoPair.moveLeft pair
                    in
                    Expect.equal -1 movedPair.axis.x
            ]
        , describe "moveRight"
            [ test "右に移動できる場合、右に移動する" <|
                \_ ->
                    let
                        pair =
                            PuyoPair.create 2 5 Red Blue

                        movedPair =
                            PuyoPair.moveRight pair
                    in
                    Expect.equal 3 movedPair.axis.x
            ]
        , describe "canMove"
            [ test "移動先にぷよがなければ移動可能" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        pair =
                            PuyoPair.create 2 5 Red Blue
                    in
                    PuyoPair.canMove pair board
                        |> Expect.equal True
            , test "軸ぷよがボード範囲外なら移動不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        pair =
                            PuyoPair.create -1 5 Red Blue
                    in
                    PuyoPair.canMove pair board
                        |> Expect.equal False
            , test "子ぷよがボード範囲外なら移動不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        pair =
                            PuyoPair.create 2 -1 Red Blue
                    in
                    PuyoPair.canMove pair board
                        |> Expect.equal False
            , test "移動先にぷよがあれば移動不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 2 5 (Filled Red)

                        pair =
                            PuyoPair.create 2 5 Red Blue
                    in
                    PuyoPair.canMove pair board
                        |> Expect.equal False
            ]
        ]
