(ns puyo.stage
  (:require [puyo.config :as config]
            [puyo.drawing :as drawing]
            [puyo.player :as player]))

(defn 盤面作成
  "フィールドを作成する（全て0で初期化）"
  []
  (vec (repeat config/ステージ行数
               (vec (repeat config/ステージ列数 0)))))

(defn キャンバス設定
  "Canvas要素をセットアップする"
  []
  (let [キャンバス (.createElement js/document "canvas")
        コンテキスト (.getContext キャンバス "2d")]
    (set! (.-width キャンバス) (* config/ステージ列数 config/ぷよサイズ))
    (set! (.-height キャンバス) (* config/ステージ行数 config/ぷよサイズ))
    (set! (.. キャンバス -style -border) (str "2px solid " config/ステージ枠線色))
    (set! (.. キャンバス -style -backgroundColor) config/ステージ背景色)

    ;; ステージ要素に追加
    (when-let [ステージ要素 (.getElementById js/document "stage")]
      (.appendChild ステージ要素 キャンバス))

    {:キャンバス キャンバス
     :コンテキスト コンテキスト}))

(defn キャンバスクリア
  "Canvasをクリアする"
  [{:keys [キャンバス コンテキスト]}]
  (when コンテキスト
    (.clearRect コンテキスト 0 0 (.-width キャンバス) (.-height キャンバス))))

(defn 盤面描画
  "フィールドを描画する"
  [{:keys [コンテキスト]} 盤面]
  (when コンテキスト
    (doseq [y座標 (range config/ステージ行数)
            x座標 (range config/ステージ列数)]
      (let [ぷよタイプ (get-in 盤面 [y座標 x座標])]
        (when (> ぷよタイプ 0)
          (drawing/ぷよ描画 コンテキスト ぷよタイプ x座標 y座標))))))

(defn 現在のぷよ描画
  "現在のぷよを描画する（軸ぷよと子ぷよ）"
  [{:keys [コンテキスト]} ぷよ状態]
  (when コンテキスト
    (let [オフセット (player/子オフセット取得 (:回転状態 ぷよ状態))
          子x座標 (+ (:x座標 ぷよ状態) (:x座標 オフセット))
          子y座標 (+ (:y座標 ぷよ状態) (:y座標 オフセット))]
      ;; 軸ぷよを描画
      (drawing/ぷよ描画 コンテキスト (:タイプ ぷよ状態) (:x座標 ぷよ状態) (:y座標 ぷよ状態))
      ;; 子ぷよを描画（軸ぷよと同じ色）
      (drawing/ぷよ描画 コンテキスト (:タイプ ぷよ状態) 子x座標 子y座標))))
