defmodule PuyoPuyoWeb.GameLive do
  use PuyoPuyoWeb, :live_view

  alias PuyoPuyo.Stage

  @moduledoc """
  ぷよぷよゲームのLiveViewモジュール
  """

  # ゲームモードの定義
  @type game_mode ::
          :start
          | :check_fall
          | :fall
          | :check_erase
          | :erasing
          | :new_puyo
          | :playing
          | :game_over

  # ゲーム設定
  @puyo_size 32

  @impl true
  def mount(_params, _session, socket) do
    # Stageモジュールを使用
    stage = Stage.new([])

    # ゲームの初期状態を設定
    socket =
      socket
      |> assign(:mode, :start)
      |> assign(:score, 0)
      |> assign(:chain, 0)
      |> assign(:stage, stage)
      |> assign(:puyo_size, @puyo_size)

    {:ok, socket}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div id="game-container" class="flex gap-8 p-8">
      <div id="game-board" class="relative bg-gray-100 border-2 border-gray-800 rounded-lg">
        <div class="grid" style={"grid-template-columns: repeat(#{@stage.cols}, #{@puyo_size}px);"}>
          <%= for row <- 0..(@stage.rows - 1) do %>
            <%= for col <- 0..(@stage.cols - 1) do %>
              <div
                class="border border-gray-300"
                style={"width: #{@puyo_size}px; height: #{@puyo_size}px;"}
              >
                {render_puyo(Stage.get_puyo(@stage, col, row))}
              </div>
            <% end %>
          <% end %>
        </div>
      </div>

      <div id="info-panel" class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">ぷよぷよゲーム</h2>

        <div class="mb-4">
          <h3 class="text-lg font-semibold">スコア</h3>

          <p id="score" class="text-3xl font-bold text-blue-600">{@score}</p>
        </div>

        <div class="mb-4">
          <h3 class="text-lg font-semibold">連鎖数</h3>

          <p id="chain" class="text-3xl font-bold text-red-600">{@chain}</p>
        </div>

        <div class="mt-6 text-sm text-gray-600">
          <h3 class="font-semibold mb-2">操作方法</h3>

          <ul class="space-y-1">
            <li>← →: 移動</li>

            <li>↑: 回転</li>

            <li>↓: 高速落下</li>
          </ul>
        </div>
      </div>
    </div>
    """
  end

  # プライベート関数

  # ぷよの描画（0は空、1-4はぷよの種類）
  defp render_puyo(0), do: nil

  defp render_puyo(type) when type in 1..4 do
    color = puyo_color(type)
    assigns = %{color: color}

    ~H"""
    <div
      class="w-full h-full rounded-full"
      style={"background-color: #{@color}; border: 2px solid rgba(0,0,0,0.2);"}
    >
    </div>
    """
  end

  # ぷよの色を返す
  defp puyo_color(1), do: "#FF0000"
  # 赤
  defp puyo_color(2), do: "#00FF00"
  # 緑
  defp puyo_color(3), do: "#0000FF"
  # 青
  defp puyo_color(4), do: "#FFFF00"
  # 黄
end
