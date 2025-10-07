module Board exposing
    ( Board
    , Cols
    , Rows
    , create
    , getCell
    , setCell
    )

import Array exposing (Array)
import Cell exposing (Cell(..))


type alias Cols =
    Int


type alias Rows =
    Int


type alias Board =
    { cols : Cols
    , rows : Rows
    , cells : Array (Array Cell)
    }


-- ボードを作成する
create : Cols -> Rows -> Board
create cols rows =
    { cols = cols
    , rows = rows
    , cells = Array.repeat rows (Array.repeat cols Empty)
    }


-- セルを取得する
getCell : Int -> Int -> Board -> Maybe Cell
getCell x y board =
    if x >= 0 && x < board.cols && y >= 0 && y < board.rows then
        Array.get y board.cells
            |> Maybe.andThen (Array.get x)

    else
        Nothing


-- セルを設定する
setCell : Int -> Int -> Cell -> Board -> Board
setCell x y cell board =
    if x >= 0 && x < board.cols && y >= 0 && y < board.rows then
        let
            newRow =
                Array.get y board.cells
                    |> Maybe.map (\row -> Array.set x cell row)
                    |> Maybe.withDefault (Array.repeat board.cols Empty)

            newCells =
                Array.set y newRow board.cells
        in
        { board | cells = newCells }

    else
        board
