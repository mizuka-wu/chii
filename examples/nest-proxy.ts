import { Module, Controller, Get } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createServer } from 'http';

// @ts-nocheck
const chii = require('../server');
const { createChiiProxy } = require('../server/proxy');

@Controller()
class AppController {
  @Get()
  index() {
    return '<a href="/devtools/chii" target="_blank">Open Chii Devtools</a>';
  }
}

@Module({
  controllers: [AppController],
})
class AppModule {}

async function bootstrap() {
  const chiiPort = 9330;
  await chii.start({
    port: chiiPort,
    host: '127.0.0.1',
    basePath: '/',
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const chiiProxy = createChiiProxy({
    target: `http://127.0.0.1:${chiiPort}`,
    basePath: '/devtools/chii',
    logger: console,
  });

  app.use(chiiProxy);

  await app.init();

  const server = createServer(app.getHttpAdapter().getInstance());
  server.on('request', app.getHttpAdapter().getRequestHandler());
  server.on('upgrade', chiiProxy.upgrade);

  server.listen(3000, () => {
    console.log('Nest application listening at http://127.0.0.1:3000/');
  });
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
