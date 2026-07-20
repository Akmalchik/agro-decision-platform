# Развёртывание Smart Ekin: Vercel + Supabase

Команды миграции и seed не являются частью Vercel Build Command и выполняются вручную до первого deployment.

## 1. Создать проект Supabase

1. Создайте проект в Supabase и выберите ближайший к пользователям регион.
2. Сохраните пароль базы данных в менеджере секретов. Не добавляйте его в Git.
3. Дождитесь готовности базы данных.

## 2. Включить PostGIS

Откройте **SQL Editor** и выполните [`docs/supabase-postgis.sql`](./supabase-postgis.sql). Он устанавливает PostGIS в `public`, что необходимо существующим миграциям Smart Ekin, проверяет схему установки и выводит версию расширения.

Не включайте PostGIS в другой схеме до выполнения файла. Если расширение уже включено в другой схеме нового пустого проекта, отключите его через Database → Extensions и выполните SQL-файл повторно.

## 3. Получить DATABASE_URL и DIRECT_URL

В панели Supabase нажмите **Connect** и подготовьте:

- `DATABASE_URL` — **Transaction pooler**, порт `6543`, для Vercel Functions. Добавьте `pgbouncer=true`, `connection_limit=1` и `sslmode=require`.
- `DIRECT_URL` — прямое подключение, порт `5432`, для Prisma CLI. Если компьютер, запускающий миграции, не поддерживает IPv6, используйте **Session pooler** на порту `5432`.

Структура переменных находится в `.env.example`. Зарезервированные URL-символы в пароле необходимо percent-encode.

## 4. Применить Prisma migrations

Создайте локальный `.env` с реальными значениями, затем выполните:

```bash
npm ci
npm run db:migrate
```

В production используйте только `prisma migrate deploy`. Не используйте `prisma migrate dev` или `prisma db push` для production-базы.

## 5. Выполнить seed

Prisma seed идемпотентно создаёт 3 пилотных хозяйства, 6 кадастровых участков и привязывает 3 подготовленные KMZ-геометрии:

```bash
npm run db:seed
```

Seed можно безопасно запускать повторно. Он не запускается во время установки, сборки или deployment. Для удаления только пилотного набора используйте `npm run db:clear-pilot`.

## 6. Создать проект Vercel

1. Создайте проект в Vercel.
2. Выберите Next.js Framework Preset.
3. Оставьте стандартные команды установки и `npm run build`.
4. Не добавляйте миграции или seed в Build Command.

## 7. Подключить GitHub

1. Опубликуйте репозиторий без `.env`, `.env.local`, `.next`, `node_modules` и `.vercel`.
2. Подключите репозиторий к Vercel.
3. При необходимости ограничьте preview deployments настройками Git Integration.

## 8. Добавить Environment Variables

В Vercel → Project Settings → Environment Variables добавьте:

- `DATABASE_URL` — transaction pooler URL;
- `DIRECT_URL` — direct/session URL, нужный Prisma во время генерации клиента и для ручных CLI-команд.

Добавьте значения для Production и Preview. В текущей версии `NEXT_PUBLIC_*` переменные не требуются. Никогда не помещайте пароль базы в переменную с префиксом `NEXT_PUBLIC_`.

## 9. Выполнить первый deployment

До первого deployment убедитесь, что PostGIS включён и `npm run db:migrate` завершён успешно. Затем запустите deployment из Vercel Dashboard. Приложение не применяет миграции при старте.

## 10. Проверить работу

1. `/api/health` возвращает успешный ответ.
2. `/uz-latn`, `/uz-cyrl` и `/ru` открываются.
3. Карта загружает участки из PostGIS.
4. Карточка участка показывает геометрию и площадь.
5. Создание полигона сохраняет `Plot`, geometry и `SoilProfile`.
6. Рекомендация возвращает TOP-3 и сохраняет историю.
7. В Vercel Function Logs и Supabase Logs нет ошибок соединения или prepared statements.

## Эксплуатационные замечания

- Prisma/PostGIS работают только в Node.js runtime, не Edge Runtime.
- Runtime-трафик использует pooled `DATABASE_URL`; миграции используют `DIRECT_URL`.
- При росте нагрузки контролируйте Database Reports и Pooler Logs. Увеличивайте `connection_limit` только после измерений.
- Изменения Vercel Environment Variables применяются после нового deployment.

Актуальные материалы: [Supabase connection modes](https://supabase.com/docs/guides/database/connecting-to-postgres), [Supabase PostGIS](https://supabase.com/docs/guides/database/extensions/postgis), [Prisma + Supabase](https://www.prisma.io/docs/orm/v6/overview/databases/supabase), [Vercel Environment Variables](https://vercel.com/docs/environment-variables).
