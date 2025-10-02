"""ぷよぷよゲームのエントリーポイント"""

import pyxel

from lib.game import Game


def main() -> None:
    """メイン関数"""
    # Pyxelウィンドウの初期化
    pyxel.init(160, 120, title="ぷよぷよ TDD")

    # ゲームのインスタンスを作成
    game = Game()

    # ゲームを初期化
    game.initialize()

    # ゲームループを開始
    game.run()


if __name__ == "__main__":
    main()
