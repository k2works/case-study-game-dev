"""ゲームメインクラス"""

from typing import Literal

import pyxel

from lib.config import Config
from lib.player import Player
from lib.puyoimage import PuyoImage
from lib.score import Score
from lib.stage import Stage

GameMode = Literal[
    "start",
    "checkFall",
    "fall",
    "checkErase",
    "erasing",
    "newPuyo",
    "playing",
    "gameOver",
]


class Game:
    """ぷよぷよゲームのメインクラス"""

    def __init__(self) -> None:
        """ゲームの初期化"""
        self.mode: GameMode = "start"
        self.frame: int = 0
        self.combination_count: int = 0

    def initialize(self) -> None:
        """各コンポーネントの初期化"""
        # 各コンポーネントの初期化
        self.config = Config()
        self.puyo_image = PuyoImage(self.config)
        self.stage = Stage(self.config, self.puyo_image)
        self.player = Player(self.config, self.stage, self.puyo_image)
        self.score = Score()

        # ゲームモードを設定
        self.mode = "start"

    def run(self) -> None:
        """ゲームループを開始"""
        pyxel.run(self.update, self.draw)

    def update(self) -> None:
        """ゲーム状態の更新(60FPSで呼ばれる)"""
        if self.mode == "start":
            # ゲーム開始時に新しいぷよを作成
            self.player.create_new_puyo()
            self.mode = "playing"

        if self.mode == "playing":
            # プレイヤーの入力と移動を処理
            self.player.update()

    def draw(self) -> None:
        """画面描画(60FPSで呼ばれる)"""
        # 画面をクリア
        pyxel.cls(0)

        # ステージを描画
        self.stage.draw()

        # プレイヤーのぷよを描画
        if self.mode == "playing":
            self.player.draw()
