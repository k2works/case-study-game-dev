namespace PuyoPuyo.Domain

/// 移動方向
type Direction =
    | Left
    | Right
    | Down

module GameLogic =
    /// ぷよペアが指定位置に配置可能かチェック
    let private isValidPosition (board: Board) (x: int) (y: int) : bool =
        y >= 0 && y < board.Rows && x >= 0 && x < board.Cols && Board.getCell board x y = Empty

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

        let newPair = { pair with X = pair.X + dx; Y = pair.Y + dy }

        if canPlacePuyoPair board newPair then Some newPair else None
