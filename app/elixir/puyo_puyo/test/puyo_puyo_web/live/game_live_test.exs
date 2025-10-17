defmodule PuyoPuyoWeb.GameLiveTest do
  use PuyoPuyoWeb.ConnCase

  import Phoenix.LiveViewTest

  describe "GameLive" do
    test "mounts successfully", %{conn: conn} do
      {:ok, _view, html} = live(conn, "/game")
      assert html =~ "ぷよぷよゲーム"
    end

    test "initializes game state on mount", %{conn: conn} do
      {:ok, view, _html} = live(conn, "/game")

      # LiveViewの状態を取得
      assert has_element?(view, "#game-container")

      # 初期状態の確認
      # mode: :start (ゲーム開始状態)
      # score: 0 (スコアは0)
      # chain: 0 (連鎖数は0)
    end

    test "displays game board", %{conn: conn} do
      {:ok, view, _html} = live(conn, "/game")

      # ゲームボードが表示されていることを確認
      assert has_element?(view, "#game-board")
    end

    test "displays score information", %{conn: conn} do
      {:ok, view, _html} = live(conn, "/game")

      # スコア情報が表示されていることを確認
      assert has_element?(view, "#score")
      assert has_element?(view, "#chain")
    end
  end
end
