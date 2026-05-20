// ===== APP CORE =====
const App = {
  tg: window.Telegram?.WebApp || {
    ready: () => {},
    expand: () => {},
    enableClosingConfirmation: () => {},
    BackButton: { show: () => {}, hide: () => {}, onClick: () => {} },
    openTelegramLink: (url) => window.open(url, '_blank'),
    showPopup: ({title, message}) => alert(title + '\n' + message),
    initData: ''
  },
  screens: {},
  currentScreen: null,
  user: null,
  token: null,
  ws: null,
  game: null,
  history: [],

  init() {
    this.tg.ready();
    this.tg.expand();
    this.tg.enableClosingConfirmation();

    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!this.token) {
      this.navigate('splash');
    } else {
      this.navigate('dashboard');
    }

    this.tg.BackButton.onClick(() => this.goBack());
  },

  register(name, renderFn) {
    this.screens[name] = renderFn;
  },

  navigate(name, params = {}) {
    if (this.currentScreen) {
      const el = document.getElementById(`screen-${this.currentScreen}`);
      if (el) el.classList.remove('active');
    }

    let screenEl = document.getElementById(`screen-${name}`);
    if (!screenEl) {
      screenEl = document.createElement('div');
      screenEl.id = `screen-${name}`;
      screenEl.className = 'screen';
      document.getElementById('screens').appendChild(screenEl);

      if (this.screens[name]) {
        screenEl.innerHTML = this.screens[name](params);
        this.attachEvents(screenEl, name, params);
      }
    }

    screenEl.classList.add('active');
    this.currentScreen = name;

    if (name !== 'dashboard' && name !== 'splash') {
      this.tg.BackButton.show();
    } else {
      this.tg.BackButton.hide();
    }

    this.history.push({ name, params });
  },

  goBack() {
    if (this.history.length > 1) {
      this.history.pop();
      const prev = this.history[this.history.length - 1];
      this.navigate(prev.name, prev.params);
    }
  },

  attachEvents(container, screenName, params) {
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        const handler = this.actions[action];
        if (handler) handler(btn, e, params);
      });
    });

    if (this.screenEvents[screenName]) {
      this.screenEvents[screenName](container, params);
    }
  },

  actions: {
    navigate(btn) {
      App.navigate(btn.dataset.target);
    },

    async login() {
      const btn = document.querySelector('[data-action="login"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';

      try {
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: App.tg.initData || '' })
        });

        if (!res.ok) throw new Error('Auth failed');

        const data = await res.json();
        App.token = data.token;
        App.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        App.navigate('dashboard');

      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = 'Войти через Telegram';
        App.showToast('Ошибка входа', 'error');
      }
    },

    selectStake(btn) {
      const stake = parseFloat(btn.dataset.stake);
      const balanceEl = document.getElementById('stakeBalance');
      const balance = parseFloat(balanceEl?.dataset.value || balanceEl?.textContent || 0);

      if (balance < stake) {
        App.showModal('Недостаточно средств', 
          `Нужно: ${stake} TON\nБаланс: ${balance.toFixed(2)} TON`, 
          [{ text: 'Пополнить', action: 'deposit' }, { text: 'Отмена', action: 'close' }]
        );
        return;
      }
      App.navigate('queue', { stake });
    },

    cancelQueue() {
      if (App.ws) App.ws.send(JSON.stringify({ type: 'cancel' }));
      App.navigate('dashboard');
    },

    makeMove(btn) {
      const index = parseInt(btn.dataset.index);
      if (App.game) App.game.makeMove(index);
    },

    surrender() {
      App.showModal('Сдаться?', 
        'Вы потеряете ставку. Соперник победит.', 
        [{ text: 'Играть дальше', action: 'close' }, { text: 'Сдаться', action: 'confirmSurrender', danger: true }]
      );
    },

    confirmSurrender() {
      if (App.game) App.game.surrender();
      App.closeModal();
    },

    playAgain() {
      App.navigate('stake');
    },

    goDashboard() {
      App.navigate('dashboard');
    },

    share() {
      const text = 'Играю в TicTacBet — PvP крестики-нолики со ставками! t.me/TicTacBetBot';
      App.tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(text)}`);
    },

    toggleChat() {
      document.getElementById('chat-panel')?.classList.toggle('active');
    },

    closeChat() {
      document.getElementById('chat-panel')?.classList.remove('active');
    },

    sendChat(btn) {
      const msg = btn.dataset.message;
      if (App.game) App.game.sendChat(msg);
      document.getElementById('chat-panel')?.classList.remove('active');
    },

    showRules() {
      App.tg.showPopup({
        title: '📋 Правила',
        message: '• Ходите по очереди\n• 15 сек на ход\n• 3 в ряд = победа\n• Ничья = возврат ставок'
      });
    },

    deposit() {
      App.showToast('Пополнение скоро будет доступно', 'info');
      App.closeModal();
    },

    closeModal() {
      App.closeModal();
    },

    requestRevenge() {
      App.showToast('Реванш запрошен!', 'success');
      App.navigate('stake');
    }
  },

  screenEvents: {},

  connectWS(path, handlers) {
    if (this.ws) this.ws.close();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.ws = new WebSocket(`${protocol}//${window.location.host}${path}?token=${this.token}`);

    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (handlers[data.type]) handlers[data.type](data);
    };

    this.ws.onclose = () => {
      setTimeout(() => this.connectWS(path, handlers), 3000);
    };
  },

  showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
  },

  showModal(title, text, buttons = []) {
    const container = document.getElementById('modals');
    const modalId = 'modal-' + Date.now();

    const btnHtml = buttons.map((b, i) => `
      <button class="btn ${b.danger ? 'btn-danger' : i === 0 ? 'btn-secondary' : 'btn-primary'}" 
              style="flex:1;justify-content:center;" data-modal-action="${b.action}" ${b.target ? 'data-target="' + b.target + '"' : ''}>${b.text}</button>
    `).join('');

    container.innerHTML = `
      <div class="modal-overlay active" id="${modalId}">
        <div class="modal-box">
          <div style="font-size:18px;font-weight:700;margin-bottom:8px;">${title}</div>
          <div style="color:var(--text-secondary);font-size:14px;margin-bottom:20px;line-height:1.5;">${text.replace(/\n/g, '<br>')}</div>
          <div style="display:flex;gap:10px;">${btnHtml}</div>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-modal-action]').forEach(btn => {
      btn.onclick = () => {
        const action = btn.dataset.modalAction;
        if (action === 'close') {
          document.getElementById(modalId)?.remove();
        } else if (action === 'navigate') {
          document.getElementById(modalId)?.remove();
          App.navigate(btn.dataset.target);
        } else if (App.actions[action]) {
          App.actions[action]();
        }
      };
    });
  },

  closeModal() {
    document.querySelector('.modal-overlay')?.remove();
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
