import { createSwaggerSpec } from 'next-swagger-doc';

const spec = createSwaggerSpec({
  apiFolder: 'app/api',
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Broker Data Dashboard API',
      version: '1.0.0',
      description:
        'API for aggregating and standardizing broker policy data from multiple sources',
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://deno-eater.vercel.app'
            : 'http://localhost:3000',
        description:
          process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
      },
    ],
  },
});

export async function GET() {
  return Response.json(spec);
}
