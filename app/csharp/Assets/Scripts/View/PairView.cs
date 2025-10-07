using UnityEngine;
using UnityEngine.UI;
using PuyoPuyo.Core;

namespace PuyoPuyo.View
{
    /// <summary>
    /// 操作中の Pair を視覚的に表示するコンポーネント
    /// </summary>
    public class PairView : MonoBehaviour
    {
        [SerializeField] private float cellSize = 50f;
        [SerializeField] private float spacing = 2f;

        private Pair pair;
        private Image axisImage;
        private Image childImage;
        private BoardView boardView;

        public void Initialize(Pair pair, BoardView boardView)
        {
            this.pair = pair;
            this.boardView = boardView;
            CreatePairImages();
        }

        private void CreatePairImages()
        {
            // 軸ぷよ
            GameObject axisObj = new GameObject("AxisPuyo");
            axisObj.transform.SetParent(transform);
            RectTransform axisRect = axisObj.AddComponent<RectTransform>();
            axisRect.sizeDelta = new Vector2(cellSize, cellSize);
            axisImage = axisObj.AddComponent<Image>();
            axisImage.sprite = SpriteUtility.GetCircleSprite(); // 円形スプライトを設定

            // 子ぷよ
            GameObject childObj = new GameObject("ChildPuyo");
            childObj.transform.SetParent(transform);
            RectTransform childRect = childObj.AddComponent<RectTransform>();
            childRect.sizeDelta = new Vector2(cellSize, cellSize);
            childImage = childObj.AddComponent<Image>();
            childImage.sprite = SpriteUtility.GetCircleSprite(); // 円形スプライトを設定
        }

        private void Update()
        {
            if (pair == null || axisImage == null || childImage == null) return;

            // 位置を更新
            UpdatePuyoPosition(axisImage, pair.AxisX, pair.AxisY);
            UpdatePuyoPosition(childImage, pair.ChildX, pair.ChildY);

            // 色を更新
            axisImage.color = GetColorFromPuyoColor(pair.AxisColor);
            childImage.color = GetColorFromPuyoColor(pair.ChildColor);
        }

        private void UpdatePuyoPosition(Image image, int x, int y)
        {
            RectTransform rect = image.GetComponent<RectTransform>();
            float posX = x * (cellSize + spacing);
            float posY = -y * (cellSize + spacing);
            rect.anchoredPosition = new Vector2(posX, posY);
        }

        private Color GetColorFromPuyoColor(PuyoColor puyoColor)
        {
            switch (puyoColor)
            {
                case PuyoColor.Red:
                    return new Color(1f, 0.2f, 0.2f);
                case PuyoColor.Blue:
                    return new Color(0.2f, 0.4f, 1f);
                case PuyoColor.Green:
                    return new Color(0.2f, 1f, 0.2f);
                case PuyoColor.Yellow:
                    return new Color(1f, 1f, 0.2f);
                default:
                    return Color.white;
            }
        }

        public void SetPair(Pair newPair)
        {
            pair = newPair;
        }
    }
}
