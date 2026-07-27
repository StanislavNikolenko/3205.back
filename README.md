# 3205.back

Backend API на NestJS для асинхронной проверки списка URL. 

## Требования

- Node.js 26 (см. `.nvmrc`)
- npm

## Локальный запуск

```bash
npm ci
cp .env.template .env   # опционально, PORT по умолчанию 3000
npm run start:dev
```

API будет доступен на `http://localhost:3000/api`.

## Запуск в Docker

```bash
docker compose up --build
```

Приложение поднимется на порту `3000`.

## API

Базовый префикс: `/api`

### `POST /api/jobs` - создать задание на проверку URL.

**Тело запроса:**

```json
{
  "urls": [
    "https://example.com",
    "https://httpbin.org/status/404"
  ]
}
```

### `GET /api/jobs` - получить список всех заданий с краткой информацией.

### `GET /api/jobs/:id` - получить детальную информация по джобе и результаты по каждому URL.

### `DELETE /api/jobs/:id` - отменить задание.

## Структура проекта

- `src/` — исходный код приложения
  - `main.ts` — точка входа, префикс `/api`, CORS, валидация запросов
  - `app.module.ts` — корневой модуль
  - `app.controller.ts`, `app.service.ts`
  - `jobs/` — модуль заданий
    - `jobs.controller.ts` — REST API (`/api/jobs`)
    - `jobs.service.ts` — хранилище в памяти и фоновая обработка URL
    - `jobs.module.ts`
    - `dto/create-job.dto.ts` — валидация тела запроса при создании задания
    - `types/url-job.ts` — типы и статусы
- `Dockerfile`, `docker-compose.yml`, `.dockerignore` — Docker
- `.env.template` — шаблон переменных окружения
- `.nvmrc` — версия Node.js (26)
