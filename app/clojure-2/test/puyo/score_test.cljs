(ns puyo.score-test
  (:require [cljs.test :refer-macros [deftest is testing]]
            [puyo.score :as score]))

(deftest スコア計算テスト
  (testing "1連鎖目のスコア計算"
    (let [erased-count 4
          chain-count 1
          score (score/calculate-score erased-count chain-count)]
      (is (= 360 score) "4個消して1連鎖: 4 * 10 * (1 + 8) = 360")))

  (testing "2連鎖目のスコア計算"
    (let [erased-count 4
          chain-count 2
          score (score/calculate-score erased-count chain-count)]
      (is (= 680 score) "4個消して2連鎖: 4 * 10 * (1 + 16) = 680")))

  (testing "3連鎖目のスコア計算"
    (let [erased-count 4
          chain-count 3
          score (score/calculate-score erased-count chain-count)]
      (is (= 1320 score) "4個消して3連鎖: 4 * 10 * (1 + 32) = 1,320")))

  (testing "大量消去のスコア計算"
    (let [erased-count 10
          chain-count 1
          score (score/calculate-score erased-count chain-count)]
      (is (= 900 score) "10個消して1連鎖: 10 * 10 * (1 + 8) = 900")))

  (testing "連鎖なし（0連鎖）のスコア計算"
    (let [erased-count 4
          chain-count 0
          score (score/calculate-score erased-count chain-count)]
      (is (= 40 score) "4個消して0連鎖: 4 * 10 * 1 = 40"))))
