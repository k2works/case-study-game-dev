(ns puyo.config)

(def stage-cols 6)         ; ステージの列数
(def stage-rows 12)        ; ステージの行数
(def puyo-size 32)         ; ぷよのサイズ（ピクセル）
(def stage-bg-color "#2a2a2a")     ; ステージの背景色
(def stage-border-color "#444")    ; ステージの枠線色

(defn get-config
  "設定マップを取得する"
  []
  {:stage-cols stage-cols
   :stage-rows stage-rows
   :puyo-size puyo-size
   :stage-bg-color stage-bg-color
   :stage-border-color stage-border-color})
