import { getTargetScriptEl } from './util';
import endWith from 'licia/endWith';
import safeStorage from 'licia/safeStorage';
import randomId from 'licia/randomId';
import rtrim from 'licia/rtrim';

const linkParser = document.createElement('a');

function normalizePathSegment(segment?: string) {
  if (!segment) {
    return '';
  }
  const trimmed = segment.trim();
  if (!trimmed || trimmed === '/') {
    return '';
  }
  return trimmed.replace(/^\/+/g, '').replace(/\/+$/g, '');
}

function joinBasePath(...segments: Array<string | undefined>) {
  const normalized = segments
    .map(normalizePathSegment)
    .filter(Boolean);
  if (!normalized.length) {
    return '/';
  }
  return `/${normalized.join('/')}/`;
}

function parseServerInput(value: string, fallbackProtocol: string) {
  const normalizedValue = value.trim();
  if (/^[a-z]+:\/\//i.test(normalizedValue)) {
    linkParser.href = normalizedValue;
  } else if (normalizedValue.startsWith('//')) {
    linkParser.href = `${fallbackProtocol}${normalizedValue}`;
  } else if (normalizedValue.startsWith('/')) {
    linkParser.href = `${fallbackProtocol}//${location.host}${normalizedValue}`;
  } else {
    linkParser.href = `${fallbackProtocol}//${normalizedValue}`;
  }

  return {
    protocol: linkParser.protocol,
    host: linkParser.host,
    pathname: linkParser.pathname,
  };
}

function resolveServerBase(raw?: string) {
  const fallbackProtocol = location.protocol === 'https:' ? 'https:' : 'http:';
  let host = location.host;
  let pathname = '/';
  let protocol: string | undefined;

  if (raw) {
    const trimmedRaw = raw.trim();
    if (trimmedRaw) {
      const parsed = parseServerInput(trimmedRaw, fallbackProtocol);
      if (parsed.host) {
        host = parsed.host;
      }
      if (parsed.pathname) {
        pathname = parsed.pathname;
      }
      if (parsed.protocol) {
        protocol = parsed.protocol;
      }
    }
  }

  const basePath = joinBasePath(pathname);
  const httpProtocol = protocol || fallbackProtocol;
  const httpUrl = `${httpProtocol}//${host}${basePath}`;
  const wsProtocol = httpProtocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${host}${basePath}`;

  return {
    httpUrl,
    wsUrl,
  };
}

const targetScript = getTargetScriptEl();
const rawServerUrl = (window as any).ChiiServerUrl
  ? (window as any).ChiiServerUrl
  : targetScript
  ? targetScript.src.replace(/target\.js(?:[?#].*)?$/, '')
  : undefined;

const resolvedServer = resolveServerBase(rawServerUrl);
const serverUrl = resolvedServer.httpUrl;
const serverWsUrl = resolvedServer.wsUrl;

let embedded = false;
let rtc = false;
let cdn = '';

if (targetScript) {
  if (targetScript.getAttribute('embedded') === 'true') {
    embedded = true;
  }
  if (targetScript.getAttribute('rtc') === 'true') {
    rtc = true;
  }
  cdn = targetScript.getAttribute('cdn') || '';
}

if (cdn && endWith(cdn, '/')) {
  cdn = rtrim(cdn, '/');
}

const sessionStore = safeStorage('session');

let id = sessionStore.getItem('chii-id');
if (!id) {
  id = randomId(6);
  sessionStore.setItem('chii-id', id);
}

export {
  // https://chii.liriliri.io/base/
  serverUrl,
  serverWsUrl,
  embedded,
  rtc,
  cdn,
  id,
};
