namespace PuyoPuyo.Elmish

open System
open System.Threading
open Elmish

module サブスクリプション =
    /// タイマーサブスクリプション
    let タイマー (_: モデル) : Sub<メッセージ> =
        let startTimer dispatch =
            let cts = new CancellationTokenSource()

            let rec loop () =
                async {
                    do! Async.Sleep(500)
                    dispatch タイマー刻み
                    return! loop ()
                }

            Async.Start(loop (), cts.Token)

            { new IDisposable with
                member _.Dispose() = cts.Cancel() }

        [ [ "timer" ], startTimer ]
