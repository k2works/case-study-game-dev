(ns puyo.specs
  (:require [cljs.spec.alpha :as s]))

;; ゲームモードの定義
(s/def ::モード #{:開始 :新規-ぷよ :playing :check-消去 :重力適用 :ゲーム-over})

;; フレーム数
(s/def ::フレーム nat-int?)

;; 連鎖カウント
(s/def ::連鎖カウント nat-int?)

;; ゲーム状態の基本構造
(s/def ::ゲーム-状態-basic
  (s/keys :req-un [::モード ::フレーム ::連鎖カウント]))
