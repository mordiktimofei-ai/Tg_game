# 🎮 TicTacBet

**PvP крестики-нолики со ставками в TON**

## 📁 Структура проекта

```
tictacbet/
├── frontend/          # Telegram Mini App
│   ├── index.html     # Главный файл (роутер + стили)
│   └── screens.js     # Все экраны (1-6)
├── backend/           # Node.js сервер
│   ├── server.js      # Express + Socket.io
│   └── package.json
├── contracts/         # TON смарт-контракты
│   └── escrow.fc
└── docs/              # Документация
```

## 🚀 Быстрый старт

### 1. Backend

```bash
cd backend
npm install
npm start
```

Сервер запустится на `http://localhost:3000`

### 2. Telegram Mini App

1. Создай бота через [@BotFather](https://t.me/BotFather)
2. Получи токен бота
3. Настрой Mini App URL (через ngrok для локальной разработки):
   ```bash
   npx ngrok http 3000
   ```
4. В BotFather: `/mybots` → твой бот → Bot Settings → Menu Button → Configure menu button
5. Укажи URL от ngrok

### 3. Подключение screens.js

В `frontend/index.html` раскомментируй строку:
```html
<script src="screens.js"></script>
```

## 🎮 Экраны

| # | Экран | Описание |
|---|-------|----------|
| 1 | Splash | Авторизация через Telegram |
| 2 | Dashboard | Баланс, статистика, быстрая игра |
| 3 | Stake Select | Выбор ставки (0.5-5 TON) |
| 4 | Queue | Поиск соперника |
| 5 | Game | Игровое поле, таймер, чат |
| 6 | Result | Результат, реванш, шеринг |

## ⚙️ Переменные окружения

```env
PORT=3000
BOT_TOKEN=your_telegram_bot_token
TON_API_KEY=your_toncenter_api_key
```

## 🔧 Технологии

- **Frontend**: Vanilla JS, Telegram WebApp API, TON Connect
- **Backend**: Node.js, Express, Socket.io
- **Blockchain**: TON (The Open Network)
- **Smart Contracts**: FunC

## 📄 Лицензия

MIT
