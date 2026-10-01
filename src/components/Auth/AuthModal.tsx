import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { UserRole } from '../../types/auth';
import {
  Lock,
  Mail,
  User,
  GraduationCap,
  ShieldCheck,
  Building,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Database,
  Sparkles,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    login,
    register,
    changePassword,
    quickDemoLogin,
    isLoading,
    user,
    isAuthenticated,
    logout,
  } = useAuth();
  const { setRole } = useLMS();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'change_password'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('teacher');
  const [regDepartment, setRegDepartment] = useState('Кафедра программной инженерии и ИИ');
  const [regDegree, setRegDegree] = useState('к.т.н., доцент');
  const [regRecordBook, setRegRecordBook] = useState('');
  const [regGroup, setRegGroup] = useState('ПИ-21-1');

  // Change password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!showAuthModal) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const res = await login(loginEmail, loginPassword);
    if (res.success) {
      setSuccessMsg('Авторизация успешна!');
      setTimeout(() => {
        setShowAuthModal(false);
        setSuccessMsg('');
      }, 700);
    } else {
      setErrorMsg(res.message || 'Ошибка входа');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const res = await register({
      email: regEmail,
      password: regPassword,
      fullName: regFullName,
      role: regRole,
      department: regDepartment,
      academicDegree: regDegree,
      recordBookNumber: regRole === 'student' ? regRecordBook : undefined,
      groupName: regRole === 'student' ? regGroup : undefined,
    });

    if (res.success) {
      setSuccessMsg('Учетная запись успешно создана в базе данных MySQL!');
      if (regRole === 'teacher' || regRole === 'head_of_department' || regRole === 'admin') {
        setRole(regRole);
      }
      setTimeout(() => {
        setShowAuthModal(false);
        setSuccessMsg('');
      }, 800);
    } else {
      setErrorMsg(res.message || 'Ошибка регистрации');
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (newPassword !== confirmPassword) {
      setErrorMsg('Новый пароль и подтверждение не совпадают');
      return;
    }
    const res = await changePassword(oldPassword, newPassword);
    if (res.success) {
      setSuccessMsg('Пароль успешно обновлен в базе данных!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setActiveTab('login');
        setSuccessMsg('');
      }, 1000);
    } else {
      setErrorMsg(res.message || 'Не удалось сменить пароль');
    }
  };

  const handleDemoClick = async (role: UserRole) => {
    setErrorMsg('');
    setSuccessMsg('');
    const ok = await quickDemoLogin(role);
    if (ok) {
      if (role === 'teacher' || role === 'head_of_department' || role === 'admin') {
        setRole(role);
      }
      setSuccessMsg(`Выполнен вход под ролью: ${role}`);
      setTimeout(() => {
        setShowAuthModal(false);
        setSuccessMsg('');
      }, 600);
    } else {
      setErrorMsg('Ошибка демо-входа');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Banner */}
        <div className="bg-radial from-blue-900 via-blue-950 to-stone-900 text-white p-6 relative">
          <button
            onClick={() => setShowAuthModal(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-800/80 border border-blue-600/40 flex items-center justify-center shadow-inner">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                ЭИОС Университета
              </h2>
              <p className="text-xs text-blue-200 font-medium">
                Единая служба аутентификации и авторизации пользователей
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-blue-200 bg-blue-900/60 rounded-lg px-3 py-1.5 border border-blue-700/50">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Защищенный шлюз ФСТЭК / ФЗ-152 • Хранилище MySQL 8.0+ • bcrypt / JWT</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors ${
              activeTab === 'login'
                ? 'border-blue-900 text-blue-950 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Вход в систему
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors ${
              activeTab === 'register'
                ? 'border-blue-900 text-blue-950 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Регистрация
          </button>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => { setActiveTab('change_password'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors ${
                activeTab === 'change_password'
                  ? 'border-blue-900 text-blue-950 bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Смена пароля
            </button>
          )}
        </div>

        {/* Body content */}
        <div className="p-6">
          {/* Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Demo Logins Bar */}
          {activeTab === 'login' && (
            <div className="mb-5 bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Быстрый демо-вход (1 клик):
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoClick('teacher')}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 text-[11px] font-medium text-left transition-colors"
                >
                  <div className="font-semibold">Преподаватель</div>
                  <div className="text-[10px] text-blue-700">Смирнов А.В.</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoClick('head_of_department')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 text-[11px] font-medium text-left transition-colors"
                >
                  <div className="font-semibold">Зав. кафедрой</div>
                  <div className="text-[10px] text-amber-700">Васильев М.П.</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoClick('admin')}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-900 text-[11px] font-medium text-left transition-colors"
                >
                  <div className="font-semibold">Админ ЭИОС</div>
                  <div className="text-[10px] text-purple-700">Ковалева О.С.</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoClick('student')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 text-[11px] font-medium text-left transition-colors"
                >
                  <div className="font-semibold">Студент</div>
                  <div className="text-[10px] text-emerald-700">Иванов Д.С.</div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Электронная почта (Логин):
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="prof.smirnov@university.ru"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">Пароль:</label>
                  <span className="text-[11px] text-stone-400">Демо: ProfPassword123!</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {isLoading ? 'Проверка учетных данных...' : 'Войти в личный кабинет'}
                </button>
              </div>

              {isAuthenticated && user && (
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>Текущий пользователь: <b>{user.fullName}</b></span>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="text-red-700 hover:underline"
                  >
                    Выйти
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  ФИО пользователя:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Петров Иван Васильевич"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Электронная почта:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="petrov@university.ru"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Пароль (от 6 знаков):
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Роль в системе:
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="teacher">Преподаватель (ППС)</option>
                    <option value="head_of_department">Заведующий кафедрой</option>
                    <option value="admin">Администратор системы</option>
                    <option value="student">Студент</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ученая степень / Должность:
                  </label>
                  <input
                    type="text"
                    value={regDegree}
                    onChange={(e) => setRegDegree(e.target.value)}
                    placeholder="д.т.н., профессор"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Подразделение / Кафедра:
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    placeholder="Кафедра программной инженерии и ИИ"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                </div>
              </div>

              {regRole === 'student' && (
                <div className="grid grid-cols-2 gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Номер зачетки:
                    </label>
                    <input
                      type="text"
                      value={regRecordBook}
                      onChange={(e) => setRegRecordBook(e.target.value)}
                      placeholder="211045"
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Группа:
                    </label>
                    <input
                      type="text"
                      value={regGroup}
                      onChange={(e) => setRegGroup(e.target.value)}
                      placeholder="ПИ-21-1"
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {isLoading ? 'Запись в базу данных MySQL...' : 'Зарегистрировать в MySQL'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CHANGE PASSWORD */}
          {activeTab === 'change_password' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Текущий пароль:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Новый пароль (от 6 символов):
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Подтвердите новый пароль:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {isLoading ? 'Обновление в БД...' : 'Сохранить новый пароль'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
