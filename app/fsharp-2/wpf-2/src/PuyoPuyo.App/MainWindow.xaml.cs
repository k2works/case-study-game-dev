using System.Windows;

namespace PuyoPuyo.App
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            this.Loaded += (s, e) => this.Focus();
        }
    }
}
