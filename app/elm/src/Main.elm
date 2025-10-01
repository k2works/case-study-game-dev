module Main exposing (main)

import Board exposing (Board)
import Browser
import Browser.Events
import GameLogic
import Html exposing (Html)
import Html.Attributes
import Html.Events
import Json.Decode as Decode
import Puyo
import Random
import Time
import Types exposing (..)
import Update.Messages exposing (Msg(..))
import View.Board
import View.GameInfo


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type GameStatus
    = NotStarted
    | Playing
    | GameOver


type alias Model =
    { board : Board
    , currentPiece : Maybe PuyoPair
    , nextPiece : Maybe PuyoPair
    , score : Int
    , level : Int
    , lastChainCount : Int
    , gameTime : Int
    , status : GameStatus
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { board = Board.createEmpty
      , currentPiece = Nothing
      , nextPiece = Nothing
      , score = 0
      , level = 1
      , lastChainCount = 0
      , gameTime = 0
      , status = NotStarted
      }
    , Cmd.none
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StartGame ->
            ( { model | status = Playing }
            , Cmd.batch
                [ Random.generate NewPuyoPairGenerated Puyo.spawnNewPuyoPair
                , Random.generate NextPuyoPairGenerated Puyo.spawnNewPuyoPair
                ]
            )

        ResetGame ->
            ( { board = Board.createEmpty
              , currentPiece = Nothing
              , nextPiece = Nothing
              , score = 0
              , level = 1
              , lastChainCount = 0
              , gameTime = 0
              , status = NotStarted
              }
            , Cmd.none
            )

        GameStep _ ->
            case model.status of
                Playing ->
                    case model.currentPiece of
                        Nothing ->
                            case model.nextPiece of
                                Just nextPiece ->
                                    ( { model | currentPiece = Just nextPiece }
                                    , Random.generate NextPuyoPairGenerated Puyo.spawnNewPuyoPair
                                    )

                                Nothing ->
                                    ( model
                                    , Random.generate NewPuyoPairGenerated Puyo.spawnNewPuyoPair
                                    )

                        Just currentPiece ->
                            if GameLogic.canFall model.board currentPiece then
                                case GameLogic.movePuyoPair model.board currentPiece Down of
                                    Just movedPiece ->
                                        ( { model | currentPiece = Just movedPiece }, Cmd.none )

                                    Nothing ->
                                        ( model, Cmd.none )

                            else
                                -- 固定処理
                                let
                                    fixedBoard =
                                        GameLogic.fixPuyoPairToBoard model.board currentPiece

                                    -- 浮遊ぷよを落下させてから連鎖処理
                                    droppedBoard =
                                        GameLogic.dropFloatingPuyos fixedBoard

                                    chainResult =
                                        GameLogic.executeChain droppedBoard

                                    newScore =
                                        model.score + chainResult.totalScore

                                    gameOver =
                                        GameLogic.isGameOver chainResult.board
                                in
                                if gameOver then
                                    ( { model
                                        | board = chainResult.board
                                        , currentPiece = Nothing
                                        , score = newScore
                                        , lastChainCount = chainResult.chainCount
                                        , status = GameOver
                                      }
                                    , Cmd.none
                                    )

                                else
                                    case model.nextPiece of
                                        Just nextPiece ->
                                            ( { model
                                                | board = chainResult.board
                                                , currentPiece = Just nextPiece
                                                , score = newScore
                                                , lastChainCount = chainResult.chainCount
                                              }
                                            , Random.generate NextPuyoPairGenerated Puyo.spawnNewPuyoPair
                                            )

                                        Nothing ->
                                            ( { model
                                                | board = chainResult.board
                                                , currentPiece = Nothing
                                                , score = newScore
                                                , lastChainCount = chainResult.chainCount
                                              }
                                            , Random.generate NewPuyoPairGenerated Puyo.spawnNewPuyoPair
                                            )

                _ ->
                    ( model, Cmd.none )

        MoveLeft ->
            case ( model.status, model.currentPiece ) of
                ( Playing, Just piece ) ->
                    case GameLogic.movePuyoPair model.board piece Left of
                        Just movedPiece ->
                            ( { model | currentPiece = Just movedPiece }, Cmd.none )

                        Nothing ->
                            ( model, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        MoveRight ->
            case ( model.status, model.currentPiece ) of
                ( Playing, Just piece ) ->
                    case GameLogic.movePuyoPair model.board piece Right of
                        Just movedPiece ->
                            ( { model | currentPiece = Just movedPiece }, Cmd.none )

                        Nothing ->
                            ( model, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        MoveDown ->
            case ( model.status, model.currentPiece ) of
                ( Playing, Just piece ) ->
                    case GameLogic.movePuyoPair model.board piece Down of
                        Just movedPiece ->
                            ( { model | currentPiece = Just movedPiece }, Cmd.none )

                        Nothing ->
                            ( model, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        Rotate ->
            case ( model.status, model.currentPiece ) of
                ( Playing, Just piece ) ->
                    let
                        rotatedPiece =
                            Puyo.rotatePuyoPair piece

                        ( pos1, pos2 ) =
                            Puyo.getPuyoPairPositions rotatedPiece

                        canRotate =
                            Board.isValidPosition model.board pos1
                                && Board.isValidPosition model.board pos2
                                && not (Board.hasPuyo model.board pos1)
                                && not (Board.hasPuyo model.board pos2)
                    in
                    if canRotate then
                        ( { model | currentPiece = Just rotatedPiece }, Cmd.none )

                    else
                        ( model, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        HardDrop ->
            case ( model.status, model.currentPiece ) of
                ( Playing, Just piece ) ->
                    let
                        droppedPiece =
                            GameLogic.hardDrop model.board piece
                    in
                    ( { model | currentPiece = Just droppedPiece }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        NewPuyoPairGenerated pair ->
            ( { model | currentPiece = Just pair }, Cmd.none )

        NextPuyoPairGenerated pair ->
            ( { model | nextPiece = Just pair }, Cmd.none )


view : Model -> Html Msg
view model =
    Html.div
        [ Html.Attributes.style "max-width" "800px"
        , Html.Attributes.style "margin" "0 auto"
        , Html.Attributes.style "padding" "20px"
        , Html.Attributes.style "font-family" "Arial, sans-serif"
        ]
        [ Html.h1 [] [ Html.text "ぷよぷよゲーム - Elm" ]
        , Html.div
            [ Html.Attributes.style "display" "flex"
            , Html.Attributes.style "gap" "20px"
            , Html.Attributes.style "margin" "20px 0"
            ]
            [ -- 左側：ボード
              Html.div
                [ Html.Attributes.style "flex" "1" ]
                [ View.Board.viewBoard model.board model.currentPiece ]

            -- 右側：情報
            , Html.div
                [ Html.Attributes.style "width" "200px"
                , Html.Attributes.style "display" "flex"
                , Html.Attributes.style "flex-direction" "column"
                , Html.Attributes.style "gap" "20px"
                ]
                [ View.Board.viewNextPuyo model.nextPiece
                , View.GameInfo.viewGameInfo model.score model.level model.lastChainCount model.gameTime
                ]
            ]

        -- コントロールボタン
        , Html.div
            [ Html.Attributes.style "margin" "20px 0" ]
            [ case model.status of
                NotStarted ->
                    Html.button
                        [ Html.Events.onClick StartGame
                        , Html.Attributes.style "padding" "10px 20px"
                        , Html.Attributes.style "font-size" "16px"
                        , Html.Attributes.style "cursor" "pointer"
                        ]
                        [ Html.text "ゲーム開始" ]

                Playing ->
                    Html.button
                        [ Html.Events.onClick ResetGame
                        , Html.Attributes.style "padding" "10px 20px"
                        , Html.Attributes.style "font-size" "16px"
                        , Html.Attributes.style "cursor" "pointer"
                        ]
                        [ Html.text "リセット" ]

                GameOver ->
                    Html.div []
                        [ Html.h2 [] [ Html.text "ゲームオーバー" ]
                        , Html.p [] [ Html.text ("スコア: " ++ String.fromInt model.score) ]
                        , Html.button
                            [ Html.Events.onClick ResetGame
                            , Html.Attributes.style "padding" "10px 20px"
                            , Html.Attributes.style "font-size" "16px"
                            , Html.Attributes.style "cursor" "pointer"
                            ]
                            [ Html.text "もう一度プレイ" ]
                        ]
            ]

        -- 操作説明
        , Html.div
            [ Html.Attributes.style "margin-top" "20px"
            , Html.Attributes.style "padding" "15px"
            , Html.Attributes.style "background-color" "#f9f9f9"
            , Html.Attributes.style "border" "1px solid #ddd"
            , Html.Attributes.style "border-radius" "4px"
            ]
            [ Html.h3 [] [ Html.text "操作方法" ]
            , Html.ul []
                [ Html.li [] [ Html.text "← → : 左右移動" ]
                , Html.li [] [ Html.text "↓ : 高速落下" ]
                , Html.li [] [ Html.text "↑ : 回転" ]
                , Html.li [] [ Html.text "スペース : ハードドロップ" ]
                ]
            ]
        ]


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.status of
        Playing ->
            Sub.batch
                [ Time.every 1000 GameStep
                , Browser.Events.onKeyDown keyDecoder
                ]

        _ ->
            Sub.none


-- キーデコーダー
keyDecoder : Decode.Decoder Msg
keyDecoder =
    Decode.field "key" Decode.string
        |> Decode.andThen
            (\key ->
                case key of
                    "ArrowLeft" ->
                        Decode.succeed MoveLeft

                    "ArrowRight" ->
                        Decode.succeed MoveRight

                    "ArrowDown" ->
                        Decode.succeed MoveDown

                    "ArrowUp" ->
                        Decode.succeed Rotate

                    " " ->
                        Decode.succeed HardDrop

                    _ ->
                        Decode.fail "Not a game key"
            )
