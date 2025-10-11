using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using PuyoPuyo.WPF.Models;
using System.Collections.ObjectModel;
using System.Windows.Media;
using System.Windows.Threading;

namespace PuyoPuyo.WPF.ViewModels;

public class StagePuyoViewModel
{
    public double X { get; set; }
    public double Y { get; set; }
    public Brush Color { get; set; } = Brushes.Gray;
}

public partial class GameViewModel : ObservableObject
{
    private const int CellSize = 40;
    private const int FallInterval = 1000; // 1秒ごとに落下
    private DispatcherTimer? _gameTimer;
    private int _fallCounter = 0;

    [ObservableProperty]
    private Game _game;

    public ObservableCollection<StagePuyoViewModel> StagePuyos { get; } = new();

    public GameViewModel()
    {
        _game = new Game();
        InitializeGame();
    }

    public void InitializeGame()
    {
        Game.Initialize();
        OnPropertyChanged(nameof(Game));
        UpdatePuyoDisplay();
    }

    [RelayCommand]
    private void Start()
    {
        Game.Start();
        OnPropertyChanged(nameof(Game));
        UpdatePuyoDisplay();
        StartGameLoop();
    }

    private void StartGameLoop()
    {
        _gameTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromMilliseconds(16) // 約60FPS
        };
        _gameTimer.Tick += GameLoop;
        _gameTimer.Start();
    }

    private void GameLoop(object? sender, EventArgs e)
    {
        if (Game.Mode != GameMode.Playing)
            return;

        _fallCounter += 16;
        if (_fallCounter >= FallInterval)
        {
            _fallCounter = 0;
            if (Game.Player != null && Game.Stage != null)
            {
                bool moved = Game.Player.MoveDown(Game.Stage);
                if (!moved)
                {
                    // 着地した場合の処理
                    Game.Player.PlacePuyoOnStage(Game.Stage);

                    // 重力を適用（ぷよを下に落とす）
                    Game.Stage.ApplyGravity();

                    // 連鎖カウントのリセット
                    int chainCount = 0;

                    // 消去判定と落下処理をループ（連鎖対応）
                    bool hasErased;
                    do
                    {
                        hasErased = false;

                        // 消去判定
                        var eraseInfo = Game.Stage.CheckErase();
                        if (eraseInfo.ErasePuyoCount > 0)
                        {
                            Game.Stage.Erase(eraseInfo);
                            hasErased = true;
                            chainCount++;

                            // スコア加算
                            if (Game.Score != null)
                            {
                                Game.Score.AddScore(eraseInfo.ErasePuyoCount, chainCount);
                                Game.Score.UpdateChainCount(chainCount);
                            }

                            // 消去後に重力適用
                            Game.Stage.ApplyGravity();
                        }
                    } while (hasErased); // 消去が発生した場合は再度判定

                    // 連鎖カウントをリセット
                    if (Game.Score != null && chainCount > 0)
                    {
                        // 次のぷよのために連鎖カウントをリセット
                        // （表示用のChainCountは維持）
                    }

                    // 新しいぷよを生成
                    Game.Player.Reset();

                    // ゲームオーバー判定
                    Game.CheckAndSetGameOver();
                    if (Game.Mode == GameMode.GameOver)
                    {
                        _gameTimer?.Stop();
                    }
                }
                UpdatePuyoDisplay();
            }
        }
    }

    [RelayCommand]
    private void Reset()
    {
        _gameTimer?.Stop();
        _fallCounter = 0;
        InitializeGame();
    }

    [RelayCommand]
    private void MoveLeft()
    {
        if (Game.Mode != GameMode.Playing) return;
        Game.Player?.MoveLeft(Game.Stage!);
        UpdatePuyoDisplay();
    }

    [RelayCommand]
    private void MoveRight()
    {
        if (Game.Mode != GameMode.Playing) return;
        Game.Player?.MoveRight(Game.Stage!);
        UpdatePuyoDisplay();
    }

    [RelayCommand]
    private void MoveDown()
    {
        if (Game.Mode != GameMode.Playing) return;
        Game.Player?.MoveDown(Game.Stage!);
        UpdatePuyoDisplay();
    }

    [RelayCommand]
    private void Rotate()
    {
        if (Game.Mode != GameMode.Playing) return;
        Game.Player?.RotateLeft(Game.Stage!);
        UpdatePuyoDisplay();
    }

    [RelayCommand]
    private void RotateRight()
    {
        if (Game.Mode != GameMode.Playing) return;
        Game.Player?.RotateRight(Game.Stage!);
        UpdatePuyoDisplay();
    }

    private void UpdatePuyoDisplay()
    {
        OnPropertyChanged(nameof(CurrentPuyoX));
        OnPropertyChanged(nameof(CurrentPuyoY));
        OnPropertyChanged(nameof(CurrentPuyoColor));
        OnPropertyChanged(nameof(SubPuyoX));
        OnPropertyChanged(nameof(SubPuyoY));
        OnPropertyChanged(nameof(SubPuyoColor));
        OnPropertyChanged(nameof(Game)); // スコア表示更新のため
        OnPropertyChanged(nameof(IsGameOver));
        UpdateStagePuyos();
    }

    public bool IsGameOver => Game.Mode == GameMode.GameOver;

    private void UpdateStagePuyos()
    {
        StagePuyos.Clear();

        if (Game.Stage == null)
            return;

        for (int y = 0; y < Game.Stage.Height; y++)
        {
            for (int x = 0; x < Game.Stage.Width; x++)
            {
                int puyoType = Game.Stage.GetCell(x, y);
                if (puyoType > 0)
                {
                    StagePuyos.Add(new StagePuyoViewModel
                    {
                        X = x * CellSize,
                        Y = y * CellSize,
                        Color = GetColorBrush((PuyoColor)puyoType)
                    });
                }
            }
        }
    }

    public double CurrentPuyoX => Game.Player?.CurrentPuyo?.X * CellSize ?? 0;
    public double CurrentPuyoY => Game.Player?.CurrentPuyo?.Y * CellSize ?? 0;
    public Brush CurrentPuyoColor => GetColorBrush(Game.Player?.CurrentPuyo?.Color ?? PuyoColor.None);

    public double SubPuyoX
    {
        get
        {
            if (Game.Player?.SubPuyo == null) return 0;
            var rotation = Game.Player.Rotation;
            var baseX = Game.Player.CurrentX;
            return rotation switch
            {
                0 => baseX * CellSize,
                1 => (baseX + 1) * CellSize,
                2 => baseX * CellSize,
                3 => (baseX - 1) * CellSize,
                _ => baseX * CellSize
            };
        }
    }

    public double SubPuyoY
    {
        get
        {
            if (Game.Player?.SubPuyo == null) return 0;
            var rotation = Game.Player.Rotation;
            var baseY = Game.Player.CurrentY;
            return rotation switch
            {
                0 => (baseY - 1) * CellSize,
                1 => baseY * CellSize,
                2 => (baseY + 1) * CellSize,
                3 => baseY * CellSize,
                _ => baseY * CellSize
            };
        }
    }

    public Brush SubPuyoColor => GetColorBrush(Game.Player?.SubPuyo?.Color ?? PuyoColor.None);

    private Brush GetColorBrush(PuyoColor color)
    {
        return color switch
        {
            PuyoColor.Red => Brushes.Red,
            PuyoColor.Blue => Brushes.Blue,
            PuyoColor.Green => Brushes.Green,
            PuyoColor.Yellow => Brushes.Yellow,
            _ => Brushes.Gray
        };
    }
}
