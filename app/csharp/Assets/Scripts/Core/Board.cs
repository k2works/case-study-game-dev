namespace PuyoPuyo.Core
{
    public class Board
    {
        public const int COLS = 6;
        public const int ROWS = 12;

        private PuyoColor[,] cells;

        public int Cols => COLS;
        public int Rows => ROWS;

        public Board()
        {
            cells = new PuyoColor[ROWS, COLS];
            Clear();
        }

        public PuyoColor Get(int row, int col)
        {
            return cells[row, col];
        }

        public void Set(int row, int col, PuyoColor color)
        {
            cells[row, col] = color;
        }

        public void Clear()
        {
            for (int row = 0; row < ROWS; row++)
            {
                for (int col = 0; col < COLS; col++)
                {
                    cells[row, col] = PuyoColor.None;
                }
            }
        }

        public bool IsInBounds(int row, int col)
        {
            return row >= 0 && row < ROWS && col >= 0 && col < COLS;
        }
    }
}
