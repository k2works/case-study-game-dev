using UnityEngine;
using UnityEngine.UI;
using PuyoPuyo.Core;

namespace PuyoPuyo.View
{
    /// <summary>
    /// Board の状態を視覚的に表示するコンポーネント
    /// </summary>
    public class BoardView : MonoBehaviour
    {
        [SerializeField] private GameObject cellPrefab;
        [SerializeField] private float cellSize = 50f;
        [SerializeField] private float spacing = 2f;

        private Board board;
        private Image[,] cellImages;

        public void Initialize(Board board)
        {
            this.board = board;
            CreateGrid();
        }

        private void CreateGrid()
        {
            cellImages = new Image[Board.ROWS, Board.COLS];

            for (int row = 0; row < Board.ROWS; row++)
            {
                for (int col = 0; col < Board.COLS; col++)
                {
                    // セルオブジェクトを作成
                    GameObject cell = new GameObject($"Cell_{row}_{col}");
                    cell.transform.SetParent(transform);

                    // RectTransform を設定
                    RectTransform rectTransform = cell.AddComponent<RectTransform>();
                    rectTransform.sizeDelta = new Vector2(cellSize, cellSize);

                    // 位置を設定（左上が原点）
                    float x = col * (cellSize + spacing);
                    float y = -row * (cellSize + spacing);
                    rectTransform.anchoredPosition = new Vector2(x, y);

                    // Image コンポーネントを追加
                    Image image = cell.AddComponent<Image>();
                    image.color = Color.gray; // デフォルトは灰色

                    cellImages[row, col] = image;
                }
            }
        }

        private void Update()
        {
            if (board == null || cellImages == null) return;

            // Board の状態を反映
            for (int row = 0; row < Board.ROWS; row++)
            {
                for (int col = 0; col < Board.COLS; col++)
                {
                    PuyoColor color = board.Get(row, col);
                    cellImages[row, col].color = GetColorFromPuyoColor(color);
                }
            }
        }

        private Color GetColorFromPuyoColor(PuyoColor puyoColor)
        {
            switch (puyoColor)
            {
                case PuyoColor.Red:
                    return new Color(1f, 0.2f, 0.2f); // 赤
                case PuyoColor.Blue:
                    return new Color(0.2f, 0.4f, 1f); // 青
                case PuyoColor.Green:
                    return new Color(0.2f, 1f, 0.2f); // 緑
                case PuyoColor.Yellow:
                    return new Color(1f, 1f, 0.2f); // 黄
                case PuyoColor.None:
                default:
                    return new Color(0.15f, 0.15f, 0.15f); // 黒っぽい灰色
            }
        }
    }
}
