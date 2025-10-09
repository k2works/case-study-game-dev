namespace PuyoPuyo.Game

open System
open System.Windows.Threading

module Subscription =
    /// ゲームタイマーを作成（Tick メッセージを dispatch）
    let createGameTimer (dispatch: Message -> unit) : DispatcherTimer =
        let timer = DispatcherTimer()
        timer.Interval <- TimeSpan.FromSeconds(1.0)
        timer.Tick.Add(fun _ -> dispatch Tick)
        timer

    /// モデルの状態に応じてタイマーを制御
    let controlTimer (timer: DispatcherTimer) (model: Model) : unit =
        if model.Status = Playing then
            // 高速落下モードに応じてタイマー速度を切り替え
            let interval =
                if model.IsFastFalling then
                    TimeSpan.FromMilliseconds(100.0)
                else
                    TimeSpan.FromSeconds(1.0)

            timer.Interval <- interval

            if not timer.IsEnabled then
                timer.Start()
        else if timer.IsEnabled then
            timer.Stop()
