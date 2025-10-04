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
          field (vec (repeat 12 (vec (repeat 6 0))))
          config {:stage-cols 6}
          new-state (player/move-left puyo-state field config)]
      (is (= 1 (:x new-state)) "X座標が1減少する")))

  (testing "右に移動できる場合、右に移動する"
    (let [puyo-state {:x 2 :y 0 :type 1 :rotation 0}
          field (vec (repeat 12 (vec (repeat 6 0))))
          config {:stage-cols 6}
          new-state (player/move-right puyo-state field config)]
      (is (= 3 (:x new-state)) "X座標が1増加する")))

  (testing "左端にいる場合、左に移動できない"
    (let [puyo-state {:x 0 :y 0 :type 1 :rotation 0}
          field (vec (repeat 12 (vec (repeat 6 0))))
          config {:stage-cols 6}
          new-state (player/move-left puyo-state field config)]
      (is (= 0 (:x new-state)) "X座標が変わらない")))

  (testing "右端にいる場合、右に移動できない"
    (let [puyo-state {:x 5 :y 0 :type 1 :rotation 0}
          field (vec (repeat 12 (vec (repeat 6 0))))
          config {:stage-cols 6}
          new-state (player/move-right puyo-state field config)]
      (is (= 5 (:x new-state)) "X座標が変わらない"))))

(deftest ぷよ回転テスト
  (testing "時計回りに回転すると、回転状態が1増える"
    (let [puyo-state {:x 2 :y 0 :type 1 :rotation 0}
          new-state (player/rotate-right puyo-state)]
      (is (= 1 (:rotation new-state)) "回転状態が1になる")))

  (testing "反時計回りに回転すると、回転状態が1減る"
    (let [puyo-state {:x 2 :y 0 :type 1 :rotation 1}
          new-state (player/rotate-left puyo-state)]
      (is (= 0 (:rotation new-state)) "回転状態が0になる")))

  (testing "回転状態が4になると0に戻る"
    (let [puyo-state {:x 2 :y 0 :type 1 :rotation 3}
          new-state (player/rotate-right puyo-state)]
      (is (= 0 (:rotation new-state)) "回転状態が0に戻る"))))

(deftest 壁キック処理テスト
  (testing "右端で右回転すると、左に移動して回転する（壁キック）"
    (let [config {:stage-cols 6}
          field (vec (repeat 12 (vec (repeat 6 0))))
          puyo-state {:x 5 :y 0 :type 1 :rotation 0}
          new-state (player/perform-rotation puyo-state field config player/rotate-right)]
      (is (= 4 (:x new-state)) "X座標が4になる（左に移動）")
      (is (= 1 (:rotation new-state)) "回転状態が1になる")))

  (testing "左端で左回転すると、右に移動して回転する（壁キック）"
    (let [config {:stage-cols 6}
          field (vec (repeat 12 (vec (repeat 6 0))))
          puyo-state {:x 0 :y 0 :type 1 :rotation 0}
          new-state (player/perform-rotation puyo-state field config player/rotate-left)]
      (is (= 1 (:x new-state)) "X座標が1になる（右に移動）")
      (is (= 3 (:rotation new-state)) "回転状態が3になる"))))

(deftest 自由落下テスト
  (testing "ぷよが自由落下する"
    (let [puyo-state {:x 2 :y 0 :type 1 :rotation 0}
          field (vec (repeat 12 (vec (repeat 6 0))))
          config {:stage-rows 12}
          new-state (player/apply-gravity puyo-state field config)]
      (is (= 1 (:y new-state)) "Y座標が1増加する")))

  (testing "最下段にいる場合、落下しない"
    (let [puyo-state {:x 2 :y 11 :type 1 :rotation 0}
          field (vec (repeat 12 (vec (repeat 6 0))))
          config {:stage-rows 12}
          new-state (player/apply-gravity puyo-state field config)]
      (is (= 11 (:y new-state)) "Y座標が変わらない")))

  (testing "回転状態に応じて子ぷよも落下判定を考慮する"
    (let [puyo-state {:x 2 :y 10 :type 1 :rotation 2}  ; 子ぷよが下
          field (vec (repeat 12 (vec (repeat 6 0))))
          config {:stage-rows 12}
          new-state (player/apply-gravity puyo-state field config)]
      (is (= 10 (:y new-state)) "子ぷよが最下段なので落下しない")))

  (testing "下にぷよがある場合、落下しない"
    (let [puyo-state {:x 2 :y 5 :type 1 :rotation 0}
          field (-> (vec (repeat 12 (vec (repeat 6 0))))
                    (assoc-in [6 2] 1))  ; 下にぷよ
          config {:stage-rows 12}
          new-state (player/apply-gravity puyo-state field config)]
      (is (= 5 (:y new-state)) "下にぷよがあるので落下しない"))))

(deftest 設置判定テスト
  (testing "最下段にいる場合、設置状態になる"
    (let [puyo-state {:x 2 :y 11 :type 1 :rotation 0}
          field (vec (repeat 12 (vec (repeat 6 0))))
          config {:stage-rows 12}]
      (is (true? (player/should-land? puyo-state field config)) "設置判定がtrueになる")))

  (testing "最下段でない場合、設置状態にならない"
    (let [puyo-state {:x 2 :y 5 :type 1 :rotation 0}
          field (vec (repeat 12 (vec (repeat 6 0))))
          config {:stage-rows 12}]
      (is (false? (player/should-land? puyo-state field config)) "設置判定がfalseになる")))

  (testing "子ぷよが最下段にいる場合、設置状態になる"
    (let [puyo-state {:x 2 :y 10 :type 1 :rotation 2}  ; 子ぷよが下(y=11)
          field (vec (repeat 12 (vec (repeat 6 0))))
          config {:stage-rows 12}]
      (is (true? (player/should-land? puyo-state field config)) "設置判定がtrueになる")))

  (testing "下にぷよがある場合、設置状態になる"
    (let [puyo-state {:x 2 :y 5 :type 1 :rotation 0}
          field (-> (vec (repeat 12 (vec (repeat 6 0))))
                    (assoc-in [6 2] 1))  ; 下にぷよ
          config {:stage-rows 12}]
      (is (true? (player/should-land? puyo-state field config)) "設置判定がtrueになる")))

  (testing "子ぷよの下にぷよがある場合、設置状態になる"
    (let [puyo-state {:x 2 :y 5 :type 1 :rotation 2}  ; 子ぷよが下
          field (-> (vec (repeat 12 (vec (repeat 6 0))))
                    (assoc-in [7 2] 1))  ; 子ぷよの下にぷよ
          config {:stage-rows 12}]
      (is (true? (player/should-land? puyo-state field config)) "設置判定がtrueになる"))))

(deftest 衝突判定テスト
  (testing "フィールドが空の場合、衝突しない"
    (let [puyo-state {:x 2 :y 5 :type 1 :rotation 0}
          field (vec (repeat 12 (vec (repeat 6 0))))]
      (is (false? (player/collides? puyo-state field)) "衝突判定がfalseになる")))

  (testing "軸ぷよがフィールドのぷよと重なる場合、衝突する"
    (let [puyo-state {:x 2 :y 5 :type 1 :rotation 0}
          field (-> (vec (repeat 12 (vec (repeat 6 0))))
                    (assoc-in [5 2] 1))]
      (is (true? (player/collides? puyo-state field)) "衝突判定がtrueになる")))

  (testing "子ぷよがフィールドのぷよと重なる場合、衝突する"
    (let [puyo-state {:x 2 :y 5 :type 1 :rotation 1}  ; 子ぷよが右
          field (-> (vec (repeat 12 (vec (repeat 6 0))))
                    (assoc-in [5 3] 1))]  ; 子ぷよの位置
      (is (true? (player/collides? puyo-state field)) "衝突判定がtrueになる"))))
