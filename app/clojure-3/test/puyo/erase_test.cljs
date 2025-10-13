(ns puyo.erase-test
  (:require [cljs.test :refer-macros [deftest is testing]]
            [puyo.erase :as erase]))

(deftest ぷよ探索テスト
  (testing "同じ色のぷよが4つ以上繋がっている場合、そのグループを取得できる"
    (let [盤面 [[1 1 0 0 0 0]
                 [1 1 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]]
          group (erase/接続探索 盤面 0 0)]
      (is (= 4 (count group)) "4つのぷよが繋がっている")
      (is (contains? (set group) [0 0]))
      (is (contains? (set group) [0 1]))
      (is (contains? (set group) [1 0]))
      (is (contains? (set group) [1 1]))))

  (testing "3つ以下のぷよは消去対象にならない"
    (let [盤面 [[1 1 1 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]]
          消去可能 (erase/消去可能グループ探索 盤面)]
      (is (empty? 消去可能) "3つのグループは消去されない"))))

(deftest 重力適用テスト
  (testing "ぷよが消去された後、上から落ちてくる"
    (let [盤面 [[0 0 0 0 0 0]
                 [1 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [1 0 0 0 0 0]]
          結果 (erase/重力適用 盤面)]
      (is (= 0 (get-in 結果 [0 0])) "最上行は空")
      (is (= 0 (get-in 結果 [1 0])) "2行目も空")
      (is (= 1 (get-in 結果 [2 0])) "ぷよが落ちている")
      (is (= 1 (get-in 結果 [3 0])) "ぷよが落ちている"))))

(deftest ぷよ消去テスト
  (testing "指定されたグループのぷよが消去される"
    (let [盤面 [[1 1 0 0 0 0]
                 [1 1 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]]
          グループ [#{[0 0] [0 1] [1 0] [1 1]}]
          結果 (erase/ぷよ消去 盤面 グループ)]
      (is (= 0 (get-in 結果 [0 0])))
      (is (= 0 (get-in 結果 [0 1])))
      (is (= 0 (get-in 結果 [1 0])))
      (is (= 0 (get-in 結果 [1 1]))))))
