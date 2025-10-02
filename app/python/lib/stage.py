"""ステージ管理クラス"""

from lib.config import Config
from lib.puyoimage import PuyoImage


class Stage:
    """ゲームステージ（盤面）を管理するクラス"""

    def __init__(self, config: Config, puyo_image: PuyoImage) -> None:
        """ステージの初期化

        Args:
            config: ゲーム設定
            puyo_image: ぷよ画像
        """
        self.config = config
        self.puyo_image = puyo_image
        self.field: list[list[int]] = []
        self._initialize_field()

    def _initialize_field(self) -> None:
        """フィールドを初期化(全て0=空)"""
        self.field = []
        for _ in range(self.config.stage_rows):
            row = []
            for _ in range(self.config.stage_cols):
                row.append(0)
            self.field.append(row)

    def draw(self) -> None:
        """ステージとフィールドのぷよを描画"""
        import pyxel

        # グリッド線を描画
        size = self.config.puyo_size
        for y in range(self.config.stage_rows + 1):
            # 横線
            pyxel.line(
                0,
                y * size,
                self.config.stage_cols * size,
                y * size,
                self.config.stage_border_color,
            )

        for x in range(self.config.stage_cols + 1):
            # 縦線
            pyxel.line(
                x * size,
                0,
                x * size,
                self.config.stage_rows * size,
                self.config.stage_border_color,
            )

        # フィールドのぷよを描画
        for y in range(self.config.stage_rows):
            for x in range(self.config.stage_cols):
                puyo_type = self.field[y][x]
                if puyo_type > 0:
                    self.puyo_image.draw(x, y, puyo_type)

    def draw_puyo(self, x: int, y: int, puyo_type: int) -> None:
        """指定位置にぷよを描画

        Args:
            x: X座標
            y: Y座標
            puyo_type: ぷよの種類
        """
        self.puyo_image.draw(x, y, puyo_type)

    def set_puyo(self, x: int, y: int, puyo_type: int) -> None:
        """フィールドにぷよを配置

        Args:
            x: X座標
            y: Y座標
            puyo_type: ぷよの種類
        """
        if 0 <= y < self.config.stage_rows and 0 <= x < self.config.stage_cols:
            self.field[y][x] = puyo_type

    def get_puyo(self, x: int, y: int) -> int:
        """フィールドからぷよの種類を取得

        Args:
            x: X座標
            y: Y座標

        Returns:
            ぷよの種類(-1: 範囲外, 0: 空, 1-4: ぷよ)
        """
        if y < 0 or y >= self.config.stage_rows or x < 0 or x >= self.config.stage_cols:
            return -1  # 範囲外
        return self.field[y][x]

    def apply_gravity(self) -> bool:
        """ステージ上のぷよに重力を適用

        Returns:
            落下したぷよがあれば True
        """
        has_fallen = False

        # フィールドのコピーを作成（移動前の状態を保存）
        old_field = [row[:] for row in self.field]

        # 下から上に向かって各列をスキャン
        for x in range(self.config.stage_cols):
            for y in range(self.config.stage_rows - 2, -1, -1):
                # ぷよがあり、かつ下が空の場合
                if old_field[y][x] > 0 and old_field[y + 1][x] == 0:
                    # 1マス下に移動
                    self.field[y + 1][x] = old_field[y][x]
                    self.field[y][x] = 0
                    has_fallen = True

        return has_fallen
