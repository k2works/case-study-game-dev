// <copyright file="GameDrawable.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

using Microsoft.Maui.Graphics;
using PuyoPuyoMAUI.Domain;

namespace PuyoPuyoMAUI.Graphics;

/// <summary>
/// ゲームボードとぷよを描画するクラス.
/// </summary>
public class GameDrawable : IDrawable
{
    private const int CellSize = 32;  // 1セルのサイズ（ピクセル）
    private const int BoardOffsetX = 10;
    private const int BoardOffsetY = 10;

    public Board? Board { get; set; }

    public PuyoPair? CurrentPiece { get; set; }

    public void Draw(ICanvas canvas, RectF dirtyRect)
    {
        // 背景を黒で塗りつぶす
        canvas.FillColor = Colors.Black;
        canvas.FillRectangle(dirtyRect);

        if (this.Board == null)
        {
            return;
        }

        // ボードの枠を描画
        this.DrawBoardFrame(canvas);

        // ボードのセルを描画
        this.DrawCells(canvas);

        // 現在のぷよペアを描画
        if (this.CurrentPiece != null)
        {
            this.DrawCurrentPiece(canvas);
        }
    }

    private void DrawBoardFrame(ICanvas canvas)
    {
        if (this.Board == null)
        {
            return;
        }

        canvas.StrokeColor = Colors.White;
        canvas.StrokeSize = 2;
        canvas.DrawRectangle(
            BoardOffsetX,
            BoardOffsetY,
            this.Board.Cols * CellSize,
            this.Board.Rows * CellSize);
    }

    private void DrawCells(ICanvas canvas)
    {
        if (this.Board == null)
        {
            return;
        }

        for (int y = 0; y < this.Board.Rows; y++)
        {
            for (int x = 0; x < this.Board.Cols; x++)
            {
                var cell = this.Board.GetCell(x, y);
                if (cell.IsFilled)
                {
                    this.DrawPuyo(canvas, x, y, cell.Color);
                }
            }
        }
    }

    private void DrawCurrentPiece(ICanvas canvas)
    {
        if (this.CurrentPiece == null)
        {
            return;
        }

        var (pos1, pos2) = this.CurrentPiece.GetPositions();
        this.DrawPuyo(canvas, pos1.X, pos1.Y, this.CurrentPiece.Puyo1Color);
        this.DrawPuyo(canvas, pos2.X, pos2.Y, this.CurrentPiece.Puyo2Color);
    }

    private void DrawPuyo(ICanvas canvas, int x, int y, PuyoColor color)
    {
        var pixelX = BoardOffsetX + (x * CellSize);
        var pixelY = BoardOffsetY + (y * CellSize);

        // ぷよ本体を描画（円）
        canvas.FillColor = color.ToColor();
        canvas.FillCircle(
            pixelX + (CellSize / 2),
            pixelY + (CellSize / 2),
            (CellSize / 2) - 2);

        // ぷよの輪郭を描画
        canvas.StrokeColor = Colors.White;
        canvas.StrokeSize = 1;
        canvas.DrawCircle(
            pixelX + (CellSize / 2),
            pixelY + (CellSize / 2),
            (CellSize / 2) - 2);
    }
}
