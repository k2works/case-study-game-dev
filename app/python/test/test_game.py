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

    def test_ゲームを初期化すると_必要なコンポーネントが作成される(
        self, game: Game
    ) -> None:
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

    def test_ぷよの消去と落下後_新たな消去パターンがあれば連鎖が発生する(
        self, game: Game
    ) -> None:
        """ぷよの消去と落下後、新たな消去パターンがあれば連鎖が発生する"""
        game.initialize()

        # ゲームのステージにぷよを配置
        # 赤ぷよの2×2と、その上に青ぷよが縦に3つ、さらに青ぷよが1つ横に
        # 0 0 0 0 0 0
        # 0 0 0 0 0 0
        # 0 0 0 0 0 0
        # 0 0 0 0 0 0
        # 0 0 0 0 0 0
        # 0 0 2 0 0 0  (Y=7)
        # 0 0 2 0 0 0  (Y=8)
        # 0 0 2 0 0 0  (Y=9)
        # 0 1 1 2 0 0  (Y=10)
        # 0 1 1 0 0 0  (Y=11)
        game.stage.set_puyo(1, 10, 1)  # 赤（下段左）
        game.stage.set_puyo(2, 10, 1)  # 赤（下段中央）
        game.stage.set_puyo(1, 11, 1)  # 赤（最下段左）
        game.stage.set_puyo(2, 11, 1)  # 赤（最下段中央）
        game.stage.set_puyo(3, 10, 2)  # 青（下段右）
        game.stage.set_puyo(2, 7, 2)  # 青（上）
        game.stage.set_puyo(2, 8, 2)  # 青（上）
        game.stage.set_puyo(2, 9, 2)  # 青（上）

        # checkErase モードに設定
        game.mode = "checkErase"

        # 1回目の消去判定と消去実行
        game.update()  # checkErase → erasing
        assert game.mode == "erasing"

        # 消去後の重力チェック
        game.update()  # erasing → checkFall
        assert game.mode == "checkFall"

        # 重力適用と落下アニメーションを繰り返して落下完了まで進める
        iterations = 0
        while game.mode != "checkErase" and iterations < 20:
            game.update()
            iterations += 1

        # checkErase モードに到達している
        assert game.mode == "checkErase"

        # 2回目の消去判定（連鎖）
        chain_erase_info = game.stage.check_erase()

        # 連鎖が発生していることを確認（青ぷよが4つつながっている）
        assert chain_erase_info["erase_puyo_count"] >= 4

    def test_盤面上のぷよがすべて消えると_全消しフラグが立つ(self, game: Game) -> None:
        """盤面上のぷよがすべて消えると、全消しフラグが立つ"""
        game.initialize()

        # ステージにぷよを配置（4つの赤ぷよ）
        game.stage.set_puyo(1, 10, 1)
        game.stage.set_puyo(2, 10, 1)
        game.stage.set_puyo(1, 11, 1)
        game.stage.set_puyo(2, 11, 1)

        # checkErase モードに設定
        game.mode = "checkErase"

        # 消去判定と消去実行
        game.update()  # checkErase → erasing
        assert game.mode == "erasing"

        # 消去後の重力チェック
        game.update()  # erasing → checkFall
        assert game.mode == "checkFall"

        # 重力適用と落下アニメーションを繰り返す
        iterations = 0
        while game.mode != "checkErase" and iterations < 20:
            game.update()
            iterations += 1

        # checkErase に到達
        assert game.mode == "checkErase"

        # 消去対象がないので newPuyo に遷移し、全消しフラグが立つ
        game.update()  # checkErase → newPuyo
        assert game.mode == "newPuyo"
        assert game.is_zenkeshi is True

    def test_ゲームオーバーになると_ゲームモードがgameOverに変わる(
        self, game: Game
    ) -> None:
        """ゲームオーバーになると、ゲームモードがgameOverに変わる"""
        game.initialize()

        # ステージの上部にぷよを配置（新しいぷよが配置される位置）
        game.stage.set_puyo(2, 0, 1)

        # ゲームモードを設定
        game.mode = "newPuyo"

        # ゲームループを実行
        game.update()

        # ゲームモードがgameOverになっていることを確認
        assert game.mode == "gameOver"
