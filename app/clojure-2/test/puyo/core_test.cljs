(ns puyo.core-test
  (:require [cljs.test :refer-macros [deftest is testing]]
            [puyo.core :as game]))

(deftest ゲームの初期化テスト
  (testing "ゲームを初期化すると、ゲーム状態がatomに設定される"
    ;; DOM要素とイベントリスナーをモック
    (set! js/document (js-obj "getElementById" (fn [_]
                                                  (js-obj "getContext" (fn [_] nil)
                                                          "addEventListener" (fn [_ _])))
                              "addEventListener" (fn [_ _])))

    (game/initialize)
    (let [state @game/game-state]
      (is (= :new-puyo (:mode state)) "ゲームモードは:new-puyoである")
      (is (number? (:frame state)) "フレーム数は数値である")
      (is (zero? (:frame state)) "初期フレーム数は0である")
      (is (vector? (:field state)) "フィールドはベクターである")
      (is (nil? (:puyo state)) "初期ぷよはnilである"))))

(deftest ゲームオーバー判定テスト
  (testing "出現位置が空の場合、ゲームオーバーではない"
    (let [field (vec (repeat 12 (vec (repeat 6 0))))]
      (is (false? (game/is-game-over? field)) "出現位置が空ならゲームオーバーではない")))

  (testing "出現位置[0 2]にぷよがある場合、ゲームオーバー"
    (let [field (-> (vec (repeat 12 (vec (repeat 6 0))))
                    (assoc-in [0 2] 1))]
      (is (true? (game/is-game-over? field)) "出現位置にぷよがあればゲームオーバー")))

  (testing "出現位置[0 3]にぷよがある場合、ゲームオーバー"
    (let [field (-> (vec (repeat 12 (vec (repeat 6 0))))
                    (assoc-in [0 3] 1))]
      (is (true? (game/is-game-over? field)) "出現位置にぷよがあればゲームオーバー")))

  (testing "出現位置の両方にぷよがある場合、ゲームオーバー"
    (let [field (-> (vec (repeat 12 (vec (repeat 6 0))))
                    (assoc-in [0 2] 1)
                    (assoc-in [0 3] 2))]
      (is (true? (game/is-game-over? field)) "出現位置にぷよがあればゲームオーバー")))

  (testing "出現位置以外にぷよがあっても、ゲームオーバーではない"
    (let [field (-> (vec (repeat 12 (vec (repeat 6 0))))
                    (assoc-in [1 2] 1)
                    (assoc-in [1 3] 2))]
      (is (false? (game/is-game-over? field)) "出現位置以外のぷよではゲームオーバーにならない"))))
