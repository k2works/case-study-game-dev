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

(defn rotate-right
  "時計回りに回転する"
  [puyo-state]
  (update puyo-state :rotation #(mod (inc %) 4)))

(defn rotate-left
  "反時計回りに回転する"
  [puyo-state]
  (update puyo-state :rotation #(mod (+ % 3) 4)))

(defn get-child-offset
  "回転状態に応じた子ぷよのオフセットを取得"
  [rotation]
  (case rotation
    0 {:x 0 :y -1}  ; 上
    1 {:x 1 :y 0}   ; 右
    2 {:x 0 :y 1}   ; 下
    3 {:x -1 :y 0}  ; 左
    {:x 0 :y -1}))  ; デフォルト

(defn perform-rotation
  "回転を実行し、必要に応じて壁キックを行う"
  [puyo-state config rotate-fn]
  (let [rotated (rotate-fn puyo-state)
        offset (get-child-offset (:rotation rotated))
        child-x (+ (:x rotated) (:x offset))]
    (cond
      ;; 右壁にめり込む場合、左に移動
      (>= child-x (:stage-cols config))
      (update rotated :x dec)

      ;; 左壁にめり込む場合、右に移動
      (< child-x 0)
      (update rotated :x inc)

      ;; 壁にめり込まない場合、そのまま
      :else
      rotated)))

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

    @(:up input-state)
    (do
      (reset! (:up input-state) false)
      (perform-rotation puyo-state config rotate-right))

    :else
    puyo-state))
