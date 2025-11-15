const registerChii = require('@mizuka-wu/chii/egg');
const puppeteer = require('puppeteer');

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

module.exports = app => {
  const options = app.config.chii || {};
  registerChii(app, options);

  const shouldLaunchPuppeteer = !process.env.EGG_WORKER_INDEX || process.env.EGG_WORKER_INDEX === '0';

  if (!shouldLaunchPuppeteer) {
    return;
  }

  app.ready(async () => {
    const logger = app.logger || console;

    const listen = (app.config.cluster && app.config.cluster.listen) || {};
    const hostname = listen.hostname || listen.host || '127.0.0.1';
    const port = listen.port || process.env.EGG_SERVER_PORT || 7001;
    const protocol = listen.protocol || 'http';
    const basePath = normalizeBasePath(options.basePath || '/');

    const baseUrl = `${protocol}://${hostname}:${port}${basePath}`;
    const scriptUrl = `${protocol}://${hostname}:${port}${basePath}target.js`;

    let browser;
    try {
      logger.info('[chii egg demo] 启动 headless Puppeteer，访问 %s', baseUrl);
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.goto('about:blank');
      await page.addScriptTag({ url: scriptUrl });
      logger.info('[chii egg demo] 已加载脚本 %s，1 分钟后关闭浏览器', scriptUrl);

      setTimeout(async () => {
        try {
          if (browser && browser.isConnected()) {
            await browser.close();
            logger.info('[chii egg demo] 已关闭 headless Puppeteer');
          }
        } catch (err) {
          logger.error('[chii egg demo] 关闭浏览器失败: %s', err.stack || err);
        }
      }, 60 * 1000);
    } catch (err) {
      logger.error('[chii egg demo] 启动 Puppeteer 失败: %s', err.stack || err);
      if (browser) {
        try {
          await browser.close();
        } catch (closeErr) {
          logger.error('[chii egg demo] 关闭失败: %s', closeErr.stack || closeErr);
        }
      }
    }
  });
};
