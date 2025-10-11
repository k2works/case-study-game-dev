// <copyright file="Game.cs" company="PuyoPuyoTDD">
// Copyright (c) PuyoPuyoTDD. All rights reserved.
// </copyright>

namespace PuyoPuyoTDD.Models;

/// <summary>
/// ゲームモードを表す列挙型.
/// </summary>
public enum GameMode
{
    /// <summary>
    /// ゲーム開始.
    /// </summary>
    Start,

    /// <summary>
    /// 落下チェック.
    /// </summary>
    CheckFall,

    /// <summary>
    /// 落下中.
    /// </summary>
    Fall,

    /// <summary>
    /// 消去チェック.
    /// </summary>
    CheckErase,

    /// <summary>
    /// 消去中.
    /// </summary>
    Erasing,

    /// <summary>
    /// 新しいぷよ生成.
    /// </summary>
    NewPuyo,

    /// <summary>
    /// プレイ中.
    /// </summary>
    Playing,

    /// <summary>
    /// ゲームオーバー.
    /// </summary>
    GameOver,
}

/// <summary>
/// ゲームクラス.
/// </summary>
public class Game
{
#pragma warning disable CS0414 // フィールドは将来のイテレーションで使用予定
    private int frame;
    private int combinationCount;
#pragma warning restore CS0414

    /// <summary>
    /// Gets ゲーム設定を取得します.
    /// </summary>
    public Config Config { get; private set; } = null!;

    /// <summary>
    /// Gets ステージを取得します.
    /// </summary>
    public Stage Stage { get; private set; } = null!;

    /// <summary>
    /// Gets プレイヤーを取得します.
    /// </summary>
    public Player Player { get; private set; } = null!;

    /// <summary>
    /// Gets スコアを取得します.
    /// </summary>
    public Score Score { get; private set; } = null!;

    /// <summary>
    /// Gets ゲームモードを取得します.
    /// </summary>
    public GameMode Mode { get; private set; }

    /// <summary>
    /// ゲームを初期化します.
    /// </summary>
    public void Initialize()
    {
        // 各コンポーネントの初期化
        this.Config = new Config();
        this.Stage = new Stage(this.Config);
        this.Player = new Player(this.Config, this.Stage);
        this.Score = new Score();

        // ゲームモードを設定
        this.Mode = GameMode.Start;
        this.frame = 0;
        this.combinationCount = 0;
    }

    /// <summary>
    /// ゲームを更新します.
    /// </summary>
    public void Update()
    {
        // TODO: ゲームループの実装
    }

    /// <summary>
    /// ゲームをリスタートします.
    /// </summary>
    public void Restart()
    {
        // ステージを初期化
        this.Stage.Initialize();

        // スコアをリセット
        this.Score.Reset();

        // ゲームモードをStartに戻す
        this.Mode = GameMode.Start;
        this.frame = 0;
        this.combinationCount = 0;
    }
}
