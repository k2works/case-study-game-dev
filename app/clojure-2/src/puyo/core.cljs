(ns puyo.core
  (:require [puyo.config :as config]
            [puyo.player :as player]
            [puyo.stage :as stage]
            [puyo.erase :as erase]
            [puyo.score :as score]))

(defonce game-state
  (atom {:mode :new-puyo
         :frame 0
         :field (stage/create-field)
         :puyo nil
         :input-state (player/create-input-state)
         :canvas-ctx nil
         :score 0
         :chain-count 0}))

(defn is-game-over?
  "ゲームオーバー判定（出現位置にぷよがあるか）"
  [field]
  (or (> (get-in field [0 2]) 0)
      (> (get-in field [0 3]) 0)))

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
             :canvas-ctx canvas-ctx
             :score 0
             :chain-count 0}))

  ;; キーボードイベントをセットアップ
  (player/setup-keyboard-events (:input-state @game-state)))

(defn update-game
  "ゲームを更新する"
  []
  (swap! game-state update :frame inc)

  (case (:mode @game-state)
    :new-puyo
    (let [field (:field @game-state)]
      (if (is-game-over? field)
        (swap! game-state assoc :mode :game-over)
        (do
          (swap! game-state assoc :puyo (player/create-puyo))
          (swap! game-state assoc :mode :playing))))

    :playing
    (let [config (config/get-config)
          field (:field @game-state)
          updated-puyo (player/update-puyo
                        (:puyo @game-state)
                        (:input-state @game-state)
                        field
                        config)
          ;; 一定フレームごとに自由落下を適用
          gravity-puyo (if (zero? (mod (:frame @game-state) 30))
                         (player/apply-gravity updated-puyo field config)
                         updated-puyo)]
      ;; 設置判定
      (if (player/should-land? gravity-puyo field config)
        (do
          (swap! game-state update :field player/land-puyo gravity-puyo)
          (swap! game-state assoc :mode :apply-gravity))
        (swap! game-state assoc :puyo gravity-puyo)))

    :check-erase
    (let [groups (erase/find-erasable-groups (:field @game-state))]
      (if (seq groups)
        (let [erased-count (reduce + (map count groups))
              chain-count (inc (:chain-count @game-state))
              points (score/calculate-score erased-count chain-count)
              field-after-erase (erase/erase-puyos (:field @game-state) groups)
              all-clear-bonus (if (score/all-cleared? field-after-erase)
                                score/zenkeshi-bonus
                                0)]
          (swap! game-state update :field (fn [_] field-after-erase))
          (swap! game-state update :score + points all-clear-bonus)
          (swap! game-state assoc :chain-count chain-count)
          (swap! game-state assoc :mode :apply-gravity))
        (do
          (swap! game-state assoc :chain-count 0)
          (swap! game-state assoc :mode :new-puyo))))

    :apply-gravity
    (do
      (swap! game-state update :field erase/apply-gravity)
      (swap! game-state assoc :mode :check-erase))

    :game-over
    nil

    nil))

(defn draw-game
  "ゲームを描画する"
  []
  (let [{:keys [canvas-ctx field puyo mode score chain-count]} @game-state]
    (stage/clear-canvas canvas-ctx)
    (stage/draw-field canvas-ctx field)
    (when (= mode :playing)
      (stage/draw-current-puyo canvas-ctx puyo))
    (stage/draw-score canvas-ctx score chain-count)
    (when (= mode :game-over)
      (stage/draw-game-over canvas-ctx))))

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
