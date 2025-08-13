import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Importar ValidationPipe
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API Docs')
    .setDescription('Documentação da API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);


  // Habilitar CORS para permitir requisições do frontend (ajuste a origem se necessário)
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3001', 'http://localhost:3002'], // Angular e NextJS
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Habilitar ValidationPipe globalmente (se ainda não estiver)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove propriedades não definidas no DTO
    forbidNonWhitelisted: true, // Lança erro se propriedades não definidas forem enviadas
    transform: true, // Transforma o payload para instâncias do DTO
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
