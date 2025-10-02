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
    "newPuyo",
    "playing",
    "checkFall",
    "fall",
    "checkErase",
    "erasing",
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
        # 経過時間を計算（ミリ秒）
        # Pyxelは60FPSなので、1フレーム = 1000/60 ≈ 16.67ms
        delta_time = 1000.0 / 60.0

        self.frame += 1

        if self.mode == "start":
            # ゲーム開始時に新しいぷよを作成
            self.mode = "newPuyo"

        elif self.mode == "newPuyo":
            # 新しいぷよを作成
            self.player.create_new_puyo()
            self.mode = "playing"

        elif self.mode == "playing":
            # プレイ中の処理（キー入力と自由落下）
            self.player.update_with_delta(delta_time)

            # 着地したら重力チェックに移行
            if self.player.has_landed():
                self.mode = "checkFall"

        elif self.mode == "checkFall":
            # 重力を適用
            has_fallen = self.stage.apply_gravity()
            if has_fallen:
                # ぷよが落下した場合、fallモードへ
                self.mode = "fall"
            else:
                # 落下するぷよがない場合、消去チェックへ
                self.mode = "checkErase"

        elif self.mode == "fall":
            # 落下アニメーション用（一定フレーム待機）
            # 簡略化のため、すぐにcheckFallに戻る
            self.mode = "checkFall"

        elif self.mode == "checkErase":
            # 消去判定
            erase_info = self.stage.check_erase()
            if erase_info["erase_puyo_count"] > 0:
                # 消去対象がある場合、消去処理へ
                self.stage.erase_boards(erase_info["erase_info"])
                self.mode = "erasing"
            else:
                # 消去対象がない場合、次のぷよを出す
                self.mode = "newPuyo"

        elif self.mode == "erasing":
            # 消去アニメーション用（一定フレーム待機）
            # 簡略化のため、すぐにcheckFallに戻る
            self.mode = "checkFall"

    def draw(self) -> None:
        """画面描画(60FPSで呼ばれる)"""
        # 画面をクリア
        pyxel.cls(0)

        # ステージを描画
        self.stage.draw()

        # プレイヤーのぷよを描画
        if self.mode == "playing":
            self.player.draw()
