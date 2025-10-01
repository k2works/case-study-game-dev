module View.Board exposing (viewBoard, viewNextPuyo)

import Board
import Html exposing (Html, div)
import Html.Attributes exposing (style)
import Puyo
import Types exposing (..)


cellSize : Int
cellSize =
    30


-- セルの描画
viewCell : Cell -> Html msg
viewCell cell =
    div
        [ style "width" (String.fromInt cellSize ++ "px")
        , style "height" (String.fromInt cellSize ++ "px")
        , style "border" "1px solid #ddd"
        , style "box-sizing" "border-box"
        , style "background-color" (cellToHex cell)
        , style "border-radius"
            (case cell of
                Empty ->
                    "0"

                Filled _ ->
                    "50%"
            )
        ]
        []


-- ボードの描画
viewBoard : Board.Board -> Maybe PuyoPair -> Html msg
viewBoard board currentPiece =
    let
        -- ボードを一時的なビューモデルに変換
        displayBoard =
            Board.toList board

        -- 現在の組ぷよを重ねて表示
        displayBoardWithPiece =
            case currentPiece of
                Just piece ->
                    let
                        ( pos1, pos2 ) =
                            Puyo.getPuyoPairPositions piece

                        updateCell y x cell =
                            if x == pos1.x && y == pos1.y then
                                Filled piece.puyo1Color

                            else if x == pos2.x && y == pos2.y then
                                Filled piece.puyo2Color

                            else
                                cell
                    in
                    displayBoard
                        |> List.indexedMap
                            (\y row ->
                                List.indexedMap (updateCell y) row
                            )

                Nothing ->
                    displayBoard
    in
    div
        [ style "border" "2px solid #333"
        , style "background-color" "#f0f0f0"
        , style "display" "inline-block"
        ]
        (List.map
            (\row ->
                div
                    [ style "display" "flex" ]
                    (List.map viewCell row)
            )
            displayBoardWithPiece
        )


-- NEXTぷよの描画
viewNextPuyo : Maybe PuyoPair -> Html msg
viewNextPuyo nextPiece =
    div
        [ style "border" "2px solid #333"
        , style "padding" "10px"
        , style "background-color" "#fff"
        ]
        [ Html.h3 [] [ Html.text "NEXT" ]
        , case nextPiece of
            Just piece ->
                div
                    [ style "display" "flex"
                    , style "flex-direction" "column"
                    , style "align-items" "center"
                    , style "gap" "5px"
                    , style "margin-top" "10px"
                    ]
                    [ div
                        [ style "width" "20px"
                        , style "height" "20px"
                        , style "border-radius" "50%"
                        , style "border" "2px solid #333"
                        , style "background-color" (colorToHex piece.puyo1Color)
                        ]
                        []
                    , div
                        [ style "width" "20px"
                        , style "height" "20px"
                        , style "border-radius" "50%"
                        , style "border" "2px solid #333"
                        , style "background-color" (colorToHex piece.puyo2Color)
                        ]
                        []
                    ]

            Nothing ->
                Html.text "なし"
        ]
