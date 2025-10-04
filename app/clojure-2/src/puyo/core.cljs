(ns puyo.core
  (:require [puyo.config :as config]
            [puyo.player :as player]
            [puyo.stage :as stage]))

(defonce game-state
  (atom {:mode :new-puyo
         :frame 0
         :field (stage/create-field)
         :puyo nil
         :input-state (player/create-input-state)
         :canvas-ctx nil}))

(defn initialize
  "ゲームを初期化する"
  []
  (let [canvas-ctx (stage/setup-canvas)]
    (reset! game-state
            {:mode :new-puyo
             :frame 0
             :field (stage/create-field)
             :puyo nil
             :input-state (player/create-input-state)
             :canvas-ctx canvas-ctx}))

  ;; キーボードイベントをセットアップ
  (player/setup-keyboard-events (:input-state @game-state)))

(defn update-game
  "ゲームを更新する"
  []
  (swap! game-state update :frame inc)

  (case (:mode @game-state)
    :new-puyo
    (do
      (swap! game-state assoc :puyo (player/create-puyo))
      (swap! game-state assoc :mode :playing))

    :playing
    (let [config (config/get-config)
          updated-puyo (player/update-puyo
                        (:puyo @game-state)
                        (:input-state @game-state)
                        config)]
      (swap! game-state assoc :puyo updated-puyo))

    nil))

(defn draw-game
  "ゲームを描画する"
  []
  (let [{:keys [canvas-ctx field puyo mode]} @game-state]
    (stage/clear-canvas canvas-ctx)
    (stage/draw-field canvas-ctx field)
    (when (= mode :playing)
      (stage/draw-current-puyo canvas-ctx puyo))))

(defn game-loop
  "ゲームループ"
  []
  (update-game)
  (draw-game)
  (js/requestAnimationFrame game-loop))

(defn init
  "ゲームのエントリーポイント"
  []
  (.log js/console "Puyo Puyo Game Started!")
  (initialize)
  (game-loop))
