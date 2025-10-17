defmodule PuyoPuyo.PlayerTest do
  use ExUnit.Case, async: true

  alias PuyoPuyo.{Player, Stage}

  @initial_x 2

  describe "Player.new/1" do
    test "creates a new player with default position" do
      stage = Stage.new([])
      player = Player.new(stage)

      # 初期位置はx=2, y=0
      assert player.puyo_x == 2
      assert player.puyo_y == 0
      # 初期回転状態は0（上向き）
      assert player.rotation == 0
      # 未着地
      assert player.landed == false
    end

    test "creates a player with random puyo types" do
      stage = Stage.new([])
      player = Player.new(stage)

      # ぷよの種類は1-4の範囲
      assert player.puyo_type in 1..4
      assert player.next_puyo_type in 1..4
    end
  end

  describe "Player.can_spawn?/2" do
    test "returns true when spawn position is empty" do
      stage = Stage.new([])
      player = Player.new(stage)

      assert Player.can_spawn?(player, stage) == true
    end

    test "returns false when spawn position is occupied" do
      stage = Stage.new([])
      # 初期位置(2, 0)にぷよを配置
      stage = Stage.set_puyo(stage, 2, 0, 1)

      player = Player.new(stage)

      assert Player.can_spawn?(player, stage) == false
    end
  end

  describe "Player.move_left/2" do
    setup do
      stage = Stage.new([])
      player = Player.new(stage)
      {:ok, stage: stage, player: player}
    end

    test "moves player left", %{stage: stage, player: player} do
      initial_x = player.puyo_x
      player = Player.move_left(player, stage)

      assert player.puyo_x == initial_x - 1
    end

    test "does not move left beyond left boundary", %{stage: stage, player: player} do
      # 左端まで移動
      player = %{player | puyo_x: 0}

      # さらに左に移動しようとする
      player = Player.move_left(player, stage)

      # 位置が変わらないことを確認
      assert player.puyo_x == 0
    end

    test "does not move left when collision with puyo", %{stage: stage, player: player} do
      # 左隣にぷよを配置
      stage = Stage.set_puyo(stage, player.puyo_x - 1, player.puyo_y, 1)

      initial_x = player.puyo_x
      player = Player.move_left(player, stage)

      # 位置が変わらないことを確認
      assert player.puyo_x == initial_x
    end

    test "does not move left when second puyo would collide", %{stage: stage, player: player} do
      # 横向き（回転状態1）にする
      player = %{player | rotation: 1}

      # 2つ目のぷよの左隣（軸ぷよの位置）にぷよを配置
      stage = Stage.set_puyo(stage, player.puyo_x, player.puyo_y, 1)

      # 左に移動しようとする
      player = Player.move_left(player, stage)

      # 移動できないことを確認（2つ目のぷよの位置に既にぷよがある）
      assert player.puyo_x == @initial_x
    end
  end

  describe "Player.move_right/2" do
    setup do
      stage = Stage.new([])
      player = Player.new(stage)
      {:ok, stage: stage, player: player}
    end

    test "moves player right", %{stage: stage, player: player} do
      initial_x = player.puyo_x
      player = Player.move_right(player, stage)

      assert player.puyo_x == initial_x + 1
    end

    test "does not move right beyond right boundary", %{stage: stage, player: player} do
      # 右端まで移動（列数は6なので、x=5が右端）
      player = %{player | puyo_x: 5}

      # さらに右に移動しようとする
      player = Player.move_right(player, stage)

      # 位置が変わらないことを確認
      assert player.puyo_x == 5
    end

    test "does not move right when collision with puyo", %{stage: stage, player: player} do
      # 右隣にぷよを配置
      stage = Stage.set_puyo(stage, player.puyo_x + 1, player.puyo_y, 1)

      initial_x = player.puyo_x
      player = Player.move_right(player, stage)

      # 位置が変わらないことを確認
      assert player.puyo_x == initial_x
    end
  end

  describe "Player.rotate/2" do
    setup do
      stage = Stage.new([])
      player = Player.new(stage)
      {:ok, stage: stage, player: player}
    end

    test "rotates player clockwise", %{stage: stage, player: player} do
      # 0 -> 1
      player = Player.rotate(player, stage)
      assert player.rotation == 1

      # 1 -> 2
      player = Player.rotate(player, stage)
      assert player.rotation == 2

      # 2 -> 3
      player = Player.rotate(player, stage)
      assert player.rotation == 3

      # 3 -> 0
      player = Player.rotate(player, stage)
      assert player.rotation == 0
    end

    test "does not rotate when collision occurs", %{stage: stage, player: player} do
      # 初期状態は上向き（回転0）
      # 回転すると右向き（回転1）になり、右隣にぷよが来る
      # 右隣にぷよを配置して回転をブロック
      stage = Stage.set_puyo(stage, player.puyo_x + 1, player.puyo_y, 1)

      player = Player.rotate(player, stage)

      # 回転できないことを確認
      assert player.rotation == 0
    end

    test "performs wall kick when rotating near left wall", %{stage: stage, player: player} do
      # 左端に移動
      player = %{player | puyo_x: 0, rotation: 3}

      # 回転すると左にはみ出すが、壁キックで右に1マスずれる
      player = Player.rotate(player, stage)

      assert player.rotation == 0
      assert player.puyo_x == 1
    end

    test "performs wall kick when rotating near right wall", %{stage: stage, player: player} do
      # 右端に移動
      player = %{player | puyo_x: 5, rotation: 1}

      # 回転すると右にはみ出すが、壁キックで左に1マスずれる
      player = Player.rotate(player, stage)

      assert player.rotation == 2
      assert player.puyo_x == 4
    end
  end

  describe "Player.can_move_down?/2" do
    setup do
      stage = Stage.new([])
      player = Player.new(stage)
      {:ok, stage: stage, player: player}
    end

    test "returns true when space below is empty", %{stage: stage, player: player} do
      assert Player.can_move_down?(player, stage) == true
    end

    test "returns false when at bottom", %{stage: stage, player: player} do
      # 最下段に移動
      player = %{player | puyo_y: 11}

      assert Player.can_move_down?(player, stage) == false
    end

    test "returns false when puyo below", %{stage: stage, player: player} do
      # 軸ぷよの下にぷよを配置
      stage = Stage.set_puyo(stage, player.puyo_x, player.puyo_y + 1, 1)

      assert Player.can_move_down?(player, stage) == false
    end

    test "returns false when second puyo has obstacle below", %{stage: stage, player: player} do
      # 初期状態は上向き（回転0）なので、2つ目のぷよは上にある
      # 2つ目のぷよの位置は(puyo_x, puyo_y - 1)
      # 横向き（回転1）にすると、2つ目のぷよは右にある
      player = %{player | rotation: 1}

      # 2つ目のぷよの下にぷよを配置
      second_puyo_x = player.puyo_x + 1
      stage = Stage.set_puyo(stage, second_puyo_x, player.puyo_y + 1, 1)

      assert Player.can_move_down?(player, stage) == false
    end
  end

  describe "Player.move_down/1" do
    setup do
      stage = Stage.new([])
      player = Player.new(stage)
      {:ok, stage: stage, player: player}
    end

    test "moves player down", %{player: player} do
      initial_y = player.puyo_y
      player = Player.move_down(player)

      assert player.puyo_y == initial_y + 1
    end
  end

  describe "Player.land/2" do
    setup do
      stage = Stage.new([])
      player = Player.new(stage)
      {:ok, stage: stage, player: player}
    end

    test "marks player as landed and places puyos on stage", %{stage: stage, player: player} do
      player = %{player | puyo_y: 10, puyo_type: 1, next_puyo_type: 2, rotation: 0}

      {landed_player, new_stage} = Player.land(player, stage)

      # プレイヤーが着地済みとマークされる
      assert landed_player.landed == true

      # ステージにぷよが配置される
      assert Stage.get_puyo(new_stage, 2, 10) == 1
      assert Stage.get_puyo(new_stage, 2, 9) == 2
    end

    test "places puyos correctly with different rotation", %{stage: stage, player: player} do
      # 横向き（回転1）
      player = %{player | puyo_y: 10, puyo_type: 1, next_puyo_type: 2, rotation: 1}

      {_landed_player, new_stage} = Player.land(player, stage)

      # ステージにぷよが配置される
      assert Stage.get_puyo(new_stage, 2, 10) == 1
      assert Stage.get_puyo(new_stage, 3, 10) == 2
    end
  end
end
