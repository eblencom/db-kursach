-- ============================================
-- База данных: Анализ финансовых новостей
-- SQL Server
-- ============================================

-- Создание базы данных (выполнить отдельно если нужно)
-- CREATE DATABASE FinancialNewsDB;
-- GO
-- USE FinancialNewsDB;
-- GO

-- Таблица ролей
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
CREATE TABLE Roles (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(50) NOT NULL UNIQUE
);

-- Таблица пользователей
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    role_id INT NOT NULL DEFAULT 2,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (role_id) REFERENCES Roles(id)
);

-- Таблица источников новостей (RSS-каналы)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NewsSources')
CREATE TABLE NewsSources (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    url NVARCHAR(500) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Таблица компаний (для фильтрации и котировок)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Companies')
CREATE TABLE Companies (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    ticker NVARCHAR(20) NOT NULL UNIQUE,
    sector NVARCHAR(100)
);

-- Таблица новостных статей
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'News')
CREATE TABLE News (
    id INT PRIMARY KEY IDENTITY(1,1),
    source_id INT NOT NULL,
    title NVARCHAR(500) NOT NULL,
    content NVARCHAR(MAX),
    url NVARCHAR(1000),
    published_at DATETIME2 NOT NULL,
    sentiment DECIMAL(3,2), -- от -1 (негатив) до 1 (позитив)
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (source_id) REFERENCES NewsSources(id)
);

-- Связь новостей и компаний (многие-ко-многим)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NewsCompanies')
CREATE TABLE NewsCompanies (
    news_id INT NOT NULL,
    company_id INT NOT NULL,
    PRIMARY KEY (news_id, company_id),
    FOREIGN KEY (news_id) REFERENCES News(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES Companies(id)
);

-- Таблица биржевых котировок
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StockPrices')
CREATE TABLE StockPrices (
    id INT PRIMARY KEY IDENTITY(1,1),
    company_id INT NOT NULL,
    price_date DATE NOT NULL,
    open_price DECIMAL(18,4) NOT NULL,
    high_price DECIMAL(18,4) NOT NULL,
    low_price DECIMAL(18,4) NOT NULL,
    close_price DECIMAL(18,4) NOT NULL,
    volume BIGINT DEFAULT 0,
    FOREIGN KEY (company_id) REFERENCES Companies(id),
    UNIQUE (company_id, price_date)
);

-- Индексы для ускорения запросов (пропустить если уже существуют)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_News_published_at' AND object_id = OBJECT_ID('News'))
CREATE INDEX IX_News_published_at ON News(published_at DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_News_sentiment' AND object_id = OBJECT_ID('News'))
CREATE INDEX IX_News_sentiment ON News(sentiment);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_News_source_id' AND object_id = OBJECT_ID('News'))
CREATE INDEX IX_News_source_id ON News(source_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_StockPrices_company_date' AND object_id = OBJECT_ID('StockPrices'))
CREATE INDEX IX_StockPrices_company_date ON StockPrices(company_id, price_date);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_NewsCompanies_company_id' AND object_id = OBJECT_ID('NewsCompanies'))
CREATE INDEX IX_NewsCompanies_company_id ON NewsCompanies(company_id);
