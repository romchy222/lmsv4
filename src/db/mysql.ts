import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import dotenv from 'dotenv';
import { DbStatus, MySQLConfig } from '../types/auth';

dotenv.config();

let pool: Pool | null = null;
let currentConfig: MySQLConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'lms_university',
};

export const getMySQLConfig = (): MySQLConfig => ({ ...currentConfig });

export const setMySQLConfig = (newConfig: Partial<MySQLConfig>) => {
  currentConfig = { ...currentConfig, ...newConfig };
  if (pool) {
    pool.end().catch(() => {});
    pool = null;
  }
};

export const getPool = (): Pool => {
  if (!pool) {
    const poolOptions: PoolOptions = {
      host: currentConfig.host,
      port: currentConfig.port,
      user: currentConfig.user,
      password: currentConfig.password,
      database: currentConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 4000,
    };
    pool = mysql.createPool(poolOptions);
  }
  return pool;
};

export const testMySQLConnection = async (config?: Partial<MySQLConfig>): Promise<{ success: boolean; message: string; latencyMs: number }> => {
  const cfg = { ...currentConfig, ...config };
  const start = Date.now();
  let tempConn: mysql.Connection | null = null;

  try {
    tempConn = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      connectTimeout: 4000,
    });

    await tempConn.ping();
    const latency = Date.now() - start;
    await tempConn.end();

    return {
      success: true,
      message: `Успешное подключение к MySQL (${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database})`,
      latencyMs: latency,
    };
  } catch (err: any) {
    const latency = Date.now() - start;
    if (tempConn) {
      try { await tempConn.end(); } catch {}
    }
    return {
      success: false,
      message: `Ошибка подключения к MySQL: ${err.message || String(err)}`,
      latencyMs: latency,
    };
  }
};
