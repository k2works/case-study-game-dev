(ns puyo.core)

(defn 初期化
  "ゲームを初期化する"
  []
  {:モード :開始
   :フレーム 0
   :連鎖カウント 0
   :設定 {}
   :ステージ {}
   :プレイヤー {}
   :スコア {}})

(defn ゲームループ
  "ゲームループの処理"
  [ゲーム状態]
  ;; 次のフレームでも自分自身を呼び出す
  (when (exists? js/requestAnimationFrame)
    (js/requestAnimationFrame #(ゲームループ ゲーム状態)))
  (when (and (exists? js/global) (.-requestAnimationFrame js/global))
    ((.-requestAnimationFrame js/global) #(ゲームループ ゲーム状態)))
  ゲーム状態)

(defn ループ開始
  "ゲームループを開始する"
  [ゲーム状態]
  (ゲームループ ゲーム状態))

(defn init
  "ゲームのエントリーポイント"
  []
  (.log js/console "Puyo Puyo Game Started!")
  (-> (初期化)
      (ループ開始)))
