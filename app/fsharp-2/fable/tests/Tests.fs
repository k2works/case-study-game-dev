module PuyoPuyo.Tests

open Fable.Mocha

let tests =
    testList "初期テスト" [
        testCase "サンプルテスト - 1 + 1 は 2" <| fun _ ->
            let result = 1 + 1
            Expect.equal result 2 "1 + 1 は 2 であるべき"
    ]

[<EntryPoint>]
let main args =
    Mocha.runTests tests
