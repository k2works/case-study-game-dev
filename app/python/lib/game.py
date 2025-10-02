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
        self.is_zenkeshi: bool = False

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

            # ゲームオーバー判定
            if self.player.check_game_over():
                self.mode = "gameOver"
            else:
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
                # 消去対象がない場合、全消し判定を行う
                self.is_zenkeshi = self.stage.check_zenkeshi()
                # 次のぷよを出す
                self.mode = "newPuyo"

        elif self.mode == "erasing":
            # 消去アニメーション用（一定フレーム待機）
            # 簡略化のため、すぐにcheckFallに戻る
            self.mode = "checkFall"

        elif self.mode == "gameOver":
            # ゲームオーバー演出（何もしない）
            pass

    def draw(self) -> None:
        """画面描画(60FPSで呼ばれる)"""
        # 画面をクリア
        pyxel.cls(0)

        # ステージを描画
        self.stage.draw()

        # プレイヤーのぷよを描画（ゲームオーバー以外）
        if self.mode == "playing":
            self.player.draw()

        # ゲームオーバー演出
        if self.mode == "gameOver":
            self.draw_game_over()

    def draw_game_over(self) -> None:
        """ゲームオーバー画面を描画する"""
        # 5x5 ビットマップフォントパターン（1=ピクセルあり、0=なし）
        font_patterns = {
            "G": [
                [0, 1, 1, 1, 0],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0],
                [1, 0, 1, 1, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [0, 1, 1, 1, 0],
            ],
            "A": [
                [0, 1, 1, 1, 0],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
            ],
            "M": [
                [1, 0, 0, 0, 1],
                [1, 1, 0, 1, 1],
                [1, 0, 1, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
            ],
            "E": [
                [1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0],
                [1, 0, 0, 0, 0],
                [1, 1, 1, 1, 0],
                [1, 0, 0, 0, 0],
                [1, 0, 0, 0, 0],
                [1, 1, 1, 1, 1],
            ],
            "O": [
                [0, 1, 1, 1, 0],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [0, 1, 1, 1, 0],
            ],
            "V": [
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [0, 1, 0, 1, 0],
                [0, 1, 0, 1, 0],
                [0, 0, 1, 0, 0],
            ],
            "R": [
                [1, 1, 1, 1, 0],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 1, 1, 1, 0],
                [1, 0, 1, 0, 0],
                [1, 0, 0, 1, 0],
                [1, 0, 0, 0, 1],
            ],
            " ": [[0, 0, 0, 0, 0] for _ in range(7)],
        }

        text = "GAME OVER"
        scale = 3  # 3倍に拡大
        char_width = 6 * scale  # 文字幅（5 + 1スペース）× スケール
        total_width = len(text) * char_width
        start_x = (pyxel.width - total_width) // 2
        start_y = pyxel.height // 2 - 10

        # 各文字を描画
        for i, char in enumerate(text):
            if char in font_patterns:
                pattern = font_patterns[char]
                base_x = start_x + i * char_width

                # パターンを拡大して描画
                for y, row in enumerate(pattern):
                    for x, pixel in enumerate(row):
                        if pixel:
                            # スケール倍のサイズで矩形を描画
                            pyxel.rect(
                                base_x + x * scale,
                                start_y + y * scale,
                                scale,
                                scale,
                                8,  # 赤色
                            )
