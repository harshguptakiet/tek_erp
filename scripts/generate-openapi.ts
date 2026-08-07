import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../apps/tekurious_erp/src/app/app.module';
import * as fs from 'fs';
import * as path from 'path';

async function generateOpenApiSpec() {
  console.log('🔄 Initializing NestJS application context for OpenAPI spec generation...');

  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Tekurious ERP API')
    .setDescription(
      'Complete REST API specification for Tekurious ERP Educational Management Platform.\n\n' +
        'Import this specification into Postman via:\n' +
        '1. File -> Import -> select `openapi.json`\n' +
        '2. Link -> `http://localhost:3000/openapi.json` (when running app)'
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
    .addServer('http://localhost:3000', 'Local Development Server')
    .addServer('http://localhost:3000/api/v1', 'API v1 Base Endpoint')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outputPath = path.resolve(process.cwd(), 'openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf8');

  console.log(`✅ OpenAPI 3.0 specification successfully generated and saved to:\n   ${outputPath}`);

  try {
    await app.close();
  } catch (e) {
    // Ignore cleanup errors during standalone spec extraction
  }
  process.exit(0);
}

generateOpenApiSpec().catch((err) => {
  console.error('❌ Failed to generate OpenAPI spec:', err);
  process.exit(1);
});
