const express = require('express');
const http = require('http');
const chii = require('@mizuka-wu/chii');
const { createChiiProxy } = require('@mizuka-wu/chii/proxy');

async function bootstrap() {
  const app = express();
  const server = http.createServer(app);

  await chii.start({
    port: 9333,
    host: '127.0.0.1',
    basePath: '/',
  });

  const chiiProxy = createChiiProxy({
    target: 'http://127.0.0.1:9333',
    basePath: '/devtools/chii',
  });

  app.use(chiiProxy);
  server.on('upgrade', chiiProxy.upgrade);

  app.get('/', (req, res) => {
    res.send('<h1>Chii Express Example</h1><p>Open <a href="/devtools/chii" target="_blank">/devtools/chii</a> to access DevTools.</p>');
  });

  server.listen(3000, () => {
    console.log('Express example available at http://127.0.0.1:3000/');
  });
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
