# Tabiya ◆

Шахматная платформа: игра с ботом по знаменитым дебютам со стрелками-подсказками,
онлайн-партии в реальном времени, режим тренировки с подсказками, друзья и рейтинг.

Стек: **React + TypeScript + Vite**, доска — `react-chessboard`, правила — `chess.js`,
движок — **Stockfish 18 (WASM)** в Web Worker, бэкенд — **Supabase** (Postgres + Auth + Realtime).

## Что работает без бэкенда (уже сейчас)

```bash
npm install
npm run dev
```

Открой http://localhost:5173 → «Играть с ботом». Онлайн-разделы покажут «оффлайн»,
пока не подключён Supabase.

## Подключение онлайна (Supabase) — по шагам

1. Зайди на https://supabase.com → New project (бесплатно). Дождись создания БД.
2. **SQL-схема:** Dashboard → SQL Editor → New query → вставь целиком
   [`supabase/schema.sql`](supabase/schema.sql) → Run. Это создаёт таблицы
   `profiles / friendships / games / game_moves`, политики доступа (RLS),
   авто-создание профиля при регистрации и серверную функцию пересчёта рейтинга.
3. **Ключи:** Dashboard → Project Settings → API. Скопируй:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` ключ → `VITE_SUPABASE_ANON_KEY`

   Создай файл `.env.local` в корне (см. `.env.example`):
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
   ⚠️ `service_role` ключ в фронт НЕ клади.
4. Перезапусти `npm run dev`. Появятся Вход/Регистрация, лобби и профиль.

### (Опционально) Вход через Google
Supabase → Authentication → Providers → Google. Нужно завести OAuth-приложение
в Google Cloud Console и вставить `Client ID` / `Client Secret`. Пока не сделаешь —
работает вход по email + паролю (ключи не нужны).

## Деплой (Vercel)

1. Залей репозиторий на GitHub (`git init` — сейчас папка не под git).
2. Vercel → Import Project → выбери репо. Framework определится как Vite.
3. В Environment Variables добавь те же `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`.
4. Deploy. Stockfish (`public/engine/*`) деплоится как статика, отдельный сервер не нужен.

## Структура

```
src/
  engine/stockfish.ts     — UCI-обёртка над Stockfish в Web Worker
  openings/               — база дебютов (data.ts) + индекс позиция→ход (book.ts)
  game/GameBoard.tsx      — общий компонент доски
  lib/                    — supabase-клиент, сервисы игр и друзей
  auth/AuthContext.tsx    — сессия + профиль
  pages/                  — Home, PlayBot, Login, Lobby, OnlineGame, Profile
public/engine/            — Stockfish 18 lite (WASM), отдаётся статикой
supabase/schema.sql       — миграция БД (вставить в SQL Editor)
```

## Заметки на будущее
- Рейтинг считает серверная SQL-функция `finish_game` (Эло, K=32). Античит ходов
  (валидация на сервере) стоит вынести в Supabase Edge Function.
- Дебютную базу легко расширять — добавляй линии в `src/openings/data.ts`.
