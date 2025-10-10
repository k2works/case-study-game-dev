// <copyright file="Stage.cs" company="PuyoPuyoTDD">
// Copyright (c) PuyoPuyoTDD. All rights reserved.
// </copyright>

namespace PuyoPuyoTDD.Models;

/// <summary>
/// ステージクラス.
/// </summary>
public class Stage
{
    private readonly Config config;

    /// <summary>
    /// Initializes a new instance of the <see cref="Stage"/> class.
    /// </summary>
    /// <param name="config">ゲーム設定.</param>
    public Stage(Config config)
    {
        this.config = config;
    }
}
