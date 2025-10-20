const { series, watch: gulpWatch } = require('gulp');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function run(cmd, okMsg, failMsg) {
  try {
    const { stdout, stderr } = await execAsync(cmd, { stdio: 'inherit' });
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    console.log(okMsg);
  } catch (error) {
    console.error(failMsg);
    throw error;
  }
}

// Run ESLint
async function lint() {
  await run('npm run lint:fix', '✓ ESLint passed', '✗ ESLint failed');
}

// Run Prettier
async function format() {
  await run('npm run format', '✓ Prettier formatting completed', '✗ Prettier formatting failed');
}

// Run tests
async function testTask() {
  await run('npm run test', '✓ All tests passed', '✗ Tests failed');
}

// Run dependency cruiser
async function dependency() {
  await run('npm run dependency', '✓ Dependency check passed', '✗ Dependency check failed');
}

const checkAndFix = series(lint, format, testTask, dependency);

function watch() {
  gulpWatch(['src/**/*.ts', 'tests/**/*.ts'], checkAndFix);
}

function guard() {
  gulpWatch(['src/**/*.ts', 'tests/**/*.ts'], testTask);
}

// Register tasks with names gulp can discover
exports.lint = lint;
exports.format = format;
exports.test = testTask;
exports.dependency = dependency;
exports.checkAndFix = checkAndFix;
exports.watch = watch;
exports.guard = guard;
exports.default = checkAndFix;
