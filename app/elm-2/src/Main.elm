module Main exposing (main)

import Board exposing (Board)
import Browser
import Browser.Events
import Cell exposing (Cell(..))
import Html exposing (Html, button, div, h1, text)
import Html.Attributes exposing (style)
import Html.Events exposing (onClick)
import Json.Decode as Decode
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


init : () -> ( Model, Cmd Msg )
init _ =
    ( { board = Board.create 6 12
      , currentPair = Nothing
      , mode = Start
      }
    , Cmd.none
    )


-- UPDATE


type Msg
    = StartGame
    | KeyPressed String
    | Tick
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StartGame ->
            ( { model
                | mode = Playing
                , currentPair = Just (PuyoPair.create 2 1 Red Blue)
              }
            , Cmd.none
            )

        KeyPressed key ->
            case ( model.mode, model.currentPair ) of
                ( Playing, Just pair ) ->
                    let
                        newPair =
                            case key of
                                "ArrowLeft" ->
                                    let
                                        movedPair =
                                            PuyoPair.moveLeft pair
                                    in
                                    if PuyoPair.canMove movedPair model.board then
                                        movedPair

                                    else
                                        pair

                                "ArrowRight" ->
                                    let
                                        movedPair =
                                            PuyoPair.moveRight pair
                                    in
                                    if PuyoPair.canMove movedPair model.board then
                                        movedPair

                                    else
                                        pair

                                _ ->
                                    pair
                    in
                    ( { model | currentPair = Just newPair }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        Tick ->
            -- 後で実装
            ( model, Cmd.none )

        NoOp ->
            ( model, Cmd.none )


-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.mode of
        Playing ->
            Browser.Events.onKeyDown (Decode.map KeyPressed keyDecoder)

        _ ->
            Sub.none


keyDecoder : Decode.Decoder String
keyDecoder =
    Decode.field "key" Decode.string


-- VIEW


view : Model -> Html Msg
view model =
    div
        [ style "padding" "20px"
        , style "font-family" "Arial, sans-serif"
        ]
        [ h1 [] [ text "ぷよぷよ - Elm 版" ]
        , div [] [ text ("ゲームモード: " ++ gameModeToString model.mode) ]
        , viewGameControls model
        , viewBoard model.board model.currentPair
        ]


viewGameControls : Model -> Html Msg
viewGameControls model =
    case model.mode of
        Start ->
            button [ onClick StartGame ] [ text "ゲーム開始" ]

        _ ->
            div [] []


gameModeToString : GameMode -> String
gameModeToString mode =
    case mode of
        Start ->
            "スタート"

        Playing ->
            "プレイ中"

        GameOver ->
            "ゲームオーバー"


viewBoard : Board -> Maybe PuyoPair -> Html Msg
viewBoard board maybePair =
    div
        [ style "margin-top" "20px"
        , style "display" "inline-block"
        , style "border" "2px solid #444"
        , style "background-color" "#2a2a2a"
        ]
        (List.range 0 (board.rows - 1)
            |> List.map (\y -> viewRow board maybePair y)
        )


viewRow : Board -> Maybe PuyoPair -> Int -> Html Msg
viewRow board maybePair y =
    div [ style "display" "flex" ]
        (List.range 0 (board.cols - 1)
            |> List.map (\x -> viewCell board maybePair x y)
        )


viewCell : Board -> Maybe PuyoPair -> Int -> Int -> Html Msg
viewCell board maybePair x y =
    let
        cellContent =
            case Board.getCell x y board of
                Just cell ->
                    cell

                Nothing ->
                    Empty

        isPairPosition =
            case maybePair of
                Just pair ->
                    (pair.axis.x == x && pair.axis.y == y)
                        || (pair.child.x == x && pair.child.y == y)

                Nothing ->
                    False

        color =
            if isPairPosition then
                case maybePair of
                    Just pair ->
                        if pair.axis.x == x && pair.axis.y == y then
                            puyoColorToString pair.axisColor

                        else
                            puyoColorToString pair.childColor

                    Nothing ->
                        "#888"

            else
                case cellContent of
                    Empty ->
                        "#888"

                    Filled puyoColor ->
                        puyoColorToString puyoColor
    in
    div
        [ style "width" "32px"
        , style "height" "32px"
        , style "margin" "2px"
        , style "border-radius" "50%"
        , style "background-color" color
        , style "border" "2px solid #000"
        ]
        []


puyoColorToString : PuyoColor -> String
puyoColorToString color =
    case color of
        Red ->
            "#ff0000"

        Green ->
            "#00ff00"

        Blue ->
            "#0000ff"

        Yellow ->
            "#ffff00"


-- MAIN


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }
