module BasicTests

open Expecto

[<Tests>]
let tests =
    testList
        "環境確認テスト"
        [ test "基本的な算術演算が動作する" {
              let result = 2 + 2
              Expect.equal result 4 "2 + 2 は 4 であるべき"
          }

          test "リストの長さが正しい" {
              let list = [ 1; 2; 3; 4; 5 ]
              Expect.equal (List.length list) 5 "リストの長さは 5 であるべき"
          }

          test "文字列の連結が動作する" {
              let result = "Hello, " + "F#!"
              Expect.equal result "Hello, F#!" "文字列が正しく連結されるべき"
          } ]
