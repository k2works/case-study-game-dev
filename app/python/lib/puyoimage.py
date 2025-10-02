"""ぷよ画像管理クラス"""

import pyxel

from lib.config import Config


class PuyoImage:
    """ぷよの画像を管理するクラス"""

    # Pyxel 16色パレットを使用
    COLORS = [
        1,  # 0: 空 (ダークブルー)
        8,  # 1: 赤
        11,  # 2: 緑
        12,  # 3: 青
        10,  # 4: 黄色
    ]

    def __init__(self, config: Config) -> None:
        """ぷよ画像の初期化

        Args:
            config: ゲーム設定
        """
        self.config = config

    def draw(self, x: int, y: int, puyo_type: int) -> None:
        """ぷよを描画

        Args:
            x: X座標(グリッド単位)
            y: Y座標(グリッド単位)
            puyo_type: ぷよの種類(0-4)
        """
        size = self.config.puyo_size
        color = (
            self.COLORS[puyo_type]
            if 0 <= puyo_type < len(self.COLORS)
            else self.COLORS[0]
        )

        # 円の中心座標と半径を計算
        center_x = x * size + size // 2
        center_y = y * size + size // 2
        radius = size // 2 - 2  # 少し小さめにして余白を作る

        # ぷよを円形で描画
        pyxel.circ(center_x, center_y, radius, color)

        # 枠線を描画(黒)
        pyxel.circb(center_x, center_y, radius, 0)
