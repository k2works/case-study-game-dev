// Learning Worker Script
// TensorFlow.js学習を非同期で実行するWorkerスクリプト

// TensorFlow.jsをWorkerで利用するための設定
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');

// Workerの状態管理
let isLearning = false;
let shouldStop = false;

// メイン処理: メッセージハンドリング
self.addEventListener('message', async (event) => {
  const message = event.data;

  try {
    switch (message.type) {
      case 'start':
        if (!isLearning) {
          await handleLearningStart(message.config);
        }
        break;

      case 'stop':
        handleLearningStop();
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  } catch (error) {
    sendErrorMessage(error.message || 'Unknown error occurred');
  }
});

// 学習開始処理
async function handleLearningStart(config) {
  isLearning = true;
  shouldStop = false;

  try {
    // プログレス報告開始
    sendProgressMessage(0.1);

    // 模擬的な学習プロセス
    // 実際のTensorFlow.js学習処理はここに実装される予定
    const result = await performMockLearning(config);

    if (shouldStop) {
      sendStoppedMessage();
      return;
    }

    sendCompleteMessage(result);
  } catch (error) {
    sendErrorMessage(error.message);
  } finally {
    isLearning = false;
    shouldStop = false;
  }
}

// 学習停止処理
function handleLearningStop() {
  if (isLearning) {
    shouldStop = true;
  }
}

// 模擬学習処理（実際のTensorFlow.js実装のプレースホルダー）
async function performMockLearning(config) {
  const totalSteps = config.epochs || 10;
  
  for (let step = 1; step <= totalSteps; step++) {
    if (shouldStop) {
      break;
    }

    // 各エポックの模擬処理
    await simulateEpoch(step, totalSteps);
    
    // プログレス更新
    const progress = (step / totalSteps) * 0.9 + 0.1; // 10%から開始
    sendProgressMessage(progress);
    
    // 非同期処理を模擬
    await sleep(100);
  }

  // 最終結果生成
  return generateMockResult(config);
}

// エポック処理の模擬
async function simulateEpoch(currentEpoch, totalEpochs) {
  // 実際のTensorFlow.js訓練処理をここに実装
  // 現在は模擬的な処理
  const batchProcessingTime = 50 + Math.random() * 100;
  await sleep(batchProcessingTime);
}

// 模擬結果生成
function generateMockResult(config) {
  const baseAccuracy = 0.7 + Math.random() * 0.2; // 0.7-0.9
  const trainingAccuracy = baseAccuracy + Math.random() * 0.05;
  const validationAccuracy = baseAccuracy + Math.random() * 0.03;
  
  return {
    success: true,
    modelPath: `models/${config.modelArchitecture}_${Date.now()}.json`,
    statistics: {
      totalSamples: Math.floor(config.maxSamples * (0.8 + Math.random() * 0.2)),
      trainingAccuracy: Math.min(trainingAccuracy, 0.95),
      validationAccuracy: Math.min(validationAccuracy, 0.92),
      trainingTime: config.epochs * 200 + Math.random() * 1000,
      modelSize: Math.floor(1024 + Math.random() * 5120), // 1KB-6KB
    },
  };
}

// ユーティリティ関数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// メッセージ送信関数
function sendProgressMessage(progress) {
  self.postMessage({
    type: 'progress',
    progress: Math.min(Math.max(progress, 0), 1), // 0-1の範囲に制限
  });
}

function sendCompleteMessage(result) {
  self.postMessage({
    type: 'complete',
    result: result,
  });
}

function sendErrorMessage(errorMessage) {
  self.postMessage({
    type: 'error',
    error: errorMessage,
  });
}

function sendStoppedMessage() {
  self.postMessage({
    type: 'stopped',
  });
}

// エラーハンドリング
self.addEventListener('error', (event) => {
  sendErrorMessage(`Worker error: ${event.message}`);
});

self.addEventListener('unhandledrejection', (event) => {
  sendErrorMessage(`Unhandled promise rejection: ${event.reason}`);
  event.preventDefault();
});

// Worker初期化完了のログ
console.log('Learning Worker initialized successfully');