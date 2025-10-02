"""ステージ管理クラス"""

from lib.config import Config
from lib.puyoimage import PuyoImage


class Stage:
    """ゲームステージ（盤面）を管理するクラス"""

    def __init__(self, config: Config, puyo_image: PuyoImage) -> None:
        """ステージの初期化

        Args:
            config: ゲーム設定
            puyo_image: ぷよ画像
        """
        self.config = config
        self.puyo_image = puyo_image
