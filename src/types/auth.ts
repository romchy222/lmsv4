import { Role } from './lms';

export type UserRole = Role | 'student';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  academicDegree?: string;
  avatarUrl?: string;
  recordBookNumber?: string;
  groupName?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
}

export interface DbStatus {
  connected: boolean;
  type: 'mysql' | 'local_sql';
  host: string;
  port: number;
  database: string;
  user: string;
  tablesCount: number;
  usersCount: number;
  lastChecked: string;
  latencyMs?: number;
  message?: string;
}

export interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
}
