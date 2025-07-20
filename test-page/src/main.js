import './style.css';

// 动态加载 target.js
function loadTargetScript() {
  const script = document.createElement('script');
  script.src = 'http://localhost:8080/target.js';
  script.onerror = () => {
    console.error('无法加载 target.js，请确保 chii 服务已启动');
    showMessage('无法加载 target.js，请确保 chii 服务已启动在 http://localhost:8080', 'error');
  };
  script.onload = () => {
    console.log('target.js 加载成功');
    showMessage('target.js 加载成功', 'success');
  };
  document.head.appendChild(script);
}

// 显示消息
function showMessage(text, type = 'success') {
  const messageContainer = document.createElement('div');
  messageContainer.className = type === 'success' ? 'success-message' : 'error-message';
  messageContainer.textContent = text;
  
  const tokenSection = document.querySelector('.token-section');
  // 移除之前的消息
  const oldMessage = tokenSection.querySelector('.success-message, .error-message');
  if (oldMessage) {
    oldMessage.remove();
  }
  
  tokenSection.appendChild(messageContainer);
  
  // 5秒后自动移除消息
  setTimeout(() => {
    messageContainer.remove();
  }, 5000);
}

// 更新当前 token 显示
function updateTokenDisplay() {
  const currentToken = localStorage.getItem('chii-private-token') || '无';
  const tokenDisplay = document.getElementById('currentToken');
  tokenDisplay.textContent = currentToken;
}

// 设置 token
function setToken() {
  const tokenInput = document.getElementById('tokenInput');
  const token = tokenInput.value.trim();
  
  if (!token) {
    showMessage('请输入有效的 token', 'error');
    return;
  }
  
  localStorage.setItem('chii-private-token', token);
  updateTokenDisplay();
  showMessage('Token 设置成功');
  tokenInput.value = '';
}

// 清除 token
function clearToken() {
  localStorage.removeItem('chii-private-token');
  updateTokenDisplay();
  showMessage('Token 已清除');
  document.getElementById('tokenInput').value = '';
}

// 初始化页面
function initPage() {
  // 加载 target.js
  loadTargetScript();
  
  // 更新当前 token 显示
  updateTokenDisplay();
  
  // 添加事件监听
  document.getElementById('setTokenBtn').addEventListener('click', setToken);
  document.getElementById('clearTokenBtn').addEventListener('click', clearToken);
  
  // 添加输入框回车事件
  document.getElementById('tokenInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      setToken();
    }
  });
}

// 当 DOM 加载完成后初始化页面
document.addEventListener('DOMContentLoaded', initPage);
