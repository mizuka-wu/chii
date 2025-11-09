const httpProxy = require('http-proxy');

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

function normalizeTarget(target = 'http://127.0.0.1:8080') {
  if (!target.endsWith('/')) {
    return target + '/';
  }
  return target;
}

function createChiiProxy(options = {}) {
  const {
    target = 'http://127.0.0.1:8080',
    basePath = '/chii',
    logger = console,
    ws = true,
    secure = false,
    changeOrigin = true,
    proxyOptions = {},
  } = options;

  const normalizedBasePath = normalizeBasePath(basePath);
  const baseWithoutTrailingSlash = normalizedBasePath.slice(0, -1);
  const normalizedTarget = normalizeTarget(target);

  const proxy = httpProxy.createProxyServer({
    target: normalizedTarget,
    changeOrigin,
    secure,
    ws,
    ...proxyOptions,
  });

  proxy.on('error', err => {
    if (typeof logger.error === 'function') {
      logger.error('[chii] proxy error', err);
    } else {
      console.error('[chii] proxy error', err);
    }
  });

  function rewriteUrl(url) {
    if (!url) return null;
    if (url === baseWithoutTrailingSlash) {
      return '/';
    }
    if (url.startsWith(normalizedBasePath)) {
      const stripped = url.slice(normalizedBasePath.length);
      return '/' + stripped;
    }
    return null;
  }

  const middleware = (req, res, next) => {
    const originalUrl = req.url;
    const originalFullUrl = req.originalUrl || req.url;

    const rewritten = rewriteUrl(originalFullUrl);
    if (rewritten === null) {
      if (typeof next === 'function') {
        return next();
      }
      return;
    }

    req.url = rewritten;
    proxy.web(req, res, undefined, err => {
      req.url = originalUrl;
      if (typeof next === 'function') {
        next(err);
      }
    });
  };

  middleware.upgrade = (req, socket, head) => {
    const originalUrl = req.url;
    const rewritten = rewriteUrl(req.url);
    if (rewritten === null) {
      socket.destroy();
      return;
    }

    req.url = rewritten;
    proxy.ws(req, socket, head, err => {
      req.url = originalUrl;
      if (typeof logger.error === 'function' && err) {
        logger.error('[chii] proxy ws error', err);
      }
    });
  };

  middleware.target = normalizedTarget;
  middleware.basePath = normalizedBasePath;
  middleware.proxy = proxy;

  return middleware;
}

module.exports = {
  createChiiProxy,
};
