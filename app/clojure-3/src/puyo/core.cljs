(ns puyo.core
  (:require [puyo.config :as config]
            [puyo.player :as player]
            [puyo.stage :as stage]))

(defonce ゲーム状態
  (atom {:モード :新規ぷよ
         :フレーム 0
         :盤面 (stage/盤面作成)
         :ぷよ nil
         :入力状態 (player/入力状態作成)
         :キャンバスコンテキスト nil}))

(defn 初期化
  "ゲームを初期化する"
  []
  (let [キャンバスコンテキスト (stage/キャンバス設定)]
    (reset! ゲーム状態
            {:モード :新規ぷよ
             :フレーム 0
             :盤面 (stage/盤面作成)
             :ぷよ nil
             :入力状態 (player/入力状態作成)
             :キャンバスコンテキスト キャンバスコンテキスト}))

  ;; キーボードイベントをセットアップ
  (player/キーボードイベント設定 (:入力状態 @ゲーム状態)))

(defn ゲーム更新
  "ゲームを更新する"
  []
  (swap! ゲーム状態 update :フレーム inc)

  (case (:モード @ゲーム状態)
    :新規ぷよ
    (do
      (swap! ゲーム状態 assoc :ぷよ (player/ぷよ作成))
      (swap! ゲーム状態 assoc :モード :プレイ中))

    :プレイ中
    (let [設定 (config/設定取得)
          更新されたぷよ (player/ぷよ更新
                        (:ぷよ @ゲーム状態)
                        (:入力状態 @ゲーム状態)
                        設定)]
      (swap! ゲーム状態 assoc :ぷよ 更新されたぷよ))

    nil))

(defn ゲーム描画
  "ゲームを描画する"
  []
  (let [{:keys [キャンバスコンテキスト 盤面 ぷよ モード]} @ゲーム状態]
    (stage/キャンバスクリア キャンバスコンテキスト)
    (stage/盤面描画 キャンバスコンテキスト 盤面)
    (when (= モード :プレイ中)
      (stage/現在のぷよ描画 キャンバスコンテキスト ぷよ))))

(defn ゲームループ
  "ゲームループ"
  []
  (ゲーム更新)
  (ゲーム描画)
  (js/requestAnimationFrame ゲームループ))

(defn init
  "ゲームのエントリーポイント"
  []
  (.log js/console "Puyo Puyo Game Started!")
  (初期化)
  (ゲームループ))
