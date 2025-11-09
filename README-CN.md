<div align="center">
  <a href="https://chii.liriliri.io/" target="_blank">
    <img src="https://chii.liriliri.io/icon.png" width="400">
  </a>
</div>

<h1 align="center">Chii</h1>

<div align="center">

远程调试工具。

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![License][license-image]][npm-url]

</div>

[npm-image]: https://img.shields.io/npm/v/chii?style=flat-square
[npm-url]: https://npmjs.org/package/chii
[ci-image]: https://img.shields.io/github/actions/workflow/status/liriliri/chii/main.yml?branch=master&style=flat-square
[ci-url]: https://github.com/liriliri/chii/actions/workflows/main.yml
[license-image]: https://img.shields.io/npm/l/chii?style=flat-square

<img src="https://chii.liriliri.io/screenshot.jpg" style="width:100%">

类似于 [weinre](https://people.apache.org/~pmuellr/weinre/docs/latest/Home.html) 的远程调试工具，使用最新的 [chrome devtools frontend](https://github.com/ChromeDevTools/devtools-frontend) 替代了 web inspector。

## 演示

![Demo](https://chii.liriliri.io/qrcode.png)

在手机上浏览：[https://chii.liriliri.io/playground/test/demo.html](https://chii.liriliri.io/playground/test/demo.html)

打开 [https://chii.liriliri.io/playground/](https://chii.liriliri.io/room.html) 并点击检查按钮开始调试演示页面。

## 安装

你可以通过 npm 获取它。

```bash
npm install chii -g
```

## 使用方法

使用以下命令启动服务器。

```bash
chii start -p 8080
```

使用此脚本将目标代码注入到你的网页中。

```html
<script src="//host-machine-ip:8080/target.js"></script>
```

然后浏览 localhost:8080 开始调试你的页面。

### 私有令牌

你可以使用私有令牌（token）功能来过滤和保护你的调试目标：

1. 在目标页面中，通过localStorage设置`chii-private-token`：
```javascript
localStorage.setItem('chii-private-token', '你的私有令牌');
```

2. 在访问调试页面时，可以通过添加token查询参数来只显示匹配的目标：
```
http://localhost:8080/?token=你的私有令牌
```

3. 如果不传递token参数，则只显示没有token的目标。

这个功能可以帮助你在多人共享同一个调试服务器时，只查看和调试自己的目标页面。

有关更详细的使用说明，请阅读 [chii.liriliri.io](https://chii.liriliri.io/docs/) 上的文档！

### VConsole 连接方式

您可以在 VConsole 中添加一个自定义 tab 来连接 Chii 服务器：

```javascript
// 创建 VConsole 连接 Chii 的 tab
function createChiiConnector(vConsole) {
  // 添加一个新的 tab
  const tab = vConsole.addPlugin({
    id: 'chii_connector',
    name: 'Chii',
    template: `
      <div>
        <div class="vc-item">
          <div class="vc-item-content">服务器地址：</div>
        </div>
        <div class="vc-item">
          <input type="text" placeholder="ip:port/path 或 hostname:port/path" id="chii-server-input" style="width:100%;padding:5px;box-sizing:border-box;">
        </div>
        <div class="vc-item">
          <div class="vc-item-content">Token (可选)：</div>
        </div>
        <div class="vc-item">
          <input type="text" placeholder="输入私有token" id="chii-token-input" style="width:100%;padding:5px;box-sizing:border-box;">
        </div>
        <div class="vc-item">
          <button id="chii-connect-btn" style="margin:10px 0;padding:5px 10px;">连接</button>
        </div>
        <div id="chii-status" class="vc-item"></div>
      </div>
    `,
    onReady() {
      const connectBtn = document.getElementById('chii-connect-btn');
      const serverInput = document.getElementById('chii-server-input');
      const tokenInput = document.getElementById('chii-token-input');
      const statusDiv = document.getElementById('chii-status');
      
      connectBtn.addEventListener('click', () => {
        // 移除可能已存在的连接脚本
        const oldScript = document.getElementById('chii-connecter');
        if (oldScript) {
          document.body.removeChild(oldScript);
        }
        
        // 获取服务器地址和token
        const serverAddress = serverInput.value.trim();
        const token = tokenInput.value.trim();
        
        if (!serverAddress) {
          statusDiv.innerHTML = '<div class="vc-item-content" style="color:red;">请输入服务器地址</div>';
          return;
        }
        
        // 自动判断协议
        const protocol = window.location.protocol;
        const scriptSrc = `${protocol}//${serverAddress}/target.js`;
        
        // 如果有token，设置到localStorage
        if (token) {
          localStorage.setItem('chii-private-token', token);
        }
        
        // 创建script标签
        const script = document.createElement('script');
        script.id = 'chii-connecter';
        script.src = scriptSrc;
        script.onerror = () => {
          statusDiv.innerHTML = '<div class="vc-item-content" style="color:red;">连接失败，请检查服务器地址</div>';
        };
        script.onload = () => {
          statusDiv.innerHTML = '<div class="vc-item-content" style="color:green;">连接成功！</div>';
        };
        
        document.body.appendChild(script);
        statusDiv.innerHTML = '<div class="vc-item-content">正在连接...</div>';
      });
    }
  });
}

// 使用示例
if (window.VConsole) {
  createChiiConnector(window.VConsole);
} else {
  // 等待VConsole初始化完成
  window.addEventListener('vconsole.ready', (event) => {
    createChiiConnector(event.detail.vConsole);
  });
}
```

使用上述代码，您可以在VConsole中添加一个名为"Chii"的tab，通过输入服务器地址和可选的token来连接Chii服务器进行调试。

## 框架集成

### Egg

项目提供了一个 Egg 中间件入口 `@mizuka-wu/chii/egg`，用于将 Chii 挂载到现有 Egg 应用中：

```js
// app.js
const registerChii = require('@mizuka-wu/chii/egg');

module.exports = app => {
  registerChii(app, {
    basePath: '/playground/',
    cdn: 'https://cdn.example.com/chii',
  });
};
```

参数说明：

- `basePath`：挂载的访问前缀（默认 `/`，会自动补齐前后的 `/`）；
- `domain`：用于模板渲染的域名，默认读取 Egg 集群配置；
- `cdn`：可选，指定前端资源 CDN；
- `compress`：是否启用 Chii 自带压缩中间件，默认为 `true`；
- `logger`：输出日志对象，默认使用 `app.logger`。

挂载后访问 `http://host:port/playground/`（取决于 `basePath`）即可打开调试界面，页面注入脚本只需 `<script src="//host:port/playground/target.js"></script>`。

示例应用位于 [`examples/egg`](examples/egg)，包含完整的 Egg 项目结构，可通过以下命令启动：

```bash
npm install --prefix examples/egg
npm run dev:egg
```

`dev:egg` 脚本会在仓库根目录执行 `npm run dev --prefix examples/egg`，因此需要先在示例目录安装自身依赖。启动后访问 `http://127.0.0.1:7001/` 查看示例首页，调试面板位于 `http://127.0.0.1:7001/chii/`。

### Express / Nest 代理

对于 Express、Nest 等基于 Node.js 的框架，可以将 Chii 作为独立服务启动，再通过代理转发指定前缀：

```js
const { createChiiProxy } = require('@mizuka-wu/chii/proxy');

const chiiProxy = createChiiProxy({
  target: 'http://127.0.0.1:9229',
  basePath: '/devtools/chii',
});

app.use(chiiProxy);
server.on('upgrade', chiiProxy.upgrade);
```

Windows 或容器环境中可将 `target` 指向真实的 Chii 服务地址。完整示例位于：

- Express 项目：[`examples/express`](examples/express)
- Nest 项目：[`examples/nest`](examples/nest)

运行前请分别安装依赖：

```bash
npm install --prefix examples/express
npm run dev:express

npm install --prefix examples/nest
npm run dev:nest
```

Express 示例默认监听 `http://127.0.0.1:3000/`，调试面板路径为 `/devtools/chii`；Nest 示例同样使用该路径。

## 相关项目

* [whistle.chii](https://github.com/liriliri/whistle.chii)：Whistle Chii 插件。
* [chobitsu](https://github.com/liriliri/chobitsu)：Chrome 开发者工具协议的 JavaScript 实现。
* [vivy](https://github.com/liriliri/vivy-docs)：图标图像生成。

## 贡献

阅读[贡献指南](https://chii.liriliri.io/docs/contributing.html)了解开发设置说明。
