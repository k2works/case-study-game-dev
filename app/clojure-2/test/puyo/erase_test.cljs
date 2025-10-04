(ns puyo.erase-test
  (:require [cljs.test :refer-macros [deftest is testing]]
            [puyo.erase :as erase]))

(deftest ぷよ探索テスト
  (testing "同じ色のぷよが4つ以上繋がっている場合、そのグループを取得できる"
    (let [field [[1 1 0 0 0 0]
                 [1 1 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]]
          group (erase/find-connected field 0 0)]
      (is (= 4 (count group)) "4つのぷよが繋がっている")
      (is (contains? (set group) [0 0]))
      (is (contains? (set group) [0 1]))
      (is (contains? (set group) [1 0]))
      (is (contains? (set group) [1 1]))))

  (testing "3つ以下のぷよは消去対象にならない"
    (let [field [[1 1 1 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]]
          erasable (erase/find-erasable-groups field)]
      (is (empty? erasable) "3つのグループは消去されない")))

  (testing "L字型に繋がったぷよも検出できる"
    (let [field [[1 1 1 0 0 0]
                 [1 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]]
          group (erase/find-connected field 0 0)]
      (is (= 4 (count group)) "L字型の4つのぷよが繋がっている"))))

(deftest ぷよ消去テスト
  (testing "4つ以上繋がったぷよを消去できる"
    (let [field [[1 1 0 0 0 0]
                 [1 1 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]]
          groups (erase/find-erasable-groups field)
          erased-field (erase/erase-puyos field groups)]
      (is (= 1 (count groups)) "1つの消去可能なグループが見つかる")
      (is (= 0 (get-in erased-field [0 0])) "ぷよが消えている")
      (is (= 0 (get-in erased-field [0 1])) "ぷよが消えている")
      (is (= 0 (get-in erased-field [1 0])) "ぷよが消えている")
      (is (= 0 (get-in erased-field [1 1])) "ぷよが消えている")))

  (testing "複数のグループを同時に消去できる"
    (let [field [[1 1 0 2 2 0]
                 [1 1 0 2 2 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]]
          groups (erase/find-erasable-groups field)
          erased-field (erase/erase-puyos field groups)]
      (is (= 2 (count groups)) "2つの消去可能なグループが見つかる")
      (is (= 0 (get-in erased-field [0 0])) "左のグループが消えている")
      (is (= 0 (get-in erased-field [0 3])) "右のグループが消えている"))))

(deftest 重力適用テスト
  (testing "ぷよが下に落ちる"
    (let [field [[1 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]]
          result (erase/apply-gravity field)]
      (is (= 0 (get-in result [0 0])) "上部は空になる")
      (is (= 1 (get-in result [11 0])) "ぷよが最下段に落ちる")))

  (testing "複数のぷよが順番に落ちる"
    (let [field [[1 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [2 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [3 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]]
          result (erase/apply-gravity field)]
      (is (= 3 (get-in result [11 0])) "一番下が3")
      (is (= 2 (get-in result [10 0])) "その上が2")
      (is (= 1 (get-in result [9 0])) "さらにその上が1")))

  (testing "各列が独立して落下する"
    (let [field [[1 2 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 3 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]
                 [0 0 0 0 0 0]]
          result (erase/apply-gravity field)]
      (is (= 1 (get-in result [11 0])) "第1列の最下段が1")
      (is (= 3 (get-in result [11 1])) "第2列の最下段が3")
      (is (= 2 (get-in result [10 1])) "第2列の2段目が2"))))
