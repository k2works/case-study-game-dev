// <copyright file="Config.cs" company="PuyoPuyoTDD">
// Copyright (c) PuyoPuyoTDD. All rights reserved.
// </copyright>

namespace PuyoPuyoTDD.Models;

/// <summary>
/// ゲーム設定クラス.
/// </summary>
public class Config
{
    /// <summary>
    /// Gets ステージの幅（セル数）を取得します.
    /// </summary>
    public int StageWidth { get; } = 6;

    /// <summary>
    /// Gets ステージの高さ（セル数）を取得します.
    /// </summary>
    public int StageHeight { get; } = 12;

    /// <summary>
    /// Gets ぷよのサイズ（ピクセル）を取得します.
    /// </summary>
    public int PuyoSize { get; } = 32;
}
