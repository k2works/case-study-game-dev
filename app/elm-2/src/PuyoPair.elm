module PuyoPair exposing
    ( PuyoPair
    , Position
    , canMove
    , canMoveDown
    , create
    , getPositions
    , moveDown
    , moveLeft
    , moveRight
    , rotate
    , rotateWithKick
    )

import Board exposing (Board)
import Cell exposing (Cell(..))
import PuyoColor exposing (PuyoColor)


type alias Position =
    { x : Int, y : Int }


type alias PuyoPair =
    { axis : Position
    , child : Position
    , axisColor : PuyoColor
    , childColor : PuyoColor
    , rotation : Int
    }


-- ぷよペアを作成する
create : Int -> Int -> PuyoColor -> PuyoColor -> PuyoPair
create x y axisColor childColor =
    { axis = { x = x, y = y }
    , child = { x = x, y = y - 1 }
    , axisColor = axisColor
    , childColor = childColor
    , rotation = 0
    }


-- ぷよペアの位置を取得する
getPositions : PuyoPair -> ( Position, Position )
getPositions pair =
    ( pair.axis, pair.child )


-- 左に移動する
moveLeft : PuyoPair -> PuyoPair
moveLeft pair =
    { pair
        | axis = { x = pair.axis.x - 1, y = pair.axis.y }
        , child = { x = pair.child.x - 1, y = pair.child.y }
    }


-- 右に移動する
moveRight : PuyoPair -> PuyoPair
moveRight pair =
    { pair
        | axis = { x = pair.axis.x + 1, y = pair.axis.y }
        , child = { x = pair.child.x + 1, y = pair.child.y }
    }


-- 時計回りに回転する（90度）
rotate : PuyoPair -> PuyoPair
rotate pair =
    let
        newRotation =
            modBy 4 (pair.rotation + 1)

        childPos =
            getChildPosition pair.axis newRotation
    in
    { pair
        | rotation = newRotation
        , child = childPos
    }


-- 回転状態に応じた子ぷよの位置を計算
getChildPosition : Position -> Int -> Position
getChildPosition axis rotation =
    case rotation of
        0 ->
            -- 上
            { x = axis.x, y = axis.y - 1 }

        1 ->
            -- 右
            { x = axis.x + 1, y = axis.y }

        2 ->
            -- 下
            { x = axis.x, y = axis.y + 1 }

        _ ->
            -- 左（3）
            { x = axis.x - 1, y = axis.y }


-- 壁キック付き回転
rotateWithKick : PuyoPair -> Board -> ( PuyoPair, Bool )
rotateWithKick pair board =
    let
        rotatedPair =
            rotate pair
    in
    if canMove rotatedPair board then
        -- 回転可能、壁キック不要
        ( rotatedPair, False )

    else
        -- 壁キックを試みる
        tryWallKick rotatedPair board


-- 壁キックを試みる
tryWallKick : PuyoPair -> Board -> ( PuyoPair, Bool )
tryWallKick pair board =
    let
        -- 左に1マス移動
        leftKick =
            { pair | axis = { x = pair.axis.x - 1, y = pair.axis.y } }
                |> (\p -> { p | child = getChildPosition p.axis p.rotation })

        -- 右に1マス移動
        rightKick =
            { pair | axis = { x = pair.axis.x + 1, y = pair.axis.y } }
                |> (\p -> { p | child = getChildPosition p.axis p.rotation })
    in
    if canMove leftKick board then
        ( leftKick, True )

    else if canMove rightKick board then
        ( rightKick, True )

    else
        -- 壁キックも失敗、回転前の状態に戻す
        ( { pair | rotation = modBy 4 (pair.rotation - 1) }
            |> (\p -> { p | child = getChildPosition p.axis p.rotation })
        , False
        )


-- 下に移動する
moveDown : PuyoPair -> PuyoPair
moveDown pair =
    { pair
        | axis = { x = pair.axis.x, y = pair.axis.y + 1 }
        , child = { x = pair.child.x, y = pair.child.y + 1 }
    }


-- 下に移動可能かチェックする
canMoveDown : PuyoPair -> Board -> Bool
canMoveDown pair board =
    let
        nextAxisY =
            pair.axis.y + 1

        nextChildY =
            pair.child.y + 1

        -- ボードの高さ
        boardRows =
            board.rows

        -- 下端チェック
        isAxisOutOfBounds =
            nextAxisY >= boardRows

        isChildOutOfBounds =
            nextChildY >= boardRows

        -- 移動先のセルチェック
        axisCell =
            if isAxisOutOfBounds then
                Nothing

            else
                Board.getCell pair.axis.x nextAxisY board

        childCell =
            if isChildOutOfBounds then
                Nothing

            else
                Board.getCell pair.child.x nextChildY board
    in
    case ( axisCell, childCell ) of
        ( Just Empty, Just Empty ) ->
            True

        _ ->
            False


-- 移動可能かチェックする
canMove : PuyoPair -> Board -> Bool
canMove pair board =
    let
        axisCell =
            Board.getCell pair.axis.x pair.axis.y board

        childCell =
            Board.getCell pair.child.x pair.child.y board
    in
    case ( axisCell, childCell ) of
        ( Just Empty, Just Empty ) ->
            True

        _ ->
            False
