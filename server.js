const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// ===== РАЗДАЧА СТАТИЧЕСКИХ ФАЙЛОВ =====
// Все файлы из папки frontend будут доступны по корневому URL
app.use(express.static(path.join(__dirname, '../frontend')));

// ===== ХРАНИЛИЩЕ (в проде — PostgreSQL + Redis) =====
const users = new Map();
const games = new Map();
const queues = new Map();
const activeConnections = new Map();

// ===== AUTH =====
app.post('/api/auth/telegram', (req, res) => {
  const { initData } = req.body;

  // Валидация подписи (в проде — проверка HMAC)
  const params = new URLSearchParams(initData);
  const user = JSON.parse(params.get('user') || '{}');

  if (!user.id) return res.status(400).json({ error: 'Invalid initData' });

  const token = crypto.randomBytes(32).toString('hex');
  users.set(token, {
    id: user.id,
    username: user.username || 'user' + user.id,
    balance: { ton: 10, usd: 42 }, // Демо-баланс
    stats: { games: 0, wins: 0, winrate: 0, streak: 0 }
  });

  res.json({ token, user: { id: user.id, username: user.username } });
});

// ===== API =====
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !users.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  req.token = token;
  req.user = users.get(token);
  next();
}

app.get('/api/dashboard', auth, (req, res) => {
  res.json({
    balance: req.user.balance,
    stats: req.user.stats,
    online: io.engine.clientsCount,
    nextFreeroll: Date.now() + 7200000
  });
});

app.get('/api/user/balance', auth, (req, res) => {
  res.json(req.user.balance);
});

app.get('/api/user/stats', auth, (req, res) => {
  res.json(req.user.stats);
});

// ===== WEBSOCKET =====
io.on('connection', (socket) => {
  const token = socket.handshake.query.token;
  const user = users.get(token);

  if (!user) { socket.disconnect(); return; }

  activeConnections.set(user.id, socket);
  socket.userId = user.id;
  socket.username = user.username;

  // === QUEUE ===
  socket.on('join_queue', (data) => {
    const { stake } = data;
    const queue = queues.get(stake) || [];
    const opponent = queue.find(s => s.userId !== user.id);

    if (opponent) {
      // Match found!
      const gameId = crypto.randomBytes(8).toString('hex');
      const game = {
        id: gameId,
        player1: user.id,
        player2: opponent.userId,
        stake,
        board: Array(9).fill(null),
        currentTurn: 'X',
        status: 'active',
        createdAt: Date.now()
      };
      games.set(gameId, game);

      queues.set(stake, queue.filter(s => s !== opponent));

      socket.emit('match_found', { gameId, opponent: { username: opponent.username } });
      opponent.emit('match_found', { gameId, opponent: { username: user.username } });

    } else {
      queue.push(socket);
      queues.set(stake, queue);

      // Timeout 60s
      setTimeout(() => {
        const idx = queue.indexOf(socket);
        if (idx > -1) {
          queue.splice(idx, 1);
          socket.emit('queue_timeout');
        }
      }, 60000);
    }
  });

  socket.on('cancel', () => {
    queues.forEach((queue, stake) => {
      const idx = queue.indexOf(socket);
      if (idx > -1) queue.splice(idx, 1);
    });
  });

  // === GAME ===
  socket.on('join_game', (data) => {
    const { gameId } = data;
    const game = games.get(gameId);
    if (!game) return;

    socket.gameId = gameId;
    socket.join(gameId);

    const symbol = game.player1 === user.id ? 'X' : 'O';
    socket.emit('game_start', { symbol, firstTurn: 'X' });
  });

  socket.on('move', (data) => {
    const { gameId, index, symbol } = data;
    const game = games.get(gameId);
    if (!game || game.status !== 'active') return;
    if (game.board[index] || game.currentTurn !== symbol) return;

    game.board[index] = symbol;
    game.currentTurn = symbol === 'X' ? 'O' : 'X';

    // Check win
    const patterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    let winner = null, winningCells = null;

    for (const [a,b,c] of patterns) {
      if (game.board[a] && game.board[a] === game.board[b] && game.board[a] === game.board[c]) {
        winner = game.board[a] === 'X' ? game.player1 : game.player2;
        winningCells = [a,b,c];
        break;
      }
    }

    io.to(gameId).emit('move', { index, symbol, nextTurn: game.currentTurn });

    if (winner) {
      game.status = 'completed';
      const prize = game.stake * 1.9;
      io.to(gameId).emit('win', { winner, prize, winningCells });
      return;
    }

    if (!game.board.includes(null)) {
      game.status = 'draw';
      io.to(gameId).emit('draw');
    }
  });

  socket.on('surrender', (data) => {
    const game = games.get(data.gameId);
    if (!game) return;
    const winner = game.player1 === user.id ? game.player2 : game.player1;
    const prize = game.stake * 1.9;
    game.status = 'completed';
    io.to(data.gameId).emit('win', { winner, prize, winningCells: null });
  });

  socket.on('timeout', (data) => {
    const game = games.get(data.gameId);
    if (!game) return;
    const winner = game.player1 === user.id ? game.player2 : game.player1;
    const prize = game.stake * 1.9;
    game.status = 'completed';
    io.to(data.gameId).emit('win', { winner, prize, winningCells: null });
  });

  socket.on('chat', (data) => {
    io.to(data.gameId).emit('chat', { sender: user.username, message: data.message });
  });

  socket.on('disconnect', () => {
    activeConnections.delete(user.id);
    queues.forEach((queue, stake) => {
      const idx = queue.indexOf(socket);
      if (idx > -1) queue.splice(idx, 1);
    });

    if (socket.gameId) {
      const game = games.get(socket.gameId);
      if (game && game.status === 'active') {
        const winner = game.player1 === user.id ? game.player2 : game.player1;
        io.to(socket.gameId).emit('opponent_left', { winner, prize: game.stake * 1.9 });
      }
    }
  });
});

// ===== ADMIN API =====
app.get('/api/admin/dashboard', auth, (req, res) => {
  if (req.user.username !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const allGames = Array.from(games.values());
  const completedGames = allGames.filter(g => g.status === 'completed');
  const revenue = completedGames.reduce((sum, g) => sum + g.stake * 0.1, 0);

  res.json({
    online: io.engine.clientsCount,
    gamesToday: allGames.length,
    revenue24h: revenue.toFixed(2),
    newUsers24h: users.size,
    liveGames: allGames.filter(g => g.status === 'active').map(g => ({
      player1: users.get(Array.from(users.entries()).find(([k,v]) => v.id === g.player1)?.[0])?.username,
      player2: users.get(Array.from(users.entries()).find(([k,v]) => v.id === g.player2)?.[0])?.username,
      stake: g.stake
    })),
    recentGames: completedGames.slice(-10).map(g => ({
      id: g.id,
      player1: users.get(Array.from(users.entries()).find(([k,v]) => v.id === g.player1)?.[0])?.username,
      player2: users.get(Array.from(users.entries()).find(([k,v]) => v.id === g.player2)?.[0])?.username,
      stake: g.stake,
      status: g.status
    }))
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 TicTacBet server running on port ${PORT}`);
});
