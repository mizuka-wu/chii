const { Controller } = require('egg');

class HomeController extends Controller {
  async index() {
    this.ctx.body = '<h1>Chii Egg 示例</h1><p>请访问 <a href="/chii/" target="_blank">/chii/</a> 打开 DevTools。</p>';
  }
}

module.exports = HomeController;
