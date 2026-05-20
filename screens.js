// ===== SCREEN 1: SPLASH =====
App.register('splash', () => `
  <div class="flex flex-col items-center justify-center" style="height:100%;padding:24px;text-align:center;">
    <div style="display:grid;grid-template-columns:repeat(3,48px);gap:8px;margin-bottom:24px;">
      ${['O','X','O','X','O','X','O','X',''].map(c => `
        <div style="width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;
          background:${c==='X'?'rgba(42,171,238,0.2)':c==='O'?'rgba(255,59,48,0.2)':'var(--card)'};
          color:${c==='X'?'var(--accent)':c==='O'?'var(--danger)':'transparent'};">${c}</div>
      `).join('')}
    </div>
    <h1 style="font-size:32px;font-weight:800;margin-bottom:8px;">TicTacBet</h1>
    <p style="color:var(--text-secondary);margin-bottom:48px;">PvP Crypto Battles</p>
    <button class="btn btn-primary btn-large" data-action="login" style="margin-bottom:32px;">Войти через Telegram</button>
    <div style="display:flex;flex-direction:column;gap:12px;width:100%;max-width:320px;">
      ${[['🛡','Skill-based PvP'],['⚡','Мгновенные выплаты'],['💰','Ставки от $0.5']]
        .map(([i,t]) => `<div style="display:flex;align-items:center;gap:12px;color:var(--text-secondary);font-size:14px;">
          <div style="width:32px;height:32px;border-radius:8px;background:var(--card);display:flex;align-items:center;justify-content:center;font-size:16px;">${i}</div><span>${t}</span></div>`).join('')}
    </div>
  </div>
`);

// ===== SCREEN 2: DASHBOARD =====
App.register('dashboard', () => `
  <div style="display:flex;flex-direction:column;height:100%;">
    <div style="padding:16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.05);">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#1E90FF);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;">
          ${App.user?.username?.[0]?.toUpperCase() || 'U'}</div>
        <span style="font-size:15px;font-weight:600;">@${App.user?.username || 'user'}</span>
      </div>
      <button class="btn btn-ghost" style="width:36px;height:36px;padding:0;border-radius:10px;background:var(--card);" data-action="navigate" data-target="settings">⚙️</button>
    </div>
    <div style="padding:16px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:28px;font-weight:700;" id="tonBalance">0.00 TON</div>
        <div style="font-size:14px;color:var(--text-secondary);" id="usdBalance">~$0.00</div>
      </div>
      <button class="btn btn-primary" style="padding:10px 20px;background:rgba(42,171,238,0.15);color:var(--accent);border:1px solid rgba(42,171,238,0.3);font-size:14px;"
        data-action="deposit">+ Пополнить</button>
    </div>
    <div class="scrollable">
      <div style="background:linear-gradient(135deg,#FF6B35,#F7931E);border-radius:16px;padding:20px;margin-bottom:20px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;opacity:0.9;margin-bottom:8px;">🔥 Freeroll</div>
        <div style="font-size:24px;font-weight:700;margin-bottom:8px;" id="freerollTimer">02:00:00</div>
        <div style="font-size:14px;opacity:0.9;margin-bottom:16px;">Приз: 50 TON</div>
        <button class="btn" style="width:100%;padding:12px;background:white;color:#FF6B35;border:none;border-radius:10px;font-size:15px;font-weight:700;"
          data-action="navigate" data-target="tournaments">Участвовать</button>
      </div>
      <button class="btn btn-primary btn-large" data-action="navigate" data-target="stake" style="margin-bottom:20px;box-shadow:0 8px 32px rgba(42,171,238,0.3);">
        <span>🔥</span><span>Играть PvP</span>
      </button>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
        ${[['🎮','Игр','games'],['🏆','Побед','wins'],['📊','Винрейт','winrate'],['🔥','Стрик','streak']]
          .map(([i,l,k]) => `<div style="background:var(--card);border-radius:12px;padding:16px;text-align:center;" data-action="navigate" data-target="profile">
            <div style="font-size:24px;margin-bottom:8px;">${i}</div>
            <div style="font-size:22px;font-weight:700;margin-bottom:4px;" id="stat-${k}">0</div>
            <div style="font-size:12px;color:var(--text-secondary);">${l}</div></div>`).join('')}
      </div>
      <div style="text-align:center;padding:12px;color:var(--text-secondary);font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;">
        <div style="width:8px;height:8px;background:var(--success);border-radius:50%;animation:pulse 2s infinite;"></div>
        <span>Онлайн: <strong id="onlineCount">0</strong></span>
      </div>
    </div>
    <div style="position:fixed;bottom:0;left:0;right:0;background:rgba(15,15,15,0.95);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-around;padding:8px 0 calc(8px + env(safe-area-inset-bottom));">
      ${[['🏠','Главная','dashboard',true],['🎮','Играть','stake',false],['👤','Профиль','profile',false]]
        .map(([i,l,t,a]) => `<button class="btn btn-ghost" style="flex:1;flex-direction:column;gap:4px;padding:8px;font-size:11px;color:${a?'var(--accent)':'var(--text-secondary)'};"
          data-action="navigate" data-target="${t}"><span style="font-size:24px;line-height:1;">${i}</span><span>${l}</span></button>`).join('')}
    </div>
  </div>
`);

App.screenEvents.dashboard = async (container) => {
  try {
    const res = await fetch('/api/dashboard', { headers: { 'Authorization': `Bearer ${App.token}` } });
    if (res.status === 401) { localStorage.clear(); App.navigate('splash'); return; }
    const data = await res.json();

    container.querySelector('#tonBalance').textContent = data.balance.ton.toFixed(2) + ' TON';
    container.querySelector('#usdBalance').textContent = '~$' + data.balance.usd.toFixed(2);
    container.querySelector('#tonBalance').dataset.value = data.balance.ton;

    container.querySelector('#stat-games').textContent = data.stats.games;
    container.querySelector('#stat-wins').textContent = data.stats.wins;
    container.querySelector('#stat-winrate').textContent = data.stats.winrate + '%';
    container.querySelector('#stat-streak').textContent = data.stats.streak;
    container.querySelector('#onlineCount').textContent = data.online;

    if (data.nextFreeroll) {
      const upd = () => {
        const d = data.nextFreeroll - Date.now();
        if (d <= 0) return;
        const h = Math.floor(d/3600000), m = Math.floor((d%3600000)/60000), s = Math.floor((d%60000)/1000);
        const el = container.querySelector('#freerollTimer');
        if (el) el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      };
      upd(); setInterval(upd, 1000);
    }
  } catch (e) { App.showToast('Ошибка загрузки', 'error'); }
};

// ===== SCREEN 3: STAKE SELECT =====
const STAKES = [{ton:0.5,usd:2.1,p:false},{ton:1,usd:4.2,p:true},{ton:2,usd:8.4,p:false},{ton:5,usd:21,p:false}];

App.register('stake', () => `
  <div style="display:flex;flex-direction:column;height:100%;">
    <div style="padding:16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,0.05);">
      <button class="btn btn-secondary" style="width:36px;height:36px;padding:0;" data-action="navigate" data-target="dashboard">←</button>
      <span style="font-size:17px;font-weight:600;">Выбор ставки</span>
    </div>
    <div class="scrollable" style="padding-top:20px;">
      <h2 style="font-size:22px;font-weight:700;margin-bottom:20px;text-align:center;">Выберите размер ставки</h2>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;" id="stakeList">
        ${STAKES.map(s => `
          <div class="stake-card" data-stake="${s.ton}" data-action="selectStake" data-stake-value="${s.ton}"
            style="background:var(--card);border-radius:16px;padding:20px;display:flex;justify-content:space-between;align-items:center;border:2px solid transparent;cursor:pointer;transition:all 0.15s;">
            <div>
              <h3 style="font-size:20px;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:8px;">
                💎 ${s.ton} TON ${s.p ? '<span style="background:linear-gradient(135deg,#FF6B35,#F7931E);color:white;font-size:10px;font-weight:700;padding:4px 8px;border-radius:6px;text-transform:uppercase;">🔥 Популярно</span>' : ''}
              </h3>
              <div style="font-size:14px;color:var(--text-secondary);">~$${s.usd.toFixed(2)}</div>
            </div>
            <span class="btn btn-primary" style="padding:10px 20px;font-size:14px;white-space:nowrap;pointer-events:none;">Выбрать</span>
          </div>
        `).join('')}
      </div>
      <div style="background:var(--card);border-radius:12px;padding:16px;">
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <span style="color:var(--text-secondary);font-size:14px;">💰 Ваш баланс</span>
          <span style="font-weight:600;font-size:14px;" id="stakeBalance">0 TON</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <span style="color:var(--text-secondary);font-size:14px;">💡 Комиссия</span><span style="font-weight:600;font-size:14px;">5%</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <span style="color:var(--text-secondary);font-size:14px;">💡 Победитель</span><span style="font-weight:600;font-size:14px;color:var(--accent);">95% банка</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;">
          <span style="color:var(--text-secondary);font-size:14px;">⏱ Время на ход</span><span style="font-weight:600;font-size:14px;">15 сек</span>
        </div>
      </div>
    </div>
  </div>
`);

App.screenEvents.stake = async (container) => {
  try {
    const res = await fetch('/api/user/balance', { headers: { 'Authorization': `Bearer ${App.token}` } });
    const data = await res.json();
    const balance = data.ton;
    container.querySelector('#stakeBalance').textContent = balance.toFixed(2) + ' TON';

    container.querySelectorAll('.stake-card').forEach(card => {
      const stake = parseFloat(card.dataset.stake);
      if (balance < stake) {
        card.style.opacity = '0.5'; card.style.cursor = 'not-allowed';
        const btn = card.querySelector('.btn');
        btn.textContent = 'Недостаточно'; btn.style.background = 'var(--card)'; btn.style.color = 'var(--text-secondary)';
        card.removeAttribute('data-action');
      } else {
        card.addEventListener('mouseenter', () => card.style.borderColor = 'rgba(42,171,238,0.3)');
        card.addEventListener('mouseleave', () => card.style.borderColor = 'transparent');
      }
    });
  } catch (e) { App.showToast('Ошибка загрузки баланса', 'error'); }
};

// ===== SCREEN 4: QUEUE =====
App.register('queue', (params) => `
  <div style="display:flex;flex-direction:column;height:100%;position:relative;">
    <button class="btn btn-secondary" style="position:absolute;top:16px;left:16px;width:40px;height:40px;padding:0;z-index:10;" data-action="cancelQueue">←</button>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;">
      <div style="width:200px;height:200px;position:relative;margin-bottom:40px;">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#1E90FF);display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 0 40px rgba(42,171,238,0.4);z-index:2;">🔍</div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120px;height:120px;border:2px solid rgba(42,171,238,0.2);border-radius:50%;animation:orbit-spin 3s linear infinite;">
          <div style="position:absolute;width:12px;height:12px;background:var(--accent);border-radius:50%;top:-6px;left:50%;transform:translateX(-50%);box-shadow:0 0 12px var(--accent);"></div>
        </div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:180px;height:180px;border:2px solid rgba(42,171,238,0.1);border-radius:50%;animation:orbit-spin 5s linear infinite reverse;">
          <div style="position:absolute;width:10px;height:10px;background:var(--accent);border-radius:50%;top:-5px;left:50%;transform:translateX(-50%);"></div>
        </div>
      </div>
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:22px;font-weight:700;margin-bottom:8px;">Поиск соперника...</div>
        <div style="color:var(--text-secondary);font-size:15px;">Ожидаем подходящего игрока</div>
        <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(42,171,238,0.15);color:var(--accent);padding:8px 16px;border-radius:20px;font-size:14px;font-weight:600;margin-top:12px;">💎 ${params.stake} TON</div>
      </div>
      <div style="display:flex;gap:24px;margin-bottom:40px;">
        <div style="text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--accent);" id="queueTimer">00:00</div><div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">Ожидание</div></div>
        <div style="text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--accent);" id="queueOnline">0</div><div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">Онлайн</div></div>
        <div style="text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--accent);" id="queueCount">0</div><div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">В очереди</div></div>
      </div>
      <button class="btn btn-danger" data-action="cancelQueue" style="width:100%;max-width:280px;padding:16px 24px;border-radius:14px;font-size:16px;"><span>❌</span><span>Отменить поиск</span></button>
    </div>
  </div>
`);

App.screenEvents.queue = (container, params) => {
  let searchTime = 0;
  const timerInterval = setInterval(() => {
    searchTime++;
    const m = Math.floor(searchTime/60), s = searchTime%60;
    const el = container.querySelector('#queueTimer');
    if (el) el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }, 1000);

  App.connectWS('/ws/queue', {
    stats: (data) => {
      const o = container.querySelector('#queueOnline'), c = container.querySelector('#queueCount');
      if (o) o.textContent = data.online; if (c) c.textContent = data.inQueue;
    },
    match_found: (data) => {
      clearInterval(timerInterval);
      App.navigate('game', { gameId: data.gameId, opponent: data.opponent, stake: params.stake });
    },
    queue_timeout: () => {
      clearInterval(timerInterval);
      App.showModal('Соперник не найден', 'Попробуйте другую ставку или пригласите друга!',
        [{text:'Изменить ставку',action:'navigate',target:'stake'}, {text:'Искать снова',action:'navigate',target:'stake'}]);
    }
  });

  App.ws.onopen = () => App.ws.send(JSON.stringify({ type: 'join_queue', stake: params.stake }));
};

// ===== SCREEN 5: GAME =====
App.register('game', (params) => `
  <div style="display:flex;flex-direction:column;height:100%;" id="gameScreen">
    <div style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.05);">
      <button class="btn btn-danger" style="padding:8px 14px;font-size:13px;" data-action="surrender">🏳️ Сдаться</button>
      <div style="text-align:center;"><div style="font-size:12px;color:var(--text-secondary);">Раунд 1/1</div><div style="font-size:14px;font-weight:700;color:var(--accent);">💎 ${params.stake} TON</div></div>
      <div style="width:80px;"></div>
    </div>
    <div style="padding:16px;display:flex;align-items:center;justify-content:space-between;">
      <div id="myCard" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;transition:all 0.3s;background:rgba(42,171,238,0.15);box-shadow:0 0 20px rgba(42,171,238,0.2);">
        <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#1E90FF);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;">${App.user?.username?.[0]?.toUpperCase()}</div>
        <div style="display:flex;flex-direction:column;"><span style="font-size:14px;font-weight:600;">@${App.user?.username}</span><span style="font-size:12px;color:var(--text-secondary);">Вы играете X</span></div>
      </div>
      <div style="font-size:14px;font-weight:900;color:var(--text-secondary);">VS</div>
      <div id="oppCard" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;transition:all 0.3s;">
        <div style="display:flex;flex-direction:column;align-items:flex-end;"><span style="font-size:14px;font-weight:600;">@${params.opponent?.username || '???'}</span><span style="font-size:12px;color:var(--text-secondary);">Играет O</span></div>
        <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--danger),#E6352B);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;">${params.opponent?.username?.[0]?.toUpperCase() || '?'}</div>
      </div>
    </div>
    <div style="text-align:center;padding:8px;">
      <div id="turnText" style="font-size:14px;font-weight:600;margin-bottom:8px;color:var(--accent);">Ваш ход! (15)</div>
      <div style="width:200px;height:4px;background:var(--card);border-radius:2px;margin:0 auto;overflow:hidden;">
        <div id="timerFill" style="height:100%;width:100%;background:linear-gradient(90deg,var(--accent),#1E90FF);border-radius:2px;transition:width 1s linear;"></div>
      </div>
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:20px;">
      <div id="gameBoard" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:100%;max-width:320px;aspect-ratio:1;">
        ${Array(9).fill(0).map((_,i) => `<div class="game-cell" data-index="${i}" data-action="makeMove"></div>`).join('')}
      </div>
    </div>
    <div style="padding:16px;border-top:1px solid rgba(255,255,255,0.05);">
      <div style="text-align:center;font-size:13px;color:var(--text-secondary);margin-bottom:12px;">Банк: <span style="color:var(--accent);font-weight:600;">${(params.stake*1.9).toFixed(2)} TON</span></div>
      <div style="display:flex;gap:10px;justify-content:center;">
        <button class="btn btn-secondary" style="padding:10px 18px;font-size:13px;" data-action="toggleChat">💬 Чат</button>
        <button class="btn btn-secondary" style="padding:10px 18px;font-size:13px;" data-action="showRules">📋 Правила</button>
      </div>
    </div>
    <div id="chat-panel" style="position:fixed;bottom:0;left:0;right:0;background:var(--card);border-radius:20px 20px 0 0;padding:16px;transform:translateY(100%);transition:transform 0.3s;z-index:50;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><span style="font-weight:600;">💬 Быстрые фразы</span>
        <button data-action="closeChat" style="background:none;border:none;color:var(--text-secondary);font-size:20px;cursor:pointer;">✕</button>
      </div>
      <div style="max-height:200px;overflow-y:auto;">
        ${['Удачи! 🍀','Хороший ход! 👍','Ой... 😅','Давай! 💪','😎','😂','👏'].map(msg => 
          `<div data-action="sendChat" data-message="${msg}" style="padding:8px 14px;background:rgba(255,255,255,0.05);border-radius:12px;margin-bottom:8px;font-size:14px;cursor:pointer;">${msg}</div>`).join('')}
      </div>
    </div>
  </div>
`);

App.screenEvents.game = (container, params) => {
  const board = Array(9).fill(null);
  let mySymbol = 'X', currentTurn = 'X', timeLeft = 15, timerInterval = null, gameEnded = false;
  const cells = container.querySelectorAll('.game-cell');
  const turnText = container.querySelector('#turnText');
  const timerFill = container.querySelector('#timerFill');
  const myCard = container.querySelector('#myCard');
  const oppCard = container.querySelector('#oppCard');

  App.game = {
    makeMove(index) {
      if (!App.ws || gameEnded || board[index] || currentTurn !== mySymbol) return;
      App.ws.send(JSON.stringify({ type: 'move', gameId: params.gameId, index, symbol: mySymbol }));
      this.placeMark(index, mySymbol);
    },
    placeMark(index, symbol) {
      board[index] = symbol;
      const cell = cells[index];
      cell.textContent = symbol;
      cell.classList.add('taken', symbol.toLowerCase());
    },
    updateTurn(turn) {
      currentTurn = turn;
      const isMyTurn = turn === mySymbol;
      if (isMyTurn) {
        myCard.style.cssText += 'background:rgba(42,171,238,0.15);box-shadow:0 0 20px rgba(42,171,238,0.2);';
        oppCard.style.cssText = oppCard.style.cssText.replace(/background[^;]+;?/,'').replace(/box-shadow[^;]+;?/,'');
        turnText.textContent = 'Ваш ход! (15)'; turnText.style.color = 'var(--accent)';
        this.startTimer();
      } else {
        myCard.style.cssText = myCard.style.cssText.replace(/background[^;]+;?/,'').replace(/box-shadow[^;]+;?/,'');
        oppCard.style.cssText += 'background:rgba(255,59,48,0.15);box-shadow:0 0 20px rgba(255,59,48,0.2);';
        turnText.textContent = 'Ход соперника...'; turnText.style.color = 'var(--text-secondary)';
        this.stopTimer();
      }
    },
    startTimer() {
      this.stopTimer(); timeLeft = 15; this.updateTimerBar();
      timerInterval = setInterval(() => {
        timeLeft--; this.updateTimerBar();
        if (timeLeft <= 5) timerFill.style.background = 'linear-gradient(90deg,var(--danger),#FF6B35)';
        if (timeLeft <= 0) { this.stopTimer(); App.ws?.send(JSON.stringify({ type: 'timeout', gameId: params.gameId })); }
      }, 1000);
    },
    stopTimer() { clearInterval(timerInterval); timerFill.style.background = 'linear-gradient(90deg,var(--accent),#1E90FF)'; },
    updateTimerBar() { timerFill.style.width = ((timeLeft/15)*100) + '%'; if (currentTurn === mySymbol) turnText.textContent = `Ваш ход! (${timeLeft})`; },
    highlightWin(cells_idx) { cells_idx.forEach(i => { cells[i].style.background = 'rgba(52,199,89,0.2)'; cells[i].style.borderColor = 'var(--success)'; }); },
    surrender() { App.ws?.send(JSON.stringify({ type: 'surrender', gameId: params.gameId })); },
    sendChat(msg) { App.ws?.send(JSON.stringify({ type: 'chat', gameId: params.gameId, message: msg })); }
  };

  App.connectWS('/ws/game', {
    game_start: (data) => { mySymbol = data.symbol; App.game.updateTurn(data.firstTurn); },
    move: (data) => { if (data.symbol !== mySymbol) App.game.placeMark(data.index, data.symbol); App.game.updateTurn(data.nextTurn); },
    win: (data) => {
      gameEnded = true; App.game.stopTimer();
      if (data.winningCells) App.game.highlightWin(data.winningCells);
      setTimeout(() => App.navigate('result', { result: data.winner === App.user.id ? 'win' : 'lose', amount: data.prize, stake: params.stake, board, winningCells: data.winningCells }), 1500);
    },
    draw: () => { gameEnded = true; App.game.stopTimer(); setTimeout(() => App.navigate('result', { result: 'draw', amount: 0, stake: params.stake, board }), 500); },
    opponent_left: (data) => { gameEnded = true; App.game.stopTimer(); App.showToast('Соперник вышел. Вы победили!', 'success'); setTimeout(() => App.navigate('result', { result: 'win', amount: data.prize, stake: params.stake, board }), 1500); },
    chat: (data) => { App.showToast(`${data.sender}: ${data.message}`); }
  });

  App.ws.onopen = () => App.ws.send(JSON.stringify({ type: 'join_game', gameId: params.gameId }));
};

// ===== SCREEN 6: RESULT =====
App.register('result', (params) => {
  const isWin = params.result === 'win', isDraw = params.result === 'draw';
  return `
  <div style="min-height:100vh;position:relative;">
    ${isWin ? '<div id="confetti-container" style="position:fixed;inset:0;pointer-events:none;z-index:50;overflow:hidden;"></div>' : ''}
    <div style="padding:16px;display:flex;justify-content:space-between;align-items:center;">
      <button class="btn btn-secondary" style="padding:8px 14px;font-size:13px;" data-action="share"><span>📤</span><span>Поделиться</span></button>
      <button class="btn btn-secondary" style="padding:8px 14px;font-size:13px;" data-action="navigate" data-target="profile"><span>📊</span><span>История</span></button>
    </div>
    <div style="text-align:center;padding:20px 24px;position:relative;">
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:300px;height:300px;border-radius:50%;filter:blur(80px);opacity:0.3;animation:glowPulse 3s ease infinite;background:${isWin?'var(--success)':isDraw?'var(--warning)':'var(--danger)'};"></div>
      <div style="font-size:80px;margin-bottom:16px;display:inline-block;animation:emojiBounce 0.6s ease;">${isWin?'🎉':isDraw?'🤝':'😔'}</div>
      <h1 style="font-size:36px;font-weight:800;margin-bottom:8px;letter-spacing:-0.5px;">${isWin?'ПОБЕДА!':isDraw?'НИЧЬЯ':'ПОРАЖЕНИЕ'}</h1>
      <div style="font-size:42px;font-weight:700;margin-bottom:8px;animation:amountSlide 0.5s ease 0.3s both;color:${isWin?'var(--success)':isDraw?'var(--warning)':'var(--danger)'};">${isWin?'+':isDraw?'±':'-'}${params.amount?.toFixed(2) || '0.00'} TON</div>
      <div style="font-size:16px;color:var(--text-secondary);animation:amountSlide 0.5s ease 0.4s both;">~$${((params.amount || 0) * 4.2).toFixed(2)}</div>
    </div>
    <div style="padding:0 24px 24px;">
      <div style="text-align:center;font-size:13px;color:var(--text-secondary);margin-bottom:12px;">Игровое поле</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:240px;margin:0 auto;aspect-ratio:1;">
        ${params.board?.map((cell, i) => `<div style="background:var(--card);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;animation:cellAppear 0.3s ease ${0.1+i*0.05}s both;${cell==='X'?'color:var(--accent);':cell==='O'?'color:var(--danger);':''}${params.winningCells?.includes(i)?'background:rgba(52,199,89,0.2);border:2px solid var(--success);':''}">${cell || ''}</div>`).join('')}
      </div>
    </div>
    <div style="padding:0 24px 24px;">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
        ${[['1:24','Длительность'],[params.board?.filter(Boolean).length || 0,'Ходов'],[isWin?'+95%':isDraw?'0%':'-100%','Доход']].map(([v,l],i) => 
          `<div style="background:var(--card);border-radius:12px;padding:14px;text-align:center;animation:statSlide 0.4s ease ${0.5+i*0.1}s both;"><div style="font-size:20px;font-weight:700;margin-bottom:4px;">${v}</div><div style="font-size:11px;color:var(--text-secondary);">${l}</div></div>`).join('')}
      </div>
    </div>
    <div style="padding:0 24px 32px;display:flex;flex-direction:column;gap:10px;">
      ${isWin ? `<button class="btn btn-primary btn-large" style="background:linear-gradient(135deg,var(--success),#30B350);box-shadow:0 4px 20px rgba(52,199,89,0.3);animation:btnSlide 0.4s ease 0.9s both;" data-action="requestRevenge"><span>⚔️</span><span>Реванш</span></button>` : ''}
      <button class="btn btn-primary btn-large" style="animation:btnSlide 0.4s ease ${isWin?'1.0':'0.9'}s both;" data-action="navigate" data-target="stake"><span>🔄</span><span>Играть ещё</span></button>
      <button class="btn btn-secondary btn-large" style="animation:btnSlide 0.4s ease ${isWin?'1.1':'1.0'}s both;" data-action="navigate" data-target="dashboard"><span>🏠</span><span>В меню</span></button>
    </div>
  </div>`;
});

App.screenEvents.result = (container, params) => {
  if (params.result === 'win') {
    const confettiContainer = container.querySelector('#confetti-container');
    const colors = ['#2AABEE', '#34C759', '#FFCC00', '#FF3B30', '#FF6B35'];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `position:absolute;width:${Math.random()*10+5}px;height:${Math.random()*10+5}px;background:${colors[Math.floor(Math.random()*colors.length)]};left:${Math.random()*100}%;top:-10px;border-radius:${Math.random()>0.5?'50%':'0'};animation:confettiFall ${Math.random()*2+2}s linear ${Math.random()*2}s forwards;`;
      confettiContainer.appendChild(confetti);
    }
    setTimeout(() => confettiContainer.innerHTML = '', 5000);
  }
  fetch('/api/user/stats', { headers: { 'Authorization': `Bearer ${App.token}` } }).then(r => r.json()).then(data => localStorage.setItem('userStats', JSON.stringify(data)));
};
