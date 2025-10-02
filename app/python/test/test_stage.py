"""ステージクラスのテスト"""

import pytest

from lib.config import Config
from lib.puyoimage import PuyoImage
from lib.stage import Stage


class TestStageErase:
    """ぷよの消去テスト"""

    @pytest.fixture
    def setup_components(self) -> tuple[Config, PuyoImage, Stage]:
        """テスト用のコンポーネントをセットアップ"""
        config = Config()
        puyo_image = PuyoImage(config)
        stage = Stage(config, puyo_image)
        return config, puyo_image, stage

    def test_同じ色のぷよが4つつながっていると_消去対象になる(
        self, setup_components: tuple[Config, PuyoImage, Stage]
    ) -> None:
        """同じ色のぷよが4つつながっていると、消去対象になる"""
        _, _, stage = setup_components

        # ステージにぷよを配置（1は赤ぷよ）
        # 2×2の正方形に赤ぷよを配置
        stage.set_puyo(1, 10, 1)
        stage.set_puyo(2, 10, 1)
        stage.set_puyo(1, 11, 1)
        stage.set_puyo(2, 11, 1)

        # 消去判定
        erase_info = stage.check_erase()

        # 4つのぷよが消去対象になっていることを確認
        assert erase_info["erase_puyo_count"] == 4
        assert len(erase_info["erase_info"]) == 4

    def test_異なる色のぷよは消去対象にならない(
        self, setup_components: tuple[Config, PuyoImage, Stage]
    ) -> None:
        """異なる色のぷよは消去対象にならない"""
        _, _, stage = setup_components

        # ステージにぷよを配置（1は赤ぷよ、2は青ぷよ）
        # 市松模様に配置
        stage.set_puyo(1, 10, 1)
        stage.set_puyo(2, 10, 2)
        stage.set_puyo(1, 11, 2)
        stage.set_puyo(2, 11, 1)

        # 消去判定
        erase_info = stage.check_erase()

        # 消去対象がないことを確認
        assert erase_info["erase_puyo_count"] == 0
        assert len(erase_info["erase_info"]) == 0

    def test_3つ以下のつながりは消去対象にならない(
        self, setup_components: tuple[Config, PuyoImage, Stage]
    ) -> None:
        """3つ以下のつながりは消去対象にならない"""
        _, _, stage = setup_components

        # ステージにぷよを配置（1は赤ぷよ）
        # L字型に3つ配置
        stage.set_puyo(1, 10, 1)
        stage.set_puyo(2, 10, 1)
        stage.set_puyo(1, 11, 1)

        # 消去判定
        erase_info = stage.check_erase()

        # 消去対象がないことを確認
        assert erase_info["erase_puyo_count"] == 0
        assert len(erase_info["erase_info"]) == 0

    def test_消去対象のぷよを消去する(
        self, setup_components: tuple[Config, PuyoImage, Stage]
    ) -> None:
        """消去対象のぷよを消去する"""
        _, _, stage = setup_components

        # ステージにぷよを配置
        stage.set_puyo(1, 10, 1)
        stage.set_puyo(2, 10, 1)
        stage.set_puyo(1, 11, 1)
        stage.set_puyo(2, 11, 1)

        # 消去判定と実行
        erase_info = stage.check_erase()
        stage.erase_boards(erase_info["erase_info"])

        # ぷよが消去されていることを確認
        assert stage.get_puyo(1, 10) == 0
        assert stage.get_puyo(2, 10) == 0
        assert stage.get_puyo(1, 11) == 0
        assert stage.get_puyo(2, 11) == 0

    def test_消去後_上にあるぷよが落下する(
        self, setup_components: tuple[Config, PuyoImage, Stage]
    ) -> None:
        """消去後、上にあるぷよが落下する"""
        _, _, stage = setup_components

        # ステージにぷよを配置
        # 下に赤ぷよ4つ（消去される）、その上に青ぷよ2つ
        stage.set_puyo(1, 10, 1)
        stage.set_puyo(2, 10, 1)
        stage.set_puyo(1, 11, 1)
        stage.set_puyo(2, 11, 1)
        stage.set_puyo(2, 8, 2)
        stage.set_puyo(2, 9, 2)

        # 消去判定と実行
        erase_info = stage.check_erase()
        stage.erase_boards(erase_info["erase_info"])

        # 重力を適用（落下するまで繰り返す）
        while stage.apply_gravity():
            pass

        # 青ぷよが元の位置から落下して下に移動していることを確認
        assert stage.get_puyo(2, 8) == 0  # 元の位置は空
        assert stage.get_puyo(2, 9) == 0  # 元の位置は空
        assert stage.get_puyo(2, 10) == 2  # 落下後の位置
        assert stage.get_puyo(2, 11) == 2  # 落下後の位置
