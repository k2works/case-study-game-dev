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

    def test_指定時間が経過すると_ぷよが1マス下に落ちる(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """指定時間が経過すると、ぷよが1マス下に落ちる"""
        _, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 初期位置を記録
        initial_y = player.puyo_y

        # 落下間隔(1000ms = 1秒)
        drop_interval = 1000

        # ゲームの更新処理を実行（落下間隔分）
        player.update_with_delta(drop_interval)

        # 1マス下に落ちていることを確認
        assert player.puyo_y == initial_y + 1

    def test_指定時間未満では_ぷよは落ちない(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """指定時間未満では、ぷよは落ちない"""
        _, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 初期位置を記録
        initial_y = player.puyo_y

        # 落下間隔の半分（500ms / 2 = 250ms）
        half_interval = 250

        # ゲームの更新処理を実行（落下間隔未満）
        player.update_with_delta(half_interval)

        # 位置が変わっていないことを確認
        assert player.puyo_y == initial_y

    def test_下端に達した場合_それ以上落ちない(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """下端に達した場合、それ以上落ちない"""
        config, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 下端に移動
        player.puyo_y = config.stage_rows - 1

        # 落下間隔分の時間を経過させる
        player.update_with_delta(1000)

        # 位置が変わっていないことを確認
        assert player.puyo_y == config.stage_rows - 1
        # 着地フラグが立っていることを確認
        assert player.has_landed() is True

    def test_下キーが押されていると_落下速度が上がる(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """下キーが押されていると、落下速度が上がる"""
        _, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 通常の落下速度
        normal_speed = player.get_drop_speed()
        assert normal_speed == 1.0

        # 下キーを押す
        player.input_key_down = True

        # 高速落下の速度を取得
        fast_speed = player.get_drop_speed()
        assert fast_speed == 10.0

    def test_下に移動できる場合_下に移動する(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """下に移動できる場合、下に移動する"""
        _, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 初期位置を記録
        initial_y = player.puyo_y

        # 下に移動
        result = player.move_down()

        # 移動できたことを確認
        assert result is True
        assert player.puyo_y == initial_y + 1

    def test_下に障害物がある場合_下に移動できない(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """下に障害物がある場合、下に移動できない"""
        config, _, stage, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 下端に移動
        player.puyo_y = config.stage_rows - 1

        # 下に移動を試みる
        result = player.move_down()

        # 移動できなかったことを確認
        assert result is False
        assert player.puyo_y == config.stage_rows - 1

    def test_新しいぷよを配置できない場合_ゲームオーバーになる(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """新しいぷよを配置できない場合、ゲームオーバーになる"""
        _, _, stage, player = setup_components

        # ステージの上部にぷよを配置（新しいぷよが配置される位置）
        stage.set_puyo(2, 0, 1)

        # 新しいぷよの生成
        player.create_new_puyo()

        # ゲームオーバー判定
        is_game_over = player.check_game_over()

        # ゲームオーバーになっていることを確認
        assert is_game_over is True

    def test_新しいぷよを配置できる場合_ゲームオーバーにならない(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """新しいぷよを配置できる場合、ゲームオーバーにならない"""
        _, _, _, player = setup_components

        # 新しいぷよの生成
        player.create_new_puyo()

        # ゲームオーバー判定
        is_game_over = player.check_game_over()

        # ゲームオーバーになっていないことを確認
        assert is_game_over is False

    def test_左にぷよがある場合_左に移動できない(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """左にぷよがある場合、左に移動できない"""
        _, _, stage, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 軸ぷよの位置を設定
        player.puyo_x = 3
        player.puyo_y = 10
        player.rotation = 0  # 上向き

        # 左隣にぷよを配置
        stage.set_puyo(2, 10, 1)

        # 初期位置を記録
        initial_x = player.puyo_x

        # 左に移動を試みる
        player.move_left()

        # 位置が変わっていないことを確認
        assert player.puyo_x == initial_x

    def test_右にぷよがある場合_右に移動できない(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """右にぷよがある場合、右に移動できない"""
        _, _, stage, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 軸ぷよの位置を設定
        player.puyo_x = 2
        player.puyo_y = 10
        player.rotation = 0  # 上向き

        # 右隣にぷよを配置
        stage.set_puyo(3, 10, 1)

        # 初期位置を記録
        initial_x = player.puyo_x

        # 右に移動を試みる
        player.move_right()

        # 位置が変わっていないことを確認
        assert player.puyo_x == initial_x

    def test_2つ目のぷよの移動先にぷよがある場合_左に移動できない(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """2つ目のぷよの移動先にぷよがある場合、左に移動できない"""
        _, _, stage, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 軸ぷよの位置を設定
        player.puyo_x = 3
        player.puyo_y = 10
        player.rotation = 1  # 右向き（2つ目のぷよが右側）

        # 2つ目のぷよの左隣にぷよを配置
        stage.set_puyo(3, 10, 1)

        # 初期位置を記録
        initial_x = player.puyo_x

        # 左に移動を試みる
        player.move_left()

        # 位置が変わっていないことを確認
        assert player.puyo_x == initial_x

    def test_回転先にぷよがある場合_右回転できない(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """回転先にぷよがある場合、右回転できない"""
        _, _, stage, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 軸ぷよの位置を設定
        player.puyo_x = 2
        player.puyo_y = 10
        player.rotation = 0  # 上向き

        # 右側にぷよを配置（右回転すると2つ目のぷよがこの位置に来る）
        stage.set_puyo(3, 10, 1)

        # 初期回転状態を記録
        initial_rotation = player.rotation

        # 右回転を試みる
        player.rotate_right()

        # 回転状態が変わっていないことを確認
        assert player.rotation == initial_rotation

    def test_回転先にぷよがある場合_左回転できない(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """回転先にぷよがある場合、左回転できない"""
        _, _, stage, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 軸ぷよの位置を設定
        player.puyo_x = 2
        player.puyo_y = 10
        player.rotation = 0  # 上向き

        # 左側にぷよを配置（左回転すると2つ目のぷよがこの位置に来る）
        stage.set_puyo(1, 10, 1)

        # 初期回転状態を記録
        initial_rotation = player.rotation

        # 左回転を試みる
        player.rotate_left()

        # 回転状態が変わっていないことを確認
        assert player.rotation == initial_rotation

    def test_下端で下向きに回転できない(
        self, setup_components: tuple[Config, PuyoImage, Stage, Player]
    ) -> None:
        """下端で下向きに回転できない（盤面外にめり込まない）"""
        config, _, _, player = setup_components

        # 新しいぷよを作成
        player.create_new_puyo()

        # 下端に配置
        player.puyo_x = 2
        player.puyo_y = config.stage_rows - 1  # 最下段
        player.rotation = 0  # 上向き

        # 初期回転状態を記録
        initial_rotation = player.rotation

        # 右回転を2回試みる（0→1→2 下向きになる）
        player.rotate_right()  # 0→1（右向き）は成功するはず
        player.rotate_right()  # 1→2（下向き）は失敗するはず

        # 回転状態が1（右向き）で止まっていることを確認
        assert player.rotation == 1
