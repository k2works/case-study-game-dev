(ns puyo.core-test
  (:require [cljs.test :refer-macros [deftest is testing]]
            [puyo.core :as game]))

(deftest ゲームの初期化テスト
  (testing "ゲームを初期化すると、初期状態が設定される"
    (let [game-state (game/initialize)]
      (is (map? game-state) "ゲーム状態はマップである")
      (is (= :start (:mode game-state)) "ゲームモードは:startである")
      (is (number? (:frame game-state)) "フレーム数は数値である")
      (is (zero? (:frame game-state)) "初期フレーム数は0である")
      (is (number? (:combination-count game-state)) "連鎖カウントは数値である")
      (is (zero? (:combination-count game-state)) "初期連鎖カウントは0である")))

  (testing "ゲームを初期化すると、必要なコンポーネントが含まれる"
    (let [game-state (game/initialize)]
      (is (contains? game-state :config) "configが含まれる")
      (is (contains? game-state :stage) "stageが含まれる")
      (is (contains? game-state :player) "playerが含まれる")
      (is (contains? game-state :score) "scoreが含まれる"))))

(deftest ゲームループテスト
  (testing "ゲームループを開始すると、requestAnimationFrameが呼ばれる"
    ;; Node.js環境でglobalにrequestAnimationFrameを設定
    (let [called (atom false)
          call-count (atom 0)
          mock-raf (fn [callback]
                     (reset! called true)
                     ;; 無限ループを防ぐため、1回だけコールバックを実行
                     (when (and callback (< @call-count 1))
                       (swap! call-count inc)
                       (callback)))]

      (set! js/requestAnimationFrame mock-raf)

      (game/start-loop (game/initialize))
      (is @called "requestAnimationFrameが呼ばれた"))))
