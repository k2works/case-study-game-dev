module Puyo exposing
    ( getPuyoPairPositions
    , randomPuyoPair
    , rotatePuyoPair
    , spawnNewPuyoPair
    )

import Random exposing (Generator)
import Types exposing (..)


-- 組ぷよを時計回りに90度回転
rotatePuyoPair : PuyoPair -> PuyoPair
rotatePuyoPair pair =
    let
        nextRotation =
            case pair.rotation of
                Deg0 ->
                    Deg90

                Deg90 ->
                    Deg180

                Deg180 ->
                    Deg270

                Deg270 ->
                    Deg0
    in
    { pair | rotation = nextRotation }


-- 組ぷよの2つのぷよの実際の座標を計算
getPuyoPairPositions : PuyoPair -> ( Position, Position )
getPuyoPairPositions pair =
    let
        basePos =
            pair.basePosition

        pos1 =
            basePos

        pos2 =
            case pair.rotation of
                Deg0 ->
                    -- 縦（上下）
                    { x = basePos.x, y = basePos.y + 1 }

                Deg90 ->
                    -- 右（左右）
                    { x = basePos.x + 1, y = basePos.y }

                Deg180 ->
                    -- 逆縦（下上）
                    { x = basePos.x, y = basePos.y - 1 }

                Deg270 ->
                    -- 左（右左）
                    { x = basePos.x - 1, y = basePos.y }
    in
    ( pos1, pos2 )


-- ランダムな色を生成
randomColor : Generator Color
randomColor =
    Random.uniform Red [ Green, Blue, Yellow, Purple ]


-- ランダムな組ぷよを生成
randomPuyoPair : Int -> Int -> Generator PuyoPair
randomPuyoPair x y =
    Random.map2
        (\color1 color2 ->
            { puyo1Color = color1
            , puyo2Color = color2
            , basePosition = { x = x, y = y }
            , rotation = Deg0
            }
        )
        randomColor
        randomColor


-- 新しい組ぷよを画面上部に生成
spawnNewPuyoPair : Generator PuyoPair
spawnNewPuyoPair =
    randomPuyoPair 3 0
