(ns puyo.score-allclear-test
  (:require [cljs.test :refer-macros [deftest is testing]]
            [puyo.score :as score]))

(deftest 全消し判定テスト
  (testing "空のフィールドは全消し状態"
    (let [field (vec (repeat 12 (vec (repeat 6 0))))]
      (is (true? (score/all-cleared? field)) "すべて0のフィールドは全消し")))

  (testing "ぷよが1つでもあれば全消しではない"
    (let [field (-> (vec (repeat 12 (vec (repeat 6 0))))
                    (assoc-in [11 2] 1))]
      (is (false? (score/all-cleared? field)) "ぷよが1つでもあれば全消しではない")))

  (testing "複数のぷよがあれば全消しではない"
    (let [field (-> (vec (repeat 12 (vec (repeat 6 0))))
                    (assoc-in [11 0] 1)
                    (assoc-in [11 1] 2)
                    (assoc-in [11 2] 3))]
      (is (false? (score/all-cleared? field)) "複数のぷよがあれば全消しではない"))))
