namespace PuyoPuyo.WPF.Models;

public enum GameMode
{
    Start,
    Playing,
    GameOver
}

public class Game
{
    public Config? Config { get; private set; }
    public Stage? Stage { get; private set; }
    public Player? Player { get; private set; }
    public Score? Score { get; private set; }
    public GameMode Mode { get; private set; }

    public void Initialize()
    {
        Config = new Config();
        Stage = new Stage(Config.StageWidth, Config.StageHeight);
        Player = new Player();
        Score = new Score();
        Mode = GameMode.Start;
    }

    public void Start()
    {
        Mode = GameMode.Playing;
    }
}

public class Config
{
    public int StageWidth { get; } = 6;
    public int StageHeight { get; } = 12;
}

public class Stage
{
    private readonly int[,] _cells;

    public int Width { get; }
    public int Height { get; }

    public Stage(int width, int height)
    {
        Width = width;
        Height = height;
        _cells = new int[width, height];
    }

    public int GetCell(int x, int y)
    {
        if (x < 0 || x >= Width || y < 0 || y >= Height)
        {
            return -1; // 範囲外
        }
        return _cells[x, y];
    }

    public void SetCell(int x, int y, int value)
    {
        if (x >= 0 && x < Width && y >= 0 && y < Height)
        {
            _cells[x, y] = value;
        }
    }

    public void Clear()
    {
        for (int y = 0; y < Height; y++)
        {
            for (int x = 0; x < Width; x++)
            {
                _cells[x, y] = 0;
            }
        }
    }

    public EraseInfo CheckErase()
    {
        var visited = new bool[Width, Height];
        var eraseList = new List<(int X, int Y, int Type)>();
        int totalEraseCount = 0;

        for (int y = 0; y < Height; y++)
        {
            for (int x = 0; x < Width; x++)
            {
                int puyoType = GetCell(x, y);
                if (puyoType > 0 && !visited[x, y])
                {
                    var connectedPuyos = new List<(int X, int Y)>();
                    SearchConnectedPuyos(x, y, puyoType, visited, connectedPuyos);

                    if (connectedPuyos.Count >= 4)
                    {
                        foreach (var puyo in connectedPuyos)
                        {
                            eraseList.Add((puyo.X, puyo.Y, puyoType));
                        }
                        totalEraseCount += connectedPuyos.Count;
                    }
                }
            }
        }

        return new EraseInfo(totalEraseCount, eraseList);
    }

    public void Erase(EraseInfo eraseInfo)
    {
        foreach (var (x, y, _) in eraseInfo.EraseList)
        {
            SetCell(x, y, 0);
        }
    }

    public void ApplyGravity()
    {
        // 各列について、下から上に向かってぷよを落下させる
        for (int x = 0; x < Width; x++)
        {
            int writeY = Height - 1; // 書き込み位置（下から詰めていく）

            // 下から上に向かってスキャン
            for (int readY = Height - 1; readY >= 0; readY--)
            {
                int puyoType = GetCell(x, readY);
                if (puyoType > 0)
                {
                    // ぷよがある場合、書き込み位置に移動
                    if (readY != writeY)
                    {
                        SetCell(x, writeY, puyoType);
                        SetCell(x, readY, 0);
                    }
                    writeY--; // 次の書き込み位置は一つ上
                }
            }
        }
    }

    private void SearchConnectedPuyos(int x, int y, int targetType, bool[,] visited, List<(int X, int Y)> result)
    {
        if (x < 0 || x >= Width || y < 0 || y >= Height)
            return;

        if (visited[x, y] || GetCell(x, y) != targetType)
            return;

        visited[x, y] = true;
        result.Add((x, y));

        // 上下左右を再帰的に探索
        SearchConnectedPuyos(x - 1, y, targetType, visited, result); // 左
        SearchConnectedPuyos(x + 1, y, targetType, visited, result); // 右
        SearchConnectedPuyos(x, y - 1, targetType, visited, result); // 上
        SearchConnectedPuyos(x, y + 1, targetType, visited, result); // 下
    }
}

public class Player
{
    public int CurrentX { get; set; }
    public int CurrentY { get; set; }
    public int Rotation { get; set; } // 0: 上, 1: 右, 2: 下, 3: 左
    public bool InputKeyLeft { get; private set; }
    public bool InputKeyRight { get; private set; }
    public bool InputKeyDown { get; private set; }
    public bool IsFastDrop => InputKeyDown;
    public Puyo? CurrentPuyo { get; set; } // 軸ぷよ
    public Puyo? SubPuyo { get; set; } // 副ぷよ

    public Player()
    {
        CurrentX = 2; // 初期位置（中央）
        CurrentY = 0; // 初期位置（上端）
        Rotation = 0; // 初期回転状態（上）
        SpawnNewPuyo();
    }

    private void SpawnNewPuyo()
    {
        var random = new Random();
        var colors = new[] { PuyoColor.Red, PuyoColor.Blue, PuyoColor.Green, PuyoColor.Yellow };

        CurrentPuyo = new Puyo(colors[random.Next(colors.Length)], CurrentX, CurrentY);
        SubPuyo = new Puyo(colors[random.Next(colors.Length)], CurrentX, CurrentY - 1);
    }

    public void Reset()
    {
        CurrentX = 2;
        CurrentY = 0;
        Rotation = 0;
        InputKeyLeft = false;
        InputKeyRight = false;
        InputKeyDown = false;
        SpawnNewPuyo();
    }

    public void SetInputLeft(bool isPressed)
    {
        InputKeyLeft = isPressed;
    }

    public void SetInputRight(bool isPressed)
    {
        InputKeyRight = isPressed;
    }

    public void SetInputDown(bool isPressed)
    {
        InputKeyDown = isPressed;
    }

    public void MoveLeft(Stage stage)
    {
        if (CanMove(CurrentX - 1, CurrentY, stage))
        {
            CurrentX--;
            UpdatePuyoPositions();
        }
    }

    public void MoveRight(Stage stage)
    {
        if (CanMove(CurrentX + 1, CurrentY, stage))
        {
            CurrentX++;
            UpdatePuyoPositions();
        }
    }

    public bool MoveDown(Stage stage)
    {
        if (CanMove(CurrentX, CurrentY + 1, stage))
        {
            CurrentY++;
            UpdatePuyoPositions();
            return true;
        }
        return false;
    }

    private void UpdatePuyoPositions()
    {
        if (CurrentPuyo != null)
        {
            CurrentPuyo.X = CurrentX;
            CurrentPuyo.Y = CurrentY;
        }
    }

    public void RotateRight(Stage stage)
    {
        Rotation = (Rotation + 1) % 4;
    }

    public void RotateLeft(Stage stage)
    {
        Rotation = (Rotation - 1 + 4) % 4;
    }

    public void PlacePuyoOnStage(Stage stage)
    {
        if (CurrentPuyo == null || SubPuyo == null)
            return;

        // 軸ぷよを配置
        stage.SetCell(CurrentX, CurrentY, (int)CurrentPuyo.Color);

        // 副ぷよの位置を計算して配置
        int subX = CurrentX;
        int subY = CurrentY;

        switch (Rotation)
        {
            case 0: // 上
                subY = CurrentY - 1;
                break;
            case 1: // 右
                subX = CurrentX + 1;
                break;
            case 2: // 下
                subY = CurrentY + 1;
                break;
            case 3: // 左
                subX = CurrentX - 1;
                break;
        }

        stage.SetCell(subX, subY, (int)SubPuyo.Color);
    }

    private bool CanMove(int x, int y, Stage stage)
    {
        // 画面の範囲内かチェック
        if (x < 0 || x >= stage.Width || y < 0 || y >= stage.Height)
        {
            return false;
        }

        // その位置にすでにぷよがあるかチェック
        return stage.GetCell(x, y) == 0;
    }
}

public enum PuyoColor
{
    None = 0,
    Red = 1,
    Blue = 2,
    Green = 3,
    Yellow = 4
}

public class Puyo
{
    public PuyoColor Color { get; set; }
    public int X { get; set; }
    public int Y { get; set; }

    public Puyo(PuyoColor color, int x, int y)
    {
        Color = color;
        X = x;
        Y = y;
    }
}

public class Score
{
    public int CurrentScore { get; set; }
    public int ChainCount { get; set; }
}
