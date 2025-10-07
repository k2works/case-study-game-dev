module PuyoPair exposing
    ( PuyoPair
    , Position
    , create
    , getPositions
    )

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
