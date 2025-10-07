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
        , describe "rotate"
            [ test "時計回りに回転すると、子ぷよが軸ぷよの右に移動する" <|
                \_ ->
                    let
                        -- 子ぷよが上にある状態（rotation = 0）
                        pair =
                            PuyoPair.create 2 5 Red Blue

                        rotatedPair =
                            PuyoPair.rotate pair
                    in
                    Expect.all
                        [ \p -> Expect.equal 2 p.axis.x
                        , \p -> Expect.equal 5 p.axis.y
                        , \p -> Expect.equal 3 p.child.x
                        , \p -> Expect.equal 5 p.child.y
                        ]
                        rotatedPair
            , test "4回回転すると元の位置に戻る" <|
                \_ ->
                    let
                        pair =
                            PuyoPair.create 2 5 Red Blue

                        rotatedPair =
                            pair
                                |> PuyoPair.rotate
                                |> PuyoPair.rotate
                                |> PuyoPair.rotate
                                |> PuyoPair.rotate
                    in
                    Expect.all
                        [ \p -> Expect.equal pair.axis p.axis
                        , \p -> Expect.equal pair.child p.child
                        ]
                        rotatedPair
            ]
        , describe "rotateWithKick"
            [ test "壁際で回転時、壁キックが発生する" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        -- 右端に配置（x = 5）
                        pair =
                            PuyoPair.create 5 5 Red Blue

                        -- 回転すると子ぷよが壁外（x = 6）になるので壁キック
                        ( movedPair, kicked ) =
                            PuyoPair.rotateWithKick pair board
                    in
                    Expect.all
                        [ \_ -> Expect.equal True kicked
                        , \_ -> Expect.equal 4 movedPair.axis.x
                        ]
                        ()
            , test "壁キックが不要な場合、位置は変わらない" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        -- 中央に配置
                        pair =
                            PuyoPair.create 2 5 Red Blue

                        ( rotatedPair, kicked ) =
                            PuyoPair.rotateWithKick pair board
                    in
                    Expect.all
                        [ \_ -> Expect.equal False kicked
                        , \_ -> Expect.equal 2 rotatedPair.axis.x
                        ]
                        ()
            ]
        , describe "moveDown"
            [ test "下に移動できる" <|
                \_ ->
                    let
                        pair =
                            PuyoPair.create 2 5 Red Blue

                        movedPair =
                            PuyoPair.moveDown pair
                    in
                    Expect.all
                        [ \p -> Expect.equal 2 p.axis.x
                        , \p -> Expect.equal 6 p.axis.y
                        , \p -> Expect.equal 2 p.child.x
                        , \p -> Expect.equal 5 p.child.y
                        ]
                        movedPair
            ]
        , describe "canMoveDown"
            [ test "下にスペースがあれば移動可能" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        pair =
                            PuyoPair.create 2 5 Red Blue
                    in
                    PuyoPair.canMoveDown pair board
                        |> Expect.equal True
            , test "軸ぷよが下端なら移動不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        pair =
                            PuyoPair.create 2 11 Red Blue
                    in
                    PuyoPair.canMoveDown pair board
                        |> Expect.equal False
            , test "子ぷよが下端なら移動不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        -- rotation = 2（子ぷよが下）の状態
                        pair =
                            { axis = { x = 2, y = 10 }
                            , child = { x = 2, y = 11 }
                            , axisColor = Red
                            , childColor = Blue
                            , rotation = 2
                            }
                    in
                    PuyoPair.canMoveDown pair board
                        |> Expect.equal False
            , test "下にぷよがあれば移動不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 2 6 (Filled Red)

                        pair =
                            PuyoPair.create 2 5 Red Blue
                    in
                    PuyoPair.canMoveDown pair board
                        |> Expect.equal False
            ]
        , describe "canSpawn"
            [ test "配置位置が空なら生成可能" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        pair =
                            PuyoPair.create 2 1 Red Blue
                    in
                    PuyoPair.canMove pair board
                        |> Expect.equal True
            , test "軸ぷよの位置が埋まっていたら生成不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 2 1 (Filled Green)

                        pair =
                            PuyoPair.create 2 1 Red Blue
                    in
                    PuyoPair.canMove pair board
                        |> Expect.equal False
            , test "子ぷよの位置が埋まっていたら生成不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 2 0 (Filled Yellow)

                        pair =
                            PuyoPair.create 2 1 Red Blue
                    in
                    PuyoPair.canMove pair board
                        |> Expect.equal False
            ]
        ]
