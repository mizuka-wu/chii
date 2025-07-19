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

## 相关项目

* [whistle.chii](https://github.com/liriliri/whistle.chii)：Whistle Chii 插件。
* [chobitsu](https://github.com/liriliri/chobitsu)：Chrome 开发者工具协议的 JavaScript 实现。
* [vivy](https://github.com/liriliri/vivy-docs)：图标图像生成。

## 贡献

阅读[贡献指南](https://chii.liriliri.io/docs/contributing.html)了解开发设置说明。
