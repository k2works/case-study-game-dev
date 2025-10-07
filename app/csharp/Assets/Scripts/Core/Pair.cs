namespace PuyoPuyo.Core
{
    public class Pair
    {
        // 軸ぷよの位置と色
        public int AxisX { get; private set; }
        public int AxisY { get; private set; }
        public PuyoColor AxisColor { get; private set; }

        // 子ぷよの位置と色
        public int ChildX { get; private set; }
        public int ChildY { get; private set; }
        public PuyoColor ChildColor { get; private set; }

        // 回転状態（0: 上, 1: 右, 2: 下, 3: 左）
        private int rotation;

        public Pair(int axisX, int axisY, PuyoColor axisColor, PuyoColor childColor)
        {
            AxisX = axisX;
            AxisY = axisY;
            AxisColor = axisColor;
            ChildColor = childColor;
            rotation = 0; // 初期状態は子ぷよが上

            // 初期位置を計算
            UpdateChildPosition();
        }

        public void RotateRight()
        {
            rotation = (rotation + 1) % 4;
            UpdateChildPosition();
        }

        public void RotateLeft()
        {
            rotation = (rotation + 3) % 4; // -1 と同じ（モジュロ演算）
            UpdateChildPosition();
        }

        public bool IsCollision(Board board, int axisX, int axisY, int childX, int childY)
        {
            // 軸ぷよの範囲チェック
            if (!board.IsInBounds(axisY, axisX))
            {
                return true;
            }

            // 子ぷよの範囲チェック
            if (!board.IsInBounds(childY, childX))
            {
                return true;
            }

            // 軸ぷよの位置にぷよがあるかチェック
            if (board.Get(axisY, axisX) != PuyoColor.None)
            {
                return true;
            }

            // 子ぷよの位置にぷよがあるかチェック
            if (board.Get(childY, childX) != PuyoColor.None)
            {
                return true;
            }

            return false; // 衝突なし
        }

        private void UpdateChildPosition()
        {
            // 回転状態に応じて子ぷよの位置を計算
            switch (rotation)
            {
                case 0: // 上
                    ChildX = AxisX;
                    ChildY = AxisY - 1;
                    break;
                case 1: // 右
                    ChildX = AxisX + 1;
                    ChildY = AxisY;
                    break;
                case 2: // 下
                    ChildX = AxisX;
                    ChildY = AxisY + 1;
                    break;
                case 3: // 左
                    ChildX = AxisX - 1;
                    ChildY = AxisY;
                    break;
            }
        }
    }
}
