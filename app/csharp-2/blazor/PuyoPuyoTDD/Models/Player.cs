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

    private int puyoX = 2; // ぷよのX座標（中央に配置）
    private int puyoY = 0; // ぷよのY座標（一番上）
    private int puyoType; // 現在のぷよの種類
    private int nextPuyoType; // 次のぷよの種類
    private int rotation; // 現在の回転状態

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

    /// <summary>
    /// Gets a value indicating whether 左キーが押されているか取得します.
    /// </summary>
    public bool InputKeyLeft { get; private set; }

    /// <summary>
    /// Gets a value indicating whether 右キーが押されているか取得します.
    /// </summary>
    public bool InputKeyRight { get; private set; }

    /// <summary>
    /// Gets a value indicating whether 上キーが押されているか取得します.
    /// </summary>
    public bool InputKeyUp { get; private set; }

    /// <summary>
    /// Gets a value indicating whether 下キーが押されているか取得します.
    /// </summary>
    public bool InputKeyDown { get; private set; }

    /// <summary>
    /// Gets ぷよのX座標を取得します.
    /// </summary>
    public int PuyoX => this.puyoX;

    /// <summary>
    /// Gets ぷよのY座標を取得します.
    /// </summary>
    public int PuyoY => this.puyoY;

    /// <summary>
    /// Gets ぷよの種類を取得します.
    /// </summary>
    public int PuyoType => this.puyoType;

    /// <summary>
    /// Gets 次のぷよの種類を取得します.
    /// </summary>
    public int NextPuyoType => this.nextPuyoType;

    /// <summary>
    /// Gets 回転状態を取得します.
    /// </summary>
    public int Rotation => this.rotation;

    /// <summary>
    /// 左キーの入力状態を設定します.
    /// </summary>
    /// <param name="value">入力状態.</param>
    public void SetInputLeft(bool value)
    {
        this.InputKeyLeft = value;
    }

    /// <summary>
    /// 右キーの入力状態を設定します.
    /// </summary>
    /// <param name="value">入力状態.</param>
    public void SetInputRight(bool value)
    {
        this.InputKeyRight = value;
    }

    /// <summary>
    /// 上キーの入力状態を設定します.
    /// </summary>
    /// <param name="value">入力状態.</param>
    public void SetInputUp(bool value)
    {
        this.InputKeyUp = value;
    }

    /// <summary>
    /// 下キーの入力状態を設定します.
    /// </summary>
    /// <param name="value">入力状態.</param>
    public void SetInputDown(bool value)
    {
        this.InputKeyDown = value;
    }

    /// <summary>
    /// 新しいぷよを生成します.
    /// </summary>
    public void CreateNewPuyo()
    {
        this.puyoX = 2;
        this.puyoY = 0;
        this.puyoType = Random.Shared.Next(1, 5); // 1～4のランダムな値
        this.nextPuyoType = Random.Shared.Next(1, 5);
        this.rotation = 0;
    }

    /// <summary>
    /// ぷよのX座標を設定します.
    /// </summary>
    /// <param name="x">X座標.</param>
    public void SetPuyoX(int x)
    {
        this.puyoX = x;
    }

    /// <summary>
    /// ぷよを左に移動します.
    /// </summary>
    public void MoveLeft()
    {
        if (this.puyoX > 0)
        {
            this.puyoX--;
        }
    }

    /// <summary>
    /// ぷよを右に移動します.
    /// </summary>
    public void MoveRight()
    {
        if (this.puyoX < this.config.StageWidth - 1)
        {
            this.puyoX++;
        }
    }

    /// <summary>
    /// ぷよを時計回りに回転します.
    /// </summary>
    public void RotateRight()
    {
        this.rotation = (this.rotation + 1) % 4;
    }

    /// <summary>
    /// ぷよを反時計回りに回転します.
    /// </summary>
    public void RotateLeft()
    {
        this.rotation = (this.rotation + 3) % 4;
    }

    /// <summary>
    /// 回転状態を設定します.
    /// </summary>
    /// <param name="rotation">回転状態.</param>
    public void SetRotation(int rotation)
    {
        this.rotation = rotation;
    }

    /// <summary>
    /// ぷよのY座標を設定します.
    /// </summary>
    /// <param name="y">Y座標.</param>
    public void SetPuyoY(int y)
    {
        this.puyoY = y;
    }

    /// <summary>
    /// 落下速度を取得します.
    /// </summary>
    /// <returns>落下速度.</returns>
    public int GetDropSpeed()
    {
        return this.InputKeyDown ? 10 : 1;
    }

    /// <summary>
    /// ぷよを下に移動します.
    /// </summary>
    /// <returns>移動できたかどうか.</returns>
    public bool MoveDown()
    {
        if (this.puyoY < this.config.StageHeight - 1)
        {
            this.puyoY++;
            return true;
        }

        return false;
    }
}
