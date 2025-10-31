import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import { IrisService, CinemaService, SurvivedService, BostonService } from './services';
import {
  IrisRequestSchema,
  CinemaRequestSchema,
  SurvivedRequestSchema,
  BostonRequestSchema,
  type IrisRequest,
  type CinemaRequest,
  type SurvivedRequest,
  type BostonRequest,
} from './schemas';
import { ZodError } from 'zod';

/**
 * ML 予測 API サーバー
 */
export class MLApiServer {
  private app: FastifyInstance;
  private irisService: IrisService;
  private cinemaService: CinemaService;
  private survivedService: SurvivedService;
  private bostonService: BostonService;

  constructor() {
    this.app = Fastify({ logger: true });

    // サービスの初期化
    this.irisService = new IrisService();
    this.cinemaService = new CinemaService();
    this.survivedService = new SurvivedService();
    this.bostonService = new BostonService();

    // CORS の設定
    this.app.register(cors, {
      origin: true, // 全てのオリジンを許可（本番環境では制限すること）
    });

    // エラーハンドラーの設定
    this.app.setErrorHandler((error, _request, reply) => {
      // ZodError の場合
      if (error.name === 'ZodError' && 'issues' in error) {
        const zodError = error as unknown as ZodError;
        reply.status(400).send({
          error: 'Validation Error',
          details: zodError.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
      } else {
        // その他のエラー
        reply.status(500).send({
          error: 'Internal Server Error',
          message: error.message,
        });
      }
    });

    // ルートの設定
    this.setupRoutes();
  }

  /**
   * サービスを初期化（モデルを読み込み）
   */
  async initialize(): Promise<void> {
    await Promise.all([
      this.irisService.initialize(),
      this.cinemaService.initialize(),
      this.survivedService.initialize(),
      this.bostonService.initialize(),
    ]);
  }

  /**
   * API ルートを設定
   */
  private setupRoutes(): void {
    // ヘルスチェック
    this.app.get('/health', async (_request, reply) => {
      reply.send({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Iris 分類
    this.app.post(
      '/api/iris/predict',
      async (request: FastifyRequest<{ Body: IrisRequest }>, reply: FastifyReply) => {
        const validated = IrisRequestSchema.parse(request.body);
        const result = this.irisService.predict(validated);
        reply.send(result);
      }
    );

    // Cinema 売上予測
    this.app.post(
      '/api/cinema/predict',
      async (request: FastifyRequest<{ Body: CinemaRequest }>, reply: FastifyReply) => {
        const validated = CinemaRequestSchema.parse(request.body);
        const result = this.cinemaService.predict(validated);
        reply.send(result);
      }
    );

    // Survived 生存予測
    this.app.post(
      '/api/survived/predict',
      async (
        request: FastifyRequest<{ Body: SurvivedRequest }>,
        reply: FastifyReply
      ) => {
        const validated = SurvivedRequestSchema.parse(request.body);
        const result = this.survivedService.predict(validated);
        reply.send(result);
      }
    );

    // Boston 住宅価格予測
    this.app.post(
      '/api/boston/predict',
      async (request: FastifyRequest<{ Body: BostonRequest }>, reply: FastifyReply) => {
        const validated = BostonRequestSchema.parse(request.body);
        const result = this.bostonService.predict(validated);
        reply.send(result);
      }
    );
  }

  /**
   * サーバーを起動
   */
  async start(port: number = 3000, host: string = '0.0.0.0'): Promise<void> {
    try {
      await this.initialize();
      await this.app.listen({ port, host });
      console.log(`Server listening on http://${host}:${port}`);
    } catch (error) {
      console.error('Failed to start server:', error);
      throw error;
    }
  }

  /**
   * サーバーを停止
   */
  async stop(): Promise<void> {
    await this.app.close();
  }

  /**
   * Fastify インスタンスを取得（テスト用）
   */
  getApp(): FastifyInstance {
    return this.app;
  }
}

// スクリプトとして実行された場合にサーバーを起動
if (require.main === module) {
  const server = new MLApiServer();
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  server.start(port).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // グレースフルシャットダウン
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await server.stop();
    process.exit(0);
  });
}
