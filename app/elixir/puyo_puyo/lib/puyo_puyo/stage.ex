defmodule PuyoPuyo.Stage do
  @moduledoc """
  ぷよぷよゲームのステージを管理するモジュール

  ステージは12行×6列のボードで構成され、以下の機能を提供します：
  - ぷよの配置と取得
  - 消去判定（4つ以上の同色ぷよの接続判定）
  - ぷよの消去
  - 落下処理（重力）
  """

  @type t :: %__MODULE__{
          rows: non_neg_integer(),
          cols: non_neg_integer(),
          board: %{non_neg_integer() => %{non_neg_integer() => non_neg_integer()}}
        }

  defstruct [:rows, :cols, :board]

  @default_rows 12
  @default_cols 6

  @doc """
  新しいステージを作成します

  ## Options
    * `:rows` - ステージの行数（デフォルト: 12）
    * `:cols` - ステージの列数（デフォルト: 6）

  ## Examples

      iex> stage = PuyoPuyo.Stage.new([])
      iex> stage.rows
      12
      iex> stage.cols
      6

  """
  @spec new(keyword()) :: t()
  def new(opts) do
    rows = Keyword.get(opts, :rows, @default_rows)
    cols = Keyword.get(opts, :cols, @default_cols)

    # ボードを初期化（すべて0で埋める）
    board =
      for row <- 0..(rows - 1), into: %{} do
        {row, for(col <- 0..(cols - 1), into: %{}, do: {col, 0})}
      end

    %__MODULE__{rows: rows, cols: cols, board: board}
  end

  @doc """
  指定した位置のぷよを取得します

  範囲外の座標を指定した場合は0（空）を返します

  ## Examples

      iex> stage = PuyoPuyo.Stage.new([])
      iex> stage = PuyoPuyo.Stage.set_puyo(stage, 1, 10, 1)
      iex> PuyoPuyo.Stage.get_puyo(stage, 1, 10)
      1

  """
  @spec get_puyo(t(), non_neg_integer(), non_neg_integer()) :: non_neg_integer()
  def get_puyo(%__MODULE__{board: board, rows: rows, cols: cols}, x, y) do
    # 範囲外チェック
    if x < 0 or x >= cols or y < 0 or y >= rows do
      0
    else
      board[y][x]
    end
  end

  @doc """
  指定した位置にぷよを設定します

  新しいステージを返します（不変データ構造）

  ## Examples

      iex> stage = PuyoPuyo.Stage.new([])
      iex> stage = PuyoPuyo.Stage.set_puyo(stage, 1, 10, 1)
      iex> PuyoPuyo.Stage.get_puyo(stage, 1, 10)
      1

  """
  @spec set_puyo(t(), non_neg_integer(), non_neg_integer(), non_neg_integer()) :: t()
  def set_puyo(%__MODULE__{board: board} = stage, x, y, puyo_type) do
    # 指定した位置のぷよを更新
    updated_row = Map.put(board[y], x, puyo_type)
    updated_board = Map.put(board, y, updated_row)

    %{stage | board: updated_board}
  end

  @doc """
  消去判定を行います

  4つ以上接続している同色のぷよを検出します。
  深さ優先探索（DFS）アルゴリズムを使用して、接続しているぷよを探索します。

  ## Returns

    {消去するぷよの数, 消去するぷよの位置リスト}

  ## Examples

      iex> stage = PuyoPuyo.Stage.new([])
      iex> stage = stage
      ...> |> PuyoPuyo.Stage.set_puyo(1, 10, 1)
      ...> |> PuyoPuyo.Stage.set_puyo(2, 10, 1)
      ...> |> PuyoPuyo.Stage.set_puyo(1, 11, 1)
      ...> |> PuyoPuyo.Stage.set_puyo(2, 11, 1)
      iex> {count, _positions} = PuyoPuyo.Stage.check_erase(stage)
      iex> count
      4

  """
  @spec check_erase(t()) :: {non_neg_integer(), [{non_neg_integer(), non_neg_integer()}]}
  def check_erase(%__MODULE__{rows: rows, cols: cols} = stage) do
    # 訪問済みセルを記録するMapSet
    visited = MapSet.new()
    # 消去対象のぷよの位置を記録するリスト
    erase_positions = []

    # 全セルをチェック
    {_visited, erase_positions} =
      Enum.reduce(0..(rows - 1), {visited, erase_positions}, fn row, {visited_acc, erase_acc} ->
        Enum.reduce(0..(cols - 1), {visited_acc, erase_acc}, fn col,
                                                                 {visited_inner, erase_inner} ->
          puyo_type = get_puyo(stage, col, row)
          position = {col, row}

          # ぷよがあり、まだ訪問していない場合
          if puyo_type > 0 and not MapSet.member?(visited_inner, position) do
            # 接続しているぷよを探索
            {visited_after_search, connected} =
              search_connected(stage, col, row, puyo_type, visited_inner)

            # 4つ以上接続している場合は消去対象に追加
            if length(connected) >= 4 do
              {visited_after_search, erase_inner ++ connected}
            else
              {visited_after_search, erase_inner}
            end
          else
            {visited_inner, erase_inner}
          end
        end)
      end)

    {length(erase_positions), erase_positions}
  end

  # 深さ優先探索で接続しているぷよを探索
  @spec search_connected(
          t(),
          non_neg_integer(),
          non_neg_integer(),
          non_neg_integer(),
          MapSet.t()
        ) ::
          {MapSet.t(), [{non_neg_integer(), non_neg_integer()}]}
  defp search_connected(stage, x, y, puyo_type, visited) do
    position = {x, y}

    # 訪問済みにマーク
    visited = MapSet.put(visited, position)
    connected = [position]

    # 4方向を探索
    directions = [{1, 0}, {-1, 0}, {0, 1}, {0, -1}]

    Enum.reduce(directions, {visited, connected}, fn {dx, dy}, {visited_acc, connected_acc} ->
      next_x = x + dx
      next_y = y + dy
      next_position = {next_x, next_y}

      # 範囲内、同じ色、未訪問の場合は再帰的に探索
      if get_puyo(stage, next_x, next_y) == puyo_type and
           not MapSet.member?(visited_acc, next_position) do
        {visited_after_recursion, connected_from_recursion} =
          search_connected(stage, next_x, next_y, puyo_type, visited_acc)

        {visited_after_recursion, connected_acc ++ connected_from_recursion}
      else
        {visited_acc, connected_acc}
      end
    end)
  end

  @doc """
  指定した位置のぷよを消去します

  ## Examples

      iex> stage = PuyoPuyo.Stage.new([])
      iex> stage = stage |> PuyoPuyo.Stage.set_puyo(1, 10, 1)
      iex> stage = PuyoPuyo.Stage.erase_puyos(stage, [{1, 10}])
      iex> PuyoPuyo.Stage.get_puyo(stage, 1, 10)
      0

  """
  @spec erase_puyos(t(), [{non_neg_integer(), non_neg_integer()}]) :: t()
  def erase_puyos(stage, positions) do
    Enum.reduce(positions, stage, fn {x, y}, stage_acc ->
      set_puyo(stage_acc, x, y, 0)
    end)
  end

  @doc """
  ぷよを落下させます

  各列で、下から上に向かってぷよをチェックし、
  下に空きがある場合は落下させます。

  ## Examples

      iex> stage = PuyoPuyo.Stage.new([])
      iex> stage = stage
      ...> |> PuyoPuyo.Stage.set_puyo(1, 5, 1)
      ...> |> PuyoPuyo.Stage.set_puyo(1, 10, 0)
      iex> stage = PuyoPuyo.Stage.fall(stage)
      iex> PuyoPuyo.Stage.get_puyo(stage, 1, 11)
      1

  """
  @spec fall(t()) :: t()
  def fall(%__MODULE__{rows: rows, cols: cols} = stage) do
    # 各列を処理
    Enum.reduce(0..(cols - 1), stage, fn col, stage_acc ->
      # 下から上に向かって処理
      Enum.reduce((rows - 2)..0//-1, stage_acc, fn row, stage_inner ->
        puyo_type = get_puyo(stage_inner, col, row)

        if puyo_type > 0 do
          # 現在のぷよの下が空いている場合、落下させる
          fall_puyo_in_column(stage_inner, col, row, puyo_type)
        else
          stage_inner
        end
      end)
    end)
  end

  # 指定した列のぷよを可能な限り落下させる
  @spec fall_puyo_in_column(t(), non_neg_integer(), non_neg_integer(), non_neg_integer()) :: t()
  defp fall_puyo_in_column(%__MODULE__{rows: rows} = stage, col, start_row, puyo_type) do
    # 落下先を探す
    fall_to_row =
      Enum.reduce_while((start_row + 1)..(rows - 1), start_row, fn row, _acc ->
        if get_puyo(stage, col, row) == 0 do
          {:cont, row}
        else
          {:halt, row - 1}
        end
      end)

    # 落下先が異なる場合は移動
    if fall_to_row != start_row do
      stage
      |> set_puyo(col, fall_to_row, puyo_type)
      |> set_puyo(col, start_row, 0)
    else
      stage
    end
  end

  @doc """
  重力を適用します（1フレームで1マス落下）

  すべてのぷよに対して、下に移動できる場合は1マス落下させます。

  ## Returns

    {ぷよが落下したかどうか, 新しいステージ}

  ## Examples

      iex> stage = PuyoPuyo.Stage.new([])
      iex> stage = PuyoPuyo.Stage.set_puyo(stage, 1, 5, 1)
      iex> {has_fallen, stage} = PuyoPuyo.Stage.apply_gravity(stage)
      iex> has_fallen
      true
      iex> PuyoPuyo.Stage.get_puyo(stage, 1, 6)
      1

  """
  @spec apply_gravity(t()) :: {boolean(), t()}
  def apply_gravity(%__MODULE__{rows: rows, cols: cols} = stage) do
    # 下から上に向かって処理（下のぷよから先に処理する）
    {has_fallen, new_stage} =
      Enum.reduce((rows - 2)..0//-1, {false, stage}, fn row, {fallen_acc, stage_acc} ->
        # 左から右に処理
        Enum.reduce(0..(cols - 1), {fallen_acc, stage_acc}, fn col, {fallen_inner, stage_inner} ->
          puyo_type = get_puyo(stage_inner, col, row)

          # ぷよがあり、下が空いている場合
          if puyo_type > 0 and get_puyo(stage_inner, col, row + 1) == 0 do
            # 1マス落下
            new_stage_inner =
              stage_inner
              |> set_puyo(col, row + 1, puyo_type)
              |> set_puyo(col, row, 0)

            {true, new_stage_inner}
          else
            {fallen_inner, stage_inner}
          end
        end)
      end)

    {has_fallen, new_stage}
  end
end
