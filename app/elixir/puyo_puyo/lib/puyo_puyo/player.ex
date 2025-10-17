defmodule PuyoPuyo.Player do
  @moduledoc """
  ぷよぷよゲームのプレイヤー（操作するぷよペア）を管理するモジュール

  プレイヤーは、軸ぷよと次ぷよの2つのぷよで構成されます。
  軸ぷよを中心に回転し、左右に移動できます。
  """

  alias PuyoPuyo.Stage

  @type t :: %__MODULE__{
          puyo_x: non_neg_integer(),
          puyo_y: integer(),
          puyo_type: non_neg_integer(),
          next_puyo_type: non_neg_integer(),
          rotation: 0..3,
          landed: boolean()
        }

  defstruct [
    :puyo_x,
    :puyo_y,
    :puyo_type,
    :next_puyo_type,
    :rotation,
    :landed
  ]

  # 初期位置
  @initial_x 2
  @initial_y 0

  # ぷよの種類の範囲
  @min_puyo_type 1
  @max_puyo_type 4

  # 回転状態ごとの2つ目のぷよのオフセット
  # 0: 上, 1: 右, 2: 下, 3: 左
  @offset_x [0, 1, 0, -1]
  @offset_y [-1, 0, 1, 0]

  @doc """
  新しいプレイヤーを作成します

  ## Examples

      iex> stage = PuyoPuyo.Stage.new([])
      iex> player = PuyoPuyo.Player.new(stage)
      iex> player.puyo_x
      2

  """
  @spec new(Stage.t()) :: t()
  def new(_stage) do
    %__MODULE__{
      puyo_x: @initial_x,
      puyo_y: @initial_y,
      puyo_type: random_puyo_type(),
      next_puyo_type: random_puyo_type(),
      rotation: 0,
      landed: false
    }
  end

  @doc """
  プレイヤーが生成可能かチェックします

  初期位置にぷよが存在しないかを確認します。

  ## Examples

      iex> stage = PuyoPuyo.Stage.new([])
      iex> player = PuyoPuyo.Player.new(stage)
      iex> PuyoPuyo.Player.can_spawn?(player, stage)
      true

  """
  @spec can_spawn?(t(), Stage.t()) :: boolean()
  def can_spawn?(%__MODULE__{puyo_x: x, puyo_y: y, rotation: rotation}, stage) do
    second_puyo_x = x + Enum.at(@offset_x, rotation)
    second_puyo_y = y + Enum.at(@offset_y, rotation)

    Stage.get_puyo(stage, x, y) == 0 and
      (second_puyo_y < 0 or Stage.get_puyo(stage, second_puyo_x, second_puyo_y) == 0)
  end

  @doc """
  プレイヤーを左に移動します

  ## Examples

      iex> stage = PuyoPuyo.Stage.new([])
      iex> player = PuyoPuyo.Player.new(stage)
      iex> player = PuyoPuyo.Player.move_left(player, stage)
      iex> player.puyo_x
      1

  """
  @spec move_left(t(), Stage.t()) :: t()
  def move_left(%__MODULE__{puyo_x: x, puyo_y: y, rotation: rotation} = player, stage) do
    next_x = x - 1
    second_puyo_x = next_x + Enum.at(@offset_x, rotation)
    second_puyo_y = y + Enum.at(@offset_y, rotation)

    # 範囲チェック
    if next_x >= 0 and second_puyo_x >= 0 and second_puyo_x < stage.cols do
      # 衝突チェック
      axis_puyo_clear =
        if y >= 0 and y < stage.rows, do: Stage.get_puyo(stage, next_x, y) == 0, else: true

      second_puyo_clear =
        if second_puyo_y >= 0 and second_puyo_y < stage.rows,
          do: Stage.get_puyo(stage, second_puyo_x, second_puyo_y) == 0,
          else: true

      if axis_puyo_clear and second_puyo_clear do
        %{player | puyo_x: next_x}
      else
        player
      end
    else
      player
    end
  end

  @doc """
  プレイヤーを右に移動します

  ## Examples

      iex> stage = PuyoPuyo.Stage.new([])
      iex> player = PuyoPuyo.Player.new(stage)
      iex> player = PuyoPuyo.Player.move_right(player, stage)
      iex> player.puyo_x
      3

  """
  @spec move_right(t(), Stage.t()) :: t()
  def move_right(%__MODULE__{puyo_x: x, puyo_y: y, rotation: rotation} = player, stage) do
    next_x = x + 1
    second_puyo_x = next_x + Enum.at(@offset_x, rotation)
    second_puyo_y = y + Enum.at(@offset_y, rotation)

    # 範囲チェック
    if next_x < stage.cols and second_puyo_x >= 0 and second_puyo_x < stage.cols do
      # 衝突チェック
      axis_puyo_clear =
        if y >= 0 and y < stage.rows, do: Stage.get_puyo(stage, next_x, y) == 0, else: true

      second_puyo_clear =
        if second_puyo_y >= 0 and second_puyo_y < stage.rows,
          do: Stage.get_puyo(stage, second_puyo_x, second_puyo_y) == 0,
          else: true

      if axis_puyo_clear and second_puyo_clear do
        %{player | puyo_x: next_x}
      else
        player
      end
    else
      player
    end
  end

  @doc """
  プレイヤーを回転します（時計回り）

  壁キック処理を含みます。

  ## Examples

      iex> stage = PuyoPuyo.Stage.new([])
      iex> player = PuyoPuyo.Player.new(stage)
      iex> player = PuyoPuyo.Player.rotate(player, stage)
      iex> player.rotation
      1

  """
  @spec rotate(t(), Stage.t()) :: t()
  def rotate(%__MODULE__{puyo_x: x, rotation: rotation} = player, stage) do
    next_rotation = rem(rotation + 1, 4)
    new_player = %{player | rotation: next_rotation}
    second_puyo_x = x + Enum.at(@offset_x, next_rotation)

    # 現在の2つ目のぷよの位置もチェック（回転前の位置）
    current_second_puyo_x = x + Enum.at(@offset_x, rotation)

    cond do
      # 回転前の2つ目のぷよが左にはみ出している場合、右にキック
      current_second_puyo_x < 0 ->
        kick_player = %{new_player | puyo_x: x + 1}
        if can_place?(kick_player, stage), do: kick_player, else: player

      # 回転前の2つ目のぷよが右にはみ出している場合、左にキック
      current_second_puyo_x >= stage.cols ->
        kick_player = %{new_player | puyo_x: x - 1}
        if can_place?(kick_player, stage), do: kick_player, else: player

      # 通常の配置が可能な場合
      can_place?(new_player, stage) ->
        new_player

      # 回転後の2つ目のぷよが左にはみ出す場合、右にキック
      second_puyo_x < 0 ->
        kick_player = %{new_player | puyo_x: x + 1}
        if can_place?(kick_player, stage), do: kick_player, else: player

      # 回転後の2つ目のぷよが右にはみ出す場合、左にキック
      second_puyo_x >= stage.cols ->
        kick_player = %{new_player | puyo_x: x - 1}
        if can_place?(kick_player, stage), do: kick_player, else: player

      # 軸ぷよが左にはみ出す場合、右にキック
      x < 0 ->
        kick_player = %{new_player | puyo_x: x + 1}
        if can_place?(kick_player, stage), do: kick_player, else: player

      # 軸ぷよが右にはみ出す場合、左にキック
      x >= stage.cols ->
        kick_player = %{new_player | puyo_x: x - 1}
        if can_place?(kick_player, stage), do: kick_player, else: player

      # 衝突がある場合は回転しない
      true ->
        player
    end
  end

  @doc """
  プレイヤーが下に移動できるかチェックします

  ## Examples

      iex> stage = PuyoPuyo.Stage.new([])
      iex> player = PuyoPuyo.Player.new(stage)
      iex> PuyoPuyo.Player.can_move_down?(player, stage)
      true

  """
  @spec can_move_down?(t(), Stage.t()) :: boolean()
  def can_move_down?(%__MODULE__{puyo_x: x, puyo_y: y, rotation: rotation}, stage) do
    next_y = y + 1
    second_puyo_x = x + Enum.at(@offset_x, rotation)
    second_puyo_y = next_y + Enum.at(@offset_y, rotation)

    # 範囲チェック
    if next_y >= stage.rows or second_puyo_y >= stage.rows do
      false
    else
      # 衝突チェック
      axis_puyo_clear = Stage.get_puyo(stage, x, next_y) == 0

      second_puyo_clear =
        if second_puyo_y >= 0,
          do: Stage.get_puyo(stage, second_puyo_x, second_puyo_y) == 0,
          else: true

      axis_puyo_clear and second_puyo_clear
    end
  end

  @doc """
  プレイヤーを下に移動します

  ## Examples

      iex> player = %PuyoPuyo.Player{puyo_x: 2, puyo_y: 0, puyo_type: 1, next_puyo_type: 2, rotation: 0, landed: false}
      iex> player = PuyoPuyo.Player.move_down(player)
      iex> player.puyo_y
      1

  """
  @spec move_down(t()) :: t()
  def move_down(%__MODULE__{puyo_y: y} = player) do
    %{player | puyo_y: y + 1}
  end

  @doc """
  プレイヤーを着地させ、ステージにぷよを配置します

  ## Examples

      iex> stage = PuyoPuyo.Stage.new([])
      iex> player = %PuyoPuyo.Player{puyo_x: 2, puyo_y: 10, puyo_type: 1, next_puyo_type: 2, rotation: 0, landed: false}
      iex> {landed_player, new_stage} = PuyoPuyo.Player.land(player, stage)
      iex> landed_player.landed
      true

  """
  @spec land(t(), Stage.t()) :: {t(), Stage.t()}
  def land(%__MODULE__{puyo_x: x, puyo_y: y, puyo_type: type, next_puyo_type: next_type, rotation: rotation} = player, stage) do
    second_puyo_x = x + Enum.at(@offset_x, rotation)
    second_puyo_y = y + Enum.at(@offset_y, rotation)

    # ステージにぷよを配置
    new_stage =
      stage
      |> Stage.set_puyo(x, y, type)
      |> then(fn stage ->
        if second_puyo_y >= 0 do
          Stage.set_puyo(stage, second_puyo_x, second_puyo_y, next_type)
        else
          stage
        end
      end)

    landed_player = %{player | landed: true}

    {landed_player, new_stage}
  end

  # プライベート関数

  # ランダムなぷよの種類を生成
  @spec random_puyo_type() :: non_neg_integer()
  defp random_puyo_type do
    Enum.random(@min_puyo_type..@max_puyo_type)
  end

  # 指定された位置にぷよを配置できるかチェック
  @spec can_place?(t(), Stage.t()) :: boolean()
  defp can_place?(%__MODULE__{puyo_x: x, puyo_y: y, rotation: rotation}, stage) do
    second_puyo_x = x + Enum.at(@offset_x, rotation)
    second_puyo_y = y + Enum.at(@offset_y, rotation)

    # 範囲チェック
    x_in_range = x >= 0 and x < stage.cols
    second_x_in_range = second_puyo_x >= 0 and second_puyo_x < stage.cols
    y_in_range = y >= 0 and y < stage.rows
    second_y_in_range = second_puyo_y >= 0 and second_puyo_y < stage.rows

    if x_in_range and second_x_in_range do
      # 衝突チェック
      axis_puyo_clear = if y_in_range, do: Stage.get_puyo(stage, x, y) == 0, else: true

      second_puyo_clear =
        if second_y_in_range, do: Stage.get_puyo(stage, second_puyo_x, second_puyo_y) == 0, else: true

      axis_puyo_clear and second_puyo_clear
    else
      false
    end
  end

end
