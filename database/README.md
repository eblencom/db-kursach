# База данных SQL Server

## Создание БД и заполнение данными

### 1. Создание базы данных

В SQL Server Management Studio или через sqlcmd:

```sql
CREATE DATABASE FinancialNewsDB;
GO
USE FinancialNewsDB;
GO
```

### 2. Выполнение скриптов

Выполните в следующем порядке:

1. **schema.sql** — создание таблиц и индексов
2. **seed.sql** — заполнение фейковыми данными

### 3. Подключение из Next.js

Скопируйте `.env.example` в `.env.local` и укажите параметры:

```
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=ВашПароль
DB_NAME=FinancialNewsDB
DB_ENCRYPT=false
```

### 4. Режим без SQL Server (демо)

Если SQL Server не установлен, приложение автоматически использует mock-данные.  
Убедитесь, что `DB_SERVER` не задан в `.env.local`, или используйте `USE_MOCK_DATA=true`.

## Структура таблиц

| Таблица | Описание |
|---------|----------|
| Roles | Роли (admin, analyst) |
| Users | Пользователи с паролями |
| NewsSources | RSS-источники новостей |
| Companies | Компании (тикеры) |
| News | Новостные статьи |
| NewsCompanies | Связь новостей и компаний |
| StockPrices | Биржевые котировки |

## Аутентификация

Добавьте в `.env.local`:
```
NEXTAUTH_SECRET=любая-случайная-строка
NEXTAUTH_URL=http://localhost:3000
```

Если пользователи не могут войти, выполните `update-passwords.sql`.

## Тестовые данные

- **Пользователи**: admin@finance.ru, analyst@finance.ru (пароль: password123)
- **Компании**: Сбербанк, Газпром, Лукойл, Яндекс, Роснефть и др.
- **Новости**: 16 статей с тональностью
- **Котировки**: март 2025 для 5 компаний
