(ns puyo.specs
  (:require [cljs.spec.alpha :as s]
            [puyo.config :as config]))

;; ゲームモードの定義
(s/def ::モード #{:開始 :新規ぷよ :プレイ中 :消去判定 :重力適用 :ゲーム-over})

;; フレーム数
(s/def ::フレーム nat-int?)

;; 連鎖カウント
(s/def ::連鎖カウント nat-int?)

;; 座標の定義
(s/def ::x座標 (s/and int? #(>= % 0) #(< % config/ステージ列数)))
(s/def ::y座標 (s/and int? #(>= % 0) #(< % config/ステージ行数)))

;; ぷよタイプ（1-4の色）
(s/def ::タイプ (s/int-in 1 5))

;; 回転状態（0-3）
(s/def ::回転状態 (s/int-in 0 4))

;; ぷよの状態
(s/def ::ぷよ状態
  (s/keys :req-un [::x座標 ::y座標 ::タイプ ::回転状態]))

;; フィールドの1セル（0=空、1-4=ぷよの色）
(s/def ::セル (s/int-in 0 5))

;; フィールドの1行
(s/def ::行 (s/coll-of ::セル :kind vector? :count config/ステージ列数))

;; フィールド全体
(s/def ::盤面 (s/coll-of ::行 :kind vector? :count config/ステージ行数))

;; 座標のペア
(s/def ::位置 (s/tuple ::y座標 ::x座標))

;; 座標のセット（connected component）
(s/def ::接続グループ (s/coll-of ::位置 :kind set? :min-count 1))

;; 消去可能なグループのコレクション
(s/def ::消去可能グループ (s/coll-of ::接続グループ :kind vector?))

;; 落下カウンター
(s/def ::落下カウンター nat-int?)

;; ゲーム状態の基本構造
(s/def ::ゲーム-状態-basic
  (s/keys :req-un [::モード ::フレーム ::連鎖カウント ::落下カウンター]))
