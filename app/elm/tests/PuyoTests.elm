module PuyoTests exposing (..)

import Expect
import Puyo
import Test exposing (..)
import Types exposing (..)


suite : Test
suite =
    describe "Puyo module"
        [ describe "rotatePuyoPair"
            [ test "rotates from Deg0 to Deg90" <|
                \_ ->
                    let
                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 1 }
                            , rotation = Deg0
                            }

                        rotated =
                            Puyo.rotatePuyoPair pair
                    in
                    rotated.rotation
                        |> Expect.equal Deg90
            , test "rotates from Deg90 to Deg180" <|
                \_ ->
                    let
                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 1 }
                            , rotation = Deg90
                            }

                        rotated =
                            Puyo.rotatePuyoPair pair
                    in
                    rotated.rotation
                        |> Expect.equal Deg180
            , test "rotates from Deg180 to Deg270" <|
                \_ ->
                    let
                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 1 }
                            , rotation = Deg180
                            }

                        rotated =
                            Puyo.rotatePuyoPair pair
                    in
                    rotated.rotation
                        |> Expect.equal Deg270
            , test "rotates from Deg270 back to Deg0" <|
                \_ ->
                    let
                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 1 }
                            , rotation = Deg270
                            }

                        rotated =
                            Puyo.rotatePuyoPair pair
                    in
                    rotated.rotation
                        |> Expect.equal Deg0
            ]
        , describe "getPuyoPairPositions"
            [ test "returns correct positions for Deg0 rotation" <|
                \_ ->
                    let
                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 1 }
                            , rotation = Deg0
                            }

                        ( pos1, pos2 ) =
                            Puyo.getPuyoPairPositions pair
                    in
                    Expect.equal
                        ( { x = 3, y = 1 }, { x = 3, y = 2 } )
                        ( pos1, pos2 )
            , test "returns correct positions for Deg90 rotation" <|
                \_ ->
                    let
                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 1 }
                            , rotation = Deg90
                            }

                        ( pos1, pos2 ) =
                            Puyo.getPuyoPairPositions pair
                    in
                    Expect.equal
                        ( { x = 3, y = 1 }, { x = 4, y = 1 } )
                        ( pos1, pos2 )
            , test "returns correct positions for Deg180 rotation" <|
                \_ ->
                    let
                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 1 }
                            , rotation = Deg180
                            }

                        ( pos1, pos2 ) =
                            Puyo.getPuyoPairPositions pair
                    in
                    Expect.equal
                        ( { x = 3, y = 1 }, { x = 3, y = 0 } )
                        ( pos1, pos2 )
            , test "returns correct positions for Deg270 rotation" <|
                \_ ->
                    let
                        pair =
                            { puyo1Color = Red
                            , puyo2Color = Blue
                            , basePosition = { x = 3, y = 1 }
                            , rotation = Deg270
                            }

                        ( pos1, pos2 ) =
                            Puyo.getPuyoPairPositions pair
                    in
                    Expect.equal
                        ( { x = 3, y = 1 }, { x = 2, y = 1 } )
                        ( pos1, pos2 )
            ]
        ]
