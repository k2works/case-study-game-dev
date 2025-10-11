using System;
using System.Windows;

namespace PuyoPuyo.App
{
    public partial class App : Application
    {
        public App()
        {
            this.Activated += StartElmish;
        }

        private void StartElmish(object? sender, EventArgs e)
        {
            this.Activated -= StartElmish;
            Program.main(MainWindow);
        }
    }
}
