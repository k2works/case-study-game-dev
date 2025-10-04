(ns puyo.core-test
  (:require [cljs.test :refer-macros [deftest is testing]]
            [puyo.core :as game]))

(deftest ゲームの初期化テスト
  (testing "ゲームを初期化すると、ゲーム状態がatomに設定される"
    ;; DOM要素とイベントリスナーをモック
    (set! js/document (js-obj "getElementById" (fn [_] (js-obj "getContext" (fn [_] nil)))
                              "addEventListener" (fn [_ _])))

    (game/initialize)
    (let [state @game/game-state]
      (is (= :new-puyo (:mode state)) "ゲームモードは:new-puyoである")
      (is (number? (:frame state)) "フレーム数は数値である")
      (is (zero? (:frame state)) "初期フレーム数は0である")
      (is (vector? (:field state)) "フィールドはベクターである")
      (is (nil? (:puyo state)) "初期ぷよはnilである"))))
