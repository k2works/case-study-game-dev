namespace PuyoPuyo.Domain

/// ぷよペア
type PuyoPair =
    { X: int
      Y: int
      Puyo1Color: PuyoColor // 軸ぷよ
      Puyo2Color: PuyoColor // 2つ目のぷよ
      Rotation: int } // 0: 上, 1: 右, 2: 下, 3: 左

module PuyoPair =
    /// ぷよペアを作成
    let create (x: int) (y: int) (color1: PuyoColor) (color2: PuyoColor) (rotation: int) : PuyoPair =
        { X = x
          Y = y
          Puyo1Color = color1
          Puyo2Color = color2
          Rotation = rotation }

    /// ぷよペアの各ぷよの位置を取得
    let getPositions (pair: PuyoPair) : (int * int) * (int * int) =
        let pos1 = (pair.X, pair.Y)

        let pos2 =
            match pair.Rotation with
            | 0 -> (pair.X, pair.Y - 1) // 上
            | 1 -> (pair.X + 1, pair.Y) // 右
            | 2 -> (pair.X, pair.Y + 1) // 下
            | 3 -> (pair.X - 1, pair.Y) // 左
            | _ -> (pair.X, pair.Y - 1) // デフォルトは上

        (pos1, pos2)

    /// ランダムなぷよペアを生成
    let createRandom (x: int) (y: int) (rotation: int) : PuyoPair =
        let random = System.Random()
        let colors = [| Red; Green; Blue; Yellow |]
        let color1 = colors.[random.Next(colors.Length)]
        let color2 = colors.[random.Next(colors.Length)]
        create x y color1 color2 rotation
