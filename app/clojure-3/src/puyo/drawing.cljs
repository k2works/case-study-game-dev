(ns puyo.drawing
  (:require [puyo.config :as config]))

(def 色リスト
  "ぷよの色定義"
  {0 "#888"    ; 空
   1 "#ff0000" ; 赤
   2 "#00ff00" ; 緑
   3 "#0000ff" ; 青
   4 "#ffff00"}) ; 黄色

(defn ぷよ描画
  "ぷよを描画する"
  [コンテキスト タイプ x座標 y座標]
  (let [サイズ config/ぷよサイズ
        色 (get 色リスト タイプ (get 色リスト 0))
        中心x座標 (+ (* x座標 サイズ) (/ サイズ 2))
        中心y座標 (+ (* y座標 サイズ) (/ サイズ 2))
        半径 (- (/ サイズ 2) 2)]

    ;; 円を描画
    (set! (.-fillStyle コンテキスト) 色)
    (.beginPath コンテキスト)
    (.arc コンテキスト 中心x座標 中心y座標 半径 0 (* js/Math.PI 2))
    (.fill コンテキスト)

    ;; 枠線を描画
    (set! (.-strokeStyle コンテキスト) "#000")
    (set! (.-lineWidth コンテキスト) 2)
    (.beginPath コンテキスト)
    (.arc コンテキスト 中心x座標 中心y座標 半径 0 (* js/Math.PI 2))
    (.stroke コンテキスト)))
