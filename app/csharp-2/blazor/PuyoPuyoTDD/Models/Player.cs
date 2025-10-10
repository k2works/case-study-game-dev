// <copyright file="Player.cs" company="PuyoPuyoTDD">
// Copyright (c) PuyoPuyoTDD. All rights reserved.
// </copyright>

namespace PuyoPuyoTDD.Models;

/// <summary>
/// プレイヤークラス.
/// </summary>
public class Player
{
    private readonly Config config;
    private readonly Stage stage;

    /// <summary>
    /// Initializes a new instance of the <see cref="Player"/> class.
    /// </summary>
    /// <param name="config">ゲーム設定.</param>
    /// <param name="stage">ステージ.</param>
    public Player(Config config, Stage stage)
    {
        this.config = config;
        this.stage = stage;
    }
}
