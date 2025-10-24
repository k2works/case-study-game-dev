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
        // ゲームの更新処理（次のイテレーションで実装）
        // 現在は何もしない
    }

    private void OnLeftButtonClicked(object? sender, EventArgs e)
    {
        // 左移動の処理（次のイテレーションで実装）
    }

    private void OnRotateButtonClicked(object? sender, EventArgs e)
    {
        // 回転の処理（次のイテレーションで実装）
    }

    private void OnRightButtonClicked(object? sender, EventArgs e)
    {
        // 右移動の処理（次のイテレーションで実装）
    }
}
