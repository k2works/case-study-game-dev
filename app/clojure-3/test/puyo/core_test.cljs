(ns puyo.core-test
  (:require [cljs.test :refer-macros [deftest is testing run-tests]]
            [puyo.core :as game]))

(deftest ゲームの初期化テスト
  (testing "ゲームを初期化すると、初期状態が設定される"
    (let [ゲーム状態 (game/初期化)]
      (is (map? ゲーム状態) "ゲーム状態はマップである")
      (is (= :開始 (:モード ゲーム状態)) "ゲームモードは:開始である")
      (is (number? (:フレーム ゲーム状態)) "フレーム数は数値である")
      (is (zero? (:フレーム ゲーム状態)) "初期フレーム数は0である")
      (is (number? (:連鎖カウント ゲーム状態)) "連鎖カウントは数値である")
      (is (zero? (:連鎖カウント ゲーム状態)) "初期連鎖カウントは0である")))

  (testing "ゲームを初期化すると、必要なコンポーネントが含まれる"
    (let [ゲーム状態 (game/初期化)]
      (is (contains? ゲーム状態 :設定) "設定が含まれる")
      (is (contains? ゲーム状態 :ステージ) "ステージが含まれる")
      (is (contains? ゲーム状態 :プレイヤー) "プレイヤーが含まれる")
      (is (contains? ゲーム状態 :スコア) "スコアが含まれる"))))

(deftest ゲームループテスト
  (testing "ゲームループを開始すると、requestAnimationFrameが呼ばれる"
    (let [called (atom false)
          original-raf (.-requestAnimationFrame js/global)]
      ;; requestAnimationFrameをモック
      (set! (.-requestAnimationFrame js/global)
            (fn [callback]
              (reset! called true)
              callback))

      (try
        (game/ループ開始 (game/初期化))
        (is @called "requestAnimationFrameが呼ばれた")
        (finally
          ;; 元に戻す（存在しない場合は undefined をセット）
          (set! (.-requestAnimationFrame js/global) original-raf))))))

;; テスト実行
(run-tests)
