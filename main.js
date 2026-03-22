(function() {
let chatHistory = [];
let chatOpen = false;
const CHAT_HISTORY_MAX = 20;

// ===== イベント登録 =====
document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle) navToggle.addEventListener('click', function() { toggleNav(this); });
  document.getElementById('chat-fab').addEventListener('click', toggleChat);
  document.getElementById('chat-close').addEventListener('click', toggleChat);
  document.getElementById('chat-send').addEventListener('click', sendChat);
  document.getElementById('chat-input').addEventListener('keydown', chatKeydown);
});

// ===== Nav =====
function toggleNav(btn) {
  const links = document.getElementById('nav-links');
  const open = links.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
  btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
}

// Escキー: ナビ・チャット両方を閉じる
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const links = document.getElementById('nav-links');
    if (links.classList.contains('open')) {
      links.classList.remove('open');
      const btn = document.querySelector('.nav-toggle');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
    if (chatOpen) toggleChat();
  }
});

// ===== Chat =====
const FOCUSABLE_SELECTORS = '#chat-box button, #chat-box textarea';

function trapFocus(e) {
  if (e.key !== 'Tab') return;
  const box = document.getElementById('chat-box');
  const focusable = Array.from(box.querySelectorAll(FOCUSABLE_SELECTORS));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
}

function toggleChat() {
  chatOpen = !chatOpen;
  const box = document.getElementById('chat-box');
  const fab = document.getElementById('chat-fab');
  box.classList.toggle('open', chatOpen);
  fab.classList.toggle('hidden', chatOpen);
  fab.setAttribute('aria-expanded', chatOpen);
  if (chatOpen) {
    if (window.innerWidth <= 768) document.body.style.overflow = 'hidden';
    document.getElementById('chat-send').disabled = false;
    document.getElementById('chat-input').disabled = false;
    document.getElementById('chat-input').focus();
    box.addEventListener('keydown', trapFocus);
    document.querySelector('main').setAttribute('inert', '');
  } else {
    document.body.style.overflow = '';
    box.removeEventListener('keydown', trapFocus);
    fab.focus();
    document.querySelector('main').removeAttribute('inert');
  }
}

// モバイル→デスクトップ切り替え時のoverflow残存解消
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) document.body.style.overflow = '';
});

function chatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
    e.preventDefault();
    sendChat();
  }
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  const msgs = document.getElementById('chat-messages');
  const userEl = document.createElement('div');
  userEl.className = 'chat-msg user';
  userEl.textContent = msg;
  msgs.appendChild(userEl);

  const thinkEl = document.createElement('div');
  thinkEl.className = 'chat-msg bot thinking';
  thinkEl.textContent = '応答待機中...';
  msgs.appendChild(thinkEl);
  msgs.scrollTop = msgs.scrollHeight;

  document.getElementById('chat-send').disabled = true;
  document.getElementById('chat-input').disabled = true;
  chatHistory.push({ role: 'user', content: msg });
  if (chatHistory.length > CHAT_HISTORY_MAX) chatHistory = chatHistory.slice(-CHAT_HISTORY_MAX);

  try {
    const r = await fetch('https://delta.bon-soleil.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: chatHistory.slice(-6) })
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    thinkEl.className = 'chat-msg bot';
    thinkEl.textContent = d.reply || 'エラーが発生しました';
    if (d.reply) chatHistory.push({ role: 'assistant', content: d.reply });
  } catch(err) {
    thinkEl.className = 'chat-msg bot';
    thinkEl.textContent = '通信エラーが発生しました。しばらくしてから再試行してください。';
  } finally {
    document.getElementById('chat-send').disabled = false;
    document.getElementById('chat-input').disabled = false;
    document.getElementById('chat-input').focus();
  }
  // DOM上限: 古いメッセージを削除（最大40件）
  const allMsgs = msgs.querySelectorAll('.chat-msg');
  if (allMsgs.length > 40) {
    for (let i = 0; i < allMsgs.length - 40; i++) allMsgs[i].remove();
  }
  msgs.scrollTop = msgs.scrollHeight;
}
})();
