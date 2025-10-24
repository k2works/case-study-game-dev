// <copyright file="MainPage.xaml.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

using PuyoPuyoMAUI.Domain;
using PuyoPuyoMAUI.Graphics;

namespace PuyoPuyoMAUI;

public partial class MainPage : ContentPage
{
    private readonly GameDrawable gameDrawable;
    private Board board = null!;
    private PuyoPair? currentPiece;
    private IDispatcherTimer? gameTimer;
    private bool isFastFalling;
    private int score;
    private bool isGameOver;

    public MainPage()
    {
        this.InitializeComponent();

        // ゲーム描画オブジェクトの初期化
        this.gameDrawable = new GameDrawable();
        this.gameView.Drawable = this.gameDrawable;

        // ゲームの初期化
        this.InitializeGame();

        // ゲームループの開始（1秒ごとに更新）
        this.StartGameLoop();
    }

    private void InitializeGame()
    {
        // 空のボードを作成
        this.board = Board.Create(6, 13);

        // 最初のぷよペアを生成
        this.currentPiece = PuyoPair.CreateRandom(2, 1, 0);

        // スコアを初期化
        this.score = 0;
        this.scoreLabel.Text = "Score: 0";

        // ゲームオーバーフラグを初期化
        this.isGameOver = false;
        this.gameOverLabel.IsVisible = false;
        this.restartButton.IsVisible = false;

        // 描画オブジェクトに設定
        this.gameDrawable.Board = this.board;
        this.gameDrawable.CurrentPiece = this.currentPiece;

        // 画面を更新
        this.gameView.Invalidate();
    }

    private void StartGameLoop()
    {
        this.gameTimer = this.Dispatcher.CreateTimer();
        this.gameTimer.Interval = TimeSpan.FromSeconds(1);
        this.gameTimer.Tick += this.OnGameTick;
        this.gameTimer.Start();
    }

    private void OnGameTick(object? sender, EventArgs e)
    {
        this.DropPuyo();
    }

    private void OnLeftButtonClicked(object? sender, EventArgs e)
    {
        if (this.currentPiece == null)
        {
            return;
        }

        // 左に移動を試みる
        var movedPiece = GameLogic.TryMovePuyoPair(this.board, this.currentPiece, Direction.Left);
        if (movedPiece != null)
        {
            this.currentPiece = movedPiece;
            this.gameDrawable.CurrentPiece = this.currentPiece;
            this.gameView.Invalidate();
        }
    }

    private void OnRotateButtonClicked(object? sender, EventArgs e)
    {
        if (this.currentPiece == null)
        {
            return;
        }

        // 回転を試みる（壁キック含む）
        var rotatedPiece = GameLogic.TryRotatePuyoPair(this.board, this.currentPiece);
        if (rotatedPiece != null)
        {
            this.currentPiece = rotatedPiece;
            this.gameDrawable.CurrentPiece = this.currentPiece;
            this.gameView.Invalidate();
        }
    }

    private void OnRightButtonClicked(object? sender, EventArgs e)
    {
        if (this.currentPiece == null)
        {
            return;
        }

        // 右に移動を試みる
        var movedPiece = GameLogic.TryMovePuyoPair(this.board, this.currentPiece, Direction.Right);
        if (movedPiece != null)
        {
            this.currentPiece = movedPiece;
            this.gameDrawable.CurrentPiece = this.currentPiece;
            this.gameView.Invalidate();
        }
    }

    private void OnDownButtonClicked(object? sender, EventArgs e)
    {
        if (this.currentPiece == null)
        {
            return;
        }

        this.DropPuyo();
    }

    private void DropPuyo()
    {
        if (this.currentPiece == null || this.isGameOver)
        {
            return;
        }

        // 下に移動を試みる
        var movedPiece = GameLogic.TryMovePuyoPair(this.board, this.currentPiece, Direction.Down);

        if (movedPiece != null)
        {
            // 移動成功
            this.currentPiece = movedPiece;
            this.gameDrawable.CurrentPiece = this.currentPiece;
            this.gameView.Invalidate();
        }
        else
        {
            // 移動できない（着地）
            var boardWithPuyo = this.board.FixPuyoPair(this.currentPiece);

            // 連鎖処理（消去と重力を繰り返し適用、連鎖情報と全消し判定付き）
            var (boardAfterChain, clearedCounts, isZenkeshi) = boardWithPuyo.ClearAndApplyGravityRepeatedlyWithChainInfo();

            // スコア加算（連鎖ごと）
            for (int i = 0; i < clearedCounts.Count; i++)
            {
                int chainNumber = i + 1;
                int clearedCount = clearedCounts[i];
                int chainScore = clearedCount * 10 * chainNumber;
                this.score += chainScore;
            }

            // 全消しボーナス加算
            if (isZenkeshi)
            {
                this.score += 3600;
            }

            // スコア表示更新
            this.scoreLabel.Text = $"Score: {this.score}";

            // 新しいぷよを生成
            var nextPiece = PuyoPair.CreateRandom(2, 1, 0);

            // ゲームオーバー判定
            if (GameLogic.CheckGameOver(boardAfterChain, nextPiece))
            {
                // ゲームオーバー
                this.board = boardAfterChain;
                this.currentPiece = null;
                this.isGameOver = true;
                this.gameTimer?.Stop();

                this.gameDrawable.Board = this.board;
                this.gameDrawable.CurrentPiece = null;

                // ゲームオーバー表示
                this.gameOverLabel.IsVisible = true;
                this.restartButton.IsVisible = true;

                this.gameView.Invalidate();
            }
            else
            {
                // ゲーム続行
                this.board = boardAfterChain;
                this.currentPiece = nextPiece;
                this.gameDrawable.Board = this.board;
                this.gameDrawable.CurrentPiece = this.currentPiece;
                this.gameView.Invalidate();
            }
        }
    }

    private void OnDownButtonPressed(object? sender, EventArgs e)
    {
        this.isFastFalling = true;
        this.UpdateTimerInterval();
    }

    private void OnDownButtonReleased(object? sender, EventArgs e)
    {
        this.isFastFalling = false;
        this.UpdateTimerInterval();
    }

    private void UpdateTimerInterval()
    {
        if (this.gameTimer == null)
        {
            return;
        }

        // 高速落下モードでは100ms、通常モードでは1000ms
        this.gameTimer.Interval = this.isFastFalling
            ? TimeSpan.FromMilliseconds(100)
            : TimeSpan.FromSeconds(1);
    }

    private void OnRestartButtonClicked(object? sender, EventArgs e)
    {
        // ゲームを初期状態に戻す
        this.InitializeGame();

        // タイマーを再開
        this.gameTimer?.Start();
    }
}
