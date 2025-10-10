using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using PuyoPuyo.WPF.ViewModels;

namespace PuyoPuyo.WPF;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        this.KeyDown += MainWindow_KeyDown;
        this.KeyUp += MainWindow_KeyUp;
    }

    private void MainWindow_KeyDown(object sender, KeyEventArgs e)
    {
        if (DataContext is GameViewModel viewModel)
        {
            viewModel.HandleKeyDown(e.Key);
        }
    }

    private void MainWindow_KeyUp(object sender, KeyEventArgs e)
    {
        if (DataContext is GameViewModel viewModel)
        {
            viewModel.HandleKeyUp(e.Key);
        }
    }
}
