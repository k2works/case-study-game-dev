defmodule PuyoPuyo.StageTest do
  use ExUnit.Case, async: true

  alias PuyoPuyo.Stage

  describe "Stage.new/1" do
    test "creates a new stage with default dimensions" do
      stage = Stage.new([])

      assert stage.rows == 12
      assert stage.cols == 6
    end

    test "creates a new stage with custom dimensions" do
      stage = Stage.new(rows: 10, cols: 8)

      assert stage.rows == 10
      assert stage.cols == 8
    end

    test "initializes board with all zeros" do
      stage = Stage.new([])

      # すべてのセルが0（空）であることを確認
      for row <- 0..(stage.rows - 1) do
        for col <- 0..(stage.cols - 1) do
          assert Stage.get_puyo(stage, col, row) == 0
        end
      end
    end
  end

  describe "Stage.set_puyo/4 and Stage.get_puyo/3" do
    setup do
      {:ok, stage: Stage.new([])}
    end

    test "sets and gets a puyo at specified position", %{stage: stage} do
      # ぷよを設定（x=1, y=10, type=1 [赤]）
      stage = Stage.set_puyo(stage, 1, 10, 1)

      # ぷよを取得して確認
      assert Stage.get_puyo(stage, 1, 10) == 1
    end

    test "returns 0 for empty cell", %{stage: stage} do
      # 空のセルを取得
      assert Stage.get_puyo(stage, 0, 0) == 0
    end

    test "returns 0 for out of bounds position", %{stage: stage} do
      # 範囲外の座標を指定
      assert Stage.get_puyo(stage, -1, 0) == 0
      assert Stage.get_puyo(stage, 0, -1) == 0
      assert Stage.get_puyo(stage, 100, 0) == 0
      assert Stage.get_puyo(stage, 0, 100) == 0
    end
  end

  describe "Stage.check_erase/1" do
    setup do
      {:ok, stage: Stage.new([])}
    end

    test "detects 4 connected puyos as erasable", %{stage: stage} do
      # 2×2の正方形に赤ぷよを配置
      stage =
        stage
        |> Stage.set_puyo(1, 10, 1)
        |> Stage.set_puyo(2, 10, 1)
        |> Stage.set_puyo(1, 11, 1)
        |> Stage.set_puyo(2, 11, 1)

      # 消去判定
      {erase_count, _positions} = Stage.check_erase(stage)

      # 4つのぷよが消去対象になっていることを確認
      assert erase_count == 4
    end

    test "does not erase different colored puyos", %{stage: stage} do
      # 市松模様に赤と緑のぷよを配置
      stage =
        stage
        |> Stage.set_puyo(1, 10, 1)
        # 赤
        |> Stage.set_puyo(2, 10, 2)
        # 緑
        |> Stage.set_puyo(1, 11, 2)
        # 緑
        |> Stage.set_puyo(2, 11, 1)

      # 赤

      # 消去判定
      {erase_count, positions} = Stage.check_erase(stage)

      # 消去対象がないことを確認
      assert erase_count == 0
      assert positions == []
    end

    test "does not erase 3 or fewer connected puyos", %{stage: stage} do
      # L字型に赤ぷよを3つ配置
      stage =
        stage
        |> Stage.set_puyo(1, 10, 1)
        |> Stage.set_puyo(2, 10, 1)
        |> Stage.set_puyo(1, 11, 1)

      # 消去判定
      {erase_count, positions} = Stage.check_erase(stage)

      # 消去対象がないことを確認
      assert erase_count == 0
      assert positions == []
    end

    test "detects vertical line of 4 puyos", %{stage: stage} do
      # 縦に4つの赤ぷよを配置
      stage =
        stage
        |> Stage.set_puyo(1, 8, 1)
        |> Stage.set_puyo(1, 9, 1)
        |> Stage.set_puyo(1, 10, 1)
        |> Stage.set_puyo(1, 11, 1)

      # 消去判定
      {erase_count, _positions} = Stage.check_erase(stage)

      # 4つのぷよが消去対象になっていることを確認
      assert erase_count == 4
    end

    test "detects horizontal line of 4 puyos", %{stage: stage} do
      # 横に4つの赤ぷよを配置
      stage =
        stage
        |> Stage.set_puyo(1, 10, 1)
        |> Stage.set_puyo(2, 10, 1)
        |> Stage.set_puyo(3, 10, 1)
        |> Stage.set_puyo(4, 10, 1)

      # 消去判定
      {erase_count, _positions} = Stage.check_erase(stage)

      # 4つのぷよが消去対象になっていることを確認
      assert erase_count == 4
    end
  end

  describe "Stage.erase_puyos/2" do
    setup do
      {:ok, stage: Stage.new([])}
    end

    test "erases puyos at specified positions", %{stage: stage} do
      # ステージにぷよを配置
      stage =
        stage
        |> Stage.set_puyo(1, 10, 1)
        |> Stage.set_puyo(2, 10, 1)
        |> Stage.set_puyo(1, 11, 1)
        |> Stage.set_puyo(2, 11, 1)

      # 消去判定
      {_count, positions} = Stage.check_erase(stage)

      # 消去実行
      stage = Stage.erase_puyos(stage, positions)

      # ぷよが消去されていることを確認
      assert Stage.get_puyo(stage, 1, 10) == 0
      assert Stage.get_puyo(stage, 2, 10) == 0
      assert Stage.get_puyo(stage, 1, 11) == 0
      assert Stage.get_puyo(stage, 2, 11) == 0
    end
  end

  describe "Stage.fall/1" do
    setup do
      {:ok, stage: Stage.new([])}
    end

    test "makes puyos fall after erasure", %{stage: stage} do
      # ステージにぷよを配置
      # 下に赤ぷよ4つ（2×2）、その上の列(x=2)に緑ぷよ2つ
      stage =
        stage
        |> Stage.set_puyo(1, 10, 1)
        # 赤
        |> Stage.set_puyo(2, 10, 1)
        # 赤
        |> Stage.set_puyo(1, 11, 1)
        # 赤
        |> Stage.set_puyo(2, 11, 1)
        # 赤
        |> Stage.set_puyo(2, 8, 2)
        # 緑
        |> Stage.set_puyo(2, 9, 2)

      # 緑

      # 消去判定と実行
      {_count, positions} = Stage.check_erase(stage)
      stage = Stage.erase_puyos(stage, positions)

      # 落下処理
      stage = Stage.fall(stage)

      # 上にあった緑ぷよが落下していることを確認
      assert Stage.get_puyo(stage, 2, 10) == 2
      assert Stage.get_puyo(stage, 2, 11) == 2
    end
  end

  describe "Stage.apply_gravity/1" do
    setup do
      {:ok, stage: Stage.new([])}
    end

    test "makes floating puyo fall one row", %{stage: stage} do
      # 浮いている青ぷよを配置（下に空きがある）
      stage = Stage.set_puyo(stage, 4, 2, 2)

      # 重力を適用
      {has_fallen, stage} = Stage.apply_gravity(stage)

      # 青ぷよが1マス落ちていることを確認
      assert has_fallen == true
      assert Stage.get_puyo(stage, 4, 2) == 0
      assert Stage.get_puyo(stage, 4, 3) == 2
    end

    test "returns false when no puyo falls", %{stage: stage} do
      # すべてのぷよが支えられている状態
      stage =
        stage
        |> Stage.set_puyo(2, 11, 1)
        |> Stage.set_puyo(3, 11, 2)

      # 重力を適用
      {has_fallen, _stage} = Stage.apply_gravity(stage)

      # 何も落ちていないことを確認
      assert has_fallen == false
    end
  end
end
