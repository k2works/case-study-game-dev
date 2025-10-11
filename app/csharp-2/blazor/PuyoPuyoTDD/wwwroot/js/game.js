// ゲームループの実装
let animationId = null;
let lastFrameTime = 0;
let lastDropTime = 0;
const FPS = 60;
const FRAME_DURATION = 1000 / FPS;
let dotNetHelper = null;

/**
 * ゲームを初期化します
 * @param {object} helper - .NET オブジェクト参照
 */
window.initializeGame = function(helper) {
    dotNetHelper = helper;

    // キーボードイベントのリスナーを追加
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
};

/**
 * キーが押されたときの処理
 * @param {KeyboardEvent} event - キーボードイベント
 */
function handleKeyDown(event) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || event.code === 'KeyX') {
        event.preventDefault();
        if (dotNetHelper) {
            const key = event.code === 'KeyX' ? 'KeyX' : event.key;
            dotNetHelper.invokeMethodAsync('OnKeyDown', key);
        }
    }
}

/**
 * キーが離されたときの処理
 * @param {KeyboardEvent} event - キーボードイベント
 */
function handleKeyUp(event) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        if (dotNetHelper) {
            dotNetHelper.invokeMethodAsync('OnKeyUp', event.key);
        }
    }
}

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
        updateGame(currentTime);
        drawGame(ctx, canvas);
        lastFrameTime = currentTime;
    }

    animationId = requestAnimationFrame(() => gameLoop(ctx, canvas));
}

/**
 * ゲームの状態を更新します
 * @param {number} currentTime - 現在時刻
 */
async function updateGame(currentTime) {
    if (!dotNetHelper) return;

    // 落下速度を取得
    const dropSpeed = await dotNetHelper.invokeMethodAsync('GetDropSpeed');

    // 落下間隔を計算 (dropSpeedが大きいほど速く落ちる)
    const dropInterval = 1000 / dropSpeed;

    // 最後の落下から dropInterval 経過していれば落下
    if (currentTime - lastDropTime >= dropInterval) {
        const canMove = await dotNetHelper.invokeMethodAsync('MoveDown');

        if (canMove) {
            lastDropTime = currentTime;
        }
    }
}

/**
 * ゲームを描画します
 * @param {CanvasRenderingContext2D} ctx - Canvas の 2D コンテキスト
 * @param {HTMLCanvasElement} canvas - Canvas 要素
 */
async function drawGame(ctx, canvas) {
    // 背景をクリア
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // グリッド線を描画
    drawGrid(ctx, canvas);

    // ぷよを描画
    if (dotNetHelper) {
        const puyoData = await dotNetHelper.invokeMethodAsync('GetPuyoData');
        drawPuyo(ctx, puyoData);
    }
}

/**
 * ぷよを描画します
 * @param {CanvasRenderingContext2D} ctx - Canvas の 2D コンテキスト
 * @param {object} puyoData - ぷよのデータ
 */
function drawPuyo(ctx, puyoData) {
    const cellSize = 32;
    const { x, y, type, rotation } = puyoData;

    // ぷよの色を決定 (type: 1=赤, 2=青, 3=緑, 4=黄)
    const colors = {
        1: '#ff0000', // 赤
        2: '#0000ff', // 青
        3: '#00ff00', // 緑
        4: '#ffff00', // 黄
    };

    const color = colors[type] || '#cccccc';

    // 軸ぷよを描画
    drawSinglePuyo(ctx, x, y, color, cellSize);

    // 回転に応じて子ぷよの位置を計算
    let childX = x;
    let childY = y;

    switch (rotation) {
        case 0: // 上
            childY = y - 1;
            break;
        case 1: // 右
            childX = x + 1;
            break;
        case 2: // 下
            childY = y + 1;
            break;
        case 3: // 左
            childX = x - 1;
            break;
    }

    // 子ぷよを描画（軸ぷよと同じ色）
    drawSinglePuyo(ctx, childX, childY, color, cellSize);
}

/**
 * 単一のぷよを描画します
 * @param {CanvasRenderingContext2D} ctx - Canvas の 2D コンテキスト
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {string} color - ぷよの色
 * @param {number} cellSize - セルのサイズ
 */
function drawSinglePuyo(ctx, x, y, color, cellSize) {
    const centerX = x * cellSize + cellSize / 2;
    const centerY = y * cellSize + cellSize / 2;
    const radius = cellSize / 2 - 2; // 少し余白を持たせる

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // ぷよの縁を描画
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
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
