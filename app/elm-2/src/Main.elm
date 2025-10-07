module Main exposing (main)

import Board exposing (Board)
import Browser
import Cell exposing (Cell(..))
import Html exposing (Html, div, h1, text)
import Html.Attributes exposing (style)
import PuyoColor exposing (PuyoColor(..))
import PuyoPair exposing (PuyoPair)


-- MODEL


type GameMode
    = Start
    | Playing
    | GameOver


type alias Model =
    { board : Board
    , currentPair : Maybe PuyoPair
    , mode : GameMode
    }


init : () -> Model
init _ =
    { board = Board.create 6 12
    , currentPair = Nothing
    , mode = Start
    }


-- UPDATE


type Msg
    = StartGame
    | Tick
    | NoOp


update : Msg -> Model -> Model
update msg model =
    case msg of
        StartGame ->
            { model
                | mode = Playing
                , currentPair = Just (PuyoPair.create 2 1 Red Blue)
            }

        Tick ->
            -- 後で実装
            model

        NoOp ->
            model


-- VIEW


view : Model -> Html Msg
view model =
    div
        [ style "padding" "20px"
        , style "font-family" "Arial, sans-serif"
        ]
        [ h1 [] [ text "ぷよぷよ - Elm 版" ]
        , div [] [ text ("ゲームモード: " ++ gameModeToString model.mode) ]
        , viewBoard model.board
        , viewCurrentPair model.currentPair
        ]


gameModeToString : GameMode -> String
gameModeToString mode =
    case mode of
        Start ->
            "スタート"

        Playing ->
            "プレイ中"

        GameOver ->
            "ゲームオーバー"


viewBoard : Board -> Html Msg
viewBoard board =
    div
        [ style "margin-top" "20px"
        , style "padding" "10px"
        , style "background-color" "#f0f0f0"
        , style "display" "inline-block"
        ]
        [ text ("ボード: " ++ String.fromInt board.cols ++ "x" ++ String.fromInt board.rows) ]


viewCurrentPair : Maybe PuyoPair -> Html Msg
viewCurrentPair maybePair =
    case maybePair of
        Just pair ->
            div
                [ style "margin-top" "10px" ]
                [ text
                    ("現在のぷよペア: ("
                        ++ String.fromInt pair.axis.x
                        ++ ", "
                        ++ String.fromInt pair.axis.y
                        ++ ")"
                    )
                ]

        Nothing ->
            div [] []


-- MAIN


main : Program () Model Msg
main =
    Browser.sandbox
        { init = init ()
        , update = update
        , view = view
        }
