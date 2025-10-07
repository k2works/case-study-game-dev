module PuyoPair exposing
    ( PuyoPair
    , Position
    , canMove
    , create
    , getPositions
    , moveLeft
    , moveRight
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
    }


-- ぷよペアを作成する
create : Int -> Int -> PuyoColor -> PuyoColor -> PuyoPair
create x y axisColor childColor =
    { axis = { x = x, y = y }
    , child = { x = x, y = y - 1 }
    , axisColor = axisColor
    , childColor = childColor
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
