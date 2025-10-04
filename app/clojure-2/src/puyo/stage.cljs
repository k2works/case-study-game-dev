(ns puyo.stage
  (:require [puyo.config :as config]
            [puyo.drawing :as drawing]))

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
  "現在のぷよを描画する"
  [{:keys [ctx]} puyo-state]
  (when ctx
    (drawing/draw-puyo ctx (:type puyo-state) (:x puyo-state) (:y puyo-state))))
