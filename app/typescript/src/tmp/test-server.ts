import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const app = Fastify({ logger: true });

// Swagger 登録
await app.register(swagger, {
  swagger: {
    info: {
      title: 'Test API',
      description: 'Testing Swagger UI',
      version: '1.0.0',
    },
    host: 'localhost:3001',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
});

// Swagger UI 登録
await app.register(swaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header: string) => header,
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

await app.listen({ port: 3001, host: '0.0.0.0' });
console.log('Test server running on http://localhost:3001');
console.log('Swagger UI: http://localhost:3001/documentation');
