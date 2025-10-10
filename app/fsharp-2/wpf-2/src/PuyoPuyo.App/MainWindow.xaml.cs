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

            var viewModelType = DataContext.GetType();
            ICommand? command = null;

            switch (e.Key)
            {
                case Key.Left:
                    var moveLeftProp = viewModelType.GetProperty("MoveLeft");
                    command = moveLeftProp?.GetValue(DataContext) as ICommand;
                    break;
                case Key.Right:
                    var moveRightProp = viewModelType.GetProperty("MoveRight");
                    command = moveRightProp?.GetValue(DataContext) as ICommand;
                    break;
            }

            if (command?.CanExecute(null) == true)
            {
                command.Execute(null);
                e.Handled = true;
            }
        }
    }
}
