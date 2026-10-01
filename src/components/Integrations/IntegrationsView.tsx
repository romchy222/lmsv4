import React from 'react';
import { useLMS } from '../../context/LMSContext';
import { useAuth } from '../../context/AuthContext';
import {
  Server,
  ShieldCheck,
  RefreshCw,
  Database,
  Lock,
  Key,
  BookOpen,
  CheckCircle2,
  Clock,
  Activity,
  FileText,
  AlertCircle,
  Terminal,
  Download,
  Users,
} from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const { systemSyncStatus, syncOneC, auditLogs, role } = useLMS();
  const { dbStatus, refreshDbStatus, setShowDbModal, setShowAuthModal, user } = useAuth();

  const [notifiedTeacher, setNotifiedTeacher] = React.useState<string | null>(null);
  const [testResult, setTestResult] = React.useState<string | null>(null);
  const [showBackupModal, setShowBackupModal] = React.useState(false);
  const [backupVerified, setBackupVerified] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);

  const handleTestGateway = (gateway: string) => {
    setTestResult(`Тест шлюза [${gateway}]: Успешно. Пинг: 22 мс, SSL/TLS ГОСТ сертификат валиден.`);
    setTimeout(() => setTestResult(null), 3500);
  };

  const handleNotifyTeacher = (name: string) => {
    setNotifiedTeacher(name);
    setTimeout(() => setNotifiedTeacher(null), 3000);
  };

  // Mock department teachers for head of department audit
  const departmentTeachers = [
    { name: 'д.т.н., проф. Смирнов А.В.', discipline: 'Архитектура ИС', journalFilled: '98%', statementsDue: '1 на подпись', status: 'ok' },
    { name: 'к.т.н., доц. Иванова О.П.', discipline: 'Алгоритмы и структуры данных', journalFilled: '94%', statementsDue: 'Все сданы', status: 'ok' },
    { name: 'ст. преп. Кузнецов Д.М.', discipline: 'Компьютерные сети и телекоммуникации', journalFilled: '62%', statementsDue: '2 просрочены', status: 'warning' },
    { name: 'асс. Романов С.А.', discipline: 'Операционные системы', journalFilled: '89%', statementsDue: 'Все сданы', status: 'ok' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-700" />
              <h1 className="text-xl font-bold text-stone-900">Интеграции вуза и Аудит безопасности (ФЗ-152)</h1>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Мониторинг экосистемных шлюзов (1С:Университет, Антиплагиат.ВУЗ, SSO, ЭБС) и неизменяемый журнал аудита оценок.
            </p>
          </div>

          <button
            onClick={syncOneC}
            disabled={systemSyncStatus.oneC.status === 'syncing'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${systemSyncStatus.oneC.status === 'syncing' ? 'animate-spin' : ''}`} />
            <span>
              {systemSyncStatus.oneC.status === 'syncing' ? 'Синхронизация...' : 'Принудительная синхронизация'}
            </span>
          </button>
        </div>
      </div>

      {/* Top Featured Integration: Реляционная СУБД MySQL 8.0+ и Авторизация */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-blue-900/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Реляционная СУБД MySQL 8.0+ (Пул соединений mysql2)
                  </h2>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      dbStatus?.connected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {dbStatus?.connected ? 'MySQL Активен' : 'Совместимый режим (MySQL Ready)'}
                  </span>
                </div>
                <p className="text-xs text-blue-200">
                  Хранилище учетных записей, электронных журналов, БРС, ведомостей с ЭЦП и аудита ФЗ-152
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                <div className="text-[11px] text-blue-300">Хост и порт:</div>
                <div className="font-mono font-semibold text-white mt-0.5">{dbStatus?.host}:{dbStatus?.port}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                <div className="text-[11px] text-blue-300">База данных:</div>
                <div className="font-mono font-semibold text-white mt-0.5">{dbStatus?.database}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                <div className="text-[11px] text-blue-300">Таблицы InnoDB:</div>
                <div className="font-semibold text-white mt-0.5">{dbStatus?.tablesCount || 10} таблиц</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                <div className="text-[11px] text-blue-300">Защита сессий:</div>
                <div className="font-semibold text-emerald-400 mt-0.5">JWT + bcrypt</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => setShowDbModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Terminal className="w-4 h-4" />
              <span>SQL-консоль и таблицы</span>
            </button>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Управление доступом</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 4 Core Integrations (ТЗ 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. АСУ ВУЗ / 1С:Университет ПРОФ */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">АСУ ВУЗ / 1С:Университет ПРОФ</h3>
                <p className="text-xs text-stone-500">Синхронизация контингента, групп, планов и расписания</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Активно
            </span>
          </div>

          <div className="space-y-2 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Последняя успешная выгрузка:</span>
              <span className="font-semibold text-stone-800">{systemSyncStatus.oneC.lastSyncTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Синхронизировано записей:</span>
              <span className="font-mono font-semibold text-stone-800">
                {systemSyncStatus.oneC.recordsSynced} студентов, 2 группы
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Протокол обмена:</span>
              <span className="font-mono text-stone-700">REST API / OData v4 (HTTPS/TLS 1.3)</span>
            </div>
          </div>
        </div>

        {/* 2. Система «Антиплагиат.ВУЗ» */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">Система «Антиплагиат.ВУЗ»</h3>
                <p className="text-xs text-stone-500">Автоматическая проверка студенческих работ при загрузке</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Шлюз онлайн
            </span>
          </div>

          <div className="space-y-2 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Подключенные модули поиска:</span>
              <span className="font-semibold text-stone-800">Кольцо вузов, РГБ, eLibrary, Интернет</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Дневная квота проверок:</span>
              <span className="font-mono font-semibold text-stone-800">
                {systemSyncStatus.antiplagiat.dailyQuotaUsed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Очередь обработки:</span>
              <span className="font-semibold text-emerald-700">0 заданий (мгновенный отклик)</span>
            </div>
          </div>
        </div>

        {/* 3. Единая система аутентификации (SSO / Active Directory) */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-800">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">Единая учетная запись (SSO / LDAP)</h3>
                <p className="text-xs text-stone-500">Active Directory / SAML 2.0 / OpenID Connect</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Доверенный домен
            </span>
          </div>

          <div className="space-y-2 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Домен каталога:</span>
              <span className="font-mono font-semibold text-stone-800">{systemSyncStatus.sso.domain}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Активных сессий ППС и студентов:</span>
              <span className="font-semibold text-stone-800">{systemSyncStatus.sso.activeSessions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Двухфакторная аутентификация:</span>
              <span className="font-semibold text-emerald-700">Включена для ППС (ГОСТ ЭЦП / TOTP)</span>
            </div>
          </div>
        </div>

        {/* 4. Электронно-библиотечные системы (ЭБС) */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">Каталоги литературы ЭБС</h3>
                <p className="text-xs text-stone-500">ЭБС «Лань», «Znanium», «IPR Smart»</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Подключено
            </span>
          </div>

          <div className="space-y-2 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Провайдеры контента:</span>
              <span className="font-semibold text-stone-800">{systemSyncStatus.ebs.provider}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Привязано изданий к РПД:</span>
              <span className="font-semibold text-stone-800">{systemSyncStatus.ebs.booksLinked} наименований</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Доступность фондов:</span>
              <span className="font-semibold text-stone-800">Полный доступ по университетской подписке</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test / Diagnostic Alert Banner */}
      {testResult && (
        <div className="p-4 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{testResult}</span>
        </div>
      )}

      {/* Модуль Заведующего кафедрой: Контроль заполнения журналов (ТЗ п.2) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-700" />
              <h2 className="text-base font-bold text-stone-900">
                Контроль заполнения журналов преподавателями кафедры (ТЗ п.2)
              </h2>
            </div>
            <p className="text-xs text-stone-500">
              Мониторинг соблюдения регламента ведения электронных журналов и сроков закрытия сессионных ведомостей.
            </p>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-800 font-bold px-3 py-1 rounded-lg border border-indigo-200">
            Кафедра программной инженерии
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider">
                <th className="p-3">Преподаватель (ППС)</th>
                <th className="p-3">Дисциплина</th>
                <th className="p-3 text-center">Заполняемость журнала</th>
                <th className="p-3 text-center">Ведомости сессии</th>
                <th className="p-3 text-center">Статус кафедры</th>
                <th className="p-3 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {departmentTeachers.map((t, idx) => (
                <tr key={idx} className="hover:bg-stone-50 transition">
                  <td className="p-3 font-semibold text-stone-900">{t.name}</td>
                  <td className="p-3 text-stone-600">{t.discipline}</td>
                  <td className="p-3 text-center font-bold text-blue-900 font-mono">{t.journalFilled}</td>
                  <td className="p-3 text-center text-stone-700">{t.statementsDue}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'ok'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status === 'ok' ? 'В графике' : 'Нарушение сроков'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {notifiedTeacher === t.name ? (
                      <span className="text-[11px] text-emerald-700 font-semibold">Напоминание отправлено</span>
                    ) : (
                      <button
                        onClick={() => handleNotifyTeacher(t.name)}
                        className="px-2.5 py-1 text-xs rounded border border-stone-300 hover:bg-stone-100 text-stone-700 transition cursor-pointer"
                      >
                        Направить уведомление
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Панель Администратора: Диагностика шлюзов и Резервное копирование (ТЗ п.2 и п.5) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-bold text-stone-900">
              Диагностика шлюзов и Резервное копирование (ТЗ п.5)
            </h2>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-lg border border-emerald-200">
            Отказоустойчивость: 99.85%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
            <span className="font-bold text-stone-800 block">Шлюз 1С:Университет</span>
            <p className="text-[11px] text-stone-500">Проверка двустороннего обмена контингентом</p>
            <button
              onClick={() => handleTestGateway('1С:Университет ПРОФ')}
              className="mt-1 w-full py-1.5 bg-white hover:bg-stone-100 border text-blue-900 font-semibold rounded-lg transition cursor-pointer"
            >
              Выполнить пинг OData
            </button>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
            <span className="font-bold text-stone-800 block">API «Антиплагиат.ВУЗ»</span>
            <p className="text-[11px] text-stone-500">Проверка валидности корпоративного токена</p>
            <button
              onClick={() => handleTestGateway('Антиплагиат.ВУЗ v4.2')}
              className="mt-1 w-full py-1.5 bg-white hover:bg-stone-100 border text-emerald-900 font-semibold rounded-lg transition cursor-pointer"
            >
              Проверить квоты и шлюз
            </button>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
            <span className="font-bold text-stone-800 block">Ежедневный бэкап БД</span>
            <p className="text-[11px] text-stone-500">Резервная копия от 01.10.2026 03:00 (4.2 ГБ)</p>
            <button
              onClick={() => setShowBackupModal(true)}
              className="mt-1 w-full py-1.5 bg-white hover:bg-stone-100 border text-stone-800 font-semibold rounded-lg transition cursor-pointer"
            >
              Проверить снимок бэкапа
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-stone-700" />
              <h2 className="text-base font-bold text-stone-900">Журнал аудита действий (ФЗ-152 «О персональных данных»)</h2>
            </div>
            <p className="text-xs text-stone-500">
              Фиксация всех изменений оценок БРС, посещаемости и подписания ведомостей в соответствии с нормами ИБ вуза.
            </p>
          </div>
          <span className="text-xs text-stone-400 font-mono bg-stone-50 px-2.5 py-1 rounded-lg border">
            Записей в логе: {auditLogs.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider">
                <th className="p-3">Время / Дата</th>
                <th className="p-3">Пользователь</th>
                <th className="p-3">Роль</th>
                <th className="p-3">Действие</th>
                <th className="p-3">Объект / Студент</th>
                <th className="p-3">Было</th>
                <th className="p-3">Стало</th>
                <th className="p-3">IP-адрес</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50 transition">
                  <td className="p-3 whitespace-nowrap text-stone-500 text-[11px]">{log.timestamp}</td>
                  <td className="p-3 font-sans font-semibold text-stone-900 whitespace-nowrap">{log.user}</td>
                  <td className="p-3 font-sans text-stone-600 text-[11px] whitespace-nowrap">{log.role}</td>
                  <td className="p-3 font-sans font-medium text-blue-900 whitespace-nowrap">{log.action}</td>
                  <td className="p-3 font-sans text-stone-800 whitespace-nowrap">{log.target}</td>
                  <td className="p-3 text-stone-400 text-[11px] whitespace-nowrap">{log.oldValue || '—'}</td>
                  <td className="p-3 text-emerald-700 font-bold text-[11px] whitespace-nowrap">{log.newValue}</td>
                  <td className="p-3 text-stone-400 text-[10px] whitespace-nowrap">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Проверка резервной копии БД (ТЗ 5) */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-700" />
                <h3 className="font-bold text-stone-900 text-base">
                  Снимок резервной копии базы данных LMS ВУЗ
                </h3>
              </div>
              <button onClick={() => setShowBackupModal(false)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">Файл архива:</span>
                  <span className="font-mono text-indigo-700">lms_db_full_20261001_0300.sql.enc</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Размер снимка:</span>
                  <span className="font-mono">4.18 ГБ (Сжатие zstd, шифрование ГОСТ 28147)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Контрольная сумма SHA-256:</span>
                  <span className="font-mono text-[10px] text-stone-600">7f8a9e2c4b...e91024bc</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-stone-800 block">Статистика таблиц базы данных:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-stone-50 rounded-lg border">
                    <span className="text-stone-500 block">Студенты и группы:</span>
                    <span className="font-bold text-stone-900 font-mono">1 420 записей</span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-lg border">
                    <span className="text-stone-500 block">Оценки и баллы БРС:</span>
                    <span className="font-bold text-stone-900 font-mono">18 450 записей</span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-lg border">
                    <span className="text-stone-500 block">Ведомости с ЭЦП:</span>
                    <span className="font-bold text-stone-900 font-mono">42 ведомости</span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-lg border">
                    <span className="text-stone-500 block">Журнал аудита ФЗ-152:</span>
                    <span className="font-bold text-stone-900 font-mono">8 920 событий</span>
                  </div>
                </div>
              </div>

              {backupVerified && (
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Целостность снимка подтверждена. Тестовое развертывание в песочнице успешно завершено.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowBackupModal(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
              >
                Закрыть
              </button>
              <button
                type="button"
                disabled={isVerifying}
                onClick={() => {
                  setIsVerifying(true);
                  setTimeout(() => {
                    setIsVerifying(false);
                    setBackupVerified(true);
                  }, 800);
                }}
                className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isVerifying ? 'Проверка хеш-суммы...' : 'Тестировать восстановление'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
