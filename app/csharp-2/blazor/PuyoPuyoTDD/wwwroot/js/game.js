// ゲームループの実装
let animationId = null;
let lastFrameTime = 0;
const FPS = 60;
const FRAME_DURATION = 1000 / FPS;

/**
 * ゲームループを開始します
 */
window.startGameLoop = function() {
    const canvas = document.getElementById('stageCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');

    // 初期描画
    drawGame(ctx, canvas);

    // ゲームループの開始
    lastFrameTime = performance.now();
    gameLoop(ctx, canvas);
};

/**
 * ゲームループのメイン関数
 * @param {CanvasRenderingContext2D} ctx - Canvas の 2D コンテキスト
 * @param {HTMLCanvasElement} canvas - Canvas 要素
 */
function gameLoop(ctx, canvas) {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;

    if (deltaTime >= FRAME_DURATION) {
        // ゲームの更新と描画
        updateGame();
        drawGame(ctx, canvas);
        lastFrameTime = currentTime;
    }

    animationId = requestAnimationFrame(() => gameLoop(ctx, canvas));
}

/**
 * ゲームの状態を更新します（将来の実装用）
 */
function updateGame() {
    // TODO: ゲームロジックの更新処理
    // 将来的にここでぷよの落下、消去などの処理を実装
}

/**
 * ゲームを描画します
 * @param {CanvasRenderingContext2D} ctx - Canvas の 2D コンテキスト
 * @param {HTMLCanvasElement} canvas - Canvas 要素
 */
function drawGame(ctx, canvas) {
    // 背景をクリア
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // グリッド線を描画
    drawGrid(ctx, canvas);
}

/**
 * グリッド線を描画します
 * @param {CanvasRenderingContext2D} ctx - Canvas の 2D コンテキスト
 * @param {HTMLCanvasElement} canvas - Canvas 要素
 */
function drawGrid(ctx, canvas) {
    const cellSize = 32; // Config.PuyoSize と同じ値
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;

    // 縦線
    for (let x = 0; x <= canvas.width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // 横線
    for (let y = 0; y <= canvas.height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

/**
 * ゲームループを停止します
 */
window.stopGameLoop = function() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
};
