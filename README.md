# 🎮 TicTacBet

**PvP крестики-нолики со ставками в TON**

## 📁 Структура проекта

```
tictacbet/
├── frontend/          # Telegram Mini App (статические файлы)
│   ├── index.html     # Главный HTML файл
│   ├── app.js         # Ядро приложения (роутер, API, WS)
│   └── screens.js     # Все экраны игры
├── backend/           # Node.js сервер
│   └── server.js      # Express + Socket.io
└── package.json       # Зависимости
```

## 🚀 Быстрый старт

### 1. Установи зависимости

```bash
npm install
```

### 2. Запусти сервер локально

```bash
npm start
```

Сервер запустится на `http://localhost:3000`

### 3. Настрой Telegram Mini App

1. Создай бота через [@BotFather](https://t.me/BotFather)
2. Получи токен бота
3. Настрой Mini App URL:
   - В BotFather: `/mybots` → твой бот → Bot Settings → Menu Button → Configure menu button
   - Укажи URL твоего сервера (например, `https://tictactoe.com`)

## 🎮 Экраны

| # | Экран | Описание |
|---|-------|----------|
| 1 | Splash | Авторизация через Telegram |
| 2 | Dashboard | Баланс, статистика, быстрая игра |
| 3 | Stake Select | Выбор ставки (0.5-5 TON) |
| 4 | Queue | Поиск соперника |
| 5 | Game | Игровое поле, таймер, чат |
| 6 | Result | Результат, реванш, шеринг |

## 📱 Файлы (каждый отдельно)

- **`frontend/index.html`** — HTML + CSS, подключает app.js и screens.js
- **`frontend/app.js`** — Ядро: роутер, API-запросы, WebSocket, модалки, тосты
- **`frontend/screens.js`** — Все 6 экранов игры (регистрация через `App.register`)
- **`backend/server.js`** — Express сервер + Socket.io для real-time игры

## ⚙️ Переменные окружения

```env
PORT=3000
```

## 🔧 Технологии

- **Frontend**: Vanilla JS, Telegram WebApp API, TON Connect
- **Backend**: Node.js, Express, Socket.io
- **Blockchain**: TON (The Open Network)

## 📄 Лицензия

MIT
