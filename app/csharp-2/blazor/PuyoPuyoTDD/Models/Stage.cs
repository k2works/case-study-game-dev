// <copyright file="Stage.cs" company="PuyoPuyoTDD">
// Copyright (c) PuyoPuyoTDD. All rights reserved.
// </copyright>

namespace PuyoPuyoTDD.Models;

/// <summary>
/// 消去情報.
/// </summary>
/// <param name="erasePuyoCount">消去するぷよの数.</param>
/// <param name="eraseList">消去するぷよのリスト.</param>
public record EraseInfo(int erasePuyoCount, List<(int X, int Y, int Type)> eraseList);

/// <summary>
/// ステージクラス.
/// </summary>
public class Stage
{
    private readonly Config config;
    private int[,] board;

    /// <summary>
    /// Initializes a new instance of the <see cref="Stage"/> class.
    /// </summary>
    /// <param name="config">ゲーム設定.</param>
    public Stage(Config config)
    {
        this.config = config;
        this.board = new int[this.config.StageWidth, this.config.StageHeight];
    }

    /// <summary>
    /// ステージを初期化します.
    /// </summary>
    public void Initialize()
    {
        for (int x = 0; x < this.config.StageWidth; x++)
        {
            for (int y = 0; y < this.config.StageHeight; y++)
            {
                this.board[x, y] = 0;
            }
        }
    }

    /// <summary>
    /// ぷよを設定します.
    /// </summary>
    /// <param name="x">X座標.</param>
    /// <param name="y">Y座標.</param>
    /// <param name="type">ぷよの種類.</param>
    public void SetPuyo(int x, int y, int type)
    {
        this.board[x, y] = type;
    }

    /// <summary>
    /// ぷよを取得します.
    /// </summary>
    /// <param name="x">X座標.</param>
    /// <param name="y">Y座標.</param>
    /// <returns>ぷよの種類.</returns>
    public int GetPuyo(int x, int y)
    {
        return this.board[x, y];
    }

    /// <summary>
    /// 消去可能なぷよをチェックします.
    /// </summary>
    /// <returns>消去情報.</returns>
    public EraseInfo CheckErase()
    {
        var eraseList = new List<(int X, int Y, int Type)>();
        var visited = new bool[this.config.StageWidth, this.config.StageHeight];

        for (int x = 0; x < this.config.StageWidth; x++)
        {
            for (int y = 0; y < this.config.StageHeight; y++)
            {
                if (this.board[x, y] != 0 && !visited[x, y])
                {
                    var connectedPuyo = new List<(int X, int Y, int Type)>();
                    this.SearchConnectedPuyo(x, y, this.board[x, y], visited, connectedPuyo);

                    if (connectedPuyo.Count >= 4)
                    {
                        eraseList.AddRange(connectedPuyo);
                    }
                }
            }
        }

        return new EraseInfo(eraseList.Count, eraseList);
    }

    /// <summary>
    /// 消去対象のぷよを消去します.
    /// </summary>
    /// <param name="eraseList">消去対象のぷよのリスト.</param>
    public void ExecuteErase(List<(int X, int Y, int Type)> eraseList)
    {
        foreach (var puyo in eraseList)
        {
            this.board[puyo.X, puyo.Y] = 0;
        }
    }

    /// <summary>
    /// 重力を適用してぷよを落下させます.
    /// </summary>
    public void ApplyGravity()
    {
        // 下から上に向かって各列を処理
        for (int x = 0; x < this.config.StageWidth; x++)
        {
            // 下から詰めていく位置
            int writeY = this.config.StageHeight - 1;

            // 下から上に向かってぷよを探索
            for (int readY = this.config.StageHeight - 1; readY >= 0; readY--)
            {
                if (this.board[x, readY] != 0)
                {
                    // ぷよがある場合、下に詰める
                    if (readY != writeY)
                    {
                        this.board[x, writeY] = this.board[x, readY];
                        this.board[x, readY] = 0;
                    }

                    writeY--;
                }
            }
        }
    }

    /// <summary>
    /// 接続されたぷよを探索します.
    /// </summary>
    /// <param name="x">X座標.</param>
    /// <param name="y">Y座標.</param>
    /// <param name="type">ぷよの種類.</param>
    /// <param name="visited">訪問済みフラグ.</param>
    /// <param name="connectedPuyo">接続されたぷよのリスト.</param>
    private void SearchConnectedPuyo(int x, int y, int type, bool[,] visited, List<(int X, int Y, int Type)> connectedPuyo)
    {
        if (x < 0 || x >= this.config.StageWidth || y < 0 || y >= this.config.StageHeight)
        {
            return;
        }

        if (visited[x, y] || this.board[x, y] != type)
        {
            return;
        }

        visited[x, y] = true;
        connectedPuyo.Add((x, y, type));

        // 上下左右を探索
        this.SearchConnectedPuyo(x - 1, y, type, visited, connectedPuyo);
        this.SearchConnectedPuyo(x + 1, y, type, visited, connectedPuyo);
        this.SearchConnectedPuyo(x, y - 1, type, visited, connectedPuyo);
        this.SearchConnectedPuyo(x, y + 1, type, visited, connectedPuyo);
    }
}
