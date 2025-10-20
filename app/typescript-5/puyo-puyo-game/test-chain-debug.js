const { PuyoColor } = require('./src/models/PuyoColor');
const { checkErasePuyo, erasePuyoFromGrid, fallPuyo } = require('./src/utils/erasePuyo');

const grid = Array(13).fill(null).map(() => Array(6).fill(PuyoColor.EMPTY));

grid[10][1] = PuyoColor.RED;
grid[10][2] = PuyoColor.RED;
grid[11][1] = PuyoColor.RED;
grid[11][2] = PuyoColor.RED;
grid[10][3] = PuyoColor.GREEN;
grid[7][2] = PuyoColor.GREEN;
grid[8][2] = PuyoColor.GREEN;
grid[9][2] = PuyoColor.GREEN;

console.log('初期配置:');
for (let y = 7; y <= 11; y++) {
  console.log(`y=${y}:`, grid[y].map(c => c === 0 ? '.' : c === 1 ? 'R' : c === 2 ? 'B' : c === 3 ? 'G' : 'Y').join(' '));
}

const eraseInfo1 = checkErasePuyo(grid);
console.log('\n1回目の消去判定:', eraseInfo1);

const erasedGrid1 = erasePuyoFromGrid(grid, eraseInfo1);
console.log('\n消去後:');
for (let y = 7; y <= 11; y++) {
  console.log(`y=${y}:`, erasedGrid1[y].map(c => c === 0 ? '.' : c === 1 ? 'R' : c === 2 ? 'B' : c === 3 ? 'G' : 'Y').join(' '));
}

const fallenGrid1 = fallPuyo(erasedGrid1);
console.log('\n落下後:');
for (let y = 7; y <= 11; y++) {
  console.log(`y=${y}:`, fallenGrid1[y].map(c => c === 0 ? '.' : c === 1 ? 'R' : c === 2 ? 'B' : c === 3 ? 'G' : 'Y').join(' '));
}

const eraseInfo2 = checkErasePuyo(fallenGrid1);
console.log('\n2回目の消去判定:', eraseInfo2);
