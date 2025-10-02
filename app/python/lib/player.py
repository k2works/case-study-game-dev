"""プレイヤー操作管理クラス"""

from lib.config import Config
from lib.puyoimage import PuyoImage
from lib.stage import Stage


class Player:
    """プレイヤーの入力と操作を管理するクラス"""

    def __init__(self, config: Config, stage: Stage, puyo_image: PuyoImage) -> None:
        """プレイヤーの初期化

        Args:
            config: ゲーム設定
            stage: ステージ
            puyo_image: ぷよ画像
        """
        self.config = config
        self.stage = stage
        self.puyo_image = puyo_image
