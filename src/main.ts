import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  // Especificar o tipo da aplicação como NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Configuração de variáveis de ambiente
  const frontendUrl =
    configService.get<string>("FRONTEND_URL") || "http://localhost:3001";
  const nodeEnv = configService.get<string>("NODE_ENV") || "development";
  const port = configService.get<number>("PORT", 3000);

  // Configuração de CORS
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // Usar helmet - não será um erro com a configuração de ESLint atualizada
  app.use(helmet());

  // Usar cookie-parser
  app.use(cookieParser());

  // Configuração de validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não decoradas dos objetos
      forbidNonWhitelisted: true, // Rejeita requisições que contenham propriedades não decoradas
      transform: true, // Transforma automaticamente dados para o tipo esperado
      transformOptions: {
        enableImplicitConversion: false, // Desativa conversões implícitas
      },
      validateCustomDecorators: true,
    }),
  );

  // Configuração do Swagger
  if (nodeEnv !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Signature API")
      .setDescription("API de gerenciamento de assinaturas")
      .setVersion("1.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
  }

  // Inicia o servidor
  await app.listen(port);

  logger.log(`Aplicação rodando na porta ${port} em ambiente ${nodeEnv}`);
  logger.log(`Swagger disponível em: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  const logger = new Logger("Bootstrap");
  logger.error(
    `Erro ao iniciar a aplicação: ${error instanceof Error ? error.message : String(error)}`,
  );
});
