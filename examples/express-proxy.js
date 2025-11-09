const express = require('express');
const http = require('http');
const { createChiiProxy } = require('../server/proxy');
const chii = require('../server');

async function main() {
  const app = express();
  const server = http.createServer(app);

  await chii.start({
    port: 9229,
    host: '127.0.0.1',
    basePath: '/',
  });

  const chiiProxy = createChiiProxy({
    target: 'http://127.0.0.1:9229',
    basePath: '/devtools/chii',
    logger: console,
  });

  app.use(chiiProxy);

  server.on('upgrade', chiiProxy.upgrade);

  app.get('/', (req, res) => {
    res.send(
      '<a href="/devtools/chii" target="_blank">Open Chii Devtools</a>'
    );
  });

  server.listen(3000, () => {
    console.log('Express listening on http://127.0.0.1:3000/');
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
