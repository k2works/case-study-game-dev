// <copyright file="PuyoColorExtensions.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

using Microsoft.Maui.Graphics;
using PuyoPuyoMAUI.Domain;

namespace PuyoPuyoMAUI.Domain;

/// <summary>
/// PuyoColor の拡張メソッド.
/// </summary>
public static class PuyoColorExtensions
{
    /// <summary>
    /// ぷよの色を MAUI の Color 構造体に変換.
    /// </summary>
    /// <returns></returns>
    public static Color ToColor(this PuyoColor puyoColor)
    {
        return puyoColor switch
        {
            PuyoColor.Red => Colors.Red,
            PuyoColor.Green => Colors.Green,
            PuyoColor.Blue => Colors.Blue,
            PuyoColor.Yellow => Colors.Yellow,
            _ => Colors.Gray
        };
    }
}
