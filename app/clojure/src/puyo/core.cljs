(ns puyo.core
  (:require [puyo.specs :as specs]
            [cljs.spec.alpha :as s]))

;; ========== 定数定義 ==========
(def board-width 8)
(def board-height 12)

(def colors
  "ぷよの色定義"
  {0 "#ffffff"  ; 空（白）
   1 "#ff4444"  ; 赤
   2 "#44ff44"  ; 緑
   3 "#4444ff"  ; 青
   4 "#ffff44"  ; 黄
   5 "#ff44ff"}) ; 紫

(def valid-colors #{1 2 3 4 5})
(def valid-rotations #{0 1 2 3})

;; ========== Phase 1: 基盤システム ==========

;; T001: ゲームボード作成
(defn create-empty-board
  "空のゲームボードを作成

   Returns:
     12×8の2次元ベクター（0で初期化）"
  []
  (vec (repeat board-height (vec (repeat board-width 0)))))

(defn valid-position?
  "座標が有効な範囲内かチェック"
  [x y]
  (and (>= x 0) (< x board-width)
       (>= y 0) (< y board-height)))

(defn get-puyo-at
  "指定位置のぷよ色を取得"
  [board x y]
  (when (valid-position? x y)
    (get-in board [y x])))

;; T002: ぷよの基本データ構造
(defn valid-color?
  "色番号が有効かどうかチェック"
  [color]
  {:pre [(int? color)]
   :post [(boolean? %)]}
  (contains? valid-colors color))

(defn get-puyo-color
  "色番号に対応するカラーコードを取得"
  [color-num]
  (get colors color-num "#ffffff"))

;; T003: 組ぷよ（2個セット）の実装
(defn create-puyo-pair
  "組ぷよ（2個セット）を作成

   Args:
     color1: puyo1の色 (1-5)
     color2: puyo2の色 (1-5)
     x: 基準位置のx座標
     y: 基準位置のy座標

   Returns:
     組ぷよマップ {:puyo1 {...} :puyo2 {...} :rotation 0}"
  [color1 color2 x y]
  {:pre [(s/valid? ::specs/color color1)
         (s/valid? ::specs/color color2)
         (s/valid? ::specs/x x)
         (s/valid? ::specs/y y)]
   :post [(s/valid? ::specs/puyo-pair %)]}
  (when-not (and (valid-color? color1) (valid-color? color2))
    (throw (js/Error. "Invalid color")))

  {:puyo1 {:color color1 :x x :y y}
   :puyo2 {:color color2 :x x :y (+ y 1)}
   :rotation 0})

(defn get-puyo-pair-positions
  "組ぷよの2つのぷよの実際の座標を計算"
  [base-x base-y rotation]
  (case rotation
    0 [{:x base-x :y base-y}           ; 縦（上下）
       {:x base-x :y (+ base-y 1)}]
    1 [{:x base-x :y base-y}           ; 右（左右）
       {:x (+ base-x 1) :y base-y}]
    2 [{:x base-x :y base-y}           ; 逆縦（下上）
       {:x base-x :y (- base-y 1)}]
    3 [{:x base-x :y base-y}           ; 左（右左）
       {:x (- base-x 1) :y base-y}]))

(defn rotate-puyo-pair
  "組ぷよを時計回りに90度回転"
  [puyo-pair]
  (update puyo-pair :rotation #(mod (+ % 1) 4)))

;; ========== Phase 2: ぷよ管理システム ==========

;; T005: ランダムなぷよ生成
(defn generate-random-color
  "1-5の範囲でランダムな色を生成"
  []
  (+ 1 (rand-int 5)))

(defn generate-random-puyo-pair
  "ランダムな色の組ぷよを生成"
  [x y]
  (create-puyo-pair (generate-random-color)
                    (generate-random-color)
                    x y))

(defn spawn-new-puyo-pair
  "新しい組ぷよを画面上部に生成"
  []
  (generate-random-puyo-pair (quot board-width 2) 0))

;; T006-T007: 組ぷよの移動と回転
(defn can-move-puyo-pair?
  "組ぷよが指定方向に移動可能かチェック"
  [puyo-pair board direction]
  (let [positions (get-puyo-pair-positions
                   (get-in puyo-pair [:puyo1 :x])
                   (get-in puyo-pair [:puyo1 :y])
                   (:rotation puyo-pair))
        offset (case direction
                 :left -1
                 :right 1)
        new-positions (map #(assoc % :x (+ (:x %) offset)) positions)]

    (every? (fn [{:keys [x y]}]
              (and (valid-position? x y)
                   (= 0 (get-puyo-at board x y))))
            new-positions)))

(defn move-puyo-pair-left
  "組ぷよを左に移動"
  [puyo-pair board]
  (if (can-move-puyo-pair? puyo-pair board :left)
    (-> puyo-pair
        (update-in [:puyo1 :x] dec)
        (update-in [:puyo2 :x] dec))
    puyo-pair))

(defn move-puyo-pair-right
  "組ぷよを右に移動"
  [puyo-pair board]
  (if (can-move-puyo-pair? puyo-pair board :right)
    (-> puyo-pair
        (update-in [:puyo1 :x] inc)
        (update-in [:puyo2 :x] inc))
    puyo-pair))

;; T008: 重力システム
(defn can-fall?
  "組ぷよが下に落下可能かチェック"
  [puyo-pair board]
  (let [positions (get-puyo-pair-positions
                   (get-in puyo-pair [:puyo1 :x])
                   (get-in puyo-pair [:puyo1 :y])
                   (:rotation puyo-pair))
        new-positions (map #(assoc % :y (+ (:y %) 1)) positions)]

    (every? (fn [{:keys [x y]}]
              (and (valid-position? x y)
                   (= 0 (get-puyo-at board x y))))
            new-positions)))

(defn move-puyo-pair-down
  "組ぷよを下に移動"
  [puyo-pair board]
  (if (can-fall? puyo-pair board)
    (-> puyo-pair
        (update-in [:puyo1 :y] inc)
        (update-in [:puyo2 :y] inc))
    puyo-pair))

(defn hard-drop
  "組ぷよを一気に底まで落下"
  [puyo-pair board]
  (loop [current-pair puyo-pair]
    (let [next-pair (move-puyo-pair-down current-pair board)]
      (if (= current-pair next-pair)
        current-pair
        (recur next-pair)))))

;; T009: ぷよの固定処理
(defn fix-puyo-pair
  "組ぷよをボードに固定"
  [puyo-pair board]
  (let [positions (get-puyo-pair-positions
                   (get-in puyo-pair [:puyo1 :x])
                   (get-in puyo-pair [:puyo1 :y])
                   (:rotation puyo-pair))
        color1 (get-in puyo-pair [:puyo1 :color])
        color2 (get-in puyo-pair [:puyo2 :color])]
    (-> board
        (assoc-in [(:y (first positions)) (:x (first positions))] color1)
        (assoc-in [(:y (second positions)) (:x (second positions))] color2))))

(defn drop-floating-puyos
  "浮いているぷよを重力で落下させる（1マスずつ繰り返し落下）"
  [board]
  (loop [current-board board
         changed? true
         iteration 0]
    (if (or (not changed?) (> iteration 100))
      (do
        (when (> iteration 100)
          (js/console.warn "drop-floating-puyos: 無限ループを検出"))
        current-board)
      (let [new-board
            (reduce
             (fn [acc-board y]
               (reduce
                (fn [acc-board-x x]
                  (let [puyo-color (get-in acc-board-x [y x])]
                    ;; ぷよがあり、下が空で、下が範囲内の場合
                    (if (and (> puyo-color 0)
                             (< y (- board-height 1))
                             (= 0 (get-in acc-board-x [(+ y 1) x])))
                      ;; 1マス下に移動
                      (-> acc-board-x
                          (assoc-in [y x] 0)
                          (assoc-in [(+ y 1) x] puyo-color))
                      acc-board-x)))
                acc-board
                (range board-width)))
             current-board
             ;; 下から処理（重要：下のぷよから落とす）
             (range (- board-height 1) -1 -1))]
        (recur new-board (not= current-board new-board) (inc iteration))))))

;; ========== Phase 3: ゲームロジック ==========

;; T010: 隣接ぷよの検索
(defn find-adjacent-puyos
  "指定位置から隣接する同色ぷよを検索（幅優先探索）"
  [board x y]
  (let [target-color (get-puyo-at board x y)]
    (if (<= target-color 0)
      []
      (loop [visited #{}
             queue [[x y]]
             result []]
        (if (empty? queue)
          result
          (let [[curr-x curr-y] (first queue)
                remaining-queue (rest queue)]
            (if (contains? visited [curr-x curr-y])
              (recur visited remaining-queue result)
              (let [new-visited (conj visited [curr-x curr-y])
                    new-result (conj result [curr-x curr-y])
                    neighbors (for [dx [-1 0 1]
                                    dy [-1 0 1]
                                    :when (or (and (= dx 0) (not= dy 0))
                                              (and (not= dx 0) (= dy 0)))
                                    :let [nx (+ curr-x dx)
                                          ny (+ curr-y dy)]
                                    :when (and (valid-position? nx ny)
                                               (= (get-puyo-at board nx ny) target-color)
                                               (not (contains? new-visited [nx ny])))]
                                [nx ny])
                    new-queue (concat remaining-queue neighbors)]
                (recur new-visited new-queue new-result)))))))))

;; T011: ぷよ消去の実行
(defn find-groups-to-clear
  "消去すべきぷよグループを検索（4つ以上の連結成分）"
  [board]
  (let [all-positions (for [y (range board-height)
                            x (range board-width)
                            :when (> (get-puyo-at board x y) 0)]
                        [x y])
        checked (atom #{})]
    (keep (fn [[x y]]
            (when-not (contains? @checked [x y])
              (let [group (find-adjacent-puyos board x y)]
                (swap! checked into group)
                (when (>= (count group) 4)
                  group))))
          all-positions)))

(defn clear-puyo-groups
  "指定されたぷよグループをボードから消去"
  [board groups]
  (reduce (fn [acc-board group]
            (reduce (fn [board [x y]]
                      (assoc-in board [y x] 0))
                    acc-board
                    group))
          board
          groups))

;; T013-T014: スコア計算システム
(defn calculate-chain-bonus
  "連鎖ボーナス計算"
  [chain-count]
  (case chain-count
    1 0
    2 8
    3 16
    4 32
    5 64
    6 96
    7 128
    (* chain-count 32)))

(defn calculate-clear-score
  "基本消去スコア計算"
  [cleared-count chain-bonus]
  (let [base-score (* cleared-count 10)]
    (+ base-score chain-bonus)))

(defn is-perfect-clear?
  "全消し判定"
  [board]
  (every? #(every? zero? %) board))

(defn calculate-perfect-clear-bonus
  "全消しボーナス計算"
  []
  1000)

;; T012: 連鎖システム
(defn execute-chain
  "連鎖処理を実行し、結果を返す"
  [board]
  (loop [current-board board
         chain-count 0
         total-score 0]
    (let [groups (find-groups-to-clear current-board)]
      (if (empty? groups)
        {:board current-board
         :chain-count chain-count
         :total-score total-score}
        (let [cleared-board (clear-puyo-groups current-board groups)
              dropped-board (drop-floating-puyos cleared-board)
              cleared-count (reduce + (map count groups))
              chain-bonus (calculate-chain-bonus (+ chain-count 1))
              clear-score (calculate-clear-score cleared-count chain-bonus)]
          (recur dropped-board
                 (+ chain-count 1)
                 (+ total-score clear-score)))))))

;; ========== Phase 4: ユーザーインターフェース ==========

(def ctx (atom nil))
(def next-ctx (atom nil))
(def cell-size 30)

;; T015: ゲーム画面の描画
(defn init-canvas
  "Canvasの初期化"
  [canvas-id]
  (if-let [canvas (.getElementById js/document canvas-id)]
    (do
      ;; Canvas の解像度を設定（CSS サイズと一致させる）
      (set! (.-width canvas) (* board-width cell-size))
      (set! (.-height canvas) (* board-height cell-size))
      (reset! ctx (.getContext canvas "2d"))
      true)
    false))

(defn draw-cell
  "単一セルの描画（円形）"
  [x y color]
  (when @ctx
    (let [center-x (+ (* x cell-size) (/ cell-size 2))
          center-y (+ (* y cell-size) (/ cell-size 2))
          radius (/ cell-size 2.5)]

      ;; 背景（枠線）
      (.beginPath @ctx)
      (.rect @ctx (* x cell-size) (* y cell-size) cell-size cell-size)
      (set! (.-strokeStyle @ctx) "#dddddd")
      (set! (.-lineWidth @ctx) 1)
      (.stroke @ctx)

      ;; ぷよ（円形）
      (when (not= color "#ffffff")
        (.beginPath @ctx)
        (.arc @ctx center-x center-y radius 0 (* 2 js/Math.PI))
        (set! (.-fillStyle @ctx) color)
        (.fill @ctx)
        (set! (.-strokeStyle @ctx) "#333333")
        (set! (.-lineWidth @ctx) 2)
        (.stroke @ctx)))))

(defn render-board
  "ボード全体の描画"
  [board]
  (when @ctx
    ;; 背景クリア
    (set! (.-fillStyle @ctx) "#f0f0f0")
    (.fillRect @ctx 0 0
               (* board-width cell-size)
               (* board-height cell-size))

    ;; 各セルを描画
    (doseq [y (range board-height)
            x (range board-width)]
      (let [cell-value (get-in board [y x])
            color (get-puyo-color cell-value)]
        (draw-cell x y color)))))

(defn render-puyo-pair
  "組ぷよの描画"
  [puyo-pair]
  (when (and @ctx puyo-pair)
    (let [positions (get-puyo-pair-positions
                     (get-in puyo-pair [:puyo1 :x])
                     (get-in puyo-pair [:puyo1 :y])
                     (:rotation puyo-pair))
          color1 (get-puyo-color (get-in puyo-pair [:puyo1 :color]))
          color2 (get-puyo-color (get-in puyo-pair [:puyo2 :color]))]
      (draw-cell (:x (first positions)) (:y (first positions)) color1)
      (draw-cell (:x (second positions)) (:y (second positions)) color2))))

;; NEXTぷよ表示
(defn init-next-canvas
  "NEXTぷよキャンバス初期化"
  []
  (when-let [canvas (.getElementById js/document "next-canvas")]
    ;; Canvas の解像度を設定
    (set! (.-width canvas) 60)
    (set! (.-height canvas) 80)
    (reset! next-ctx (.getContext canvas "2d"))
    true))

(defn render-next-puyo
  "NEXTぷよの描画"
  [next-piece]
  (when (and @next-ctx next-piece)
    (let [canvas-width 60
          canvas-height 80]
      ;; 背景クリア
      (set! (.-fillStyle @next-ctx) "#f8f8f8")
      (.fillRect @next-ctx 0 0 canvas-width canvas-height)

      ;; NEXTぷよを小さく描画
      (let [color1 (get-puyo-color (get-in next-piece [:puyo1 :color]))
            color2 (get-puyo-color (get-in next-piece [:puyo2 :color]))]
        ;; puyo1を上に描画
        (.beginPath @next-ctx)
        (.arc @next-ctx 30 25 8 0 (* 2 js/Math.PI))
        (set! (.-fillStyle @next-ctx) color1)
        (.fill @next-ctx)

        ;; puyo2を下に描画
        (.beginPath @next-ctx)
        (.arc @next-ctx 30 45 8 0 (* 2 js/Math.PI))
        (set! (.-fillStyle @next-ctx) color2)
        (.fill @next-ctx)))))

;; T016: ゲーム情報の表示
(defn update-score-display
  "スコア表示更新"
  [score]
  (when-let [element (.getElementById js/document "score")]
    (set! (.-textContent element) (str score))))

(defn update-level-display
  "レベル表示更新"
  [level]
  (when-let [element (.getElementById js/document "level")]
    (set! (.-textContent element) (str level))))

(defn update-chain-display
  "連鎖数表示更新"
  [chain-count]
  (when-let [element (.getElementById js/document "chain")]
    (set! (.-textContent element) (str chain-count))))

(defn format-game-time
  "ゲーム時間のフォーマット（秒 → mm:ss）"
  [seconds]
  (let [minutes (quot seconds 60)
        remaining-seconds (mod seconds 60)]
    (str minutes ":" (if (< remaining-seconds 10)
                       (str "0" remaining-seconds)
                       remaining-seconds))))

(defn update-time-display
  "時間表示更新"
  [game-time]
  (when-let [element (.getElementById js/document "time")]
    (set! (.-textContent element) (format-game-time game-time))))

;; ========== Phase 5: ゲームフロー ==========

(defonce game-state
  (atom {:board nil
         :current-piece nil
         :next-piece nil
         :score 0
         :level 1
         :chain-count 0
         :game-time 0
         :game-running false}))

(defonce drop-timer (atom nil))
(defonce game-timer (atom nil))

;; T019: ゲーム初期化
(defn reset-game-state!
  "ゲーム状態を初期値にリセット"
  []
  (swap! game-state assoc
         :score 0
         :level 1
         :chain-count 0
         :game-time 0
         :game-running false
         :current-piece nil
         :next-piece nil))

(defn initialize-game-board!
  "ゲームボードを空の状態で初期化"
  []
  (swap! game-state assoc :board (create-empty-board)))

(defn spawn-initial-puyo-pair!
  "初期ぷよペアを生成"
  []
  (let [next-piece (spawn-new-puyo-pair)]
    (swap! game-state assoc
           :current-piece (spawn-new-puyo-pair)
           :next-piece next-piece)))

(defn start-new-game!
  "新しいゲームを開始"
  []
  (reset-game-state!)
  (initialize-game-board!)
  (spawn-initial-puyo-pair!)
  (swap! game-state assoc :game-running true)
  (when-let [overlay (.getElementById js/document "gameOver")]
    (set! (.-style.display overlay) "none")))

;; T020: ゲーム終了判定
(defn is-game-over?
  "ゲームオーバー判定（上部2行にぷよがある場合）"
  [board]
  (boolean
   (some (fn [y]
           (some (fn [x]
                   (> (get-puyo-at board x y) 0))
                 (range board-width)))
         [0 1])))

(defn process-game-over!
  "ゲームオーバー処理"
  []
  (swap! game-state assoc :game-running false)
  (when-let [overlay (.getElementById js/document "gameOver")]
    (set! (.-style.display overlay) "flex"))
  (when-let [btn (.getElementById js/document "restart-button")]
    (set! (.-style.display btn) "block"))
  (when-let [btn (.getElementById js/document "start-button")]
    (set! (.-style.display btn) "none")))

(defn check-and-handle-game-over!
  "ゲームオーバーチェックと処理"
  []
  (let [board (:board @game-state)]
    (when (is-game-over? board)
      (process-game-over!)
      true)))

;; ゲームループ
(defn fix-puyo-pair-to-board!
  "現在のぷよペアをボードに固定"
  [current-piece]
  (let [board (:board @game-state)
        new-board (fix-puyo-pair current-piece board)]
    (swap! game-state assoc :board new-board)))

(defn log-board
  "デバッグ用: ボードの状態をコンソールに出力"
  [board label]
  (js/console.log label)
  (doseq [y (range 6 board-height)]
    (let [row (map #(get-in board [y %]) (range board-width))]
      (js/console.log (str "y=" y ": " (apply str (map #(if (= % 0) "." %) row)))))))

(defn process-line-clear!
  "ライン消去処理と浮遊ぷよの落下"
  []
  (let [board (:board @game-state)
        _ (log-board board "Before execute-chain:")
        ;; まず浮遊ぷよを落下させる
        dropped-board (drop-floating-puyos board)
        _ (log-board dropped-board "After drop-floating-puyos:")
        ;; その後連鎖処理を実行
        result (execute-chain dropped-board)
        _ (log-board (:board result) "After execute-chain:")]
    (swap! game-state assoc
           :board (:board result)
           :score (+ (:score @game-state) (:total-score result))
           :chain-count (:chain-count result))
    (update-score-display (:score @game-state))
    (update-chain-display (:chain-count result))))

(defn spawn-new-puyo-pair!
  "新しいぷよペアを生成"
  []
  (let [current (:next-piece @game-state)
        next (spawn-new-puyo-pair)]
    (swap! game-state assoc
           :current-piece current
           :next-piece next)))

(defn render-game
  "ゲーム全体の描画"
  []
  (render-board (:board @game-state))
  (when-let [current-piece (:current-piece @game-state)]
    (render-puyo-pair current-piece))
  (when-let [next-piece (:next-piece @game-state)]
    (render-next-puyo next-piece))
  (update-score-display (:score @game-state))
  (update-level-display (:level @game-state))
  (update-time-display (:game-time @game-state)))

(defn game-step!
  "ゲームの1ステップ処理"
  []
  (when (:game-running @game-state)
    (if-let [current-piece (:current-piece @game-state)]
      (let [board (:board @game-state)]
        (if (can-fall? current-piece board)
          ;; まだ落下できる場合
          (let [moved-piece (move-puyo-pair-down current-piece board)]
            (swap! game-state assoc :current-piece moved-piece))
          ;; 落下できない場合 - 固定処理
          (do
            (fix-puyo-pair-to-board! current-piece)
            (process-line-clear!)
            (when-not (check-and-handle-game-over!)
              (spawn-new-puyo-pair!)))))
      ;; 現在のピースがない場合
      (spawn-new-puyo-pair!))

    (render-game)))

(defn stop-drop-timer!
  "落下タイマー停止"
  []
  (when @drop-timer
    (js/clearInterval @drop-timer)
    (reset! drop-timer nil)))

(defn start-drop-timer!
  "落下タイマー開始"
  []
  (stop-drop-timer!)
  (reset! drop-timer
          (js/setInterval game-step! 1000)))

(defn stop-game-timer!
  "ゲームタイマー停止"
  []
  (when @game-timer
    (js/clearInterval @game-timer)
    (reset! game-timer nil)))

(defn start-game-timer!
  "ゲームタイマー開始"
  []
  (stop-game-timer!)
  (reset! game-timer
          (js/setInterval
           (fn []
             (when (:game-running @game-state)
               (swap! game-state update :game-time inc)
               (update-time-display (:game-time @game-state))))
           1000)))

;; T017: キーボード入力処理
(defn process-left-movement!
  "左移動処理"
  []
  (when-let [current-piece (:current-piece @game-state)]
    (let [board (:board @game-state)
          moved-piece (move-puyo-pair-left current-piece board)]
      (swap! game-state assoc :current-piece moved-piece)
      (render-game))))

(defn process-right-movement!
  "右移動処理"
  []
  (when-let [current-piece (:current-piece @game-state)]
    (let [board (:board @game-state)
          moved-piece (move-puyo-pair-right current-piece board)]
      (swap! game-state assoc :current-piece moved-piece)
      (render-game))))

(defn can-rotate?
  "回転可能かチェック"
  [puyo-pair board]
  (let [rotated (rotate-puyo-pair puyo-pair)
        positions (get-puyo-pair-positions
                   (get-in rotated [:puyo1 :x])
                   (get-in rotated [:puyo1 :y])
                   (:rotation rotated))]
    (every? (fn [{:keys [x y]}]
              (and (valid-position? x y)
                   (= 0 (get-puyo-at board x y))))
            positions)))

(defn process-rotation!
  "回転処理"
  []
  (when-let [current-piece (:current-piece @game-state)]
    (let [board (:board @game-state)]
      (when (can-rotate? current-piece board)
        (let [rotated-piece (rotate-puyo-pair current-piece)]
          (swap! game-state assoc :current-piece rotated-piece)
          (render-game))))))

(defn process-soft-drop!
  "ソフトドロップ処理"
  []
  (game-step!))

(defn process-hard-drop!
  "ハードドロップ処理"
  []
  (when-let [current-piece (:current-piece @game-state)]
    (let [board (:board @game-state)
          dropped-piece (hard-drop current-piece board)]
      (swap! game-state assoc :current-piece dropped-piece)
      (game-step!))))

(defn handle-key-input
  "キー入力処理"
  [key-code]
  (when (:game-running @game-state)
    (case key-code
      "ArrowLeft"  (process-left-movement!)
      "ArrowRight" (process-right-movement!)
      "ArrowUp"    (process-rotation!)
      "ArrowDown"  (process-soft-drop!)
      " "          (process-hard-drop!)
      nil)))

(defn setup-key-listener!
  "キーボードイベントリスナー設定"
  []
  (.addEventListener js/document "keydown"
                     (fn [e]
                       (when (contains? #{"ArrowLeft" "ArrowRight" "ArrowUp" "ArrowDown" " "} (.-key e))
                         (.preventDefault e)
                         (handle-key-input (.-key e))))))

(defn start-game!
  "ゲーム開始"
  []
  (start-new-game!)
  (start-drop-timer!)
  (start-game-timer!)
  (render-game)
  (when-let [btn (.getElementById js/document "start-button")]
    (set! (.-style.display btn) "none"))
  (when-let [btn (.getElementById js/document "restart-button")]
    (set! (.-style.display btn) "none")))

(defn init []
  (println "Puyo Puyo Game Initialized!")
  (init-canvas "game-canvas")
  (init-next-canvas)
  (setup-key-listener!)

  ;; スタートボタン
  (when-let [btn (.getElementById js/document "start-button")]
    (.addEventListener btn "click" start-game!))

  ;; リスタートボタン
  (when-let [btn (.getElementById js/document "restart-button")]
    (.addEventListener btn "click" start-game!))

  (println "Ready to play!"))