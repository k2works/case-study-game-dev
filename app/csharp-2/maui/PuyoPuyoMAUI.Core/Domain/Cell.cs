namespace PuyoPuyoMAUI.Domain;

/// <summary>
/// ボードのセルの状態
/// </summary>
public abstract record Cell
{
    /// <summary>
    /// 空のセル
    /// </summary>
    public static Cell Empty { get; } = new EmptyCell();

    /// <summary>
    /// ぷよで埋まったセルを作成
    /// </summary>
    public static Cell Filled(PuyoColor color) => new FilledCell(color);

    /// <summary>
    /// セルが空かどうか
    /// </summary>
    public abstract bool IsEmpty { get; }

    /// <summary>
    /// セルが埋まっているかどうか
    /// </summary>
    public bool IsFilled => !IsEmpty;

    /// <summary>
    /// セルの色（埋まっている場合のみ）
    /// </summary>
    public abstract PuyoColor Color { get; }

    private sealed record EmptyCell : Cell
    {
        public override bool IsEmpty => true;

        public override PuyoColor Color => throw new InvalidOperationException("空のセルには色がありません");
    }

    private sealed record FilledCell(PuyoColor PuyoColor) : Cell
    {
        public override bool IsEmpty => false;

        public override PuyoColor Color => PuyoColor;
    }
}
