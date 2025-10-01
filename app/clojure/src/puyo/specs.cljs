(ns puyo.specs
  (:require [cljs.spec.alpha :as s]))

;; ========== 基本的な仕様定義 ==========

;; 色の仕様
(s/def ::color (s/int-in 1 6))  ; 1-5の範囲
(s/def ::empty-cell #{0})
(s/def ::cell-value (s/or :empty ::empty-cell :color ::color))

;; 座標の仕様
(s/def ::x (s/int-in 0 8))  ; 0-7の範囲
(s/def ::y (s/int-in 0 12)) ; 0-11の範囲
(s/def ::position (s/keys :req-un [::x ::y]))

;; 回転の仕様
(s/def ::rotation #{0 1 2 3})

;; ぷよの仕様
(s/def ::puyo (s/keys :req-un [::color ::x ::y]))

;; 組ぷよの仕様
(s/def ::puyo1 ::puyo)
(s/def ::puyo2 ::puyo)
(s/def ::puyo-pair (s/keys :req-un [::puyo1 ::puyo2 ::rotation]))

;; ボードの仕様
(s/def ::row (s/coll-of ::cell-value :kind vector? :count 8))
(s/def ::board (s/coll-of ::row :kind vector? :count 12))

;; スコアの仕様
(s/def ::score nat-int?)
(s/def ::level pos-int?)
(s/def ::chain-count nat-int?)

;; ゲーム時間の仕様
(s/def ::game-time nat-int?)

;; ゲーム状態の仕様
(s/def ::game-running boolean?)
(s/def ::current-piece (s/nilable ::puyo-pair))
(s/def ::next-piece (s/nilable ::puyo-pair))

(s/def ::game-state
  (s/keys :req-un [::board ::current-piece ::next-piece
                   ::score ::level ::chain-count
                   ::game-time ::game-running]))

;; ========== 連鎖結果の仕様 ==========
(s/def ::total-score nat-int?)
(s/def ::chain-result
  (s/keys :req-un [::board ::chain-count ::total-score]))

;; ========== 関数の仕様定義 ==========

;; create-empty-board
(s/fdef create-empty-board
  :args (s/cat)
  :ret ::board)

;; valid-position?
(s/fdef valid-position?
  :args (s/cat :x int? :y int?)
  :ret boolean?)

;; get-puyo-at
(s/fdef get-puyo-at
  :args (s/cat :board ::board :x ::x :y ::y)
  :ret (s/nilable ::cell-value))

;; valid-color?
(s/fdef valid-color?
  :args (s/cat :color int?)
  :ret boolean?)

;; create-puyo-pair
(s/fdef create-puyo-pair
  :args (s/cat :color1 ::color :color2 ::color :x ::x :y ::y)
  :ret ::puyo-pair)

;; rotate-puyo-pair
(s/fdef rotate-puyo-pair
  :args (s/cat :puyo-pair ::puyo-pair)
  :ret ::puyo-pair)

;; generate-random-color
(s/fdef generate-random-color
  :args (s/cat)
  :ret ::color)

;; can-fall?
(s/fdef can-fall?
  :args (s/cat :puyo-pair ::puyo-pair :board ::board)
  :ret boolean?)

;; move-puyo-pair-down
(s/fdef move-puyo-pair-down
  :args (s/cat :puyo-pair ::puyo-pair :board ::board)
  :ret ::puyo-pair)

;; fix-puyo-pair
(s/fdef fix-puyo-pair
  :args (s/cat :puyo-pair ::puyo-pair :board ::board)
  :ret ::board)

;; find-adjacent-puyos
(s/fdef find-adjacent-puyos
  :args (s/cat :board ::board :x ::x :y ::y)
  :ret (s/coll-of (s/tuple ::x ::y) :kind vector?))

;; execute-chain
(s/fdef execute-chain
  :args (s/cat :board ::board)
  :ret ::chain-result)

;; is-game-over?
(s/fdef is-game-over?
  :args (s/cat :board ::board)
  :ret boolean?)

;; calculate-chain-bonus
(s/fdef calculate-chain-bonus
  :args (s/cat :chain-count pos-int?)
  :ret nat-int?)

;; calculate-clear-score
(s/fdef calculate-clear-score
  :args (s/cat :cleared-count pos-int? :chain-bonus nat-int?)
  :ret pos-int?)

;; is-perfect-clear?
(s/fdef is-perfect-clear?
  :args (s/cat :board ::board)
  :ret boolean?)

;; ========== ヘルパー関数 ==========

(defn validate-data
  "データが仕様に適合しているか検証"
  [spec data]
  (if (s/valid? spec data)
    true
    (do
      (let [explanation (s/explain-str spec data)]
        (js/console.error "Spec validation failed:" explanation))
      false)))

(defn validate-and-throw
  "データが仕様に適合していない場合は例外をスロー"
  [spec data message]
  (when-not (s/valid? spec data)
    (let [explanation (s/explain-str spec data)]
      (throw (js/Error. (str message "\n" explanation)))))
  data)

(defn assert-game-state
  "ゲーム状態の検証"
  [game-state]
  (validate-and-throw ::game-state game-state "Invalid game state"))

(defn assert-board
  "ボードの検証"
  [board]
  (validate-and-throw ::board board "Invalid board"))

(defn assert-puyo-pair
  "組ぷよの検証"
  [puyo-pair]
  (validate-and-throw ::puyo-pair puyo-pair "Invalid puyo pair"))
