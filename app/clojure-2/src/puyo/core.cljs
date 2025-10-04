(ns puyo.core)

(defn initialize
  "ゲームを初期化する"
  []
  {:mode :start
   :frame 0
   :combination-count 0
   :config {}
   :stage {}
   :player {}
   :score {}})

(defn game-loop
  "ゲームループの処理"
  [game-state]
  ;; 次のフレームでも自分自身を呼び出す
  (js/requestAnimationFrame #(game-loop game-state))
  game-state)

(defn start-loop
  "ゲームループを開始する"
  [game-state]
  (game-loop game-state))

(defn init
  "ゲームのエントリーポイント"
  []
  (.log js/console "Puyo Puyo Game Started!")
  (-> (initialize)
      (start-loop)))
