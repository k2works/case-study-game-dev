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

// 位置が有効かチェック（Y < 0 は画面上部の出現エリアとして許可）
let private isValidPosition (board: Board) (x: int) (y: int) : bool =
    if y < 0 then
        // 画面上部（Y < 0）は横の範囲だけチェック
        x >= 0 && x < 6
    else
        // 通常エリアは空セルかチェック
        x >= 0 && x < 6 && y < 12 && getCellColor x y board = Empty

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

// ぷよペアが配置可能かチェック
let private canPlacePuyoPair (board: Board) (pair: PuyoPair) : bool =
    isValidPosition board pair.AxisPosition.X pair.AxisPosition.Y
    && isValidPosition board pair.ChildPosition.X pair.ChildPosition.Y

// ぷよペアを回転（壁キック処理付き）
let tryRotatePuyoPair (board: Board) (pair: PuyoPair) : PuyoPair option =
    // 通常回転を試す
    let rotated = PuyoPair.rotateClockwise pair

    if canPlacePuyoPair board rotated then
        Some rotated
    else
        // 壁キックを試す（左に1マス）
        let kickedLeft =
            { rotated with
                AxisPosition =
                    { rotated.AxisPosition with
                        X = rotated.AxisPosition.X - 1 }
                ChildPosition =
                    { rotated.ChildPosition with
                        X = rotated.ChildPosition.X - 1 } }

        if canPlacePuyoPair board kickedLeft then
            Some kickedLeft
        else
            // 壁キックを試す（右に1マス）
            let kickedRight =
                { rotated with
                    AxisPosition =
                        { rotated.AxisPosition with
                            X = rotated.AxisPosition.X + 1 }
                    ChildPosition =
                        { rotated.ChildPosition with
                            X = rotated.ChildPosition.X + 1 } }

            if canPlacePuyoPair board kickedRight then
                Some kickedRight
            else
                // 回転できない
                None
