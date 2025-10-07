module Cell exposing (Cell(..))

import PuyoColor exposing (PuyoColor)


type Cell
    = Empty
    | Filled PuyoColor
