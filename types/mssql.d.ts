declare module 'mssql' {
  export interface config {
    user?: string;
    password?: string;
    server?: string;
    database?: string;
    options?: Record<string, unknown>;
    pool?: Record<string, unknown>;
  }
  export interface Request {
    input(name: string, type: unknown, value: unknown): Request;
    query(query: string): Promise<{ recordset: unknown[] }>;
  }
  export interface ConnectionPool {
    request(): Request;
    close(): Promise<void>;
  }
  export const Int: unknown;
  export const Date: unknown;
  export const NVarChar: (length?: number) => unknown;
  export const VarChar: (length?: number) => unknown;
  export function connect(cfg: config): Promise<ConnectionPool>;

  interface MssqlModule {
    config: config;
    Int: unknown;
    Date: unknown;
    NVarChar: (length?: number) => unknown;
    VarChar: (length?: number) => unknown;
    ConnectionPool: ConnectionPool;
    connect(cfg: config): Promise<ConnectionPool>;
  }
  const mssql: MssqlModule;
  export default mssql;
}
