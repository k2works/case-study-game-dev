"""ステージ管理クラス"""

from typing import TypedDict

from lib.config import Config
from lib.puyoimage import PuyoImage


class ErasePosition(TypedDict):
    """消去位置情報"""

    x: int
    y: int
    type: int


class EraseInfo(TypedDict):
    """消去情報"""

    erase_puyo_count: int
    erase_info: list[ErasePosition]


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

    def check_erase(self) -> EraseInfo:
        """消去判定を行う

        Returns:
            EraseInfo: 消去情報
        """
        # 消去情報
        erase_info: EraseInfo = {"erase_puyo_count": 0, "erase_info": []}

        # 一時的なチェック用ボード
        checked: list[list[bool]] = [
            [False for _ in range(self.config.stage_cols)]
            for _ in range(self.config.stage_rows)
        ]

        # 全マスをチェック
        for y in range(self.config.stage_rows):
            for x in range(self.config.stage_cols):
                # ぷよがあり、まだチェックしていない場合
                if self.field[y][x] != 0 and not checked[y][x]:
                    # 接続しているぷよを探索
                    puyo_type = self.field[y][x]
                    connected: list[tuple[int, int]] = []
                    self._search_connected_puyo(x, y, puyo_type, checked, connected)

                    # 4つ以上つながっている場合は消去対象
                    if len(connected) >= 4:
                        for puyo_x, puyo_y in connected:
                            erase_info["erase_info"].append(
                                {"x": puyo_x, "y": puyo_y, "type": puyo_type}
                            )
                        erase_info["erase_puyo_count"] += len(connected)

        return erase_info

    def _search_connected_puyo(
        self,
        start_x: int,
        start_y: int,
        puyo_type: int,
        checked: list[list[bool]],
        connected: list[tuple[int, int]],
    ) -> None:
        """接続しているぷよを探索（深さ優先探索）

        Args:
            start_x: 探索開始X座標
            start_y: 探索開始Y座標
            puyo_type: 探索するぷよの種類
            checked: チェック済みフラグの2次元配列
            connected: 接続しているぷよの座標リスト
        """
        # 探索済みにする
        checked[start_y][start_x] = True
        connected.append((start_x, start_y))

        # 4方向を探索
        directions = [
            (1, 0),  # 右
            (-1, 0),  # 左
            (0, 1),  # 下
            (0, -1),  # 上
        ]

        for dx, dy in directions:
            next_x = start_x + dx
            next_y = start_y + dy

            # 範囲内かつ未チェックかつ同じ種類のぷよの場合、再帰的に探索
            if (
                0 <= next_x < self.config.stage_cols
                and 0 <= next_y < self.config.stage_rows
                and not checked[next_y][next_x]
                and self.field[next_y][next_x] == puyo_type
            ):
                self._search_connected_puyo(
                    next_x, next_y, puyo_type, checked, connected
                )

    def erase_boards(self, erase_info: list[ErasePosition]) -> None:
        """消去対象のぷよを消去

        Args:
            erase_info: 消去するぷよの位置情報リスト
        """
        # 消去対象のぷよを消去
        for info in erase_info:
            self.field[info["y"]][info["x"]] = 0

    def check_zenkeshi(self) -> bool:
        """全消し判定を行う

        Returns:
            盤面上にぷよが一つも残っていない場合は True
        """
        # フィールド内のすべてのマスをチェック
        for y in range(self.config.stage_rows):
            for x in range(self.config.stage_cols):
                # ぷよがあれば全消しではない
                if self.field[y][x] != 0:
                    return False

        # すべてのマスが空なら全消し
        return True
