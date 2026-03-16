/**
 * Фейковые данные для демонстрации без SQL Server
 * Используются когда DB_CONNECTION_STRING не задан
 */

export const mockUsers = [
  { id: 1, email: 'admin@finance.ru', full_name: 'Администратор Системы', role: 'admin' },
  { id: 2, email: 'analyst@finance.ru', full_name: 'Иванов Иван Аналитик', role: 'analyst' },
  { id: 3, email: 'petrov@finance.ru', full_name: 'Петров Пётр', role: 'analyst' },
];

export const mockNewsSources = [
  { id: 1, name: 'РБК', url: 'https://www.rbc.ru/rss/', is_active: true },
  { id: 2, name: 'Интерфакс', url: 'https://www.interfax.ru/rss/', is_active: true },
  { id: 3, name: 'Коммерсантъ', url: 'https://www.kommersant.ru/RSS/news.xml', is_active: true },
  { id: 4, name: 'Ведомости', url: 'https://www.vedomosti.ru/rss/news', is_active: true },
  { id: 5, name: 'Forbes Россия', url: 'https://www.forbes.ru/rss', is_active: true },
];

export const mockCompanies = [
  { id: 1, name: 'Сбербанк', ticker: 'SBER', sector: 'Финансы' },
  { id: 2, name: 'Газпром', ticker: 'GAZP', sector: 'Энергетика' },
  { id: 3, name: 'Лукойл', ticker: 'LKOH', sector: 'Нефть и газ' },
  { id: 4, name: 'Яндекс', ticker: 'YNDX', sector: 'IT' },
  { id: 5, name: 'Роснефть', ticker: 'ROSN', sector: 'Нефть и газ' },
  { id: 6, name: 'Норникель', ticker: 'GMKN', sector: 'Металлургия' },
  { id: 7, name: 'Магнит', ticker: 'MGNT', sector: 'Ритейл' },
  { id: 8, name: 'Татнефть', ticker: 'TATN', sector: 'Нефть и газ' },
];

export const mockNews = [
  { id: 1, source_id: 1, title: 'Сбербанк отчитался о рекордной прибыли в IV квартале', content: 'Крупнейший банк России Сбербанк сообщил о рекордной чистой прибыли...', published_at: '2025-03-15T10:30:00', sentiment: 0.85, company_ids: [1] },
  { id: 2, source_id: 1, title: 'Газпром увеличил экспорт газа в Европу', content: 'Газпром сообщил об увеличении поставок природного газа...', published_at: '2025-03-15T09:15:00', sentiment: 0.65, company_ids: [2] },
  { id: 3, source_id: 2, title: 'Лукойл анонсировал новые проекты в Арктике', content: 'Нефтяная компания Лукойл представила планы по разработке...', published_at: '2025-03-14T16:00:00', sentiment: 0.55, company_ids: [3] },
  { id: 4, source_id: 3, title: 'Яндекс столкнулся с давлением регуляторов', content: 'Регулятор потребовал от Яндекса предоставить дополнительную информацию...', published_at: '2025-03-14T14:20:00', sentiment: -0.45, company_ids: [4] },
  { id: 5, source_id: 4, title: 'Роснефть и BP расширяют сотрудничество', content: 'Роснефть и британская BP подписали меморандум...', published_at: '2025-03-14T11:00:00', sentiment: 0.75, company_ids: [5] },
  { id: 6, source_id: 5, title: 'Норникель повысил дивидендные выплаты', content: 'Совет директоров Норникеля одобрил увеличение дивидендных выплат...', published_at: '2025-03-13T18:30:00', sentiment: 0.9, company_ids: [6] },
  { id: 7, source_id: 1, title: 'Магнит открыл 50 новых магазинов в регионах', content: 'Сеть магазинов Магнит продолжает экспансию...', published_at: '2025-03-13T12:00:00', sentiment: 0.7, company_ids: [7] },
  { id: 8, source_id: 2, title: 'Татнефть снизила добычу из-за техработ', content: 'Татнефть временно снизила объемы добычи на 5%...', published_at: '2025-03-12T09:00:00', sentiment: -0.2, company_ids: [8] },
  { id: 9, source_id: 3, title: 'ЦБ РФ ужесточил требования к банкам', content: 'Центральный банк объявил о новых требованиях к капиталу банков...', published_at: '2025-03-12T08:15:00', sentiment: -0.35, company_ids: [1] },
  { id: 10, source_id: 4, title: 'Биржевые индексы РФ выросли на фоне новостей', content: 'Индекс Мосбиржи вырос на 1.2% в ходе торгов...', published_at: '2025-03-11T17:00:00', sentiment: 0.6, company_ids: [1, 2, 3] },
];

const stockPricesByCompany: Record<number, Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>> = {
  1: Array.from({ length: 15 }, (_, i) => {
    const d = new Date(2025, 2, 1 + i);
    const base = 285.5 + i * 1.6;
    return { date: d.toISOString().split('T')[0], open: base, high: base + 2, low: base - 1, close: base + 1.2, volume: 15000000 + i * 1000000 };
  }),
  2: Array.from({ length: 15 }, (_, i) => {
    const d = new Date(2025, 2, 1 + i);
    const base = 128.5 + i * 1.3;
    return { date: d.toISOString().split('T')[0], open: base, high: base + 1.5, low: base - 0.8, close: base + 0.8, volume: 25000000 };
  }),
  3: Array.from({ length: 15 }, (_, i) => {
    const d = new Date(2025, 2, 1 + i);
    const base = 6850 + i * 52;
    return { date: d.toISOString().split('T')[0], open: base, high: base + 70, low: base - 30, close: base + 40, volume: 5000000 + i * 100000 };
  }),
  4: Array.from({ length: 15 }, (_, i) => {
    const d = new Date(2025, 2, 1 + i);
    const base = 4250 + (i > 3 ? -30 : 0) + i * 10;
    return { date: d.toISOString().split('T')[0], open: base, high: base + 70, low: base - 50, close: base + 20, volume: 8000000 };
  }),
  5: Array.from({ length: 15 }, (_, i) => {
    const d = new Date(2025, 2, 1 + i);
    const base = 568 + i * 3.5;
    return { date: d.toISOString().split('T')[0], open: base, high: base + 6, low: base - 3, close: base + 4, volume: 15000000 };
  }),
  6: Array.from({ length: 15 }, (_, i) => {
    const d = new Date(2025, 2, 1 + i);
    const base = 15200 + i * 80;
    return { date: d.toISOString().split('T')[0], open: base, high: base + 100, low: base - 50, close: base + 60, volume: 3000000 };
  }),
  7: Array.from({ length: 15 }, (_, i) => {
    const d = new Date(2025, 2, 1 + i);
    const base = 6820 + i * 25;
    return { date: d.toISOString().split('T')[0], open: base, high: base + 40, low: base - 20, close: base + 25, volume: 4000000 };
  }),
  8: Array.from({ length: 15 }, (_, i) => {
    const d = new Date(2025, 2, 1 + i);
    const base = 598 + i * 2.5;
    return { date: d.toISOString().split('T')[0], open: base, high: base + 5, low: base - 2, close: base + 3, volume: 8000000 };
  }),
};

export function getMockStockPrices(companyId: number) {
  return stockPricesByCompany[companyId] || [];
}
