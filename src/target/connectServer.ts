import Socket from 'licia/Socket';
import query from 'licia/query';
import chobitsu from 'chobitsu';
import { serverUrl, id } from './config';
import { getFavicon } from './util';

let isInit = false;
let ws: Socket;
let currentToken: string | null = null;

export default function () {
  const proxy = `${serverUrl}proxy`;
  chobitsu.domain('Page').setProxy({
    proxy,
  });
  chobitsu.domain('Debugger').setProxy({
    proxy,
  });
  chobitsu.domain('CSS').setProxy({
    proxy,
  });

  // 保存当前的token值
  currentToken = localStorage.getItem('chii-private-token');

  // 创建WebSocket连接
  ws = createWebSocket();

  // 监听localStorage变化
  window.addEventListener('storage', event => {
    if (event.key === 'chii-private-token') {
      const newToken = event.newValue;
      // 如果token发生变化，重新建立连接
      if (newToken !== currentToken) {
        currentToken = newToken;
        reconnect();
      }
    }
  });

  // 定期检查localStorage中的token是否发生变化（处理同页面修改的情况）
  setInterval(() => {
    const newToken = localStorage.getItem('chii-private-token');
    if (newToken !== currentToken) {
      currentToken = newToken;
      reconnect();
    }
  }, 2000);

  ws.on('open', () => {
    isInit = true;
    ws.on('message', event => {
      chobitsu.sendRawMessage(event.data);
    });
  });

  chobitsu.setOnMessage((message: string) => {
    if (!isInit) return;
    ws.send(message);
  });
}

// 创建WebSocket连接的函数
function createWebSocket(): Socket {
  return new Socket(
    `${serverUrl.replace(/^http/, 'ws')}target/${id}?${query.stringify({
      url: location.href,
      title: (window as any).ChiiTitle || document.title,
      favicon: getFavicon(),
      '__chobitsu-hide__': true,
      token: currentToken || '',
    })}`
  );
}

// 重新连接的函数
function reconnect() {
  // 关闭现有连接
  if (ws) {
    isInit = false;
    try {
      ws.close();
    } catch (e) {
      // 忽略关闭过程中的错误
      console.error(e);
    }
  }

  // 创建新连接
  ws = createWebSocket();

  // 重新绑定事件
  ws.on('open', () => {
    isInit = true;
    ws.on('message', event => {
      chobitsu.sendRawMessage(event.data);
    });
  });
}
