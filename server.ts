import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  initDatabase,
  getDbStatus,
  findUserByEmail,
  createUser,
  updateUserPassword,
  executeCustomSQL,
  getDemoAccounts,
} from './src/db/database';
import { testMySQLConnection, setMySQLConfig, getMySQLConfig } from './src/db/mysql';
import { comparePassword, signToken, verifyToken } from './src/services/auth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize database on startup
initDatabase().catch(err => {
  console.error('Database initialization warning:', err);
});

// Middleware to extract authenticated user
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Необходима авторизация (отсутствует токен)' });
  }

  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Недействительный или истекший токен сессии' });
  }

  (req as any).user = user;
  next();
};

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Укажите email и пароль' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Пользователь с таким email не найден' });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Неверный пароль' });
    }

    const authUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      department: user.department,
      academicDegree: user.academic_degree,
      avatarUrl: user.avatar_url,
      recordBookNumber: user.record_book_number,
      groupName: user.group_name,
      createdAt: user.created_at,
    };

    const token = signToken(authUser);
    return res.json({
      success: true,
      message: 'Успешный вход в систему',
      token,
      user: authUser,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Ошибка сервера при авторизации' });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role, department, academicDegree, recordBookNumber, groupName } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ success: false, message: 'Заполните обязательные поля: email, пароль, ФИО, роль' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Пароль должен содержать минимум 6 символов' });
    }

    const user = await createUser({
      email,
      password,
      fullName,
      role,
      department: department || 'Кафедра программной инженерии и ИИ',
      academicDegree,
      recordBookNumber,
      groupName,
    });

    const token = signToken(user);
    return res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован в базе данных',
      token,
      user,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || 'Ошибка регистрации' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticate, async (req: Request, res: Response) => {
  const reqUser = (req as any).user;
  const dbUser = await findUserByEmail(reqUser.email);
  if (!dbUser) {
    return res.status(404).json({ success: false, message: 'Пользователь не найден' });
  }

  return res.json({
    success: true,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      fullName: dbUser.full_name,
      role: dbUser.role,
      department: dbUser.department,
      academicDegree: dbUser.academic_degree,
      avatarUrl: dbUser.avatar_url,
      recordBookNumber: dbUser.record_book_number,
      groupName: dbUser.group_name,
      createdAt: dbUser.created_at,
    },
  });
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', authenticate, async (req: Request, res: Response) => {
  try {
    const reqUser = (req as any).user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Укажите старый и новый пароль' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Новый пароль должен содержать от 6 символов' });
    }

    const user = await findUserByEmail(reqUser.email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    const isValid = await comparePassword(oldPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Текущий пароль указан неверно' });
    }

    await updateUserPassword(user.id, newPassword);
    return res.json({ success: true, message: 'Пароль успешно обновлен в базе данных' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Ошибка обновления пароля' });
  }
});

// GET /api/auth/demo-users
app.get('/api/auth/demo-users', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    accounts: getDemoAccounts(),
  });
});

// -------------------------------------------------------------
// Database Endpoints (MySQL & Architecture)
// -------------------------------------------------------------

// GET /api/db/status
app.get('/api/db/status', async (_req: Request, res: Response) => {
  try {
    const status = await getDbStatus();
    return res.json({ success: true, status });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/db/test-connection
app.post('/api/db/test-connection', async (req: Request, res: Response) => {
  try {
    const { host, port, user, password, database } = req.body;
    const testResult = await testMySQLConnection({
      host,
      port: port ? parseInt(port, 10) : undefined,
      user,
      password,
      database,
    });

    if (testResult.success) {
      setMySQLConfig({
        host,
        port: port ? parseInt(port, 10) : 3306,
        user,
        password,
        database,
      });
    }

    return res.json(testResult);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/db/execute-sql
app.post('/api/db/execute-sql', async (req: Request, res: Response) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ success: false, message: 'SQL-запрос не указан' });
    }

    const result = await executeCustomSQL(sql);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/db/schema
app.get('/api/db/schema', (_req: Request, res: Response) => {
  try {
    const schemaPath = path.join(__dirname, 'src', 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
      return res.json({ success: true, schema: sqlContent });
    }
    return res.status(404).json({ success: false, message: 'schema.sql не найден' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// Vite middleware integration (Dev) or Static files (Prod)
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LMS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
