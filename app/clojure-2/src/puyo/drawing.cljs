(ns puyo.drawing
  (:require [puyo.config :as config]))

(def colors
  "ぷよの色定義"
  {0 "#888"    ; 空
   1 "#ff0000" ; 赤
   2 "#00ff00" ; 緑
   3 "#0000ff" ; 青
   4 "#ffff00"}) ; 黄色

(defn draw-puyo
  "ぷよを描画する"
  [ctx type x y]
  (let [size config/puyo-size
        color (get colors type (get colors 0))
        center-x (+ (* x size) (/ size 2))
        center-y (+ (* y size) (/ size 2))
        radius (- (/ size 2) 2)]

    ;; 円を描画
    (set! (.-fillStyle ctx) color)
    (.beginPath ctx)
    (.arc ctx center-x center-y radius 0 (* js/Math.PI 2))
    (.fill ctx)

    ;; 枠線を描画
    (set! (.-strokeStyle ctx) "#000")
    (set! (.-lineWidth ctx) 2)
    (.beginPath ctx)
    (.arc ctx center-x center-y radius 0 (* js/Math.PI 2))
    (.stroke ctx)))
