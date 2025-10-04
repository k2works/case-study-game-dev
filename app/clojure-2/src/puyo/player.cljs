(ns puyo.player)

(defn create-input-state
  "入力状態を作成する"
  []
  {:left (atom false)
   :right (atom false)
   :up (atom false)
   :down (atom false)})

(defn handle-key-down
  "キー押下時の処理"
  [input-state key-code]
  (case key-code
    "ArrowLeft" (reset! (:left input-state) true)
    "ArrowRight" (reset! (:right input-state) true)
    "ArrowUp" (reset! (:up input-state) true)
    "ArrowDown" (reset! (:down input-state) true)
    nil))

(defn handle-key-up
  "キー解放時の処理"
  [input-state key-code]
  (case key-code
    "ArrowLeft" (reset! (:left input-state) false)
    "ArrowRight" (reset! (:right input-state) false)
    "ArrowUp" (reset! (:up input-state) false)
    "ArrowDown" (reset! (:down input-state) false)
    nil))

(defn setup-keyboard-events
  "キーボードイベントをセットアップする"
  [input-state]
  (.addEventListener js/document "keydown"
                     (fn [e] (handle-key-down input-state (.-key e))))
  (.addEventListener js/document "keyup"
                     (fn [e] (handle-key-up input-state (.-key e)))))

(defn create-puyo
  "新しいぷよを作成する"
  []
  {:x 2
   :y 0
   :type (inc (rand-int 4)) ; 1-4のランダムな値
   :rotation 0})

(defn move-left
  "ぷよを左に移動する"
  [puyo-state _config]
  (if (> (:x puyo-state) 0)
    (update puyo-state :x dec)
    puyo-state))

(defn move-right
  "ぷよを右に移動する"
  [puyo-state config]
  (if (< (:x puyo-state) (dec (:stage-cols config)))
    (update puyo-state :x inc)
    puyo-state))

(defn update-puyo
  "入力に応じてぷよを更新する"
  [puyo-state input-state config]
  (cond
    @(:left input-state)
    (do
      (reset! (:left input-state) false)
      (move-left puyo-state config))

    @(:right input-state)
    (do
      (reset! (:right input-state) false)
      (move-right puyo-state config))

    :else
    puyo-state))
