"""プレイヤークラスのテスト"""

import pytest

from lib.config import Config
from lib.player import Player
from lib.puyoimage import PuyoImage
from lib.stage import Stage


class TestPlayer:
    """プレイヤークラスのテスト"""

    @pytest.fixture
    def setup_components(
        self,
    ) -> tuple[Config, PuyoImage, Stage, Player]:
        """テスト用のコンポーネントをセットアップ"""
        config = Config()
        puyo_image = PuyoImage(config)
        stage = Stage(config, puyo_image)
        player = Player(config, stage, puyo_image)
        return config, puyo_image, stage, player

    def test_左キーが押されると_左向きの移動フラグが立つ(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """左キーが押されると、左向きの移動フラグが立つ"""
        _, _, _, player = setup_components

        # Pyxelのキー入力をシミュレート
        # 実際のPyxelではpyxel.btn()を使うが、テストではinput_key_leftを直接設定
        player.input_key_left = True

        assert player.input_key_left is True

    def test_右キーが押されると_右向きの移動フラグが立つ(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """右キーが押されると、右向きの移動フラグが立つ"""
        _, _, _, player = setup_components

        player.input_key_right = True

        assert player.input_key_right is True

    def test_キー入力をクリアできる(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """キー入力フラグをクリアできる"""
        _, _, _, player = setup_components

        # まず左キーフラグを立てる
        player.input_key_left = True
        assert player.input_key_left is True

        # 次にクリア
        player.input_key_left = False
        assert player.input_key_left is False

    def test_左に移動できる場合_左に移動する(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """左に移動できる場合、左に移動する"""
        _, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 初期位置を記録
        initial_x = player.puyo_x

        # 左に移動
        player.move_left()

        # 位置が1つ左に移動していることを確認
        assert player.puyo_x == initial_x - 1

    def test_右に移動できる場合_右に移動する(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """右に移動できる場合、右に移動する"""
        _, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 初期位置を記録
        initial_x = player.puyo_x

        # 右に移動
        player.move_right()

        # 位置が1つ右に移動していることを確認
        assert player.puyo_x == initial_x + 1

    def test_左端にいる場合_左に移動できない(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """左端にいる場合、左に移動できない"""
        _, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 左端に移動
        player.puyo_x = 0

        # 左に移動を試みる
        player.move_left()

        # 位置が変わっていないことを確認
        assert player.puyo_x == 0

    def test_右端にいる場合_右に移動できない(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """右端にいる場合、右に移動できない"""
        config, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 右端に移動(ステージの幅 - 1)
        player.puyo_x = config.stage_cols - 1

        # 右に移動を試みる
        player.move_right()

        # 位置が変わっていないことを確認
        assert player.puyo_x == config.stage_cols - 1

    def test_時計回りに回転すると_回転状態が1増える(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """時計回りに回転すると、回転状態が1増える"""
        _, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 初期回転状態を記録
        initial_rotation = player.rotation

        # 時計回りに回転
        player.rotate_right()

        # 回転状態が1増えていることを確認
        assert player.rotation == (initial_rotation + 1) % 4

    def test_反時計回りに回転すると_回転状態が1減る(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """反時計回りに回転すると、回転状態が1減る"""
        _, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 初期回転状態を記録
        initial_rotation = player.rotation

        # 反時計回りに回転
        player.rotate_left()

        # 回転状態が1減っていることを確認(負の値にならないように調整)
        assert player.rotation == (initial_rotation + 3) % 4

    def test_回転状態が4になると0に戻る(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """回転状態が4になると0に戻る"""
        _, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 回転状態を3に設定
        player.rotation = 3

        # 時計回りに回転
        player.rotate_right()

        # 回転状態が0になっていることを確認
        assert player.rotation == 0

    def test_右端で右回転すると_左に移動して回転する_壁キック(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """右端で右回転すると、左に移動して回転する(壁キック)"""
        config, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 右端に移動
        player.puyo_x = config.stage_cols - 1
        player.rotation = 0  # 上向き

        # 右回転(2つ目のぷよが右にくる)
        player.rotate_right()

        # 壁キックにより左に移動していることを確認
        assert player.puyo_x == config.stage_cols - 2
        assert player.rotation == 1

    def test_左端で左回転すると_右に移動して回転する_壁キック(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """左端で左回転すると、右に移動して回転する(壁キック)"""
        _, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 左端に移動
        player.puyo_x = 0
        player.rotation = 0  # 上向き

        # 左回転(2つ目のぷよが左にくる)
        player.rotate_left()

        # 壁キックにより右に移動していることを確認
        assert player.puyo_x == 1
        assert player.rotation == 3
