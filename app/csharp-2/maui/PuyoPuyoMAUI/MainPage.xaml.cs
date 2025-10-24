using PuyoPuyoMAUI.Domain;
using PuyoPuyoMAUI.Graphics;

namespace PuyoPuyoMAUI;

public partial class MainPage : ContentPage
{
    private readonly GameDrawable _gameDrawable;
    private Board _board;
    private PuyoPair? _currentPiece;
    private IDispatcherTimer? _gameTimer;

    public MainPage()
    {
        InitializeComponent();

        // ゲーム描画オブジェクトの初期化
        _gameDrawable = new GameDrawable();
        gameView.Drawable = _gameDrawable;

        // ゲームの初期化
        InitializeGame();

        // ゲームループの開始（1秒ごとに更新）
        StartGameLoop();
    }

    private void InitializeGame()
    {
        // 空のボードを作成
        _board = Board.Create(6, 13);

        // 最初のぷよペアを生成
        _currentPiece = PuyoPair.CreateRandom(2, 1, 0);

        // 描画オブジェクトに設定
        _gameDrawable.Board = _board;
        _gameDrawable.CurrentPiece = _currentPiece;

        // 画面を更新
        gameView.Invalidate();
    }

    private void StartGameLoop()
    {
        _gameTimer = Dispatcher.CreateTimer();
        _gameTimer.Interval = TimeSpan.FromSeconds(1);
        _gameTimer.Tick += OnGameTick;
        _gameTimer.Start();
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
