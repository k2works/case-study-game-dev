module Board exposing
    ( Board
    , allCellsEmpty
    , createEmpty
    , getCell
    , hasPuyo
    , height
    , isPerfectClear
    , isValidPosition
    , setCell
    , toList
    , width
    )

import Array exposing (Array)
import Types exposing (..)


-- ボード（外部に実装を隠蔽）
type Board
    = Board
        { width : Int
        , height : Int
        , cells : Array (Array Cell)
        }


-- 空のゲームボードを作成
createEmpty : Board
createEmpty =
    Board
        { width = 8
        , height = 12
        , cells = Array.repeat 12 (Array.repeat 8 Empty)
        }


-- ボードの幅を取得
width : Board -> Int
width (Board board) =
    board.width


-- ボードの高さを取得
height : Board -> Int
height (Board board) =
    board.height


-- ボードをリストに変換
toList : Board -> List (List Cell)
toList (Board board) =
    board.cells
        |> Array.toList
        |> List.map Array.toList


-- 座標が有効な範囲内かチェック
isValidPosition : Board -> Position -> Bool
isValidPosition (Board board) pos =
    pos.x >= 0 && pos.x < board.width && pos.y >= 0 && pos.y < board.height


-- 指定位置のセルを取得
getCell : Board -> Position -> Maybe Cell
getCell (Board board) pos =
    if isValidPosition (Board board) pos then
        board.cells
            |> Array.get pos.y
            |> Maybe.andThen (Array.get pos.x)

    else
        Nothing


-- 指定位置にぷよがあるかチェック
hasPuyo : Board -> Position -> Bool
hasPuyo board pos =
    case getCell board pos of
        Just (Filled _) ->
            True

        _ ->
            False


-- 指定位置のセルを更新（不変）
setCell : Board -> Position -> Cell -> Board
setCell (Board board) pos cell =
    if not (isValidPosition (Board board) pos) then
        Board board

    else
        let
            updatedRow =
                board.cells
                    |> Array.get pos.y
                    |> Maybe.map (Array.set pos.x cell)

            updatedCells =
                case updatedRow of
                    Just row ->
                        Array.set pos.y row board.cells

                    Nothing ->
                        board.cells
        in
        Board { board | cells = updatedCells }


-- 全消し判定
isPerfectClear : Board -> Bool
isPerfectClear board =
    allCellsEmpty board


-- 全セルが空かチェック
allCellsEmpty : Board -> Bool
allCellsEmpty (Board board) =
    board.cells
        |> Array.toList
        |> List.all
            (\row ->
                row
                    |> Array.toList
                    |> List.all (\c -> c == Empty)
            )
