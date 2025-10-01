(ns puyo.specs-test
  (:require [cljs.test :refer-macros [deftest is testing run-tests]]
            [cljs.spec.alpha :as s]
            [puyo.specs :as specs]))

(deftest color-spec-test
  (testing "有効な色"
    (is (s/valid? ::specs/color 1))
    (is (s/valid? ::specs/color 2))
    (is (s/valid? ::specs/color 3))
    (is (s/valid? ::specs/color 4))
    (is (s/valid? ::specs/color 5)))

  (testing "無効な色"
    (is (not (s/valid? ::specs/color 0)))
    (is (not (s/valid? ::specs/color 6)))
    (is (not (s/valid? ::specs/color -1)))
    (is (not (s/valid? ::specs/color "red")))))

(deftest position-spec-test
  (testing "有効な位置"
    (is (s/valid? ::specs/position {:x 0 :y 0}))
    (is (s/valid? ::specs/position {:x 7 :y 11}))
    (is (s/valid? ::specs/position {:x 4 :y 6})))

  (testing "無効な位置"
    (is (not (s/valid? ::specs/position {:x -1 :y 0})))
    (is (not (s/valid? ::specs/position {:x 8 :y 0})))
    (is (not (s/valid? ::specs/position {:x 0 :y -1})))
    (is (not (s/valid? ::specs/position {:x 0 :y 12})))))

(deftest rotation-spec-test
  (testing "有効な回転"
    (is (s/valid? ::specs/rotation 0))
    (is (s/valid? ::specs/rotation 1))
    (is (s/valid? ::specs/rotation 2))
    (is (s/valid? ::specs/rotation 3)))

  (testing "無効な回転"
    (is (not (s/valid? ::specs/rotation -1)))
    (is (not (s/valid? ::specs/rotation 4)))
    (is (not (s/valid? ::specs/rotation "0")))))

(deftest puyo-spec-test
  (testing "有効なぷよ"
    (is (s/valid? ::specs/puyo {:color 1 :x 0 :y 0}))
    (is (s/valid? ::specs/puyo {:color 5 :x 7 :y 11})))

  (testing "無効なぷよ"
    (is (not (s/valid? ::specs/puyo {:color 0 :x 0 :y 0})))
    (is (not (s/valid? ::specs/puyo {:color 1 :x 8 :y 0})))
    (is (not (s/valid? ::specs/puyo {:x 0 :y 0}))))) ; color が欠けている

(deftest puyo-pair-spec-test
  (testing "有効な組ぷよ"
    (is (s/valid? ::specs/puyo-pair
                  {:puyo1 {:color 1 :x 3 :y 0}
                   :puyo2 {:color 2 :x 3 :y 1}
                   :rotation 0})))

  (testing "無効な組ぷよ"
    (is (not (s/valid? ::specs/puyo-pair
                       {:puyo1 {:color 1 :x 3 :y 0}
                        :puyo2 {:color 2 :x 3 :y 1}}))) ; rotation が欠けている
    (is (not (s/valid? ::specs/puyo-pair
                       {:puyo1 {:color 0 :x 3 :y 0}
                        :puyo2 {:color 2 :x 3 :y 1}
                        :rotation 0}))))) ; 無効な色

(deftest board-spec-test
  (testing "有効なボード"
    (let [empty-board (vec (repeat 12 (vec (repeat 8 0))))]
      (is (s/valid? ::specs/board empty-board)))

    (let [board-with-puyo (-> (vec (repeat 12 (vec (repeat 8 0))))
                              (assoc-in [11 3] 1)
                              (assoc-in [11 4] 2))]
      (is (s/valid? ::specs/board board-with-puyo))))

  (testing "無効なボード"
    (is (not (s/valid? ::specs/board []))) ; 空のボード
    (is (not (s/valid? ::specs/board (vec (repeat 10 (vec (repeat 8 0))))))) ; 行数が少ない
    (is (not (s/valid? ::specs/board (vec (repeat 12 (vec (repeat 6 0))))))))) ; 列数が少ない

(deftest game-state-spec-test
  (testing "有効なゲーム状態"
    (let [game-state {:board (vec (repeat 12 (vec (repeat 8 0))))
                      :current-piece {:puyo1 {:color 1 :x 3 :y 0}
                                      :puyo2 {:color 2 :x 3 :y 1}
                                      :rotation 0}
                      :next-piece {:puyo1 {:color 3 :x 3 :y 0}
                                   :puyo2 {:color 4 :x 3 :y 1}
                                   :rotation 0}
                      :score 0
                      :level 1
                      :chain-count 0
                      :game-time 0
                      :game-running true}]
      (is (s/valid? ::specs/game-state game-state))))

  (testing "無効なゲーム状態"
    (let [invalid-state {:board (vec (repeat 12 (vec (repeat 8 0))))
                         :current-piece nil
                         :next-piece nil
                         :score -10  ; 負のスコア
                         :level 1
                         :chain-count 0
                         :game-time 0
                         :game-running true}]
      (is (not (s/valid? ::specs/game-state invalid-state))))))

(deftest validate-data-test
  (testing "有効なデータの検証"
    (is (true? (specs/validate-data ::specs/color 1)))
    (is (true? (specs/validate-data ::specs/rotation 0))))

  (testing "無効なデータの検証"
    (is (false? (specs/validate-data ::specs/color 0)))
    (is (false? (specs/validate-data ::specs/rotation 4)))))

(deftest validate-and-throw-test
  (testing "有効なデータは例外をスローしない"
    (is (= {:color 1 :x 0 :y 0}
           (specs/validate-and-throw ::specs/puyo
                                     {:color 1 :x 0 :y 0}
                                     "Invalid puyo"))))

  (testing "無効なデータは例外をスロー"
    (is (thrown? js/Error
                 (specs/validate-and-throw ::specs/puyo
                                           {:color 0 :x 0 :y 0}
                                           "Invalid puyo")))))

;; テスト実行
(run-tests)
