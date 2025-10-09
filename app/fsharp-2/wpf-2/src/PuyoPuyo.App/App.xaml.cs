using System;
using System.Windows;

namespace PuyoPuyo.App
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
            var window = new MainWindow();
            Program.main(window);
        }
    }
}
