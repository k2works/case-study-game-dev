import { series, watch as gulpWatch } from 'gulp';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Run ESLint
export async function lint() {
  try {
    await execAsync('npm run lint:fix');
    console.log('✓ ESLint passed');
  } catch (error) {
    console.error('✗ ESLint failed');
    throw error;
  }
}

// Run Prettier
export async function format() {
  try {
    await execAsync('npm run format');
    console.log('✓ Prettier formatting completed');
  } catch (error) {
    console.error('✗ Prettier formatting failed');
    throw error;
  }
}

// Run tests
export async function test() {
  try {
    await execAsync('npm run test');
    console.log('✓ All tests passed');
  } catch (error) {
    console.error('✗ Tests failed');
    throw error;
  }
}

// Check and fix (lint + format + test)
export const checkAndFix = series(lint, format, test);

// Watch mode
export function watchMode() {
  gulpWatch(['src/**/*.ts', 'tests/**/*.ts'], checkAndFix);
}

// Guard mode (continuous testing)
export function guard() {
  gulpWatch(['src/**/*.ts', 'tests/**/*.ts'], test);
}

// Default task
export default checkAndFix;
