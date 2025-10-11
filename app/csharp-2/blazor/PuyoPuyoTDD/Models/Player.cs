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
            int nextX = this.puyoX - 1;

            // 軸ぷよの衝突判定
            if (this.stage.GetPuyo(nextX, this.puyoY) != 0)
            {
                return;
            }

            // 子ぷよの位置を計算
            var (childX, childY) = this.GetChildPuyoPosition(this.rotation);

            // 子ぷよの移動後の位置
            int nextChildX = childX - 1;

            // 子ぷよの境界チェックと衝突判定
            if (nextChildX >= 0 && nextChildX < this.config.StageWidth &&
                childY >= 0 && childY < this.config.StageHeight)
            {
                if (this.stage.GetPuyo(nextChildX, childY) != 0)
                {
                    return;
                }
            }

            this.puyoX = nextX;
        }
    }

    /// <summary>
    /// ぷよを右に移動します.
    /// </summary>
    public void MoveRight()
    {
        if (this.puyoX < this.config.StageWidth - 1)
        {
            int nextX = this.puyoX + 1;

            // 軸ぷよの衝突判定
            if (this.stage.GetPuyo(nextX, this.puyoY) != 0)
            {
                return;
            }

            // 子ぷよの位置を計算
            var (childX, childY) = this.GetChildPuyoPosition(this.rotation);

            // 子ぷよの移動後の位置
            int nextChildX = childX + 1;

            // 子ぷよの境界チェックと衝突判定
            if (nextChildX >= 0 && nextChildX < this.config.StageWidth &&
                childY >= 0 && childY < this.config.StageHeight)
            {
                if (this.stage.GetPuyo(nextChildX, childY) != 0)
                {
                    return;
                }
            }

            this.puyoX = nextX;
        }
    }

    /// <summary>
    /// ぷよを時計回りに回転します.
    /// </summary>
    public void RotateRight()
    {
        int newRotation = (this.rotation + 1) % 4;

        // 回転後の子ぷよの位置を計算
        var (childX, childY) = this.GetChildPuyoPosition(newRotation);

        // 境界チェックとがべキック処理
        if (childX < 0)
        {
            // 左端を超える場合、右に1マスずらす
            this.puyoX++;
        }
        else if (childX >= this.config.StageWidth)
        {
            // 右端を超える場合、左に1マスずらす
            this.puyoX--;
        }
        else if (childY < 0 || childY >= this.config.StageHeight)
        {
            // 上下の境界を超える場合は回転できない
            return;
        }

        // 再計算した子ぷよの位置
        (childX, childY) = this.GetChildPuyoPosition(newRotation);

        // 衝突判定
        if (this.stage.GetPuyo(this.puyoX, this.puyoY) != 0 ||
            this.stage.GetPuyo(childX, childY) != 0)
        {
            // がべキックでずらした後も衝突する場合は回転できない
            return;
        }

        this.rotation = newRotation;
    }

    /// <summary>
    /// ぷよを反時計回りに回転します.
    /// </summary>
    public void RotateLeft()
    {
        int newRotation = (this.rotation + 3) % 4;

        // 回転後の子ぷよの位置を計算
        var (childX, childY) = this.GetChildPuyoPosition(newRotation);

        // 境界チェックとがべキック処理
        if (childX < 0)
        {
            // 左端を超える場合、右に1マスずらす
            this.puyoX++;
        }
        else if (childX >= this.config.StageWidth)
        {
            // 右端を超える場合、左に1マスずらす
            this.puyoX--;
        }
        else if (childY < 0 || childY >= this.config.StageHeight)
        {
            // 上下の境界を超える場合は回転できない
            return;
        }

        // 再計算した子ぷよの位置
        (childX, childY) = this.GetChildPuyoPosition(newRotation);

        // 衝突判定
        if (this.stage.GetPuyo(this.puyoX, this.puyoY) != 0 ||
            this.stage.GetPuyo(childX, childY) != 0)
        {
            // がべキックでずらした後も衝突する場合は回転できない
            return;
        }

        this.rotation = newRotation;
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
        // 回転状態によって子ぷよの位置が変わるため、境界チェックを調整
        // rotation 2 (下向き) の場合、子ぷよが軸ぷよの下にあるため、1マス手前で停止
        int maxY = this.rotation == 2 ? this.config.StageHeight - 2 : this.config.StageHeight - 1;

        if (this.puyoY < maxY)
        {
            // 移動後の位置を計算
            int nextY = this.puyoY + 1;

            // 軸ぷよの衝突判定
            if (this.stage.GetPuyo(this.puyoX, nextY) != 0)
            {
                return false;
            }

            // 子ぷよの位置を計算
            var (childX, childY) = this.GetChildPuyoPosition(this.rotation);

            // 子ぷよの移動後の位置
            int nextChildY = childY + 1;

            // 子ぷよの衝突判定
            if (this.stage.GetPuyo(childX, nextChildY) != 0)
            {
                return false;
            }

            this.puyoY = nextY;
            return true;
        }

        return false;
    }

    /// <summary>
    /// ぷよが着地したかどうかを判定します.
    /// </summary>
    /// <returns>着地しているかどうか.</returns>
    public bool HasLanded()
    {
        // 回転状態によって子ぷよの位置が変わるため、境界チェックを調整
        int maxY = this.rotation == 2 ? this.config.StageHeight - 2 : this.config.StageHeight - 1;
        return this.puyoY >= maxY;
    }

    /// <summary>
    /// 着地したぷよをステージに配置します.
    /// </summary>
    public void PlacePuyoOnStage()
    {
        // 軸ぷよを配置
        this.stage.SetPuyo(this.puyoX, this.puyoY, this.puyoType);

        // 子ぷよの位置を計算して配置
        var (childX, childY) = this.GetChildPuyoPosition(this.rotation);

        this.stage.SetPuyo(childX, childY, this.puyoType);
    }

    /// <summary>
    /// ゲームオーバー判定を行います.
    /// </summary>
    /// <returns>ゲームオーバーの場合true.</returns>
    public bool CheckGameOver()
    {
        // 新しいぷよの配置位置（軸ぷよ）にすでにぷよがあるかチェック
        if (this.stage.GetPuyo(this.puyoX, this.puyoY) != 0)
        {
            return true;
        }

        // 子ぷよの位置もチェック
        var (childX, childY) = this.GetChildPuyoPosition(this.rotation);

        // 子ぷよが画面外の場合はチェックしない
        if (childY < 0 || childY >= this.config.StageHeight ||
            childX < 0 || childX >= this.config.StageWidth)
        {
            return false;
        }

        // 子ぷよの位置にぷよがあるかチェック
        if (this.stage.GetPuyo(childX, childY) != 0)
        {
            return true;
        }

        return false;
    }

    /// <summary>
    /// 子ぷよの位置を計算します.
    /// </summary>
    /// <param name="rotation">回転状態.</param>
    /// <returns>子ぷよの位置（X, Y）.</returns>
    private (int X, int Y) GetChildPuyoPosition(int rotation)
    {
        int childX = this.puyoX;
        int childY = this.puyoY;

        switch (rotation)
        {
            case 0: // 上
                childY = this.puyoY - 1;
                break;
            case 1: // 右
                childX = this.puyoX + 1;
                break;
            case 2: // 下
                childY = this.puyoY + 1;
                break;
            case 3: // 左
                childX = this.puyoX - 1;
                break;
        }

        return (childX, childY);
    }
}
