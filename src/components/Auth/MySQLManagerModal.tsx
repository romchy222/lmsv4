import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Database,
  X,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Play,
  FileCode,
  Download,
  Terminal,
  Activity,
  Table,
  Cpu,
  Layers,
} from 'lucide-react';

export const MySQLManagerModal: React.FC = () => {
  const { showDbModal, setShowDbModal, dbStatus, refreshDbStatus, testDbConnection, executeSQL } = useAuth();

  const [activeTab, setActiveTab] = useState<'status' | 'test' | 'sql' | 'schema'>('status');

  // Connection settings form
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('3306');
  const [user, setUser] = useState('root');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('lms_university');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);

  // SQL console
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [sqlRunning, setSqlRunning] = useState(false);
  const [sqlResult, setSqlResult] = useState<{ success: boolean; rows?: any[]; affectedRows?: number; message?: string } | null>(null);

  // Schema state
  const [schemaText, setSchemaText] = useState<string>('');

  useEffect(() => {
    if (showDbModal) {
      refreshDbStatus();
      fetch('/api/db/schema')
        .then((r) => r.json())
        .then((d) => {
          if (d.schema) setSchemaText(d.schema);
        })
        .catch(() => {});
    }
  }, [showDbModal, refreshDbStatus]);

  if (!showDbModal) return null;

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);
    const res = await testDbConnection({
      host,
      port: parseInt(port, 10) || 3306,
      user,
      password,
      database,
    });
    setTesting(false);
    setTestResult(res);
  };

  const handleRunSQL = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sqlQuery.trim()) return;
    setSqlRunning(true);
    setSqlResult(null);
    const res = await executeSQL(sqlQuery);
    setSqlRunning(false);
    setSqlResult(res);
  };

  const downloadSchemaSQL = () => {
    const blob = new Blob([schemaText || '-- LMS University MySQL Schema'], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-radial from-slate-900 via-blue-950 to-stone-900 text-white p-5 flex items-center justify-between border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Управление базой данных MySQL</h2>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    dbStatus?.connected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {dbStatus?.connected ? 'MySQL Активен' : 'SQL Совместимый режим'}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                LMS University Database Management System • InnoDB engine • utf8mb4
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDbModal(false)}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 text-xs font-semibold text-stone-600 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-2 px-3 border-b-2 rounded-t-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-blue-900 text-blue-950 bg-white shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Состояние и таблицы
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`py-2 px-3 border-b-2 rounded-t-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'test'
                ? 'border-blue-900 text-blue-950 bg-white shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Подключение к MySQL
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-2 px-3 border-b-2 rounded-t-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-blue-900 text-blue-950 bg-white shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            SQL-консоль
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-2 px-3 border-b-2 rounded-t-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-blue-900 text-blue-950 bg-white shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Схема DDL (schema.sql)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Status Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70">
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span>Тип СУБД:</span>
                    <Cpu className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-base font-bold text-stone-800">
                    {dbStatus?.type === 'mysql' ? 'MySQL 8.0 (Пул)' : 'SQL Движок (Node/InnoDB)'}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    База: <code className="bg-stone-200 px-1 py-0.5 rounded text-stone-700">{dbStatus?.database}</code>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70">
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span>Хост и порт:</span>
                    <Server className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-base font-bold text-stone-800">
                    {dbStatus?.host}:{dbStatus?.port}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Пользователь: <span className="font-medium text-stone-700">{dbStatus?.user}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70">
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span>Таблицы и пользователи:</span>
                    <Layers className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-base font-bold text-stone-800">
                    {dbStatus?.tablesCount} таблиц • {dbStatus?.usersCount} учетных записей
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Пинг: {dbStatus?.latencyMs !== undefined ? `${dbStatus.latencyMs} мс` : '< 1 мс'}
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-blue-950">
                      Статус хранилища данных: {dbStatus?.message}
                    </div>
                    <div className="text-[11px] text-blue-800">
                      Поддерживает аутентификацию пользователей, шифрование bcrypt, транзакции и журнал аудита ФЗ-152.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => refreshDbStatus()}
                  className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Обновить
                </button>
              </div>

              {/* Registered Tables in Database */}
              <div>
                <h3 className="text-sm font-bold text-stone-800 mb-2 flex items-center gap-2">
                  <Table className="w-4 h-4 text-blue-800" />
                  Таблицы реляционной схемы MySQL:
                </h3>
                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 text-xs">
                  <div className="grid grid-cols-12 bg-stone-100 p-2.5 font-semibold text-stone-700">
                    <div className="col-span-4">Имя таблицы</div>
                    <div className="col-span-3">Движок / Кодировка</div>
                    <div className="col-span-5">Назначение</div>
                  </div>
                  <div className="grid grid-cols-12 p-2.5 hover:bg-stone-50">
                    <div className="col-span-4 font-mono font-medium text-blue-900">users</div>
                    <div className="col-span-3 text-stone-500">InnoDB • utf8mb4</div>
                    <div className="col-span-5 text-stone-700">Учетные записи (ППС, студенты, админы, пароли bcrypt)</div>
                  </div>
                  <div className="grid grid-cols-12 p-2.5 hover:bg-stone-50">
                    <div className="col-span-4 font-mono font-medium text-blue-900">academic_groups</div>
                    <div className="col-span-3 text-stone-500">InnoDB • utf8mb4</div>
                    <div className="col-span-5 text-stone-700">Учебные группы (ПИ-21-1, специальности, факультеты)</div>
                  </div>
                  <div className="grid grid-cols-12 p-2.5 hover:bg-stone-50">
                    <div className="col-span-4 font-mono font-medium text-blue-900">courses</div>
                    <div className="col-span-3 text-stone-500">InnoDB • utf8mb4</div>
                    <div className="col-span-5 text-stone-700">Учебные дисциплины, часы (лекции/лаб/практики), КУМ</div>
                  </div>
                  <div className="grid grid-cols-12 p-2.5 hover:bg-stone-50">
                    <div className="col-span-4 font-mono font-medium text-blue-900">attendance_records</div>
                    <div className="col-span-3 text-stone-500">InnoDB • utf8mb4</div>
                    <div className="col-span-5 text-stone-700">Электронный журнал посещаемости (П, Н, УП, О)</div>
                  </div>
                  <div className="grid grid-cols-12 p-2.5 hover:bg-stone-50">
                    <div className="col-span-4 font-mono font-medium text-blue-900">grade_items & student_grades</div>
                    <div className="col-span-3 text-stone-500">InnoDB • utf8mb4</div>
                    <div className="col-span-5 text-stone-700">Балльно-рейтинговая система (БРС), веса категорий</div>
                  </div>
                  <div className="grid grid-cols-12 p-2.5 hover:bg-stone-50">
                    <div className="col-span-4 font-mono font-medium text-blue-900">submissions</div>
                    <div className="col-span-3 text-stone-500">InnoDB • utf8mb4</div>
                    <div className="col-span-5 text-stone-700">Студенческие работы, версионность и Антиплагиат.ВУЗ</div>
                  </div>
                  <div className="grid grid-cols-12 p-2.5 hover:bg-stone-50">
                    <div className="col-span-4 font-mono font-medium text-blue-900">exam_statements</div>
                    <div className="col-span-3 text-stone-500">InnoDB • utf8mb4</div>
                    <div className="col-span-5 text-stone-700">Экзаменационные ведомости, ЭЦП ГОСТ Р 34.10-2012</div>
                  </div>
                  <div className="grid grid-cols-12 p-2.5 hover:bg-stone-50">
                    <div className="col-span-4 font-mono font-medium text-blue-900">audit_logs</div>
                    <div className="col-span-3 text-stone-500">InnoDB • utf8mb4</div>
                    <div className="col-span-5 text-stone-700">Журнал безопасности и неизменяемый аудит ФЗ-152</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEST CONNECTION */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
                Здесь вы можете проверить сетевую доступность внешнего сервера MySQL или локального сервиса и настроить параметры пула соединений:
              </div>

              <form onSubmit={handleTestConnection} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Хост MySQL (Host):
                    </label>
                    <input
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="localhost или 127.0.0.1"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Порт (Port):
                    </label>
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder="3306"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Имя пользователя (User):
                    </label>
                    <input
                      type="text"
                      value={user}
                      onChange={(e) => setUser(e.target.value)}
                      placeholder="root"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Пароль (Password):
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Имя базы данных (Database):
                  </label>
                  <input
                    type="text"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    placeholder="lms_university"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-800"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={testing}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    {testing ? 'Проверка соединения...' : 'Тестировать подключение к MySQL'}
                  </button>

                  <span className="text-[11px] text-stone-400">
                    Переменные окружения: <code className="text-stone-600">MYSQL_HOST, MYSQL_PORT</code>
                  </span>
                </div>
              </form>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold">{testResult.message}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      Время отклика сетевого сокета: {testResult.latencyMs} мс
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SQL CONSOLE */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Введите SQL-запрос для выполнения:
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSqlQuery('SELECT * FROM users LIMIT 10;')}
                      className="px-2 py-0.5 text-[10px] bg-stone-100 hover:bg-stone-200 rounded text-stone-600"
                    >
                      SELECT users
                    </button>
                    <button
                      type="button"
                      onClick={() => setSqlQuery('SHOW TABLES;')}
                      className="px-2 py-0.5 text-[10px] bg-stone-100 hover:bg-stone-200 rounded text-stone-600"
                    >
                      SHOW TABLES
                    </button>
                    <button
                      type="button"
                      onClick={() => setSqlQuery('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5;')}
                      className="px-2 py-0.5 text-[10px] bg-stone-100 hover:bg-stone-200 rounded text-stone-600"
                    >
                      SELECT audit_logs
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full p-2.5 font-mono text-xs border border-stone-300 rounded-xl bg-stone-900 text-emerald-300 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  placeholder="SELECT * FROM users;"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleRunSQL}
                  disabled={sqlRunning}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {sqlRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Выполнить SQL-запрос
                </button>
                <span className="text-[11px] text-stone-400">
                  Поддерживает SELECT, SHOW, DESCRIBE и совместимый режим
                </span>
              </div>

              {sqlResult && (
                <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                  <div className="bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700 border-b border-stone-200 flex justify-between">
                    <span>Результат выполнения запроса:</span>
                    <span>{sqlResult.rows ? `${sqlResult.rows.length} строк` : ''}</span>
                  </div>

                  {sqlResult.message && (
                    <div className="p-3 text-xs text-stone-600 italic">{sqlResult.message}</div>
                  )}

                  {sqlResult.rows && sqlResult.rows.length > 0 && (
                    <div className="overflow-x-auto max-h-60">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                            {Object.keys(sqlResult.rows[0]).map((key) => (
                              <th key={key} className="p-2 font-mono font-semibold">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                          {sqlResult.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/50">
                              {Object.values(row).map((val: any, valIdx) => (
                                <td key={valIdx} className="p-2 text-stone-800">
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SCHEMA DDL */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-600 font-medium">
                  Полная схема DDL реляционной базы данных MySQL 8.0+:
                </span>
                <button
                  type="button"
                  onClick={downloadSchemaSQL}
                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Скачать schema.sql
                </button>
              </div>

              <pre className="p-3 bg-stone-900 text-emerald-300 rounded-xl text-xs font-mono max-h-96 overflow-y-auto whitespace-pre-wrap">
                {schemaText || '// Загрузка schema.sql...'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
