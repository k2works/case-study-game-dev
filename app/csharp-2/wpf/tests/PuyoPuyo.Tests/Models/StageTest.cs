using Xunit;
using PuyoPuyo.WPF.Models;

namespace PuyoPuyo.Tests.Models;

public class StageTest
{
    private readonly Config _config;
    private readonly Stage _stage;

    public StageTest()
    {
        _config = new Config();
        _stage = new Stage(_config.StageWidth, _config.StageHeight);
    }

    [Fact]
    public void 同じ色のぷよが4つつながっていると消去対象になる()
    {
        // Arrange
        _stage.Clear();
        _stage.SetCell(1, 10, 1);
        _stage.SetCell(2, 10, 1);
        _stage.SetCell(1, 11, 1);
        _stage.SetCell(2, 11, 1);

        // Act
        var eraseInfo = _stage.CheckErase();

        // Assert
        Assert.Equal(4, eraseInfo.ErasePuyoCount);
        Assert.NotEmpty(eraseInfo.EraseList);
    }

    [Fact]
    public void 同じ色のぷよが3つでは消去対象にならない()
    {
        // Arrange
        _stage.Clear();
        _stage.SetCell(1, 10, 1);
        _stage.SetCell(2, 10, 1);
        _stage.SetCell(1, 11, 1);

        // Act
        var eraseInfo = _stage.CheckErase();

        // Assert
        Assert.Equal(0, eraseInfo.ErasePuyoCount);
        Assert.Empty(eraseInfo.EraseList);
    }

    [Fact]
    public void 異なる色のぷよは消去対象にならない()
    {
        // Arrange
        _stage.Clear();
        _stage.SetCell(1, 10, 1);
        _stage.SetCell(2, 10, 2);
        _stage.SetCell(1, 11, 2);
        _stage.SetCell(2, 11, 1);

        // Act
        var eraseInfo = _stage.CheckErase();

        // Assert
        Assert.Equal(0, eraseInfo.ErasePuyoCount);
        Assert.Empty(eraseInfo.EraseList);
    }

    [Fact]
    public void 縦に5つつながっていても消去できる()
    {
        // Arrange
        _stage.Clear();
        _stage.SetCell(2, 7, 1);
        _stage.SetCell(2, 8, 1);
        _stage.SetCell(2, 9, 1);
        _stage.SetCell(2, 10, 1);
        _stage.SetCell(2, 11, 1);

        // Act
        var eraseInfo = _stage.CheckErase();

        // Assert
        Assert.Equal(5, eraseInfo.ErasePuyoCount);
    }

    [Fact]
    public void L字型につながっていても消去できる()
    {
        // Arrange
        _stage.Clear();
        _stage.SetCell(1, 10, 1);
        _stage.SetCell(1, 11, 1);
        _stage.SetCell(2, 11, 1);
        _stage.SetCell(3, 11, 1);

        // Act
        var eraseInfo = _stage.CheckErase();

        // Assert
        Assert.Equal(4, eraseInfo.ErasePuyoCount);
    }

    [Fact]
    public void 消去情報に基づいてぷよを消去できる()
    {
        // Arrange
        _stage.Clear();
        _stage.SetCell(1, 10, 1);
        _stage.SetCell(2, 10, 1);
        _stage.SetCell(1, 11, 1);
        _stage.SetCell(2, 11, 1);
        var eraseInfo = _stage.CheckErase();

        // Act
        _stage.Erase(eraseInfo);

        // Assert
        Assert.Equal(0, _stage.GetCell(1, 10));
        Assert.Equal(0, _stage.GetCell(2, 10));
        Assert.Equal(0, _stage.GetCell(1, 11));
        Assert.Equal(0, _stage.GetCell(2, 11));
    }

    [Fact]
    public void 空中に浮いているぷよは重力で落下する()
    {
        // Arrange
        _stage.Clear();
        _stage.SetCell(2, 5, 1); // 空中のぷよ
        _stage.SetCell(2, 11, 2); // 一番下のぷよ

        // Act
        _stage.ApplyGravity();

        // Assert
        Assert.Equal(0, _stage.GetCell(2, 5)); // 元の位置は空
        Assert.Equal(1, _stage.GetCell(2, 10)); // 下に落ちた
        Assert.Equal(2, _stage.GetCell(2, 11)); // 底は変わらず
    }

    [Fact]
    public void 複数の列で同時に落下処理が行われる()
    {
        // Arrange
        _stage.Clear();
        _stage.SetCell(1, 5, 1);
        _stage.SetCell(2, 6, 2);
        _stage.SetCell(3, 7, 3);

        // Act
        _stage.ApplyGravity();

        // Assert
        Assert.Equal(1, _stage.GetCell(1, 11));
        Assert.Equal(2, _stage.GetCell(2, 11));
        Assert.Equal(3, _stage.GetCell(3, 11));
    }

    [Fact]
    public void 下にぷよがあると落下が止まる()
    {
        // Arrange
        _stage.Clear();
        _stage.SetCell(2, 8, 1); // 上のぷよ
        _stage.SetCell(2, 10, 2); // 障害物
        _stage.SetCell(2, 11, 3); // 底

        // Act
        _stage.ApplyGravity();

        // Assert
        Assert.Equal(1, _stage.GetCell(2, 9)); // 障害物の上に落ちる
        Assert.Equal(2, _stage.GetCell(2, 10));
        Assert.Equal(3, _stage.GetCell(2, 11));
    }
}
