#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scala.js版ぷよぷよドキュメントの識別子を日本語に変換するスクリプト
"""

import re
import sys

def convert_to_japanese():
    """メイン変換処理"""

    # 入力ファイルを読み込み
    input_file = 'ぷよぷよから始めるテスト駆動開発入門_Scala_js版.md'
    output_file = 'ぷよぷよから始めるテスト駆動開発入門_Scala_js_日本語コード版.md'

    print(f"読み込み中: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"元のファイルサイズ: {len(content)} 文字")

    # タイトルを変更
    content = content.replace(
        '# ぷよぷよから始めるテスト駆動開発入門 Scala.js 版',
        '# ぷよぷよから始めるテスト駆動開発入門 Scala.js 日本語コード版'
    )

    # 冒頭に説明を追加
    intro_section = """
> **注意**: このドキュメントは、コード内のすべての識別子（変数名、関数名、クラス名など）を日本語に変換したバージョンです。
> 日本語識別子を使用することで、コードの意図がより明確になり、ドメイン知識とコードの距離が近くなります。
> ただし、実際のプロジェクトでは、チームの慣習やプロジェクトの要件に応じて、適切な命名規則を選択してください。

"""

    # タイトル行の後に説明を挿入
    lines = content.split('\n')
    if lines[0].startswith('# '):
        lines.insert(1, intro_section)
        content = '\n'.join(lines)

    # 変換ルールの定義（順序が重要 - より specific なものを先に）
    replacements = [
        # クラス定義（具体的なパターンを先に）
        ('class GameSpec', 'class ゲームSpec'),
        ('class PlayerSpec', 'class プレイヤーSpec'),
        ('class StageSpec', 'class ステージSpec'),

        # ケースクラス
        ('case class EraseInfo', 'case class 消去情報'),
        ('case class PuyoPosition', 'case class ぷよの位置'),

        # enum定義
        ('enum GameMode:', 'enum ゲームモード:'),

        # 変数宣言（より具体的なパターン）
        ('var game:', 'var ゲーム:'),
        ('val game:', 'val ゲーム:'),
        ('var game =', 'var ゲーム ='),
        ('val game =', 'val ゲーム ='),
        ('var game ', 'var ゲーム '),
        ('val game ', 'val ゲーム '),

        ('game =', 'ゲーム ='),
        ('\\bgame\\.', 'ゲーム.'),

        # メソッド定義と呼び出し（より具体的なものを先に）
        ('def createNewPuyo\\(', 'def 新しいぷよを作成('),
        ('\\.createNewPuyo\\(', '.新しいぷよを作成('),

        ('def moveLeft\\(', 'def 左に移動('),
        ('\\.moveLeft\\(', '.左に移動('),

        ('def moveRight\\(', 'def 右に移動('),
        ('\\.moveRight\\(', '.右に移動('),

        ('def moveDown\\(', 'def 下に移動('),
        ('\\.moveDown\\(', '.下に移動('),

        ('def rotateRight\\(', 'def 右に回転('),
        ('\\.rotateRight\\(', '.右に回転('),

        ('def rotateLeft\\(', 'def 左に回転('),
        ('\\.rotateLeft\\(', '.左に回転('),

        ('def canMoveDown\\(', 'def 下に移動できる('),
        ('\\.canMoveDown\\(', '.下に移動できる('),

        ('def hasLanded\\(', 'def 着地した('),
        ('\\.hasLanded\\(', '.着地した('),

        ('def checkErase\\(', 'def 消去チェック('),
        ('\\.checkErase\\(', '.消去チェック('),

        ('def applyGravity\\(', 'def 重力を適用('),
        ('\\.applyGravity\\(', '.重力を適用('),

        ('def eraseBoards\\(', 'def ボードを消去('),
        ('\\.eraseBoards\\(', '.ボードを消去('),

        ('def fall\\(', 'def 落下('),
        ('\\.fall\\(', '.落下('),

        ('def draw\\(', 'def 描画('),
        ('\\.draw\\(', '.描画('),

        ('def update\\(', 'def 更新('),
        ('\\.update\\(', '.更新('),

        ('def initialize\\(', 'def 初期化('),
        ('\\.initialize\\(', '.初期化('),

        ('def setupKeyboard\\(', 'def キーボードを設定('),
        ('\\.setupKeyboard\\(', '.キーボードを設定('),

        ('def setMode\\(', 'def モードを設定('),
        ('\\.setMode\\(', '.モードを設定('),

        ('def getMode\\(', 'def モードを取得('),
        ('\\.getMode\\(', '.モードを取得('),

        ('def setPuyoX\\(', 'def ぷよのX座標を設定('),
        ('\\.setPuyoX\\(', '.ぷよのX座標を設定('),

        ('def setPuyoY\\(', 'def ぷよのY座標を設定('),
        ('\\.setPuyoY\\(', '.ぷよのY座標を設定('),

        ('def setRotation\\(', 'def 回転状態を設定('),
        ('\\.setRotation\\(', '.回転状態を設定('),

        ('def getPuyoX\\(', 'def ぷよのX座標を取得('),
        ('def puyoX:', 'def ぷよのX座標:'),
        ('\\.puyoX\\b', '.ぷよのX座標'),

        ('def getPuyoY\\(', 'def ぷよのY座標を取得('),
        ('def puyoY:', 'def ぷよのY座標:'),
        ('\\.puyoY\\b', '.ぷよのY座標'),

        ('def getRotation\\(', 'def 回転状態を取得('),
        ('def rotation:', 'def 回転状態:'),
        ('\\.rotation\\b', '.回転状態'),

        ('def puyoType:', 'def ぷよの種類:'),
        ('\\.puyoType\\b', '.ぷよの種類'),

        ('def updateWithDelta\\(', 'def デルタ時間で更新('),
        ('\\.updateWithDelta\\(', '.デルタ時間で更新('),

        ('def setInputKeyDown\\(', 'def 下キー入力を設定('),
        ('\\.setInputKeyDown\\(', '.下キー入力を設定('),

        ('def getDropSpeed\\(', 'def 落下速度を取得('),
        ('\\.getDropSpeed\\(', '.落下速度を取得('),

        # 変数名（パターンマッチを使用）
        ('_puyoX', '_ぷよのX座標'),
        ('_puyoY', '_ぷよのY座標'),
        ('_rotation', '_回転状態'),
        ('_puyoType', '_ぷよの種類'),
        ('_landed', '_着地済み'),

        # クラス名（一般的なパターン）
        ('\\bConfig\\b(?!:)', '設定情報'),
        ('class Config', 'class 設定情報'),
        ('new Config\\(', 'new 設定情報('),

        ('\\bPlayer\\b(?!:)', 'プレイヤー'),
        ('class Player', 'class プレイヤー'),
        ('new Player\\(', 'new プレイヤー('),

        ('\\bStage\\b(?!:)', 'ステージ'),
        ('class Stage', 'class ステージ'),
        ('new Stage\\(', 'new ステージ('),

        ('\\bPuyoImage\\b', 'ぷよ画像'),
        ('class PuyoImage', 'class ぷよ画像'),
        ('new PuyoImage\\(', 'new ぷよ画像('),

        ('\\bGame\\b(?!:)', 'ゲーム'),
        ('class Game', 'class ゲーム'),
        ('new Game\\(', 'new ゲーム('),
        ('var game:', 'var ゲーム:'),

        ('\\bScore\\b(?!:)', 'スコア'),
        ('class Score', 'class スコア'),
        ('new Score\\(', 'new スコア('),

        ('GameMode', 'ゲームモード'),
        ('EraseInfo', '消去情報'),
        ('PuyoPosition', 'ぷよの位置'),

        # プロパティアクセス
        ('\\.config\\b', '.設定情報'),
        ('\\.puyoImage\\b', '.ぷよ画像'),
        ('\\.stage\\b', '.ステージ'),
        ('\\.player\\b', '.プレイヤー'),
        ('\\.score\\b', '.スコア'),
        ('\\.mode\\b', '.モード'),

        # よくある変数名（パラメータと変数宣言と代入）
        ('\\bconfig:', '設定情報:'),
        ('config:', '設定情報:'),
        (' config =', ' 設定情報 ='),
        ('\\bconfig =', '設定情報 ='),
        ('\\(config\\)', '(設定情報)'),
        (' config,', ' 設定情報,'),
        ('\\bconfig\\b', '設定情報'),

        ('\\bpuyoImage:', 'ぷよ画像:'),
        ('puyoImage:', 'ぷよ画像:'),
        (' puyoImage =', ' ぷよ画像 ='),
        ('\\bpuyoImage =', 'ぷよ画像 ='),
        ('\\(puyoImage\\)', '(ぷよ画像)'),
        (' puyoImage,', ' ぷよ画像,'),
        ('\\bpuyoImage\\b', 'ぷよ画像'),

        ('\\bstage:', 'ステージ:'),
        ('stage:', 'ステージ:'),
        (' stage =', ' ステージ ='),
        ('\\bstage =', 'ステージ ='),
        ('\\(stage\\)', '(ステージ)'),
        (' stage,', ' ステージ,'),
        ('\\bstage\\b', 'ステージ'),

        ('\\bplayer:', 'プレイヤー:'),
        ('player:', 'プレイヤー:'),
        (' player =', ' プレイヤー ='),
        ('\\bplayer =', 'プレイヤー ='),

        ('\\bscore:', 'スコア:'),
        ('score:', 'スコア:'),
        (' score =', ' スコア ='),
        ('\\bscore =', 'スコア ='),

        # コメント内の識別子
        ('// Config', '// 設定情報'),
        ('// Player', '// プレイヤー'),
        ('// Stage', '// ステージ'),
        ('// PuyoImage', '// ぷよ画像'),
        ('// Game', '// ゲーム'),
        ('// Score', '// スコア'),

        # 追加の変数パターン
        ('val deltaTime', 'val デルタ時間'),
        ('deltaTime:', 'デルタ時間:'),
        ('\\bdeltaTime\\b', 'デルタ時間'),

        ('val frame', 'val フレーム'),
        ('var frame', 'var フレーム'),
        ('_frame', '_フレーム'),

        ('combinationCount', '連鎖数'),
        ('val eraseCount', 'val 消去数'),
        ('val chainCount', 'val 連鎖数'),
    ]

    # 変換を実行
    conversion_count = 0
    for pattern, replacement in replacements:
        before_len = len(content)
        content = re.sub(pattern, replacement, content)
        after_len = len(content)
        if before_len != after_len:
            count = len(re.findall(pattern, content + " " * (before_len - after_len)))
            conversion_count += count
            if count > 0:
                print(f"変換: '{pattern}' -> '{replacement}' ({count}箇所)")

    print(f"\n合計変換数: {conversion_count} 箇所")
    print(f"変換後のファイルサイズ: {len(content)} 文字")

    # 出力ファイルに書き込み
    print(f"\n書き込み中: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print("変換完了!")
    return True

if __name__ == '__main__':
    try:
        convert_to_japanese()
        sys.exit(0)
    except Exception as e:
        print(f"エラーが発生しました: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
