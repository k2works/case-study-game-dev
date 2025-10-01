// ぷよぷよゲームのエントリーポイント

console.log('ぷよぷよゲーム起動！')

// Canvas 要素の取得
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')

if (ctx) {
  // 背景を描画
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // テキストを描画
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '20px Arial'
  ctx.fillText('ぷよぷよ開発中...', 50, 180)
}
