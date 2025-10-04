(ns puyo.player-test
  (:require [cljs.test :refer-macros [deftest is testing]]
            [puyo.player :as player]))

(deftest キー入力検出テスト
  (testing "左キーが押されると、左向きの移動フラグが立つ"
    (let [input-state (player/create-input-state)]
      ;; 左キー押下をシミュレート
      (player/handle-key-down input-state "ArrowLeft")

      (is (true? @(:left input-state)) "左フラグがtrueになる")))

  (testing "右キーが押されると、右向きの移動フラグが立つ"
    (let [input-state (player/create-input-state)]
      ;; 右キー押下をシミュレート
      (player/handle-key-down input-state "ArrowRight")

      (is (true? @(:right input-state)) "右フラグがtrueになる")))

  (testing "キーが離されると、対応する移動フラグが下がる"
    (let [input-state (player/create-input-state)]
      ;; まず左キーを押す
      (player/handle-key-down input-state "ArrowLeft")
      (is (true? @(:left input-state)) "左フラグがtrueになる")

      ;; 次に左キーを離す
      (player/handle-key-up input-state "ArrowLeft")
      (is (false? @(:left input-state)) "左フラグがfalseになる"))))

(deftest ぷよ移動テスト
  (testing "左に移動できる場合、左に移動する"
    (let [puyo-state {:x 2 :y 0 :type 1 :rotation 0}
          config {:stage-cols 6}
          new-state (player/move-left puyo-state config)]
      (is (= 1 (:x new-state)) "X座標が1減少する")))

  (testing "右に移動できる場合、右に移動する"
    (let [puyo-state {:x 2 :y 0 :type 1 :rotation 0}
          config {:stage-cols 6}
          new-state (player/move-right puyo-state config)]
      (is (= 3 (:x new-state)) "X座標が1増加する")))

  (testing "左端にいる場合、左に移動できない"
    (let [puyo-state {:x 0 :y 0 :type 1 :rotation 0}
          config {:stage-cols 6}
          new-state (player/move-left puyo-state config)]
      (is (= 0 (:x new-state)) "X座標が変わらない")))

  (testing "右端にいる場合、右に移動できない"
    (let [puyo-state {:x 5 :y 0 :type 1 :rotation 0}
          config {:stage-cols 6}
          new-state (player/move-right puyo-state config)]
      (is (= 5 (:x new-state)) "X座標が変わらない"))))
