/**
 * AI処理用Web Worker
 * メインスレッドをブロックせずにAI計算を実行
 */

// TensorFlow.jsの読み込み（CDN経由）
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');

class AIWorker {
  constructor() {
    this.model = null;
    this.modelReady = false;
    this.initializeModel();
  }

  /**
   * TensorFlow.jsモデルの初期化
   */
  async initializeModel() {
    try {
      // シンプルなニューラルネットワークモデルを作成
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({
            inputShape: [42], // 6x7フィールド入力
            units: 64,
            activation: 'relu',
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 32,
            activation: 'relu',
          }),
          tf.layers.dense({
            units: 1, // スコア出力
            activation: 'linear',
          }),
        ],
      });

      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae'],
      });

      this.modelReady = true;
      console.log('AI Worker: ML model initialized successfully');
      
      // メインスレッドに準備完了を通知
      self.postMessage({
        type: 'MODEL_READY',
        payload: { ready: true }
      });
    } catch (error) {
      console.warn('AI Worker: Failed to initialize ML model:', error);
      this.modelReady = false;
      
      self.postMessage({
        type: 'MODEL_ERROR',
        payload: { error: error.message }
      });
    }
  }

  /**
   * ゲーム状態をテンソル入力に変換
   */
  gameStateToTensor(gameState) {
    const fieldData = [];
    
    for (let y = 0; y < gameState.field.height; y++) {
      for (let x = 0; x < gameState.field.width; x++) {
        const cell = gameState.field.cells[x]?.[y];
        if (cell === null) {
          fieldData.push(0); // 空のセル
        } else {
          // 色を数値に変換
          switch (cell) {
            case 'red':
              fieldData.push(1);
              break;
            case 'blue':
              fieldData.push(2);
              break;
            case 'green':
              fieldData.push(3);
              break;
            case 'yellow':
              fieldData.push(4);
              break;
            default:
              fieldData.push(0);
          }
        }
      }
    }

    // 42要素（6x7）に調整
    while (fieldData.length < 42) {
      fieldData.push(0);
    }
    fieldData.splice(42);

    return tf.tensor2d([fieldData], [1, 42]);
  }

  /**
   * MLモデルを使用した手の評価
   */
  async evaluateWithML(move, gameState) {
    if (!this.modelReady || !this.model) {
      return this.fallbackEvaluation(move, gameState);
    }

    try {
      const inputTensor = this.gameStateToTensor(gameState);
      const prediction = this.model.predict(inputTensor);
      const score = await prediction.data();

      // テンソルのクリーンアップ
      inputTensor.dispose();
      prediction.dispose();

      return score[0] + this.fallbackEvaluation(move, gameState) * 0.3;
    } catch (error) {
      console.warn('AI Worker: ML evaluation failed, using fallback:', error);
      return this.fallbackEvaluation(move, gameState);
    }
  }

  /**
   * フォールバック評価（従来の手法）
   */
  fallbackEvaluation(move, gameState) {
    if (!move.isValid) {
      return -1000;
    }

    const field = gameState.field;
    
    // 高さベースの評価（下の位置ほど高スコア）
    const avgY = (move.primaryPosition.y + move.secondaryPosition.y) / 2;
    const heightScore = avgY * 10;

    // 中央付近を優遇
    const centerX = (field.width - 1) / 2;
    const avgX = (move.primaryPosition.x + move.secondaryPosition.x) / 2;
    const distanceFromCenter = Math.abs(centerX - avgX);
    const centerScore = (field.width - distanceFromCenter) * 5;

    return heightScore + centerScore;
  }

  /**
   * 評価詳細の作成
   */
  createEvaluation(move, gameState, mlScore) {
    if (!move.isValid) {
      return {
        heightScore: -1000,
        centerScore: 0,
        modeScore: 0,
        totalScore: -1000,
        averageY: -1,
        averageX: -1,
        distanceFromCenter: 0,
        reason: '無効な手',
      };
    }

    const field = gameState.field;
    const avgY = (move.primaryPosition.y + move.secondaryPosition.y) / 2;
    const avgX = (move.primaryPosition.x + move.secondaryPosition.x) / 2;
    const centerX = (field.width - 1) / 2;
    const distanceFromCenter = Math.abs(centerX - avgX);
    
    const heightScore = avgY * 10;
    const centerScore = (field.width - distanceFromCenter) * 5;
    const modeScore = this.modelReady ? mlScore * 20 : 0; // ML補正
    
    const totalScore = heightScore + centerScore + modeScore;
    
    const reason = this.modelReady 
      ? `位置(${move.x}, ${Math.round(avgY)}), ML-Worker判定, スコア: ${Math.round(totalScore)}`
      : `位置(${move.x}, ${Math.round(avgY)}), Worker従来判定, スコア: ${Math.round(totalScore)}`;

    return {
      heightScore,
      centerScore,
      modeScore,
      totalScore,
      averageY: avgY,
      averageX: avgX,
      distanceFromCenter,
      reason,
    };
  }

  /**
   * AI手評価の実行
   */
  async evaluateMove(data) {
    const { move, gameState, requestId } = data;
    
    try {
      const mlScore = await this.evaluateWithML(move, gameState);
      const evaluation = this.createEvaluation(move, gameState, mlScore);
      
      // 結果をメインスレッドに送信
      self.postMessage({
        type: 'MOVE_EVALUATED',
        payload: {
          requestId,
          move,
          evaluation,
          score: evaluation.totalScore
        }
      });
    } catch (error) {
      self.postMessage({
        type: 'EVALUATION_ERROR',
        payload: {
          requestId,
          error: error.message
        }
      });
    }
  }
}

// Worker インスタンスを作成
const aiWorker = new AIWorker();

// メインスレッドからのメッセージを処理
self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'EVALUATE_MOVE':
      await aiWorker.evaluateMove(payload);
      break;
      
    case 'CHECK_MODEL_STATUS':
      self.postMessage({
        type: 'MODEL_STATUS',
        payload: { ready: aiWorker.modelReady }
      });
      break;
      
    default:
      console.warn('AI Worker: Unknown message type:', type);
  }
});