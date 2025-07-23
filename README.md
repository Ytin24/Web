# Цветокрафт — Fullstack приложение цветочного магазина

## Быстрый старт (Docker Compose)

### 1. Клонируйте репозиторий и перейдите в папку проекта
```bash
git clone <ВАШ_РЕПОЗИТОРИЙ>
cd <ВАШ_РЕПОЗИТОРИЙ>
```

### 2. Запустите сборку и запуск контейнеров
```bash
docker-compose up --build
```

- Приложение будет доступно на http://localhost:5000
- База данных PostgreSQL — на порту 5432

### 3. Проведите миграции базы данных
В новом терминале:
```bash
docker-compose exec app npx drizzle-kit push
```

---

## Переменные окружения

- `DATABASE_URL` — строка подключения к Postgres (уже настроена для docker-compose)
- `PORT` — порт приложения (по умолчанию 5000)
- `ROOT_PASSWORD` — пароль root-пользователя (опционально, иначе будет дефолтный)
- Для интеграций: `YANDEX_MAPS_API_KEY`, `YANDEX_METRICS_COUNTER_ID`, `OPENAI_API_KEY` и др.

Создайте файл `.env` при необходимости и добавьте свои значения.

---

## Основные команды

- `docker-compose up --build` — сборка и запуск всего стека
- `docker-compose down` — остановка и удаление контейнеров
- `docker-compose exec app npx drizzle-kit push` — миграция схемы БД
- `docker-compose exec app npm run build` — ручная сборка приложения
- `docker-compose exec app npm run dev` — запуск backend в dev-режиме (для разработки)

---

## Разработка

- Для локальной разработки рекомендуется запускать backend и frontend отдельно:
  - Backend: `npm run dev` (или через VSCode/Node.js)
  - Frontend: `cd client && npm run dev`
- Все исходники фронта — в `client/`
- Все исходники backend — в `server/`
- Общие типы и схемы — в `shared/`
- Для работы с БД используйте Drizzle ORM и миграции через drizzle-kit
- Для тестирования API используйте Swagger: http://localhost:5000/api/docs
- Для интеграции webhook-ов см. [WEBHOOK-ДОКУМЕНТАЦИЯ.md](./WEBHOOK-ДОКУМЕНТАЦИЯ.md)

---

## Поддержка и обновление

- Все зависимости фиксируются в `package-lock.json` — используйте `npm ci` для установки
- Для обновления зависимостей: `npm update` и пересоберите контейнер
- Для добавления новых переменных окружения — обновите `.env` и/или `docker-compose.yml`
- Для обновления схемы БД — измените `shared/schema.ts` и выполните миграцию
- Для обновления фронта или backend — пересоберите контейнеры (`docker-compose up --build`)
- Для резервного копирования БД — используйте стандартные инструменты Postgres (`pg_dump`)

---

## Документация

- **Swagger API**: http://localhost:5000/api/docs
- **Документация по Webhook**: [WEBHOOK-ДОКУМЕНТАЦИЯ.md](./WEBHOOK-ДОКУМЕНТАЦИЯ.md)
- **Архитектура и гайдлайны**: см. `replit.md`

---

## FAQ

- **Как изменить порт?** — Измените переменную PORT в `docker-compose.yml` и/или `.env`
- **Как подключиться к БД?** — Используйте параметры из `docker-compose.yml` (user: tsvetokraft, pass: tsvetokraft, db: tsvetokraft)
- **Как добавить интеграцию?** — Добавьте переменные окружения и настройте соответствующие сервисы
- **Как восстановить root-пользователя?** — Он защищён на уровне кода, но можно задать новый пароль через переменную `ROOT_PASSWORD`

---

## Контакты и поддержка

- Вопросы по коду — через Issues или Pull Requests
- Для интеграций и доработок — см. документацию и комментарии в коде