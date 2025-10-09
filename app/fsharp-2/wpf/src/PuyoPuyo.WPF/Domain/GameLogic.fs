namespace PuyoPuyo.Domain

/// 移動方向
type Direction =
    | Left
    | Right
    | Down

module GameLogic =
    /// ぷよペアをボードに固定
    let fixPuyoPair (board: Board) (pair: PuyoPair) : Board =
        let (pos1, pos2) = PuyoPair.getPositions pair
        let (x1, y1) = pos1
        let (x2, y2) = pos2

        board
        |> Board.setCell x1 y1 (Filled pair.Puyo1Color)
        |> Board.setCell x2 y2 (Filled pair.Puyo2Color)

    /// ぷよペアが指定位置に配置可能かチェック
    let private isValidPosition (board: Board) (x: int) (y: int) : bool =
        y >= 0
        && y < board.Rows
        && x >= 0
        && x < board.Cols
        && Board.getCell board x y = Empty

    /// ぷよペアが配置可能かチェック
    let canPlacePuyoPair (board: Board) (pair: PuyoPair) : bool =
        let (pos1, pos2) = PuyoPair.getPositions pair
        let (x1, y1) = pos1
        let (x2, y2) = pos2
        isValidPosition board x1 y1 && isValidPosition board x2 y2

    /// ぷよペアを指定方向に移動（可能な場合のみ）
    let tryMovePuyoPair (board: Board) (pair: PuyoPair) (direction: Direction) : PuyoPair option =
        let (dx, dy) =
            match direction with
            | Left -> (-1, 0)
            | Right -> (1, 0)
            | Down -> (0, 1)

        let newPair =
            { pair with
                X = pair.X + dx
                Y = pair.Y + dy }

        if canPlacePuyoPair board newPair then
            Some newPair
        else
            None

    /// ぷよペアを回転（壁キック処理を含む）
    let tryRotatePuyoPair (board: Board) (pair: PuyoPair) : PuyoPair option =
        // 時計回りに回転
        let rotated = PuyoPair.rotateClockwise pair

        // 回転後の位置が有効かチェック
        if canPlacePuyoPair board rotated then
            Some rotated
        else
            // 壁キック: 左に1マスずらして試行
            let kickedLeft = { rotated with X = rotated.X - 1 }

            if canPlacePuyoPair board kickedLeft then
                Some kickedLeft
            else
                // 壁キック: 右に1マスずらして試行
                let kickedRight = { rotated with X = rotated.X + 1 }

                if canPlacePuyoPair board kickedRight then
                    Some kickedRight
                else
                    None // 回転不可

    /// ゲームオーバー判定（新しいぷよを配置できるかチェック）
    let checkGameOver (board: Board) (newPiece: PuyoPair) : bool =
        // 新しいぷよが配置できない場合はゲームオーバー
        not (canPlacePuyoPair board newPiece)
