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

        # 自由落下タイマー
        self.drop_timer: float = 0.0  # 落下タイマー（ミリ秒）
        self.drop_interval: float = 500.0  # 落下間隔（500ms = 0.5秒）

        # 着地フラグ
        self.landed: bool = False  # 着地したかどうか

    def update_input(self) -> None:
        """キー入力状態を更新"""
        try:
            # Pyxelのキー入力をチェック
            # 左右上: btnp（押された瞬間のみTrue）
            self.input_key_left = pyxel.btnp(pyxel.KEY_LEFT)
            self.input_key_right = pyxel.btnp(pyxel.KEY_RIGHT)
            self.input_key_up = pyxel.btnp(pyxel.KEY_UP)
            # 下: btn（押し続けている間ずっとTrue）高速落下用
            self.input_key_down = pyxel.btn(pyxel.KEY_DOWN)
        except:  # noqa: E722
            # Pyxelが初期化されていない場合（テスト環境など）はスキップ
            pass

    def create_new_puyo(self) -> None:
        """新しいぷよを作成"""
        self.puyo_x = self.INITIAL_PUYO_X
        self.puyo_y = self.INITIAL_PUYO_Y
        self.puyo_type = self._get_random_puyo_type()
        self.next_puyo_type = self._get_random_puyo_type()
        self.rotation = 0
        self.drop_timer = 0.0
        self.landed = False

    def _get_random_puyo_type(self) -> int:
        """ランダムなぷよの種類を生成"""
        return random.randint(self.MIN_PUYO_TYPE, self.MAX_PUYO_TYPE)

    def _can_move_to(self, new_x: int, new_y: int) -> bool:
        """指定位置に移動できるかチェック

        Args:
            new_x: 移動先のX座標
            new_y: 移動先のY座標

        Returns:
            移動できる場合は True
        """
        # 軸ぷよが移動できるかチェック
        puyo_at_new_pos = self.stage.get_puyo(new_x, new_y)
        # -1は範囲外、0は空、1以上はぷよがある
        if puyo_at_new_pos > 0:
            return False

        # 2つ目のぷよの位置を計算
        second_x = new_x
        second_y = new_y

        if self.rotation == 0:  # 上
            second_y = new_y - 1
        elif self.rotation == 1:  # 右
            second_x = new_x + 1
        elif self.rotation == 2:  # 下
            second_y = new_y + 1
        elif self.rotation == 3:  # 左
            second_x = new_x - 1

        # 2つ目のぷよが移動できるかチェック
        # 盤面外(-1)は有効として扱う
        puyo_at_second_pos = self.stage.get_puyo(second_x, second_y)
        if puyo_at_second_pos > 0:
            return False

        return True

    def _can_rotate_to(self, new_rotation: int) -> bool:
        """指定回転状態に回転できるかチェック

        Args:
            new_rotation: 回転後の回転状態

        Returns:
            回転できる場合は True
        """
        # 回転後の2つ目のぷよの位置を計算
        second_x = self.puyo_x
        second_y = self.puyo_y

        if new_rotation == 0:  # 上
            second_y = self.puyo_y - 1
        elif new_rotation == 1:  # 右
            second_x = self.puyo_x + 1
        elif new_rotation == 2:  # 下
            second_y = self.puyo_y + 1
        elif new_rotation == 3:  # 左
            second_x = self.puyo_x - 1

        # 2つ目のぷよが回転先に配置できるかチェック
        # 盤面外(-1)は有効として扱う
        puyo_at_second_pos = self.stage.get_puyo(second_x, second_y)
        if puyo_at_second_pos > 0:
            return False

        return True

    def move_left(self) -> None:
        """左に移動"""
        # 左端でなければ、かつ移動先に障害物がなければ左に移動
        if self.puyo_x > 0 and self._can_move_to(self.puyo_x - 1, self.puyo_y):
            self.puyo_x -= 1

    def move_right(self) -> None:
        """右に移動"""
        # 右端でなければ、かつ移動先に障害物がなければ右に移動
        if self.puyo_x < self.config.stage_cols - 1 and self._can_move_to(
            self.puyo_x + 1, self.puyo_y
        ):
            self.puyo_x += 1

    def rotate_right(self) -> None:
        """時計回りに回転(0→1→2→3→0)"""
        # 新しい回転状態を計算
        new_rotation = (self.rotation + 1) % 4

        # 回転できるかチェック
        if not self._can_rotate_to(new_rotation):
            return

        # 回転状態を更新
        self.rotation = new_rotation

        # 壁キック: 右端で右回転（rotation=1）すると左に移動
        if self.rotation == 1 and self.puyo_x == self.config.stage_cols - 1:
            self.puyo_x -= 1

        # 壁キック: 左端で下回転（rotation=3）すると右に移動
        if self.rotation == 3 and self.puyo_x == 0:
            self.puyo_x += 1

    def rotate_left(self) -> None:
        """反時計回りに回転(0→3→2→1→0)"""
        # 新しい回転状態を計算（+3は-1と同じ mod 4）
        new_rotation = (self.rotation + 3) % 4

        # 回転できるかチェック
        if not self._can_rotate_to(new_rotation):
            return

        # 回転状態を更新
        self.rotation = new_rotation

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
        try:
            if pyxel.btnp(pyxel.KEY_Z):
                self.rotate_left()
        except:  # noqa: E722
            # Pyxelが初期化されていない場合（テスト環境など）はスキップ
            pass

    def update_with_delta(self, delta_time: float) -> None:
        """時間経過に応じてぷよを更新（自由落下処理）

        Args:
            delta_time: 経過時間（ミリ秒）
        """
        # キー入力処理
        self.update()

        # 既に着地している場合は落下しない
        if self.landed:
            return

        # 落下タイマーを更新（高速落下の速度を反映）
        self.drop_timer += delta_time * self.get_drop_speed()

        # 落下間隔を超えたら落下処理
        if self.drop_timer >= self.drop_interval:
            self.drop_timer = 0.0

            # 下に移動できるかチェック
            if self._can_move_down():
                self.puyo_y += 1
            else:
                # 着地処理
                self._fix_to_stage()

    def _can_move_down(self) -> bool:
        """下に移動できるかチェック

        Returns:
            下に移動できる場合は True
        """
        # 下端チェック
        if self.puyo_y >= self.config.stage_rows - 1:
            return False

        # 軸ぷよの下にぷよがあるかチェック
        if self.stage.get_puyo(self.puyo_x, self.puyo_y + 1) > 0:
            return False

        # 2つ目のぷよの位置を計算
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

        # 2つ目のぷよが下に移動できるかチェック
        # 2つ目のぷよが上にある場合は軸ぷよと同時に落ちるのでチェック不要
        if self.rotation == 0:
            return True

        # 2つ目のぷよの下にぷよがあるかチェック
        if self.stage.get_puyo(second_x, second_y + 1) > 0:
            return False

        return True

    def _fix_to_stage(self) -> None:
        """着地したぷよをステージに固定"""
        # 軸ぷよを固定
        self.stage.set_puyo(self.puyo_x, self.puyo_y, self.puyo_type)

        # 2つ目のぷよの位置を計算
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

        # 2つ目のぷよを固定
        self.stage.set_puyo(second_x, second_y, self.next_puyo_type)

        # 着地フラグを立てる
        self.landed = True

    def has_landed(self) -> bool:
        """着地したかどうかを返す

        Returns:
            着地している場合は True
        """
        return self.landed

    def get_drop_speed(self) -> float:
        """落下速度を取得

        Returns:
            下キーが押されていれば10.0、そうでなければ1.0
        """
        return 10.0 if self.input_key_down else 1.0

    def move_down(self) -> bool:
        """下に移動

        Returns:
            移動できた場合は True、できなかった場合は False
        """
        if self._can_move_down():
            self.puyo_y += 1
            return True
        return False

    def check_game_over(self) -> bool:
        """ゲームオーバー判定を行う

        Returns:
            ゲームオーバーの場合は True
        """
        # 新しいぷよの配置位置（中央上部）
        x = self.INITIAL_PUYO_X
        y = self.INITIAL_PUYO_Y

        # 配置位置にすでにぷよがある場合はゲームオーバー
        # 軸ぷよの位置をチェック
        if self.stage.get_puyo(x, y) != 0:
            return True

        # 2つ目のぷよの位置もチェック（回転状態に応じて）
        # rotation=0 の場合、2つ目のぷよは上に配置される
        if self.rotation == 0:
            if y > 0 and self.stage.get_puyo(x, y - 1) != 0:
                return True

        return False
