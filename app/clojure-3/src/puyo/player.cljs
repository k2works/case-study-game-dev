(ns puyo.player)

(defn 入力状態作成
  "入力状態を作成する"
  []
  {:左 (atom false)
   :右 (atom false)
   :上 (atom false)
   :下 (atom false)})

(defn キー押下処理
  "キー押下時の処理"
  [入力状態 キーコード]
  (case キーコード
    "ArrowLeft" (reset! (:左 入力状態) true)
    "ArrowRight" (reset! (:右 入力状態) true)
    "ArrowUp" (reset! (:上 入力状態) true)
    "ArrowDown" (reset! (:下 入力状態) true)
    nil))

(defn キー離上処理
  "キー解放時の処理"
  [入力状態 キーコード]
  (case キーコード
    "ArrowLeft" (reset! (:左 入力状態) false)
    "ArrowRight" (reset! (:右 入力状態) false)
    "ArrowUp" (reset! (:上 入力状態) false)
    "ArrowDown" (reset! (:下 入力状態) false)
    nil))

(defn キーボードイベント設定
  "キーボードイベントをセットアップする"
  [入力状態]
  (.addEventListener js/document "keydown"
                     (fn [e] (キー押下処理 入力状態 (.-key e))))
  (.addEventListener js/document "keyup"
                     (fn [e] (キー離上処理 入力状態 (.-key e)))))

(defn ぷよ作成
  "新しいぷよを作成する"
  []
  {:x座標 2
   :y座標 0
   :タイプ (inc (rand-int 4)) ; 1-4のランダムな値
   :回転状態 0})

(defn 左に移動
  "ぷよを左に移動する"
  [ぷよ状態 設定]
  (if (> (:x座標 ぷよ状態) 0)
    (update ぷよ状態 :x座標 dec)
    ぷよ状態))

(defn 右に移動
  "ぷよを右に移動する"
  [ぷよ状態 設定]
  (if (< (:x座標 ぷよ状態) (dec (:ステージ列数 設定)))
    (update ぷよ状態 :x座標 inc)
    ぷよ状態))

(defn ぷよ更新
  "入力に応じてぷよを更新する"
  [ぷよ状態 入力状態 設定]
  (cond
    @(:左 入力状態)
    (do
      (reset! (:左 入力状態) false)
      (左に移動 ぷよ状態 設定))

    @(:右 入力状態)
    (do
      (reset! (:右 入力状態) false)
      (右に移動 ぷよ状態 設定))

    :else
    ぷよ状態))
