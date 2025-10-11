package com.example.puyopuyo

enum class GameMode {
    Start,
    CheckFall,
    Fall,
    CheckErase,
    Erasing,
    NewPuyo,
    Playing,
    GameOver,
}

class Game {
    lateinit var config: Config
        private set
    lateinit var stage: Stage
        private set
    lateinit var player: Player
        private set
    lateinit var score: Score
        private set
    var mode: GameMode = GameMode.Start
        private set

    private var frame: Int = 0
    private var combinationCount: Int = 0

    fun initialize() {
        // 各コンポーネントの初期化
        config = Config()
        stage = Stage(config)
        stage.initialize()
        player = Player(config, stage)
        score = Score()

        // ゲームモードを設定
        mode = GameMode.Start
        frame = 0
        combinationCount = 0
    }
}
