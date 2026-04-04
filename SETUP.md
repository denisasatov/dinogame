# Telegram Mini App — Инструкция по настройке

## Что уже сделано

- Подключён Telegram Web Apps SDK
- Адаптирован viewport для мобильных экранов
- Добавлен haptic feedback при проигрыше и паузе
- Интеграция с темой Telegram (автоопределение светлой/тёмной)
- Кнопка «Назад» в Telegram управляет паузой
- Responsive canvas под размер экрана

## Шаг 1: Деплой приложения

Mini App должен быть доступен по HTTPS. Варианты:

### GitHub Pages (бесплатно)

```bash
# Запушьте репозиторий на GitHub
git init
git add .
git commit -m "Telegram Mini App"
git remote add origin https://github.com/your-username/dinogame.git
git push -u origin main
```

Затем в настройках репозитория включите GitHub Pages. URL будет:
`https://your-username.github.io/dinogame/`

### Vercel (бесплатно)

```bash
npm i -g vercel
vercel
```

### Любой HTTPS хостинг

Просто загрузите файлы (`index.html`, `style.css`, `game.js`, `telegram.js`) на любой хостинг с HTTPS.

## Шаг 2: Подключение к боту через BotFather

1. Откройте **@BotFather** в Telegram
2. Отправьте `/mybots` → выберите вашего бота
3. Нажмите **Bot Settings** → **Menu Button**
4. Нажмите **Configure Menu Button**
5. Отправьте URL вашего приложения (например `https://your-username.github.io/dinogame/`)
6. Введите название кнопки, например `🦕 Играть`

**Альтернатива — через Inline кнопку:**

Отправьте @BotFather:
```
/setinline
```
Затем создайте кнопку через ваш бот-код.

## Шаг 3: Проверка

Откройте вашего бота в Telegram → нажмите кнопку меню → игра запустится внутри Telegram.

## Структура файлов

```
├── index.html      # Главная страница
├── style.css       # Стили и темы
├── game.js         # Логика игры
├── telegram.js     # Telegram Web App интеграция
└── SETUP.md        # Эта инструкция
```

## Что делает telegram.js

| Функция | Описание |
|---------|----------|
| `tg.ready()` | Сообщает Telegram, что приложение готово |
| `tg.expand()` | Разворачивает на весь экран |
| `tg.setHeaderColor()` | Устанавливает цвет хедера |
| `tg.disableVerticalSwipes()` | Отключает свайп для скролла |
| Haptic Feedback | Вибрация при проигрыше и паузе |
| BackButton | Кнопка «Назад» = пауза |
| Theme detection | Автоподстройка под тему Telegram |
