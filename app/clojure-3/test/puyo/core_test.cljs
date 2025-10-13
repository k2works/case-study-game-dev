(ns puyo.core-test
  (:require [cljs.test :refer-macros [deftest is testing run-tests]]
            [puyo.core :as game]
            [puyo.stage :as stage]
            [puyo.player :as player]))

(deftest ゲーム状態の構造テスト
  (testing "ゲーム状態に必要なコンポーネントが含まれる"
    (let [状態 @game/ゲーム状態]
      (is (map? 状態) "ゲーム状態はマップである")
      (is (contains? 状態 :モード) "モードが含まれる")
      (is (contains? 状態 :フレーム) "フレームが含まれる")
      (is (contains? 状態 :盤面) "盤面が含まれる")
      (is (contains? 状態 :ぷよ) "ぷよが含まれる")
      (is (contains? 状態 :入力状態) "入力状態が含まれる")
      (is (number? (:フレーム 状態)) "フレーム数は数値である"))))

(deftest ゲーム更新テスト
  (testing "ゲーム更新でフレーム数が増加する"
    (let [初期フレーム (:フレーム @game/ゲーム状態)]
      (game/ゲーム更新)
      (let [更新後フレーム (:フレーム @game/ゲーム状態)]
        (is (= (inc 初期フレーム) 更新後フレーム) "フレーム数が1増加する")))))

;; テスト実行
(run-tests)
