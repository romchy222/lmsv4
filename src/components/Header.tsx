import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Calendar,
  Eye,
  Bell,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  FileCheck,
  AlertTriangle,
  Clock,
  Layers,
  X,
  Database,
  LogIn,
  LogOut,
  KeyRound,
  User,
} from 'lucide-react';
import { Role } from '../types/lms';
import { UserRole } from '../types/auth';

export const Header: React.FC = () => {
  const { role, setRole, profile, accessibility, updateAccessibility, submissions, examStatements } = useLMS();
  const { user, isAuthenticated, logout, setShowAuthModal, setShowDbModal, dbStatus } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pendingSubmissions = submissions.filter((s) => s.status === 'submitted');
  const unsignedStatements = examStatements.filter((st) => !st.isSigned);
  const notificationCount = pendingSubmissions.length + unsignedStatements.length + 1;

  const roleLabels: Record<Role, { title: string; subtitle: string; badgeColor: string }> = {
    teacher: {
      title: 'Преподаватель (ППС)',
      subtitle: 'Профессор кафедры',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    head_of_department: {
      title: 'Заведующий кафедрой',
      subtitle: 'Контроль УМК и ведомостей',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    },
    admin: {
      title: 'Администратор системы',
      subtitle: 'АСУ / 1С / Интеграции',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & University title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-sm shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 tracking-tight text-base sm:text-lg">
                  LMS ВУЗ
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700 border border-blue-200">
                  ППС
                </span>
                <span className="hidden md:inline-block text-xs text-stone-500 font-normal">
                  Рабочее место преподавателя
                </span>
              </div>
              <p className="text-xs text-stone-500 truncate hidden sm:block">
                {profile.faculty} • {profile.department}
              </p>
            </div>
          </div>

          {/* Academic Calendar Widget */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-semibold text-stone-900">Весенний семестр 2025/2026</span>
              <span className="mx-1 text-stone-300">|</span>
              <span className="text-stone-600">5-я неделя (Знаменатель)</span>
            </div>
          </div>

          {/* Actions: Accessibility, Role Switcher, Notifications, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* MySQL Database Manager Button */}
            <button
              onClick={() => setShowDbModal(true)}
              title="Панель управления базой данных MySQL (Схема, Пул, SQL-консоль)"
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-blue-700" />
              <span className="hidden sm:inline">MySQL</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  dbStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
                title={dbStatus?.connected ? 'MySQL подключен' : 'Локальное SQL-хранилище'}
              />
            </button>

            {/* Accessibility toggle */}
            <button
              onClick={() => updateAccessibility({ enabled: !accessibility.enabled })}
              title="Версия для слабовидящих"
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                accessibility.enabled
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              <Eye className="w-4 h-4 text-stone-600" />
              <span className="hidden md:inline">Слабовидящим</span>
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${roleLabels[role].badgeColor}`}
                title="Переключить роль для тестирования функционала ТЗ"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-semibold">{roleLabels[role].title}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-stone-100">
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Роли в системе (ТЗ п.2)</p>
                  </div>
                  {(['teacher', 'head_of_department', 'admin'] as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-stone-50 transition-colors ${
                        role === r ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-stone-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-stone-900">{roleLabels[r].title}</div>
                        <div className="text-[11px] text-stone-500">{roleLabels[r].subtitle}</div>
                      </div>
                      {role === r && <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 relative transition-colors cursor-pointer"
                title="Уведомления и дедлайны"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-stone-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 pb-2 border-b border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-stone-900 text-sm">Уведомления и задачи</span>
                      <span className="text-xs bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full">
                        {notificationCount}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                    {pendingSubmissions.map((sub) => (
                      <div key={sub.id} className="p-3 hover:bg-stone-50 text-xs transition-colors">
                        <div className="flex items-start gap-2">
                          <FileCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-stone-900">Новая работа на рецензирование</p>
                            <p className="text-stone-600 text-[11px] mt-0.5">{sub.assignmentTitle}</p>
                            <p className="text-stone-400 text-[10px] mt-1">
                              Студент: {sub.studentId} • {sub.groupName} • {sub.submittedAt}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {unsignedStatements.map((stmt) => (
                      <div key={stmt.id} className="p-3 hover:bg-stone-50 text-xs transition-colors bg-amber-50/40">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-stone-900">Дедлайн: сдача ведомости</p>
                            <p className="text-stone-600 text-[11px] mt-0.5">
                              {stmt.statementNumber} — {stmt.disciplineName} ({stmt.groupName})
                            </p>
                            <p className="text-amber-700 text-[10px] font-medium mt-1">
                              Требуется подписание ЭЦП до 15.06.2026
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="p-3 hover:bg-stone-50 text-xs transition-colors">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-stone-900">Синхронизация АСУ ВУЗ завершена</p>
                          <p className="text-stone-500 text-[11px] mt-0.5">
                            Контингент и расписание групп ИВТ-401, ПИ-302 обновлены.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Professor Profile info & Authentication Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2 border-l border-stone-200 hover:opacity-90 transition-opacity cursor-pointer text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-700 to-indigo-900 border border-blue-300 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                    {getInitials(user.fullName || profile.fullName)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-stone-900 text-xs">{user.fullName || profile.fullName}</span>
                      <span
                        title="Квалифицированная ЭЦП ГОСТ Р 34.10 активна"
                        className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        ЭЦП
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate max-w-[160px]">
                      {user.academicDegree || profile.academicDegree}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/70">
                      <div className="font-bold text-xs text-stone-900">{user.fullName}</div>
                      <div className="text-[11px] text-stone-500 font-mono mt-0.5">{user.email}</div>
                      <div className="text-[11px] text-blue-800 font-medium mt-1">{user.department}</div>
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                        <ShieldCheck className="w-3 h-3" />
                        Сессия защищена JWT • ФЗ-152
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowDbModal(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-stone-50 text-stone-700 transition-colors"
                      >
                        <Database className="w-4 h-4 text-blue-700" />
                        <span>Управление базой данных MySQL</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowAuthModal(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-stone-50 text-stone-700 transition-colors"
                      >
                        <KeyRound className="w-4 h-4 text-amber-600" />
                        <span>Сменить пароль / Безопасность</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowAuthModal(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-stone-50 text-stone-700 transition-colors"
                      >
                        <User className="w-4 h-4 text-purple-600" />
                        <span>Сменить учетную запись / Роль</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-stone-100">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-red-50 text-red-700 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Выйти из личного кабинета</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Войти</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
