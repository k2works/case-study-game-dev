namespace PuyoPuyo.App.WinUI

open System

module Program =
    [<EntryPoint; STAThread>]
    let main args =
        do FSharp.Maui.WinUICompat.Program.Main(args, typeof<PuyoPuyo.App.WinUI.App>)
        0
