import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Course,
  Student,
  TimetableItem,
  AttendanceRecord,
  AttendanceStatus,
  GradeItem,
  StudentGrade,
  Submission,
  ExamStatement,
  Announcement,
  ForumMessage,
  AuditLogEntry,
  Role,
  CourseModuleItem,
  TestQuestion,
} from '../types/lms';
import {
  initialTeacherProfile,
  initialStudents,
  initialTimetable,
  initialCourses,
  initialGradeItems,
  initialStudentGrades,
  initialLessonDates,
  initialAttendanceRecords,
  initialSubmissions,
  initialExamStatements,
  initialAnnouncements,
  initialForumMessages,
  initialAuditLogs,
} from '../data/initialData';
import confetti from 'canvas-confetti';

export interface AccessibilitySettings {
  enabled: boolean;
  fontSize: 'normal' | 'large' | 'huge';
  contrastTheme: 'standard' | 'contrast_black_white' | 'contrast_yellow_black';
  fontFamily: 'sans' | 'serif';
}

export interface SystemSyncState {
  oneC: { status: 'synced' | 'syncing' | 'error'; lastSyncTime: string; recordsSynced: number };
  antiplagiat: { status: 'connected' | 'checking'; queueCount: number; dailyQuotaUsed: string };
  sso: { status: 'active'; domain: string; activeSessions: number };
  ebs: { status: 'connected'; provider: string; booksLinked: number };
}

export interface StudentBRSSummary {
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  ectsGrade: string; // A, B, C, D, E, FX, F
  traditionalGrade: string; // '5 (Отлично)', '4 (Хорошо)', '3 (Удовл.)', '2 (Неуд.)'
  traditionalValue: number; // 5, 4, 3, 2
  passStatus: boolean;
}

interface LMSContextType {
  role: Role;
  setRole: (role: Role) => void;
  profile: UserProfile;
  courses: Course[];
  activeCourseId: string;
  setActiveCourseId: (id: string) => void;
  activeCourse: Course;
  students: Student[];
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  timetable: TimetableItem[];
  lessonDates: { date: string; type: 'ЛК' | 'ПР' | 'ЛБ' }[];
  attendanceRecords: AttendanceRecord[];
  setAttendance: (studentId: string, date: string, status: AttendanceStatus, note?: string) => void;
  setBulkAttendance: (date: string, status: AttendanceStatus) => void;
  gradeItems: GradeItem[];
  studentGrades: StudentGrade[];
  updateGrade: (studentId: string, gradeItemId: string, points: number) => void;
  addGradeItem: (item: Omit<GradeItem, 'id'>) => void;
  submissions: Submission[];
  gradeSubmission: (submissionId: string, score: number, feedback: string, rubricScores: number[]) => void;
  sendSubmissionForRevision: (submissionId: string, feedback: string) => void;
  examStatements: ExamStatement[];
  signExamStatementWithEDS: (statementId: string, certSerial: string) => Promise<boolean>;
  announcements: Announcement[];
  addAnnouncement: (item: Omit<Announcement, 'id' | 'publishedAt' | 'viewsCount'>) => void;
  forumMessages: ForumMessage[];
  addForumMessage: (topic: string, content: string) => void;
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, target: string, oldValue?: string, newValue?: string) => void;
  accessibility: AccessibilitySettings;
  updateAccessibility: (updater: Partial<AccessibilitySettings>) => void;
  systemSyncStatus: {
    oneC: { status: 'synced' | 'syncing' | 'error'; lastSyncTime: string; recordsSynced: number };
    antiplagiat: { status: 'connected' | 'checking'; queueCount: number; dailyQuotaUsed: string };
    sso: { status: 'active'; domain: string; activeSessions: number };
    ebs: { status: 'connected'; provider: string; booksLinked: number };
  };
  syncOneC: () => void;
  triggerAntiplagiatCheck: (submissionId: string) => void;
  calculateStudentBRS: (studentId: string) => StudentBRSSummary;
  calculateStudentAttendance: (studentId: string) => { total: number; present: number; percentage: number };
  addCourseModuleItem: (courseId: string, moduleId: string, item: Omit<CourseModuleItem, 'id'>) => void;
  addTestQuestion: (courseId: string, testId: string, question: TestQuestion) => void;
  toggleKumApproval: (courseId: string) => void;
  brsScaleSettings: { excellentThreshold: number; goodThreshold: number; satisfactoryThreshold: number };
  updateBrsScaleSettings: (settings: { excellentThreshold: number; goodThreshold: number; satisfactoryThreshold: number }) => void;
  categoryWeights: { current: number; milestone: number; term_paper: number; exam: number };
  updateCategoryWeights: (weights: { current: number; milestone: number; term_paper: number; exam: number }) => void;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

export const LMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('teacher');
  const [profile] = useState<UserProfile>(initialTeacherProfile);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [activeCourseId, setActiveCourseId] = useState<string>('course-1');
  const [students] = useState<Student[]>(initialStudents);
  const [selectedGroup, setSelectedGroup] = useState<string>('ИВТ-401');
  const [timetable, setTimetable] = useState<TimetableItem[]>(initialTimetable);
  const [lessonDates] = useState(initialLessonDates);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);
  const [gradeItems, setGradeItems] = useState<GradeItem[]>(initialGradeItems);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>(initialStudentGrades);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [examStatements, setExamStatements] = useState<ExamStatement[]>(initialExamStatements);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>(initialForumMessages);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    enabled: false,
    fontSize: 'normal',
    contrastTheme: 'standard',
    fontFamily: 'sans',
  });

  const [systemSyncStatus, setSystemSyncStatus] = useState<SystemSyncState>({
    oneC: { status: 'synced', lastSyncTime: 'Сегодня, 10:15', recordsSynced: 38 },
    antiplagiat: { status: 'connected', queueCount: 0, dailyQuotaUsed: '14 / 100 проверок' },
    sso: { status: 'active', domain: 'CORP.UNIVERSITY.EDU.RU (Active Directory)', activeSessions: 418 },
    ebs: { status: 'connected', provider: 'ЭБС «Лань» + «Znanium»', booksLinked: 12 },
  });

  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  const addAuditLog = (action: string, target: string, oldValue?: string, newValue?: string) => {
    const newLog: AuditLogEntry = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU'),
      user: profile.fullName,
      role: role === 'teacher' ? 'Преподаватель (ППС)' : role === 'head_of_department' ? 'Зав. кафедрой' : 'Администратор',
      action,
      target,
      oldValue: oldValue || '—',
      newValue: newValue || '—',
      ipAddress: '192.168.10.42 (Клиент ППС)',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const updateAccessibility = (updater: Partial<AccessibilitySettings>) => {
    setAccessibility((prev) => ({ ...prev, ...updater }));
  };

  const setAttendance = (studentId: string, date: string, status: AttendanceStatus, note?: string) => {
    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.studentId === studentId && r.lessonDate === date);
      const studentName = students.find((s) => s.id === studentId)?.fullName || studentId;
      if (existingIdx >= 0) {
        const oldStatus = prev[existingIdx].status;
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status,
          note: note !== undefined ? note : updated[existingIdx].note,
        };
        addAuditLog('Корректировка посещаемости', `${studentName} на ${date}`, oldStatus, status);
        return updated;
      } else {
        addAuditLog('Отметка посещаемости', `${studentName} на ${date}`, 'Не выставлено', status);
        return [
          ...prev,
          {
            studentId,
            lessonDate: date,
            lessonType: 'Лекция',
            status,
            note,
          },
        ];
      }
    });
  };

  const setBulkAttendance = (date: string, status: AttendanceStatus) => {
    const groupStudents = students.filter((s) => s.group === selectedGroup);
    groupStudents.forEach((student) => {
      setAttendance(student.id, date, status);
    });
    addAuditLog('Массовая отметка посещаемости', `Группа ${selectedGroup}, дата ${date}`, '—', `Все отмечены: ${status}`);
  };

  const updateGrade = (studentId: string, gradeItemId: string, points: number) => {
    const student = students.find((s) => s.id === studentId);
    const item = gradeItems.find((g) => g.id === gradeItemId);
    const existing = studentGrades.find((g) => g.studentId === studentId && g.gradeItemId === gradeItemId);
    const oldVal = existing ? `${existing.points} б.` : '0 б.';

    setStudentGrades((prev) => {
      const idx = prev.findIndex((g) => g.studentId === studentId && g.gradeItemId === gradeItemId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          points,
          updatedAt: new Date().toLocaleDateString('ru-RU'),
          updatedBy: profile.fullName,
        };
        return next;
      }
      return [
        ...prev,
        {
          studentId,
          gradeItemId,
          points,
          updatedAt: new Date().toLocaleDateString('ru-RU'),
          updatedBy: profile.fullName,
        },
      ];
    });

    addAuditLog(
      'Изменение балла БРС',
      `${student?.fullName || studentId} -> ${item?.name || gradeItemId}`,
      oldVal,
      `${points} б. (из ${item?.maxPoints || 20})`
    );
  };

  const addGradeItem = (item: Omit<GradeItem, 'id'>) => {
    const newItem: GradeItem = {
      ...item,
      id: 'gi-' + Date.now(),
    };
    setGradeItems((prev) => [...prev, newItem]);
    addAuditLog('Создание элемента БРС', newItem.name, '—', `Макс: ${newItem.maxPoints} б.`);
  };

  const gradeSubmission = (submissionId: string, score: number, feedback: string, rubricScores: number[]) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;
        const updatedRubric = sub.rubric.map((r, i) => ({
          ...r,
          awardedScore: rubricScores[i] !== undefined ? rubricScores[i] : r.awardedScore,
        }));
        return {
          ...sub,
          status: 'graded',
          score,
          feedback,
          rubric: updatedRubric,
        };
      })
    );

    const sub = submissions.find((s) => s.id === submissionId);
    if (sub) {
      const student = students.find((s) => s.id === sub.studentId);
      // Link to grade item for Lab 2 if matching
      const targetGradeItem = gradeItems.find((gi) => gi.name.includes('Лабораторная работа №2')) || gradeItems[1];
      if (targetGradeItem) {
        updateGrade(sub.studentId, targetGradeItem.id, score);
      }
      addAuditLog(
        'Проверка работы студента',
        `${student?.fullName || sub.studentId} -> ${sub.assignmentTitle}`,
        'На проверке',
        `Оценка: ${score}/${sub.maxScore} б.`
      );
    }
  };

  const sendSubmissionForRevision = (submissionId: string, feedback: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === submissionId ? { ...sub, status: 'revision_needed', feedback } : sub))
    );
    const sub = submissions.find((s) => s.id === submissionId);
    const student = students.find((s) => s.id === sub?.studentId);
    addAuditLog(
      'Возврат работы на доработку',
      `${student?.fullName || 'Студент'} -> ${sub?.assignmentTitle}`,
      'На проверке',
      'Возвращено с замечанием'
    );
  };

  const signExamStatementWithEDS = async (statementId: string, certSerial: string): Promise<boolean> => {
    // Generate realistic electronic stamp
    const timestamp = new Date().toLocaleString('ru-RU') + ' MSK';
    const fakeHash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    setExamStatements((prev) =>
      prev.map((stmt) => {
        if (stmt.id !== statementId) return stmt;
        return {
          ...stmt,
          isSigned: true,
          signedAt: timestamp,
          status: 'signed_locked',
          digitalSignatureStamp: {
            signatureHash: fakeHash,
            certificateSerial: certSerial || profile.digitalCertificate.serialNumber,
            signerName: `${profile.fullName} (${profile.academicDegree})`,
            timestamp,
            organization: 'ФГАОУ ВО Национальный Исследовательский Университет',
          },
        };
      })
    );

    addAuditLog(
      'Подписание экзаменационной ведомости ЭЦП ГОСТ Р 34.10',
      `Ведомость ${statementId}`,
      'Готова к подписанию',
      `Подписано ЭЦП: ${certSerial} (${timestamp})`
    );

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore in non-browser envs
    }

    return true;
  };

  const addAnnouncement = (item: Omit<Announcement, 'id' | 'publishedAt' | 'viewsCount'>) => {
    const newAnn: Announcement = {
      ...item,
      id: 'ann-' + Date.now(),
      publishedAt: 'Только что',
      viewsCount: 1,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    addAuditLog('Публикация объявления', newAnn.title, '—', `Для: ${newAnn.groupTarget}`);
  };

  const addForumMessage = (topic: string, content: string) => {
    const newMsg: ForumMessage = {
      id: 'fm-' + Date.now(),
      disciplineId: activeCourseId,
      topic,
      senderName: `${profile.fullName} (${profile.academicDegree})`,
      senderRole: 'teacher',
      sentAt: 'Только что',
      content,
      repliesCount: 0,
    };
    setForumMessages((prev) => [newMsg, ...prev]);
    addAuditLog('Сообщение на форуме курса', topic, '—', 'Преподаватель ответил в тред');
  };

  const syncOneC = () => {
    setSystemSyncStatus((prev) => ({
      ...prev,
      oneC: { ...prev.oneC, status: 'syncing' },
    }));

    setTimeout(() => {
      setSystemSyncStatus((prev) => ({
        ...prev,
        oneC: {
          status: 'synced',
          lastSyncTime: 'Только что',
          recordsSynced: 42,
        },
      }));
      addAuditLog(
        'Синхронизация АСУ ВУЗ / 1С:Университет',
        'Контингент студентов и расписание',
        'Синхронизировано',
        'Успешно получены 42 записи'
      );
    }, 1200);
  };

  const triggerAntiplagiatCheck = (submissionId: string) => {
    setSystemSyncStatus((prev) => ({
      ...prev,
      antiplagiat: { ...prev.antiplagiat, status: 'checking', queueCount: 1 },
    }));

    setTimeout(() => {
      setSubmissions((prev) =>
        prev.map((s) => {
          if (s.id !== submissionId) return s;
          return {
            ...s,
            plagiarismReport: {
              ...s.plagiarismReport,
              originalityPercent: 88.5,
              borrowingPercent: 7.2,
              citationPercent: 4.3,
              status: 'passed',
              checkedAt: 'Только что',
            },
          };
        })
      );

      setSystemSyncStatus((prev) => ({
        ...prev,
        antiplagiat: { ...prev.antiplagiat, status: 'connected', queueCount: 0 },
      }));

      addAuditLog('Проверка Антиплагиат.ВУЗ', `Работа ID: ${submissionId}`, 'В очереди', 'Оригинальность: 88.5% (Пройдено)');
    }, 1500);
  };

  const [brsScaleSettings, setBrsScaleSettings] = useState({
    excellentThreshold: 85,
    goodThreshold: 70,
    satisfactoryThreshold: 55,
  });

  const [categoryWeights, setCategoryWeights] = useState({
    current: 40,
    milestone: 20,
    term_paper: 20,
    exam: 20,
  });

  const updateBrsScaleSettings = (settings: { excellentThreshold: number; goodThreshold: number; satisfactoryThreshold: number }) => {
    setBrsScaleSettings(settings);
    addAuditLog('Обновление порогов шкалы БРС', 'Шкала 100-балльная / ECTS', '—', `Отл: ${settings.excellentThreshold}, Хор: ${settings.goodThreshold}, Удовл: ${settings.satisfactoryThreshold}`);
  };

  const updateCategoryWeights = (weights: { current: number; milestone: number; term_paper: number; exam: number }) => {
    setCategoryWeights(weights);
    addAuditLog('Обновление весов категорий БРС', 'Веса видов контроля', '—', `Тек: ${weights.current}%, Руб: ${weights.milestone}%, Экз: ${weights.exam}%`);
  };

  const addTestQuestion = (courseId: string, testId: string, question: TestQuestion) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          tests: c.tests.map((t) => {
            if (t.id !== testId) return t;
            return {
              ...t,
              questions: [...t.questions, question],
            };
          }),
        };
      })
    );
    addAuditLog('Добавление вопроса в банк тестов', question.questionText.slice(0, 40) + '...', '—', `Тип: ${question.type}`);
  };

  const toggleKumApproval = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const nextStatus = !c.kumApproved;
        addAuditLog(
          nextStatus ? 'Утверждение КУМ дисциплины' : 'Отзыв утверждения КУМ',
          c.title,
          c.kumApproved ? 'Утверждено' : 'На согласовании',
          nextStatus ? 'Утверждено заведующим кафедрой' : 'На согласовании'
        );
        return { ...c, kumApproved: nextStatus };
      })
    );
  };

  const calculateStudentBRS = (studentId: string): StudentBRSSummary => {
    const grades = studentGrades.filter((g) => g.studentId === studentId);
    let totalPoints = 0;
    let maxPoints = 0;

    gradeItems.forEach((item) => {
      maxPoints += item.maxPoints;
      const g = grades.find((gr) => gr.gradeItemId === item.id);
      if (g) {
        totalPoints += g.points;
      }
    });

    const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

    let ectsGrade = 'F';
    let traditionalGrade = '2 (Неуд.)';
    let traditionalValue = 2;
    let passStatus = false;

    if (percentage >= 90) {
      ectsGrade = 'A';
      traditionalGrade = '5 (Отлично)';
      traditionalValue = 5;
      passStatus = true;
    } else if (percentage >= brsScaleSettings.excellentThreshold) {
      ectsGrade = 'B';
      traditionalGrade = '5 (Отлично)';
      traditionalValue = 5;
      passStatus = true;
    } else if (percentage >= brsScaleSettings.goodThreshold) {
      ectsGrade = 'C';
      traditionalGrade = '4 (Хорошо)';
      traditionalValue = 4;
      passStatus = true;
    } else if (percentage >= 60) {
      ectsGrade = 'D';
      traditionalGrade = '3 (Удовл.)';
      traditionalValue = 3;
      passStatus = true;
    } else if (percentage >= brsScaleSettings.satisfactoryThreshold) {
      ectsGrade = 'E';
      traditionalGrade = '3 (Удовл.)';
      traditionalValue = 3;
      passStatus = true;
    } else {
      ectsGrade = 'FX';
      traditionalGrade = '2 (Неуд.)';
      traditionalValue = 2;
      passStatus = false;
    }

    return {
      totalPoints,
      maxPoints,
      percentage,
      ectsGrade,
      traditionalGrade,
      traditionalValue,
      passStatus,
    };
  };

  const calculateStudentAttendance = (studentId: string) => {
    const studentRecords = attendanceRecords.filter((r) => r.studentId === studentId);
    const total = lessonDates.length;
    const present = studentRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, percentage };
  };

  const addCourseModuleItem = (courseId: string, moduleId: string, item: Omit<CourseModuleItem, 'id'>) => {
    const newItem: CourseModuleItem = {
      ...item,
      id: 'item-' + Date.now(),
    };

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          modules: c.modules.map((m) => {
            if (m.id !== moduleId) return m;
            return {
              ...m,
              items: [...m.items, newItem],
            };
          }),
        };
      })
    );

    addAuditLog('Добавление учебного материала', newItem.title, '—', `В модуль ${moduleId}`);
  };

  return (
    <LMSContext.Provider
      value={{
        role,
        setRole,
        profile,
        courses,
        activeCourseId,
        setActiveCourseId,
        activeCourse,
        students,
        selectedGroup,
        setSelectedGroup,
        timetable,
        lessonDates,
        attendanceRecords,
        setAttendance,
        setBulkAttendance,
        gradeItems,
        studentGrades,
        updateGrade,
        addGradeItem,
        submissions,
        gradeSubmission,
        sendSubmissionForRevision,
        examStatements,
        signExamStatementWithEDS,
        announcements,
        addAnnouncement,
        forumMessages,
        addForumMessage,
        auditLogs,
        addAuditLog,
        accessibility,
        updateAccessibility,
        systemSyncStatus,
        syncOneC,
        triggerAntiplagiatCheck,
        calculateStudentBRS,
        calculateStudentAttendance,
        addCourseModuleItem,
        addTestQuestion,
        toggleKumApproval,
        brsScaleSettings,
        updateBrsScaleSettings,
        categoryWeights,
        updateCategoryWeights,
      }}
    >
      {children}
    </LMSContext.Provider>
  );
};

export const useLMS = () => {
  const context = useContext(LMSContext);
  if (!context) {
    throw new Error('useLMS must be used within an LMSProvider');
  }
  return context;
};
