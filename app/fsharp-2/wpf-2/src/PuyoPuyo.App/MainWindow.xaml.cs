using System.Windows;
using System.Windows.Input;

namespace PuyoPuyo.App
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            this.KeyDown += OnKeyDown;
        }

        private void OnKeyDown(object sender, KeyEventArgs e)
        {
            if (DataContext == null) return;

            var viewModel = DataContext as dynamic;
            if (viewModel == null) return;

            switch (e.Key)
            {
                case Key.Left:
                    viewModel.MoveLeft?.Execute(null);
                    e.Handled = true;
                    break;
                case Key.Right:
                    viewModel.MoveRight?.Execute(null);
                    e.Handled = true;
                    break;
            }
        }
    }
}
