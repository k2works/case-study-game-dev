using Xunit;
using PuyoPuyo.WPF.ViewModels;
using PuyoPuyo.WPF.Models;

namespace PuyoPuyo.Tests.ViewModels;

public class GameViewModelTest
{
    [Fact]
    public void ViewModelを初期化するとゲームが初期化される()
    {
        // Arrange & Act
        var viewModel = new GameViewModel();

        // Assert
        Assert.NotNull(viewModel.Game);
        Assert.Equal(GameMode.Start, viewModel.Game.Mode);
    }

    [Fact]
    public void Startコマンドを実行するとゲームが開始される()
    {
        // Arrange
        var viewModel = new GameViewModel();

        // Act
        viewModel.StartCommand.Execute(null);

        // Assert
        Assert.Equal(GameMode.Playing, viewModel.Game.Mode);
    }

    [Fact]
    public void プロパティ変更通知が正しく発火する()
    {
        // Arrange
        var viewModel = new GameViewModel();
        bool propertyChanged = false;
        viewModel.PropertyChanged += (sender, e) =>
        {
            if (e.PropertyName == nameof(GameViewModel.Game))
                propertyChanged = true;
        };

        // Act
        viewModel.InitializeGame();

        // Assert
        Assert.True(propertyChanged);
    }
}
