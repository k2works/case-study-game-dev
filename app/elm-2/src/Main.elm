module Main exposing (main)

import Browser
import Html exposing (Html, div, h1, text)


-- MODEL

type alias Model =
    {}


init : Model
init =
    {}


-- UPDATE

type Msg
    = NoOp


update : Msg -> Model -> Model
update msg model =
    case msg of
        NoOp ->
            model


-- VIEW

view : Model -> Html Msg
view model =
    div []
        [ h1 [] [ text "ぷよぷよ - Elm 版" ]
        ]


-- MAIN

main : Program () Model Msg
main =
    Browser.sandbox
        { init = init
        , update = update
        , view = view
        }
