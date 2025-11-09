const router = require('./middle/router');
const compress = require('./middle/compress');
const WebSocketServer = require('./lib/WebSocketServer');

function normalizeBasePath(basePath = '/') {
  let ret = basePath || '/';
  if (!ret.startsWith('/')) {
    ret = '/' + ret;
  }
  if (!ret.endsWith('/')) {
    ret += '/';
  }
  return ret;
}

function inferDomain(app, explicitDomain) {
  if (explicitDomain) {
    return explicitDomain;
  }

  const listen = (app.config && app.config.cluster && app.config.cluster.listen) || {};
  const hostname = listen.hostname || listen.host || '127.0.0.1';
  const port = listen.port || process.env.EGG_SERVER_PORT || 7001;

  return `${hostname}:${port}`;
}

module.exports = function registerChii(app, options = {}) {
  if (!app || typeof app.use !== 'function') {
    throw new Error('[chii] egg application instance is required');
  }

  const {
    basePath = '/',
    domain,
    cdn,
    compress: enableCompress,
    logger = (app.logger && app.logger.info ? app.logger : console),
  } = options;

  const normalizedBasePath = normalizeBasePath(basePath);
  const resolvedDomain = inferDomain(app, domain);

  const wss = new WebSocketServer();
  const routerMiddleware = router(wss.channelManager, resolvedDomain, cdn, normalizedBasePath);
  const compressMiddleware = enableCompress === false ? null : compress();

  const baseWithoutTrailingSlash = normalizedBasePath.slice(0, -1);

  const chiiMiddleware = async (ctx, next) => {
    const matchBasePath = ctx.path.startsWith(normalizedBasePath);
    const matchBaseIndex = ctx.path === baseWithoutTrailingSlash;

    if (!matchBasePath && !matchBaseIndex) {
      return next();
    }

    if (matchBaseIndex) {
      ctx.path = normalizedBasePath;
      ctx.url = normalizedBasePath + ctx.search;
    }

    if (compressMiddleware) {
      await compressMiddleware(ctx, () => routerMiddleware(ctx, next));
    } else {
      await routerMiddleware(ctx, next);
    }
  };

  app.use(chiiMiddleware);

  const attachServer = server => {
    if (!server) return;
    wss.start(server);
    if (typeof logger.info === 'function') {
      logger.info('[chii] websocket server attached');
    }
  };

  if (app.server) {
    attachServer(app.server);
  } else if (typeof app.once === 'function') {
    app.once('server', attachServer);
  }

  if (typeof app.beforeStart === 'function') {
    app.beforeStart(() => {
      if (typeof logger.info === 'function') {
        logger.info(`[chii] mounted at ${normalizedBasePath}`);
      }
    });
  }

  return {
    basePath: normalizedBasePath,
    channelManager: wss.channelManager,
  };
};
