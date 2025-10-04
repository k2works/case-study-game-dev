(ns puyo.stage
  (:require [puyo.config :as config]
            [puyo.drawing :as drawing]
            [puyo.player :as player]))

(defn create-field
  "フィールドを作成する（全て0で初期化）"
  []
  (vec (repeat config/stage-rows
               (vec (repeat config/stage-cols 0)))))

(defn setup-canvas
  "Canvas要素をセットアップする"
  []
  (let [canvas (.getElementById js/document "stage")
        ctx (.getContext canvas "2d")]
    {:canvas canvas
     :ctx ctx}))

(defn clear-canvas
  "Canvasをクリアする"
  [{:keys [canvas ctx]}]
  (when ctx
    (.clearRect ctx 0 0 (.-width canvas) (.-height canvas))))

(defn draw-field
  "フィールドを描画する"
  [{:keys [ctx]} field]
  (when ctx
    (doseq [y (range config/stage-rows)
            x (range config/stage-cols)]
      (let [puyo-type (get-in field [y x])]
        (when (> puyo-type 0)
          (drawing/draw-puyo ctx puyo-type x y))))))

(defn draw-current-puyo
  "現在のぷよを描画する（軸ぷよと子ぷよ）"
  [{:keys [ctx]} puyo-state]
  (when ctx
    (let [offset (player/get-child-offset (:rotation puyo-state))
          child-x (+ (:x puyo-state) (:x offset))
          child-y (+ (:y puyo-state) (:y offset))]
      ;; 軸ぷよを描画
      (drawing/draw-puyo ctx (:type puyo-state) (:x puyo-state) (:y puyo-state))
      ;; 子ぷよを描画（軸ぷよと同じ色）
      (drawing/draw-puyo ctx (:type puyo-state) child-x child-y))))
