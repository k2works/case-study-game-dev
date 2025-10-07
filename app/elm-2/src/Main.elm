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
    | Checking
    | Erasing
    | Falling
    | GameOver


type alias Model =
    { board : Board
    , currentPair : Maybe PuyoPair
    , mode : GameMode
    , dropTimer : Float
    , dropInterval : Float
    , lastFrameTime : Maybe Time.Posix
    , fastDropActive : Bool
    , chainCount : Int
    , score : Int
    , message : String
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
      , chainCount = 0
      , score = 0
      , message = ""
      }
    , Cmd.none
    )


-- UPDATE


type Msg
    = StartGame
    | KeyPressed String
    | Tick Time.Posix
    | Restart
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
                , chainCount = 0
                , score = 0
                , message = ""
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
            case model.mode of
                Playing ->
                    -- プレイ中の自動落下処理
                    case ( model.currentPair, model.lastFrameTime ) of
                        ( Just pair, Just lastTime ) ->
                            let
                                deltaTime =
                                    toFloat (Time.posixToMillis currentTime - Time.posixToMillis lastTime)

                                effectiveInterval =
                                    if model.fastDropActive then
                                        50

                                    else
                                        model.dropInterval

                                newTimer =
                                    model.dropTimer + deltaTime
                            in
                            if newTimer >= effectiveInterval then
                                if PuyoPair.canMoveDown pair model.board then
                                    ( { model
                                        | currentPair = Just (PuyoPair.moveDown pair)
                                        , dropTimer = 0
                                        , lastFrameTime = Just currentTime
                                      }
                                    , Cmd.none
                                    )

                                else
                                    -- 着地！ボードに固定して消去判定モードへ
                                    let
                                        newBoard =
                                            model.board
                                                |> Board.setCell pair.axis.x pair.axis.y (Filled pair.axisColor)
                                                |> Board.setCell pair.child.x pair.child.y (Filled pair.childColor)
                                                |> GameLogic.applyGravity
                                    in
                                    ( { model
                                        | board = newBoard
                                        , currentPair = Nothing
                                        , mode = Checking
                                        , dropTimer = 0
                                        , lastFrameTime = Just currentTime
                                        , fastDropActive = False
                                        , chainCount = 0
                                      }
                                    , Cmd.none
                                    )

                            else
                                ( { model
                                    | dropTimer = newTimer
                                    , lastFrameTime = Just currentTime
                                  }
                                , Cmd.none
                                )

                        ( Just pair, Nothing ) ->
                            -- 最初のフレーム：タイムスタンプを記録するだけ
                            ( { model | lastFrameTime = Just currentTime }
                            , Cmd.none
                            )

                        _ ->
                            ( model, Cmd.none )

                Checking ->
                    -- 消去判定モード
                    let
                        erasableGroups =
                            findAllErasableGroups model.board
                    in
                    if List.isEmpty erasableGroups then
                        -- 消去なし → 全消しチェック
                        let
                            isAllClear =
                                GameLogic.isEmpty model.board

                            zenkeshiBonus =
                                if isAllClear then
                                    3600

                                else
                                    0

                            message =
                                if isAllClear then
                                    "全消し！+3600"

                                else
                                    ""

                            -- 次のぷよを生成
                            newPair =
                                PuyoPair.create 2 1 Red Blue
                        in
                        -- 次のぷよが配置可能かチェック
                        if PuyoPair.canMove newPair model.board then
                            -- 配置可能 → ゲーム続行
                            ( { model
                                | mode = Playing
                                , currentPair = Just newPair
                                , score = model.score + zenkeshiBonus
                                , message = message
                              }
                            , Cmd.none
                            )

                        else
                            -- 配置不可 → ゲームオーバー
                            ( { model
                                | mode = GameOver
                                , score = model.score + zenkeshiBonus
                              }
                            , Cmd.none
                            )

                    else
                        -- 消去あり → 消去モードへ
                        let
                            newChainCount =
                                model.chainCount + 1

                            -- 消去するぷよの数
                            erasedCount =
                                List.sum (List.map Set.size erasableGroups)

                            -- スコア計算: 消去数 × 連鎖ボーナス
                            chainBonus =
                                case newChainCount of
                                    1 ->
                                        1

                                    2 ->
                                        8

                                    3 ->
                                        16

                                    4 ->
                                        32

                                    5 ->
                                        64

                                    6 ->
                                        96

                                    7 ->
                                        128

                                    _ ->
                                        160

                            points =
                                erasedCount * chainBonus

                            -- すべてのグループを消去
                            newBoard =
                                List.foldl GameLogic.erasePuyos model.board erasableGroups
                        in
                        ( { model
                            | mode = Erasing
                            , chainCount = newChainCount
                            , score = model.score + points
                            , board = newBoard
                          }
                        , Cmd.none
                        )

                Erasing ->
                    -- 消去アニメーション（簡略化のためすぐに落下モードへ）
                    ( { model | mode = Falling }, Cmd.none )

                Falling ->
                    -- 重力適用後、再度消去判定へ
                    let
                        newBoard =
                            GameLogic.applyGravity model.board
                    in
                    ( { model
                        | board = newBoard
                        , mode = Checking
                      }
                    , Cmd.none
                    )

                _ ->
                    ( model, Cmd.none )

        Restart ->
            ( { board = Board.create 6 12
              , currentPair = Nothing
              , mode = Start
              , dropTimer = 0
              , dropInterval = 1000
              , lastFrameTime = Nothing
              , fastDropActive = False
              , chainCount = 0
              , score = 0
              , message = ""
              }
            , Cmd.none
            )

        NoOp ->
            ( model, Cmd.none )


-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.mode of
        Start ->
            Sub.none

        Playing ->
            Sub.batch
                [ Browser.Events.onKeyDown (Decode.map KeyPressed keyDecoder)
                , Browser.Events.onAnimationFrame Tick
                ]

        Checking ->
            Browser.Events.onAnimationFrame Tick

        Erasing ->
            Browser.Events.onAnimationFrame Tick

        Falling ->
            Browser.Events.onAnimationFrame Tick

        GameOver ->
            Browser.Events.onKeyDown restartKeyDecoder


keyDecoder : Decode.Decoder String
keyDecoder =
    Decode.field "key" Decode.string


restartKeyDecoder : Decode.Decoder Msg
restartKeyDecoder =
    Decode.field "key" Decode.string
        |> Decode.andThen
            (\key ->
                if key == "r" || key == "R" then
                    Decode.succeed Restart

                else
                    Decode.fail "Not R key"
            )


-- VIEW


view : Model -> Html Msg
view model =
    div
        [ style "padding" "20px"
        , style "font-family" "Arial, sans-serif"
        ]
        [ h1 [] [ text "ぷよぷよ - Elm 版" ]
        , div []
            [ text ("スコア: " ++ String.fromInt model.score)
            , text " | "
            , text ("連鎖数: " ++ String.fromInt model.chainCount)
            ]
        , if String.isEmpty model.message then
            text ""

          else
            div
                [ style "color" "gold"
                , style "font-weight" "bold"
                , style "font-size" "24px"
                , style "margin" "10px 0"
                ]
                [ text model.message ]
        , div [] [ text ("ゲームモード: " ++ gameModeToString model.mode) ]
        , viewGameControls model
        , viewBoard model.board model.currentPair
        ]


viewGameControls : Model -> Html Msg
viewGameControls model =
    case model.mode of
        Start ->
            button [ onClick StartGame ] [ text "ゲーム開始" ]

        GameOver ->
            div []
                [ div
                    [ style "color" "red"
                    , style "font-size" "32px"
                    , style "font-weight" "bold"
                    , style "margin" "20px 0"
                    ]
                    [ text "ゲームオーバー" ]
                , div
                    [ style "font-size" "24px"
                    , style "margin" "10px 0"
                    ]
                    [ text ("最終スコア: " ++ String.fromInt model.score) ]
                , div
                    [ style "margin" "20px 0"
                    ]
                    [ text "Rキーを押して再スタート" ]
                ]

        _ ->
            div [] []


gameModeToString : GameMode -> String
gameModeToString mode =
    case mode of
        Start ->
            "スタート"

        Playing ->
            "プレイ中"

        Checking ->
            "消去判定中"

        Erasing ->
            "消去中"

        Falling ->
            "落下中"

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


{-| ボード全体から消去可能なグループを探す
-}
findAllErasableGroups : Board -> List (Set ( Int, Int ))
findAllErasableGroups board =
    let
        cols =
            Board.getCols board

        rows =
            Board.getRows board

        -- すべてのセルをチェック
        allPositions =
            List.concatMap
                (\y -> List.map (\x -> ( x, y )) (List.range 0 (cols - 1)))
                (List.range 0 (rows - 1))

        -- 訪問済み位置を管理
        findGroups : List ( Int, Int ) -> Set ( Int, Int ) -> List (Set ( Int, Int )) -> List (Set ( Int, Int ))
        findGroups positions visited groups =
            case positions of
                [] ->
                    groups

                ( x, y ) :: rest ->
                    if Set.member ( x, y ) visited then
                        findGroups rest visited groups

                    else
                        case Board.getCell x y board of
                            Just (Filled color) ->
                                let
                                    connected =
                                        GameLogic.findConnectedPuyos x y color board

                                    newVisited =
                                        Set.union visited connected
                                in
                                if Set.size connected >= 4 then
                                    findGroups rest newVisited (connected :: groups)

                                else
                                    findGroups rest newVisited groups

                            _ ->
                                findGroups rest visited groups
    in
    findGroups allPositions Set.empty []


-- MAIN


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }
