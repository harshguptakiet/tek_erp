import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import helmet from 'helmet';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled in dev for Swagger UI asset loading
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      transform: true, // Transform payloads to DTO instances
      forbidNonWhitelisted: true, // Throw error if non-whitelisted values are provided
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit type conversion
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or local dev origins
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, origin);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'x-tenant-id', 'x-organization-id'],
    exposedHeaders: ['Set-Cookie', 'Authorization'],
  });

  // API versioning
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  // OpenAPI / Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Tekurious ERP API')
    .setDescription(
      'Complete REST API documentation for Tekurious ERP Educational Management Platform.\n\n' +
        '### Postman Import Options:\n' +
        '- **URL Import**: `http://localhost:3000/openapi.json` or `http://localhost:3000/api/docs-json`\n' +
        '- **File Import**: `openapi.json` generated in project root directory\n\n' +
        '### Authentication:\n' +
        'Click the **Authorize** button below and enter `Bearer <your_jwt_access_token>`.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Local Server (default)')
    .addServer(`http://localhost:${process.env.PORT || 3000}/${globalPrefix}`, 'API v1 Base URL')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Serve Swagger UI
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
    customSiteTitle: 'Tekurious ERP API Documentation',
  });
  SwaggerModule.setup('api/docs', app, document);

  // Express raw endpoints for direct Postman OpenAPI URL import
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/openapi.json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });
  httpAdapter.get('/api/docs-json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });
  httpAdapter.get('/api/v1/openapi.json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  // Write openapi.json file to disk for offline Postman import
  try {
    const outputPath = path.resolve(process.cwd(), 'openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf8');
    Logger.log(`📄 OpenAPI specification exported to: ${outputPath}`);
  } catch (err: any) {
    Logger.warn(`Failed to export openapi.json: ${err.message}`);
  }

  // Start the application
  const port = process.env.PORT || 3333;
  await app.listen(port);

  Logger.log(`🚀 Tekurious ERP is running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 Swagger UI: http://localhost:${port}/docs`);
  Logger.log(`📮 Postman OpenAPI Spec URL: http://localhost:${port}/openapi.json`);
  Logger.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  Logger.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  Logger.log(`🛡️  Security: Helmet enabled, Rate limiting active`);
}

bootstrap();
