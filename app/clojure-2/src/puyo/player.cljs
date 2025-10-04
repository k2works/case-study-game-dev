(ns puyo.player
  (:require [puyo.config :as config]))

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

(defn get-child-offset
  "回転状態に応じた子ぷよのオフセットを取得"
  [rotation]
  (case rotation
    0 {:x 0 :y -1}  ; 上
    1 {:x 1 :y 0}   ; 右
    2 {:x 0 :y 1}   ; 下
    3 {:x -1 :y 0}  ; 左
    {:x 0 :y -1}))  ; デフォルト

(defn collides?
  "ぷよがフィールドのぷよと衝突するか、画面外に出るかを判定する"
  [puyo-state field]
  (let [offset (get-child-offset (:rotation puyo-state))
        child-x (+ (:x puyo-state) (:x offset))
        child-y (+ (:y puyo-state) (:y offset))
        axis-x (:x puyo-state)
        axis-y (:y puyo-state)]
    (or
     ;; 軸ぷよが左右または下方向に画面外（上方向は許容）
     (< axis-x 0)
     (>= axis-x config/stage-cols)
     (>= axis-y config/stage-rows)
     ;; 子ぷよが左右または下方向に画面外（上方向は許容）
     (< child-x 0)
     (>= child-x config/stage-cols)
     (>= child-y config/stage-rows)
     ;; フィールドのぷよと衝突（範囲内のみチェック）
     (and (>= axis-y 0) (>= axis-x 0)
          (< axis-y config/stage-rows) (< axis-x config/stage-cols)
          (pos? (get-in field [axis-y axis-x] 0)))
     (and (>= child-y 0) (>= child-x 0)
          (< child-y config/stage-rows) (< child-x config/stage-cols)
          (pos? (get-in field [child-y child-x] 0))))))

(defn move-left
  "ぷよを左に移動する"
  [puyo-state field _config]
  (if (> (:x puyo-state) 0)
    (let [moved (update puyo-state :x dec)]
      (if (collides? moved field)
        puyo-state
        moved))
    puyo-state))

(defn move-right
  "ぷよを右に移動する"
  [puyo-state field config]
  (if (< (:x puyo-state) (dec (:stage-cols config)))
    (let [moved (update puyo-state :x inc)]
      (if (collides? moved field)
        puyo-state
        moved))
    puyo-state))

(defn rotate-right
  "時計回りに回転する"
  [puyo-state]
  (update puyo-state :rotation #(mod (inc %) 4)))

(defn rotate-left
  "反時計回りに回転する"
  [puyo-state]
  (update puyo-state :rotation #(mod (+ % 3) 4)))

(defn perform-rotation
  "回転を実行し、必要に応じて壁キックを行う"
  [puyo-state field config rotate-fn]
  (let [rotated (rotate-fn puyo-state)
        offset (get-child-offset (:rotation rotated))
        child-x (+ (:x rotated) (:x offset))
        kicked (cond
                 ;; 右壁にめり込む場合、左に移動
                 (>= child-x (:stage-cols config))
                 (update rotated :x dec)

                 ;; 左壁にめり込む場合、右に移動
                 (< child-x 0)
                 (update rotated :x inc)

                 ;; 壁にめり込まない場合、そのまま
                 :else
                 rotated)]
    ;; 衝突判定
    (if (collides? kicked field)
      puyo-state
      kicked)))

(defn apply-gravity
  "重力を適用してぷよを落下させる"
  [puyo-state field config]
  (let [offset (get-child-offset (:rotation puyo-state))
        child-y (+ (:y puyo-state) (:y offset))
        max-y (dec (:stage-rows config))
        moved (update puyo-state :y inc)]
    (if (and (< (:y puyo-state) max-y)
             (< child-y max-y)
             (not (collides? moved field)))
      moved
      puyo-state)))

(defn should-land?
  "ぷよが設置すべきかを判定する"
  [puyo-state field config]
  (let [offset (get-child-offset (:rotation puyo-state))
        child-y (+ (:y puyo-state) (:y offset))
        max-y (dec (:stage-rows config))
        ;; 1マス下に移動したときの状態
        下移動 (update puyo-state :y inc)]
    (or (>= (:y puyo-state) max-y)
        (>= child-y max-y)
        (collides? 下移動 field))))

(defn land-puyo
  "ぷよをフィールドに固定する"
  [field puyo-state]
  (let [offset (get-child-offset (:rotation puyo-state))
        child-x (+ (:x puyo-state) (:x offset))
        child-y (+ (:y puyo-state) (:y offset))]
    (-> field
        (assoc-in [(:y puyo-state) (:x puyo-state)] (:type puyo-state))
        (assoc-in [child-y child-x] (:type puyo-state)))))

(defn update-puyo
  "入力に応じてぷよを更新する"
  [puyo-state input-state field config]
  (cond
    @(:left input-state)
    (do
      (reset! (:left input-state) false)
      (move-left puyo-state field config))

    @(:right input-state)
    (do
      (reset! (:right input-state) false)
      (move-right puyo-state field config))

    @(:up input-state)
    (do
      (reset! (:up input-state) false)
      (perform-rotation puyo-state field config rotate-right))

    :else
    puyo-state))

(defn handle-touch-input
  "タッチ入力を処理する（テスト用）"
  [input-state x canvas-width]
  (cond
    (< x (/ canvas-width 3))
    (reset! (:left input-state) true)

    (> x (* 2 (/ canvas-width 3)))
    (reset! (:right input-state) true)

    :else
    (reset! (:up input-state) true)))

(defn setup-touch-events
  "タッチイベントをセットアップする"
  [input-state]
  (when-let [canvas (.getElementById js/document "stage")]
    (.addEventListener canvas "touchstart"
                       (fn [e]
                         (.preventDefault e)
                         (let [touch (aget (.-touches e) 0)
                               x (.-clientX touch)
                               rect (.getBoundingClientRect canvas)
                               relative-x (- x (.-left rect))
                               canvas-width (.-width canvas)]
                           (handle-touch-input input-state relative-x canvas-width))))

    (.addEventListener canvas "touchend"
                       (fn [e]
                         (.preventDefault e)
                         (reset! (:left input-state) false)
                         (reset! (:right input-state) false)
                         (reset! (:up input-state) false)))))
