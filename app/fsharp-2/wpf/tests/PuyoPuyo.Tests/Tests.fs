module Tests

open Xunit
open FsUnit.Xunit

[<Fact>]
let ``環境セットアップの確認`` () =
    // イテレーション 0: 環境が正しくセットアップされたことを確認するテスト
    1 + 1 |> should equal 2
