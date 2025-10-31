import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { fileURLToPath } from 'url';
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

  constructor(options?: { logger?: boolean }) {
    this.app = Fastify({
      logger: options?.logger ?? (process.env.NODE_ENV !== 'test'),
      ajv: {
        customOptions: {
          removeAdditional: false,
          useDefaults: false,
          coerceTypes: false,
          strict: false,
        },
      },
    });

    // サービスの初期化
    this.irisService = new IrisService();
    this.cinemaService = new CinemaService();
    this.survivedService = new SurvivedService();
    this.bostonService = new BostonService();

    // CORS の設定
    this.app.register(cors, {
      origin: true, // 全てのオリジンを許可（本番環境では制限すること）
    });

    // Swagger の設定
    this.app.register(swagger, {
      openapi: {
        info: {
          title: 'ML Prediction API',
          description: 'Machine Learning prediction API with 4 models',
          version: '1.0.0',
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Development server',
          },
        ],
        tags: [
          { name: 'Health', description: 'Health check endpoints' },
          { name: 'Iris', description: 'Iris species classification' },
          { name: 'Cinema', description: 'Movie sales prediction' },
          { name: 'Survived', description: 'Survival prediction' },
          { name: 'Boston', description: 'Housing price prediction' },
        ],
      },
    });

    // Swagger UI の設定
    this.app.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
    });

    // エラーハンドラーの設定
    this.app.setErrorHandler((error, _request, reply) => {
      // Fastify のバリデーションエラー
      if (error.validation) {
        reply.status(400).send({
          error: 'Validation Error',
          details: error.validation.map((err: any) => ({
            path: err.instancePath || err.dataPath || '',
            message: err.message || '',
          })),
        });
      }
      // ZodError の場合
      else if (error.name === 'ZodError' && 'issues' in error) {
        const zodError = error as unknown as ZodError;
        reply.status(400).send({
          error: 'Validation Error',
          details: zodError.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }
      // その他のエラー
      else {
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
    this.app.get(
      '/health',
      {
        schema: {
          tags: ['Health'],
          description: 'Health check endpoint',
          response: {
            200: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      async (_request, reply) => {
        reply.send({ status: 'ok', timestamp: new Date().toISOString() });
      }
    );

    // Iris 分類
    this.app.post(
      '/api/iris/predict',
      {
        schema: {
          tags: ['Iris'],
          description: 'Predict Iris species based on flower measurements',
          body: {
            type: 'object',
            required: ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'],
            properties: {
              sepal_length: {
                type: 'number',
                description: 'Sepal length in cm',
              },
              sepal_width: {
                type: 'number',
                description: 'Sepal width in cm',
              },
              petal_length: {
                type: 'number',
                description: 'Petal length in cm',
              },
              petal_width: {
                type: 'number',
                description: 'Petal width in cm',
              },
            },
          },
          response: {
            200: {
              type: 'object',
              properties: {
                species: {
                  type: 'string',
                  enum: ['setosa', 'versicolor', 'virginica'],
                  description: 'Predicted Iris species',
                },
              },
            },
          },
        },
      },
      async (request: FastifyRequest<{ Body: IrisRequest }>, reply: FastifyReply) => {
        const validated = IrisRequestSchema.parse(request.body);
        const result = this.irisService.predict(validated);
        reply.send(result);
      }
    );

    // Cinema 売上予測
    this.app.post(
      '/api/cinema/predict',
      {
        schema: {
          tags: ['Cinema'],
          description: 'Predict movie sales based on marketing data',
          body: {
            type: 'object',
            required: ['sns1', 'sns2', 'actor', 'original'],
            properties: {
              sns1: {
                type: 'integer',
                description: 'SNS platform 1 mentions',
              },
              sns2: {
                type: 'integer',
                description: 'SNS platform 2 mentions',
              },
              actor: {
                type: 'integer',
                description: 'Lead actor popularity score (0-100)',
                minimum: 0,
                maximum: 100,
              },
              original: {
                type: 'integer',
                description: 'Is original work (0: sequel, 1: original)',
                enum: [0, 1],
              },
            },
          },
          response: {
            200: {
              type: 'object',
              properties: {
                predicted_sales: {
                  type: 'number',
                  description: 'Predicted sales in 10,000 yen',
                },
              },
            },
          },
        },
      },
      async (request: FastifyRequest<{ Body: CinemaRequest }>, reply: FastifyReply) => {
        const validated = CinemaRequestSchema.parse(request.body);
        const result = this.cinemaService.predict(validated);
        reply.send(result);
      }
    );

    // Survived 生存予測
    this.app.post(
      '/api/survived/predict',
      {
        schema: {
          tags: ['Survived'],
          description: 'Predict survival based on passenger information',
          body: {
            type: 'object',
            required: ['pclass', 'age', 'sex'],
            properties: {
              pclass: {
                type: 'integer',
                description: 'Passenger class (1: upper, 2: middle, 3: lower)',
                enum: [1, 2, 3],
              },
              age: {
                type: 'integer',
                description: 'Age in years',
                minimum: 0,
                maximum: 100,
              },
              sex: {
                type: 'string',
                description: 'Gender',
                enum: ['male', 'female'],
              },
            },
          },
          response: {
            200: {
              type: 'object',
              properties: {
                survived: {
                  type: 'integer',
                  description: 'Survival prediction (0: died, 1: survived)',
                  enum: [0, 1],
                },
              },
            },
          },
        },
      },
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
      {
        schema: {
          tags: ['Boston'],
          description: 'Predict housing price based on property features',
          body: {
            type: 'object',
            required: ['rm', 'lstat', 'ptratio'],
            properties: {
              rm: {
                type: 'number',
                description: 'Average number of rooms per dwelling',
              },
              lstat: {
                type: 'number',
                description: 'Percentage of lower status population',
                minimum: 0,
                maximum: 100,
              },
              ptratio: {
                type: 'number',
                description: 'Pupil-teacher ratio',
              },
            },
          },
          response: {
            200: {
              type: 'object',
              properties: {
                predicted_price: {
                  type: 'number',
                  description: 'Predicted price in $1000 units',
                },
              },
            },
          },
        },
      },
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
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
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
