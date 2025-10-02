"""ゲームクラスのテスト"""
from unittest.mock import patch

import pytest

from lib.config import Config
from lib.game import Game
from lib.player import Player
from lib.puyoimage import PuyoImage
from lib.score import Score
from lib.stage import Stage


class TestGame:
    """ゲームクラスのテスト"""

    @pytest.fixture
    def game(self) -> Game:
        """各テストで使用するゲームインスタンス"""
        return Game()

    def test_ゲームを初期化すると_必要なコンポーネントが作成される(self, game: Game) -> None:
        """ゲームを初期化すると、必要なコンポーネントが作成される"""
        game.initialize()

        assert isinstance(game.config, Config)
        assert isinstance(game.puyo_image, PuyoImage)
        assert isinstance(game.stage, Stage)
        assert isinstance(game.player, Player)
        assert isinstance(game.score, Score)

    def test_ゲームを初期化すると_ゲームモードがstartになる(self, game: Game) -> None:
        """ゲームを初期化すると、ゲームモードがstartになる"""
        game.initialize()

        assert game.mode == "start"

    def test_ゲームループを開始すると_pyxel_runが呼ばれる(self, game: Game) -> None:
        """ゲームループを開始すると、pyxel.runが呼ばれる"""
        with patch("pyxel.run") as mock_run:
            game.run()

            # pyxel.runが呼び出されたことを確認
            mock_run.assert_called_once()
            # updateとdrawメソッドが引数として渡されたことを確認
            args = mock_run.call_args[0]
            assert callable(args[0])  # update method
            assert callable(args[1])  # draw method
