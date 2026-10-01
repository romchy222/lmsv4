import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, DbStatus, MySQLConfig, UserRole } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showDbModal: boolean;
  setShowDbModal: (show: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    department: string;
    academicDegree?: string;
    recordBookNumber?: string;
    groupName?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  quickDemoLogin: (role: UserRole) => Promise<boolean>;
  dbStatus: DbStatus | null;
  refreshDbStatus: () => Promise<void>;
  testDbConnection: (config: MySQLConfig) => Promise<{ success: boolean; message: string; latencyMs: number }>;
  executeSQL: (sql: string) => Promise<{ success: boolean; rows?: any[]; affectedRows?: number; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'lms_auth_token';
const USER_KEY = 'lms_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    // Default logged in as professor if no session yet, for instant smooth UX
    return {
      id: 'usr-prof-01',
      email: 'prof.smirnov@university.ru',
      fullName: 'Смирнов Алексей Валерьевич',
      role: 'teacher',
      department: 'Кафедра программной инженерии и ИИ',
      academicDegree: 'д.т.н., профессор',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      createdAt: new Date().toISOString(),
    };
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showDbModal, setShowDbModal] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);

  const refreshDbStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setDbStatus(data.status);
          return;
        }
      }
    } catch {
      // Fallback status if offline
    }
    setDbStatus({
      connected: false,
      type: 'local_sql',
      host: 'localhost',
      port: 3306,
      database: 'lms_university',
      user: 'root',
      tablesCount: 10,
      usersCount: 4,
      lastChecked: new Date().toLocaleTimeString('ru-RU'),
      message: 'Локальное SQL-хранилище активно (готовность к MySQL)',
    });
  }, []);

  useEffect(() => {
    refreshDbStatus();
  }, [refreshDbStatus]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setShowAuthModal(false);
        setIsLoading(false);
        return { success: true, message: data.message };
      }
      setIsLoading(false);
      return { success: false, message: data.message || 'Ошибка входа' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: 'Не удалось связаться с сервером авторизации' };
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    department: string;
    academicDegree?: string;
    recordBookNumber?: string;
    groupName?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setToken(resData.token);
        setUser(resData.user);
        localStorage.setItem(TOKEN_KEY, resData.token);
        localStorage.setItem(USER_KEY, JSON.stringify(resData.user));
        setShowAuthModal(false);
        setIsLoading(false);
        return { success: true, message: resData.message };
      }
      setIsLoading(false);
      return { success: false, message: resData.message || 'Ошибка регистрации' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: 'Не удалось связаться с сервером базы данных' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!token) return { success: false, message: 'Не авторизован' };
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      return { success: res.ok && data.success, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Сбой запроса смены пароля' };
    }
  };

  const quickDemoLogin = async (role: UserRole): Promise<boolean> => {
    let email = 'prof.smirnov@university.ru';
    let pass = 'ProfPassword123!';

    if (role === 'head_of_department') {
      email = 'head.vasiliev@university.ru';
      pass = 'HeadPassword123!';
    } else if (role === 'admin') {
      email = 'admin@university.ru';
      pass = 'AdminPassword123!';
    } else if (role === 'student') {
      email = 'student.ivanov@university.ru';
      pass = 'StudentPassword123!';
    }

    const res = await login(email, pass);
    return res.success;
  };

  const testDbConnection = async (config: MySQLConfig) => {
    try {
      const res = await fetch('/api/db/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      await refreshDbStatus();
      return data;
    } catch (e: any) {
      return { success: false, message: 'Ошибка связи с сервером', latencyMs: 0 };
    }
  };

  const executeSQL = async (sql: string) => {
    try {
      const res = await fetch('/api/db/execute-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: 'Ошибка отправки запроса' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        showAuthModal,
        setShowAuthModal,
        showDbModal,
        setShowDbModal,
        login,
        register,
        logout,
        changePassword,
        quickDemoLogin,
        dbStatus,
        refreshDbStatus,
        testDbConnection,
        executeSQL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
