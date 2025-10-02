"""ぷよ画像管理クラス"""

from lib.config import Config


class PuyoImage:
    """ぷよの画像を管理するクラス"""

    def __init__(self, config: Config) -> None:
        """ぷよ画像の初期化

        Args:
            config: ゲーム設定
        """
        self.config = config
