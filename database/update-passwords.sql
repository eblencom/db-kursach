-- Обновление паролей для входа (пароль: password123)
-- Выполнить если пользователи не могут войти после обновления seed
-- Хеш сгенерирован: bcrypt.hashSync('password123', 10)

UPDATE Users SET password_hash = '$2b$10$xY9z2KIzdbDkV10BjBY.nuzH/htUeVpasyZbmanRpdHedF5blfQVW'
WHERE email IN ('admin@finance.ru', 'analyst@finance.ru', 'petrov@finance.ru');
