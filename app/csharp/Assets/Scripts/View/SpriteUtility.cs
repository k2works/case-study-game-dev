using UnityEngine;

namespace PuyoPuyo.View
{
    /// <summary>
    /// スプライト生成ユーティリティ
    /// </summary>
    public static class SpriteUtility
    {
        private static Sprite circleSprite;

        /// <summary>
        /// 円形のスプライトを取得（キャッシュ）
        /// </summary>
        public static Sprite GetCircleSprite()
        {
            if (circleSprite == null)
            {
                circleSprite = CreateCircleSprite(128);
            }
            return circleSprite;
        }

        /// <summary>
        /// 円形のスプライトを生成
        /// </summary>
        private static Sprite CreateCircleSprite(int size)
        {
            Texture2D texture = new Texture2D(size, size, TextureFormat.RGBA32, false);
            texture.filterMode = FilterMode.Bilinear;

            int center = size / 2;
            float radius = size / 2f;

            for (int y = 0; y < size; y++)
            {
                for (int x = 0; x < size; x++)
                {
                    float dx = x - center;
                    float dy = y - center;
                    float distance = Mathf.Sqrt(dx * dx + dy * dy);

                    // アンチエイリアシングのために少しぼかす
                    float alpha = 1f - Mathf.Clamp01((distance - radius + 1f));

                    texture.SetPixel(x, y, new Color(1f, 1f, 1f, alpha));
                }
            }

            texture.Apply();

            return Sprite.Create(
                texture,
                new Rect(0, 0, size, size),
                new Vector2(0.5f, 0.5f),
                100f
            );
        }
    }
}
