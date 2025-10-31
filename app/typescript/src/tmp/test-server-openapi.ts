import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const app = Fastify({ logger: true });

// OpenAPI 3.x 形式で Swagger 登録
await app.register(swagger, {
  openapi: {
    info: {
      title: 'Test API (OpenAPI)',
      description: 'Testing Swagger UI with OpenAPI 3.x',
      version: '1.0.0',
    },
  },
});

// Swagger UI 登録
await app.register(swaggerUi, {
  routePrefix: '/documentation',
});

// テストルート
app.get(
  '/test',
  {
    schema: {
      description: 'Test endpoint',
      tags: ['test'],
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  },
  async () => {
    return { message: 'Hello World' };
  }
);

app.post(
  '/echo',
  {
    schema: {
      description: 'Echo endpoint',
      tags: ['test'],
      body: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            echo: { type: 'string' },
          },
        },
      },
    },
  },
  async (request) => {
    const { message } = request.body as { message: string };
    return { echo: message };
  }
);

await app.listen({ port: 3002, host: '0.0.0.0' });
console.log('Test server (OpenAPI) running on http://localhost:3002');
console.log('Swagger UI: http://localhost:3002/documentation');
