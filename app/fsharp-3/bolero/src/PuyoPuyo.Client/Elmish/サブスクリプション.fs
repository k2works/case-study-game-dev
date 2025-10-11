namespace PuyoPuyo.Elmish

open System
open System.Threading
open Elmish

module サブスクリプション =
    /// タイマーサブスクリプション（高速落下時は速度を上げる、ゲームオーバー時は停止）
    let タイマー (モデル: モデル) : Sub<メッセージ> =
        // ゲームオーバー時はタイマーを停止
        match モデル.状態 with
        | ゲームオーバー -> []
        | _ ->
            let startTimer dispatch =
                let cts = new CancellationTokenSource()
                // 高速落下中は100ms、通常時は500ms
                let interval = if モデル.高速落下中 then 100 else 500

                let rec loop () =
                    async {
                        do! Async.Sleep(interval)
                        dispatch タイマー刻み
                        return! loop ()
                    }

                Async.Start(loop (), cts.Token)

                { new IDisposable with
                    member _.Dispose() = cts.Cancel() }

            [ [ "timer" ], startTimer ]
