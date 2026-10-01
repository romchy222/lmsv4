export type Role = 'teacher' | 'head_of_department' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  academicDegree: string; // e.g. "д.т.н., профессор" or "к.т.н., доцент"
  department: string; // "Кафедра программной инженерии"
  faculty: string; // "Факультет информационных технологий"
  email: string;
  avatarUrl: string;
  role: Role;
  digitalCertificate: {
    serialNumber: string;
    validUntil: string;
    issuer: string; // e.g. "Удостоверяющий центр Минобрнауки РФ"
    owner: string;
  };
}

export type LessonType = 'Лекция' | 'Практика' | 'Лабораторная' | 'Консультация' | 'Экзамен' | 'Зачет';

export interface TimetableItem {
  id: string;
  disciplineId: string;
  disciplineName: string;
  groupName: string;
  time: string; // "08:30 - 10:00"
  type: LessonType;
  classroom: string; // "Ауд. 412" or "Дистанционно"
  isOnline: boolean;
  vcsPlatform?: 'Яндекс Телемост' | 'BigBlueButton' | 'VK Звонки' | 'SberJazz';
  vcsLink?: string;
  status: 'upcoming' | 'in_progress' | 'completed';
}

export interface Student {
  id: string;
  fullName: string;
  group: string;
  recordBookNumber: string; // Номер зачетной книжки
  avatarUrl?: string;
  email: string;
  phone: string;
  riskStatus?: 'normal' | 'warning' | 'critical';
  lastActivityDate: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late'; // П, Н, УП, О

export interface AttendanceRecord {
  studentId: string;
  lessonDate: string;
  lessonType: LessonType;
  status: AttendanceStatus;
  note?: string;
}

export interface GradeItem {
  id: string;
  name: string; // e.g., "Лаб. 1: Архитектурные паттерны"
  category: 'current' | 'milestone' | 'term_paper' | 'exam';
  maxPoints: number;
  weightPercent: number;
  date: string;
}

export interface StudentGrade {
  studentId: string;
  gradeItemId: string;
  points: number; // 0..maxPoints
  updatedAt: string;
  updatedBy: string;
}

export interface AntiplagiatReport {
  originalityPercent: number;
  borrowingPercent: number;
  citationPercent: number;
  selfCitationPercent: number;
  status: 'passed' | 'review_required' | 'rejected';
  reportUrl: string;
  checkedAt: string;
  engine: string; // "Антиплагиат.ВУЗ v4.2"
}

export interface Submission {
  id: string;
  studentId: string;
  disciplineId: string;
  assignmentId: string;
  assignmentTitle: string;
  groupName: string;
  submittedAt: string;
  version: number;
  fileName: string;
  fileSize: string;
  fileSnippet: string;
  status: 'submitted' | 'graded' | 'revision_needed';
  score?: number;
  maxScore: number;
  feedback?: string;
  plagiarismReport: AntiplagiatReport;
  rubric: {
    name: string;
    maxScore: number;
    awardedScore: number;
  }[];
}

export type QuestionType = 'single_choice' | 'multi_choice' | 'matching' | 'open_text' | 'formula';

export interface TestQuestion {
  id: string;
  questionText: string;
  type: QuestionType;
  points: number;
  options?: string[];
  correctAnswer?: string | string[];
  matchingPairs?: { left: string; right: string }[];
  hint?: string;
}

export interface TestSettings {
  id: string;
  title: string;
  timeLimitMinutes: number;
  maxAttempts: number;
  randomizeQuestions: boolean;
  questionsPerAttempt: number;
  passScorePercent: number;
  questions: TestQuestion[];
}

export interface CourseModuleItem {
  id: string;
  title: string;
  type: 'lecture_pdf' | 'video' | 'presentation' | 'lab_manual' | 'test' | 'scorm' | 'ebs_link';
  fileSize?: string;
  duration?: string;
  linkUrl?: string;
  description?: string;
  testId?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  weekRange: string;
  description: string;
  items: CourseModuleItem[];
}

export interface Course {
  id: string;
  title: string;
  code: string; // "09.03.04-ПО"
  semester: string; // "6 семестр, 2025/2026 уч. год"
  faculty: string;
  groups: string[];
  totalHours: number;
  lectureHours: number;
  practiceHours: number;
  labHours: number;
  syllabusUrl: string;
  kumApproved: boolean; // Комплекс учебно-методических материалов
  modules: CourseModule[];
  tests: TestSettings[];
}

export interface ExamStatement {
  id: string;
  statementNumber: string; // e.g., "В-04/2026-ПИ"
  disciplineId: string;
  disciplineName: string;
  groupName: string;
  academicYear: string;
  semester: string;
  controlType: 'Экзамен' | 'Дифференцированный зачет' | 'Зачет';
  date: string;
  isSigned: boolean;
  signedAt?: string;
  digitalSignatureStamp?: {
    signatureHash: string;
    certificateSerial: string;
    signerName: string;
    timestamp: string;
    organization: string;
  };
  status: 'draft' | 'ready_to_sign' | 'signed_locked' | 'archived';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  disciplineId?: string;
  groupTarget: string; // "Все группы" or "ИВТ-401"
  publishedAt: string;
  authorName: string;
  isUrgent: boolean;
  viewsCount: number;
}

export interface ForumMessage {
  id: string;
  disciplineId: string;
  topic: string;
  senderName: string;
  senderRole: 'student' | 'teacher';
  avatarUrl?: string;
  sentAt: string;
  content: string;
  repliesCount: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  target: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
}
