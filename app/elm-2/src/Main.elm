module Main exposing (GameMode(..), Model, Msg(..), main, update)

import Board exposing (Board)
import Browser
import Browser.Events
import Cell exposing (Cell(..))
import GameLogic
import Html exposing (Html, button, div, h1, text)
import Html.Attributes exposing (style)
import Html.Events exposing (onClick)
import Json.Decode as Decode
import PuyoColor exposing (PuyoColor(..))
import Set exposing (Set)
import PuyoPair exposing (PuyoPair)
import Time


-- MODEL


type GameMode
    = Start
    | Playing
    | GameOver


type alias Model =
    { board : Board
    , currentPair : Maybe PuyoPair
    , mode : GameMode
    , dropTimer : Float
    , dropInterval : Float
    , lastFrameTime : Maybe Time.Posix
    , fastDropActive : Bool
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { board = Board.create 6 12
      , currentPair = Nothing
      , mode = Start
      , dropTimer = 0
      , dropInterval = 1000
      , lastFrameTime = Nothing
      , fastDropActive = False
      }
    , Cmd.none
    )


-- UPDATE


type Msg
    = StartGame
    | KeyPressed String
    | Tick Time.Posix
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StartGame ->
            ( { model
                | mode = Playing
                , currentPair = Just (PuyoPair.create 2 1 Red Blue)
                , dropTimer = 0
                , lastFrameTime = Nothing
                , fastDropActive = False
              }
            , Cmd.none
            )

        KeyPressed key ->
            case key of
                "ArrowDown" ->
                    -- 高速落下フラグを立てる
                    ( { model | fastDropActive = True }, Cmd.none )

                _ ->
                    -- その他のキー処理
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

                                        "ArrowUp" ->
                                            -- 回転（壁キック付き）
                                            let
                                                ( rotatedPair, _ ) =
                                                    PuyoPair.rotateWithKick pair model.board
                                            in
                                            rotatedPair

                                        _ ->
                                            pair
                            in
                            ( { model | currentPair = Just newPair }, Cmd.none )

                        _ ->
                            ( model, Cmd.none )

        Tick currentTime ->
            case ( model.mode, model.currentPair, model.lastFrameTime ) of
                ( Playing, Just pair, Just lastTime ) ->
                    let
                        deltaTime =
                            toFloat (Time.posixToMillis currentTime - Time.posixToMillis lastTime)

                        -- 高速落下時は落下間隔を短くする
                        effectiveInterval =
                            if model.fastDropActive then
                                50

                            else
                                model.dropInterval

                        newTimer =
                            model.dropTimer + deltaTime
                    in
                    if newTimer >= effectiveInterval then
                        -- 落下タイマーが間隔を超えたら落下処理
                        if PuyoPair.canMoveDown pair model.board then
                            -- 下に移動可能
                            ( { model
                                | currentPair = Just (PuyoPair.moveDown pair)
                                , dropTimer = 0
                                , lastFrameTime = Just currentTime
                              }
                            , Cmd.none
                            )

                        else
                            -- 着地した：ボードに固定して消去判定
                            let
                                boardWithPuyos =
                                    model.board
                                        |> Board.setCell pair.axis.x pair.axis.y (Filled pair.axisColor)
                                        |> Board.setCell pair.child.x pair.child.y (Filled pair.childColor)

                                -- 消去可能なぷよを検出
                                ( erasedBoard, hasErased ) =
                                    checkAndErasePuyos boardWithPuyos
                            in
                            ( { model
                                | board = erasedBoard
                                , currentPair = Just (PuyoPair.create 2 1 Red Blue)
                                , dropTimer = 0
                                , lastFrameTime = Just currentTime
                                , fastDropActive = False
                              }
                            , Cmd.none
                            )

                    else
                        -- まだ落下タイマーが間隔に達していない
                        ( { model
                            | dropTimer = newTimer
                            , lastFrameTime = Just currentTime
                          }
                        , Cmd.none
                        )

                ( Playing, Just pair, Nothing ) ->
                    -- 最初のフレーム：タイムスタンプを記録するだけ
                    ( { model | lastFrameTime = Just currentTime }
                    , Cmd.none
                    )

                _ ->
                    ( model, Cmd.none )

        NoOp ->
            ( model, Cmd.none )


-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.mode of
        Playing ->
            Sub.batch
                [ Browser.Events.onKeyDown (Decode.map KeyPressed keyDecoder)
                , Browser.Events.onAnimationFrame Tick
                ]

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


-- GAME LOGIC HELPERS


{-| ボード上のぷよを消去判定して消去する
-}
checkAndErasePuyos : Board -> ( Board, Bool )
checkAndErasePuyos board =
    let
        cols =
            Board.getCols board

        rows =
            Board.getRows board

        -- すべてのセルをチェックして、4つ以上つながったぷよを探す
        checkAllCells : Set ( Int, Int ) -> Int -> Int -> Set ( Int, Int )
        checkAllCells checked x y =
            if y >= rows then
                checked

            else if x >= cols then
                checkAllCells checked 0 (y + 1)

            else if Set.member ( x, y ) checked then
                checkAllCells checked (x + 1) y

            else
                case Board.getCell x y board of
                    Just (Filled color) ->
                        let
                            connected =
                                GameLogic.findConnectedPuyos x y color board

                            newChecked =
                                Set.union checked connected
                        in
                        if Set.size connected >= 4 then
                            -- 4つ以上つながっている場合は消去対象に追加
                            checkAllCells newChecked (x + 1) y

                        else
                            checkAllCells newChecked (x + 1) y

                    _ ->
                        checkAllCells checked (x + 1) y

        toErase =
            checkAllCells Set.empty 0 0
                |> Set.filter
                    (\( x, y ) ->
                        case Board.getCell x y board of
                            Just (Filled color) ->
                                let
                                    connected =
                                        GameLogic.findConnectedPuyos x y color board
                                in
                                Set.size connected >= 4

                            _ ->
                                False
                    )

        hasErased =
            not (Set.isEmpty toErase)

        erasedBoard =
            if hasErased then
                board
                    |> GameLogic.erasePuyos toErase
                    |> GameLogic.applyGravity

            else
                board
    in
    ( erasedBoard, hasErased )


-- MAIN


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }
