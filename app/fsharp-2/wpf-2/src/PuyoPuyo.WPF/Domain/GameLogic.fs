module Domain.GameLogic

open Domain.Board
open Domain.Puyo
open Domain.PuyoPair
open Domain.Score

// ゲーム状態
type GameState =
    | NotStarted
    | Playing
    | Paused
    | GameOver

// 移動方向
type Direction =
    | Left
    | Right
    | Down

// 位置が有効かチェック
let private isValidPosition (board: Board) (x: int) (y: int) : bool =
    x >= 0 && x < 6 && y >= 0 && y < 12 && getCellColor x y board = Empty

// ぷよペアを指定方向に移動（可能な場合のみ）
let tryMovePuyoPair (board: Board) (pair: PuyoPair) (direction: Direction) : PuyoPair option =
    let (dx, dy) =
        match direction with
        | Left -> (-1, 0)
        | Right -> (1, 0)
        | Down -> (0, 1)

    let newAxisPos =
        { X = pair.AxisPosition.X + dx
          Y = pair.AxisPosition.Y + dy }

    let newChildPos =
        { X = pair.ChildPosition.X + dx
          Y = pair.ChildPosition.Y + dy }

    if
        isValidPosition board newAxisPos.X newAxisPos.Y
        && isValidPosition board newChildPos.X newChildPos.Y
    then
        Some
            { pair with
                AxisPosition = newAxisPos
                ChildPosition = newChildPos }
    else
        None
