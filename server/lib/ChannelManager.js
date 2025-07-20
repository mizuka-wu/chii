const Emitter = require('licia/Emitter');
const truncate = require('licia/truncate');
const ansiColor = require('licia/ansiColor');
const util = require('./util');
const Channel = require('licia/Channel');

module.exports = class ChannelManager extends Emitter {
  constructor() {
    super();

    this._targets = {};
    this._clients = {};
  }
  createTarget(id, ws, url, title, favicon, ip, userAgent) {
    const channel = createChannel(ws);

    util.log(`${ansiColor.yellow('target')} ${id}:${truncate(title, 10)} ${ansiColor.green('connected')} token: ${ws.token}`);
    this._targets[id] = {
      id,
      title,
      url,
      favicon,
      channel,
      ws,
      ip,
      userAgent,
      rtc: ws.rtc,
      token: ws.token
    };

    ws.on('close', () => this.removeTarget(id, title));
    ws.on('error', error => {
      util.log(`${ansiColor.yellow('target')} ${id}:${truncate(title, 10)} ${ansiColor.red('error')} ${error.message}`);
    });

    this.emit('target_changed');
  }
  createClient(id, ws, target) {
    target = this._targets[target];
    if (!target) {
      return ws.close();
    }

    const channel = createChannel(ws);
    util.log(
      `${ansiColor.blue('client')} ${id} ${ansiColor.green('connected')} to target ${target.id}:${truncate(
        target.title,
        10
      )}`
    );
    channel.connect(target.channel);

    this._clients[id] = {
      id,
      target: target.id,
      ws,
      channel,
    };

    const closeClientWs = () => ws.close();
    ws.on('close', () => {
      target.ws.removeListener('close', closeClientWs);
      this.removeClient(id);
    });
    target.ws.on('close', closeClientWs);
  }
  removeTarget(id, title = '') {
    util.log(`${ansiColor.yellow('target')} ${id}:${title} ${ansiColor.red('disconnected')}`);
    delete this._targets[id];

    this.emit('target_changed');
  }
  removeClient(id) {
    util.log(`${ansiColor.blue('client')} ${id} ${ansiColor.red('disconnected')}`);
    delete this._clients[id];
  }
  getTargets(token) {
    // 输出日志，查看 token 和 targets 数据
    util.log(`${ansiColor.blue('getTargets')} token: ${token || 'undefined'}, targets count: ${Object.keys(this._targets).length}`);
    util.log(`${ansiColor.blue('getTargets')} targets: ${JSON.stringify(this._targets, (key, value) => {
      // 避免循环引用导致的 JSON 序列化错误
      if (key === 'ws') {
        return {
          token: value.token,
        }
      }
      if (key === 'channel' || key === 'ws') return '[Object]';
      return value;
    }, 2)}`);
    
    return Object.fromEntries(Object.entries(this._targets).filter(([, target]) => {
      if (token) return target.token === token;
      return !target.token
    }));
  }
  getClients() {
    return this._clients;
  }
};

function createChannel(ws) {
  const channel = new Channel();

  ws.on('close', () => channel.destroy());
  ws.on('message', (data, isBinary) => {
    channel.send(isBinary ? data : data.toString());
  });
  channel.on('message', msg => ws.send(msg));

  return channel;
}
