class PuyoGame {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.BOARD_WIDTH = 6;
        this.BOARD_HEIGHT = 12;
        this.CELL_SIZE = 50;
        
        this.board = [];
        this.currentPuyo = null;
        this.nextPuyo = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gameOver = false;
        
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple'];
        
        this.initBoard();
        this.bindEvents();
        this.generateNextPuyo();
        this.generateNewPuyo();
    }
    
    initBoard() {
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('restart-button').addEventListener('click', () => this.restartGame());
        document.getElementById('play-again').addEventListener('click', () => this.restartGame());
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gameLoop();
        }
    }
    
    restartGame() {
        this.initBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gameOver = false;
        this.updateDisplay();
        this.generateNextPuyo();
        this.generateNewPuyo();
        this.draw();
        document.getElementById('game-over').classList.add('hidden');
    }
    
    generateNextPuyo() {
        this.nextPuyo = {
            colors: [
                this.colors[Math.floor(Math.random() * this.colors.length)],
                this.colors[Math.floor(Math.random() * this.colors.length)]
            ]
        };
        this.drawNext();
    }
    
    generateNewPuyo() {
        if (this.nextPuyo) {
            this.currentPuyo = {
                x: Math.floor(this.BOARD_WIDTH / 2) - 1,
                y: 0,
                colors: this.nextPuyo.colors,
                orientation: 0 // 0: 縦, 1: 横右, 2: 縦逆, 3: 横左
            };
            this.generateNextPuyo();
            
            // ゲームオーバーチェック
            if (this.board[0][this.currentPuyo.x] !== 0 || this.board[0][this.currentPuyo.x + 1] !== 0) {
                this.endGame();
                return false;
            }
        }
        return true;
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.gameOver) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                this.movePuyo(-1, 0);
                break;
            case 'ArrowRight':
                this.movePuyo(1, 0);
                break;
            case 'ArrowDown':
                this.movePuyo(0, 1);
                break;
            case 'ArrowUp':
                this.rotatePuyo();
                break;
            case ' ':
                this.gameRunning = !this.gameRunning;
                if (this.gameRunning) this.gameLoop();
                break;
        }
        e.preventDefault();
    }
    
    movePuyo(dx, dy) {
        if (!this.currentPuyo) return;
        
        const newX = this.currentPuyo.x + dx;
        const newY = this.currentPuyo.y + dy;
        
        if (this.isValidPosition(newX, newY, this.currentPuyo.orientation)) {
            this.currentPuyo.x = newX;
            this.currentPuyo.y = newY;
            this.draw();
        } else if (dy > 0) {
            // 下に移動できない場合、ぷよを固定
            this.placePuyo();
        }
    }
    
    rotatePuyo() {
        if (!this.currentPuyo) return;
        
        const newOrientation = (this.currentPuyo.orientation + 1) % 4;
        if (this.isValidPosition(this.currentPuyo.x, this.currentPuyo.y, newOrientation)) {
            this.currentPuyo.orientation = newOrientation;
            this.draw();
        }
    }
    
    isValidPosition(x, y, orientation) {
        const positions = this.getPuyoPositions(x, y, orientation);
        
        for (let pos of positions) {
            if (pos.x < 0 || pos.x >= this.BOARD_WIDTH || 
                pos.y < 0 || pos.y >= this.BOARD_HEIGHT ||
                this.board[pos.y][pos.x] !== 0) {
                return false;
            }
        }
        return true;
    }
    
    getPuyoPositions(x, y, orientation) {
        const positions = [{x, y}];
        
        switch(orientation) {
            case 0: // 縦
                positions.push({x, y: y + 1});
                break;
            case 1: // 横右
                positions.push({x: x + 1, y});
                break;
            case 2: // 縦逆
                positions.push({x, y: y - 1});
                break;
            case 3: // 横左
                positions.push({x: x - 1, y});
                break;
        }
        
        return positions;
    }
    
    placePuyo() {
        if (!this.currentPuyo) return;
        
        const positions = this.getPuyoPositions(
            this.currentPuyo.x, 
            this.currentPuyo.y, 
            this.currentPuyo.orientation
        );
        
        // ぷよを盤面に配置
        positions.forEach((pos, index) => {
            this.board[pos.y][pos.x] = this.getColorIndex(this.currentPuyo.colors[index]);
        });
        
        // 連鎖チェック
        this.checkChains();
        
        // 新しいぷよ生成
        this.generateNewPuyo();
    }
    
    getColorIndex(color) {
        return this.colors.indexOf(color) + 1;
    }
    
    getColorFromIndex(index) {
        return index === 0 ? null : this.colors[index - 1];
    }
    
    checkChains() {
        let chainCount = 0;
        let totalRemoved = 0;
        
        while (true) {
            const removed = this.removeConnectedPuyos();
            if (removed === 0) break;
            
            chainCount++;
            totalRemoved += removed;
            this.dropPuyos();
            this.draw();
            
            // チェイン演出のための小さな遅延
            // 実際のゲームではアニメーションを入れる
        }
        
        if (chainCount > 0) {
            this.addScore(totalRemoved, chainCount);
        }
    }
    
    removeConnectedPuyos() {
        const visited = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(false));
        let removed = 0;
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (!visited[y][x] && this.board[y][x] !== 0) {
                    const connected = this.findConnected(x, y, this.board[y][x], visited);
                    if (connected.length >= 4) {
                        connected.forEach(pos => {
                            this.board[pos.y][pos.x] = 0;
                        });
                        removed += connected.length;
                    }
                }
            }
        }
        
        return removed;
    }
    
    findConnected(x, y, color, visited) {
        if (x < 0 || x >= this.BOARD_WIDTH || y < 0 || y >= this.BOARD_HEIGHT ||
            visited[y][x] || this.board[y][x] !== color) {
            return [];
        }
        
        visited[y][x] = true;
        let connected = [{x, y}];
        
        // 4方向をチェック
        const directions = [{x: 0, y: 1}, {x: 1, y: 0}, {x: 0, y: -1}, {x: -1, y: 0}];
        directions.forEach(dir => {
            connected = connected.concat(this.findConnected(x + dir.x, y + dir.y, color, visited));
        });
        
        return connected;
    }
    
    dropPuyos() {
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            let writePos = this.BOARD_HEIGHT - 1;
            for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
                if (this.board[y][x] !== 0) {
                    this.board[writePos][x] = this.board[y][x];
                    if (writePos !== y) {
                        this.board[y][x] = 0;
                    }
                    writePos--;
                }
            }
        }
    }
    
    addScore(puyosRemoved, chainCount) {
        const baseScore = puyosRemoved * 10;
        const chainBonus = chainCount > 1 ? (chainCount - 1) * 50 : 0;
        const levelBonus = this.level * 5;
        
        this.score += baseScore + chainBonus + levelBonus;
        this.lines += Math.floor(puyosRemoved / 4);
        
        // レベルアップ
        if (this.lines >= this.level * 10) {
            this.level++;
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gameOver) return;
        
        this.movePuyo(0, 1);
        this.draw();
        
        // レベルに応じて落下速度を調整
        const dropSpeed = Math.max(100, 1000 - (this.level - 1) * 100);
        setTimeout(() => this.gameLoop(), dropSpeed);
    }
    
    endGame() {
        this.gameOver = true;
        this.gameRunning = false;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    draw() {
        // メインボードをクリア
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 盤面のぷよを描画
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x] !== 0) {
                    this.drawPuyo(x, y, this.getColorFromIndex(this.board[y][x]), this.ctx);
                }
            }
        }
        
        // 現在のぷよを描画
        if (this.currentPuyo) {
            const positions = this.getPuyoPositions(
                this.currentPuyo.x, 
                this.currentPuyo.y, 
                this.currentPuyo.orientation
            );
            
            positions.forEach((pos, index) => {
                if (pos.y >= 0) {
                    this.drawPuyo(pos.x, pos.y, this.currentPuyo.colors[index], this.ctx);
                }
            });
        }
        
        // グリッドを描画
        this.drawGrid();
    }
    
    drawPuyo(x, y, color, ctx) {
        const pixelX = x * this.CELL_SIZE;
        const pixelY = y * this.CELL_SIZE;
        
        // ぷよの色を設定
        const colorMap = {
            'red': '#ff4757',
            'blue': '#3742fa',
            'green': '#2ed573',
            'yellow': '#ffa502',
            'purple': '#a55eea'
        };
        
        ctx.fillStyle = colorMap[color];
        ctx.fillRect(pixelX + 2, pixelY + 2, this.CELL_SIZE - 4, this.CELL_SIZE - 4);
        
        // ハイライト効果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(pixelX + 5, pixelY + 5, this.CELL_SIZE - 20, this.CELL_SIZE - 20);
        
        // 境界線
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(pixelX + 2, pixelY + 2, this.CELL_SIZE - 4, this.CELL_SIZE - 4);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.CELL_SIZE, 0);
            this.ctx.lineTo(x * this.CELL_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.CELL_SIZE);
            this.ctx.lineTo(this.canvas.width, y * this.CELL_SIZE);
            this.ctx.stroke();
        }
    }
    
    drawNext() {
        if (!this.nextPuyo) return;
        
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const centerX = this.nextCanvas.width / 2;
        const centerY = this.nextCanvas.height / 2;
        const puyoSize = 30;
        
        // 縦に2つのぷよを表示
        this.drawNextPuyo(centerX - puyoSize/2, centerY - puyoSize, this.nextPuyo.colors[0], puyoSize);
        this.drawNextPuyo(centerX - puyoSize/2, centerY, this.nextPuyo.colors[1], puyoSize);
    }
    
    drawNextPuyo(x, y, color, size) {
        const colorMap = {
            'red': '#ff4757',
            'blue': '#3742fa',
            'green': '#2ed573',
            'yellow': '#ffa502',
            'purple': '#a55eea'
        };
        
        this.nextCtx.fillStyle = colorMap[color];
        this.nextCtx.fillRect(x, y, size, size);
        
        // ハイライト効果
        this.nextCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.nextCtx.fillRect(x + 3, y + 3, size - 12, size - 12);
        
        // 境界線
        this.nextCtx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.nextCtx.lineWidth = 1;
        this.nextCtx.strokeRect(x, y, size, size);
    }
}

// ゲーム開始
window.addEventListener('load', () => {
    const game = new PuyoGame();
    game.draw();
});