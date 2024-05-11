import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const port = 5000
  const app = await NestFactory.create(AppModule);
  const swaggerConfig = new DocumentBuilder()
  .setTitle("Thriller's Travel Task Documentation")
  .setDescription("API documentation for flights microservice")
  .setVersion("1.0")
  .addTag("Thriller")
  .addBearerAuth()
  .build()

  const doc = SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup("/apidocs", app, doc)
  await app.listen(port)
  console.log(`app listening on port ${port}`)
  
}
bootstrap();
