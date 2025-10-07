module PuyoPuyo.Client.Main

open Elmish
open Bolero
open PuyoPuyo.Elmish
open PuyoPuyo.Components

type MyApp() =
    inherit ProgramComponent<モデル, メッセージ>()

    override this.Program = Program.mkProgram (fun _ -> モデル.初期化 (), Cmd.none) 更新.更新 ゲーム画面.ビュー
