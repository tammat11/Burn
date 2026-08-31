# BURN Admin

Админ-панель клуба BURN. React + Vite + TypeScript, синхронизация данных —
Firestore (проект `burn-b365c`, тот же, что использует мобильное приложение).

## Запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

Статика собирается в `dist/` — любой статический хостинг (Firebase Hosting,
Netlify, Vercel и т.д.).

## Авторизация

Вход по email/паролю (Firebase Authentication). Доступ к записи данных
разрешён только адресам из allowlist в `firestore.rules` проекта
`burn-b365c` (функция `isAdmin()`). Чтение справочных коллекций
(`admin_residents`, `admin_events`, `admin_wins`, `admin_privileges`,
`admin_config`) открыто — их использует основное приложение.

Создать первого администратора: Firebase Console → Authentication →
Users → Add user (email/пароль), затем добавить этот email в список
`isAdmin()` в `firestore.rules`.

## Данные

- `src/burnData.ts` — типы и исходные (seed) данные, которыми Firestore
  заполняется один раз при первом запуске, если коллекция пуста.
- `src/adminSync.ts` — хуки `useCollectionSync`/`useDocSync`: заменяют
  старое `localStorage`-хранилище на `onSnapshot`-подписку + batched-запись,
  так что несколько открытых вкладок/администраторов видят изменения друг
  друга в реальном времени.
- `src/firebase.ts` — конфигурация Firebase Web-приложения (тот же проект,
  что и у Flutter-клиента).

## Правила доступа

`firestore.rules` — копия правил, задеплоенных в проекте `burn-b365c`.
Ключевое:

- `admin_residents` / `admin_events` / `admin_wins` / `admin_privileges` /
  `admin_config` — читает кто угодно (эти данные показывает мобильное
  приложение), пишет только email из allowlist в `isAdmin()`.
- `users/{uid}/registrations/{eventId}` — записи резидента на мероприятия;
  доступны только самому пользователю.

Приложение читает те же `admin_*` коллекции напрямую, поэтому изменение,
сохранённое в админке, появляется в приложении сразу. Пока коллекции пусты,
приложение показывает вшитые демо-данные — первый вход в админку заполняет
Firestore исходными значениями автоматически.
