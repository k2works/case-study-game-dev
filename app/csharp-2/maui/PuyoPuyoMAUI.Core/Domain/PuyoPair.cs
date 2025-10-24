namespace PuyoPuyoMAUI.Domain;

/// <summary>
/// ぷよペア
/// </summary>
public sealed record PuyoPair
{
    /// <summary>
    /// X 座標（軸ぷよ）
    /// </summary>
    public int X { get; init; }

    /// <summary>
    /// Y 座標（軸ぷよ）
    /// </summary>
    public int Y { get; init; }

    /// <summary>
    /// 軸ぷよの色
    /// </summary>
    public PuyoColor Puyo1Color { get; init; }

    /// <summary>
    /// 2 つ目のぷよの色
    /// </summary>
    public PuyoColor Puyo2Color { get; init; }

    /// <summary>
    /// 回転状態 (0: 上, 1: 右, 2: 下, 3: 左)
    /// </summary>
    public int Rotation { get; init; }

    public PuyoPair(int x, int y, PuyoColor puyo1Color, PuyoColor puyo2Color, int rotation)
    {
        X = x;
        Y = y;
        Puyo1Color = puyo1Color;
        Puyo2Color = puyo2Color;
        Rotation = rotation;
    }

    /// <summary>
    /// ぷよペアの各ぷよの位置を取得
    /// </summary>
    public ((int X, int Y) Pos1, (int X, int Y) Pos2) GetPositions()
    {
        var pos1 = (X, Y);
        var pos2 = Rotation switch
        {
            0 => (X, Y - 1),      // 上
            1 => (X + 1, Y),      // 右
            2 => (X, Y + 1),      // 下
            3 => (X - 1, Y),      // 左
            _ => (X, Y - 1)       // デフォルトは上
        };
        return (pos1, pos2);
    }

    /// <summary>
    /// ランダムなぷよペアを生成
    /// </summary>
    public static PuyoPair CreateRandom(int x, int y, int rotation)
    {
        var random = Random.Shared;
        var colors = new[] { PuyoColor.Red, PuyoColor.Green, PuyoColor.Blue, PuyoColor.Yellow };
        var color1 = colors[random.Next(colors.Length)];
        var color2 = colors[random.Next(colors.Length)];
        return new PuyoPair(x, y, color1, color2, rotation);
    }
}
