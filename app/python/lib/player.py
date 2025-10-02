"""プレイヤー操作管理クラス"""

import random

import pyxel

from lib.config import Config
from lib.puyoimage import PuyoImage
from lib.stage import Stage


class Player:
    """プレイヤーの入力と操作を管理するクラス"""

    # 定数定義
    INITIAL_PUYO_X = 2  # ぷよの初期X座標(中央)
    INITIAL_PUYO_Y = 0  # ぷよの初期Y座標(一番上)
    MIN_PUYO_TYPE = 1  # ぷよの種類の最小値
    MAX_PUYO_TYPE = 4  # ぷよの種類の最大値

    def __init__(self, config: Config, stage: Stage, puyo_image: PuyoImage) -> None:
        """プレイヤーの初期化

        Args:
            config: ゲーム設定
            stage: ステージ
            puyo_image: ぷよ画像
        """
        self.config = config
        self.stage = stage
        self.puyo_image = puyo_image

        # キー入力フラグ
        self.input_key_left: bool = False
        self.input_key_right: bool = False
        self.input_key_up: bool = False
        self.input_key_down: bool = False

        # ぷよの状態
        self.puyo_x: int = self.INITIAL_PUYO_X  # ぷよのX座標
        self.puyo_y: int = self.INITIAL_PUYO_Y  # ぷよのY座標
        self.puyo_type: int = 0  # 現在のぷよの種類
        self.next_puyo_type: int = 0  # 次のぷよの種類
        self.rotation: int = 0  # 現在の回転状態

    def update_input(self) -> None:
        """キー入力状態を更新"""
        # Pyxelのキー入力をチェック
        self.input_key_left = pyxel.btn(pyxel.KEY_LEFT)
        self.input_key_right = pyxel.btn(pyxel.KEY_RIGHT)
        self.input_key_up = pyxel.btn(pyxel.KEY_UP)
        self.input_key_down = pyxel.btn(pyxel.KEY_DOWN)

    def create_new_puyo(self) -> None:
        """新しいぷよを作成"""
        self.puyo_x = self.INITIAL_PUYO_X
        self.puyo_y = self.INITIAL_PUYO_Y
        self.puyo_type = self._get_random_puyo_type()
        self.next_puyo_type = self._get_random_puyo_type()
        self.rotation = 0

    def _get_random_puyo_type(self) -> int:
        """ランダムなぷよの種類を生成"""
        return random.randint(self.MIN_PUYO_TYPE, self.MAX_PUYO_TYPE)

    def move_left(self) -> None:
        """左に移動"""
        # 左端でなければ左に移動
        if self.puyo_x > 0:
            self.puyo_x -= 1

    def move_right(self) -> None:
        """右に移動"""
        # 右端でなければ右に移動
        if self.puyo_x < self.config.stage_cols - 1:
            self.puyo_x += 1

    def rotate_right(self) -> None:
        """時計回りに回転(0→1→2→3→0)"""
        # 回転状態を1増やす
        self.rotation = (self.rotation + 1) % 4

        # 壁キック: 右端で右回転（rotation=1）すると左に移動
        if self.rotation == 1 and self.puyo_x == self.config.stage_cols - 1:
            self.puyo_x -= 1

        # 壁キック: 左端で下回転（rotation=3）すると右に移動
        if self.rotation == 3 and self.puyo_x == 0:
            self.puyo_x += 1

    def rotate_left(self) -> None:
        """反時計回りに回転(0→3→2→1→0)"""
        # 回転状態を1減らす（+3は-1と同じ mod 4）
        self.rotation = (self.rotation + 3) % 4

        # 壁キック: 右端で右回転（rotation=1）すると左に移動
        if self.rotation == 1 and self.puyo_x == self.config.stage_cols - 1:
            self.puyo_x -= 1

        # 壁キック: 左端で下回転（rotation=3）すると右に移動
        if self.rotation == 3 and self.puyo_x == 0:
            self.puyo_x += 1

    def draw(self) -> None:
        """現在のぷよを描画（1つ目と2つ目）"""
        # 1つ目のぷよを描画
        self.stage.draw_puyo(self.puyo_x, self.puyo_y, self.puyo_type)

        # 回転状態に応じて2つ目のぷよの位置を計算
        second_x = self.puyo_x
        second_y = self.puyo_y

        if self.rotation == 0:  # 上
            second_y = self.puyo_y - 1
        elif self.rotation == 1:  # 右
            second_x = self.puyo_x + 1
        elif self.rotation == 2:  # 下
            second_y = self.puyo_y + 1
        elif self.rotation == 3:  # 左
            second_x = self.puyo_x - 1

        # 2つ目のぷよを描画
        self.stage.draw_puyo(second_x, second_y, self.next_puyo_type)

    def update(self) -> None:
        """キー入力に応じて移動と回転"""
        # キー入力状態を更新
        self.update_input()

        # キー入力に応じて移動
        if self.input_key_left:
            self.move_left()
            self.input_key_left = False  # 移動後フラグをクリア

        if self.input_key_right:
            self.move_right()
            self.input_key_right = False  # 移動後フラグをクリア

        # キー入力に応じて回転
        if self.input_key_up:
            self.rotate_right()
            self.input_key_up = False  # 回転後フラグをクリア

        # Z キーで左回転
        if pyxel.btnp(pyxel.KEY_Z):
            self.rotate_left()
