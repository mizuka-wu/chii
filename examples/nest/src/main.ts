import 'reflect-metadata';
import { Module, Controller, Get } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createServer } from 'http';

const chii = require('@mizuka-wu/chii');
const { createChiiProxy } = require('@mizuka-wu/chii/proxy');

@Controller()
class AppController {
  @Get()
  index() {
    return '<h1>Chii Nest Example</h1><p>Open <a href="/devtools/chii" target="_blank">/devtools/chii</a> to access DevTools.</p>';
  }
}

@Module({
  controllers: [AppController],
})
class AppModule {}

async function bootstrap() {
  const chiiPort = 9444;
  await chii.start({
    port: chiiPort,
    host: '127.0.0.1',
    basePath: '/',
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const chiiProxy = createChiiProxy({
    target: `http://127.0.0.1:${chiiPort}`,
    basePath: '/devtools/chii',
  });

  const instance = app.getHttpAdapter().getInstance();
  instance.use(chiiProxy);

  await app.init();

  const server = createServer(instance);
  server.on('request', instance);
  server.on('upgrade', chiiProxy.upgrade);

  server.listen(3000, () => {
    console.log('Nest example available at http://127.0.0.1:3000/');
  });
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
