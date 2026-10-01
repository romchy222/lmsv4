import React, { useState } from 'react';
import { useLMS } from '../../context/LMSContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  AlertTriangle,
  UserCheck,
  Calendar,
  Users,
  Clock,
  Send,
  FileSpreadsheet,
  CheckCircle2,
  PieChart,
  Activity,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { students, courses, selectedGroup, setSelectedGroup, calculateStudentBRS, calculateStudentAttendance, activeCourse, role } = useLMS();

  const [notificationSent, setNotificationSent] = useState<Record<string, boolean>>({});

  // Group calculation
  const groupStudents = students.filter((s) => s.group === selectedGroup);

  const gradeCounts = {
    excellent: 0, // 5
    good: 0, // 4
    satisfactory: 0, // 3
    failed: 0, // 2
  };

  let totalPointsSum = 0;
  let totalAttSum = 0;

  groupStudents.forEach((st) => {
    const brs = calculateStudentBRS(st.id);
    const att = calculateStudentAttendance(st.id);

    totalPointsSum += brs.totalPoints;
    totalAttSum += att.percentage;

    if (brs.percentage >= 85) gradeCounts.excellent++;
    else if (brs.percentage >= 70) gradeCounts.good++;
    else if (brs.percentage >= 55) gradeCounts.satisfactory++;
    else gradeCounts.failed++;
  });

  const avgPoints = groupStudents.length > 0 ? (totalPointsSum / groupStudents.length).toFixed(1) : 0;
  const avgAttendance = groupStudents.length > 0 ? Math.round(totalAttSum / groupStudents.length) : 0;

  // Students at risk
  const riskStudents = students.filter(
    (st) =>
      st.riskStatus === 'critical' ||
      st.riskStatus === 'warning' ||
      calculateStudentBRS(st.id).percentage < 55
  );

  const handleSendCuratorAlert = (studentId: string) => {
    setNotificationSent((prev) => ({ ...prev, [studentId]: true }));
    setTimeout(() => {
      setNotificationSent((prev) => ({ ...prev, [studentId]: false }));
    }, 3000);
  };

  const handleExportFullReport = () => {
    let csv = `Отчет об успеваемости и посещаемости группы ${selectedGroup}\n`;
    csv += `Дисциплина: ${activeCourse.title}\n`;
    csv += `Дата выгрузки: ${new Date().toLocaleDateString('ru-RU')}\n\n`;
    csv += `ФИО Студента;Группа;Балл БРС;ECTS;Оценка;Посещаемость (%);Статус активности\n`;

    groupStudents.forEach((st) => {
      const brs = calculateStudentBRS(st.id);
      const att = calculateStudentAttendance(st.id);
      csv += `${st.fullName};${st.group};${brs.totalPoints};${brs.ectsGrade};${brs.traditionalGrade};${att.percentage}%;${st.lastActivityDate}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Аналитический_отчет_${selectedGroup}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-700" />
              <h1 className="text-xl font-bold text-stone-900">
                {role === 'head_of_department' ? 'Аналитика кафедры и контроль успеваемости' : 'Отчетность и аналитика'}
              </h1>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Сводные данные успеваемости, анализ посещаемости, цифровой след студентов и предиктивная аналитика отчислений.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-stone-50 p-1 rounded-xl border border-stone-200 text-xs">
              <span className="text-stone-500 pl-2">Группа:</span>
              {(['ИВТ-401', 'ПИ-302'] as const).map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-3 py-1 font-semibold rounded-lg transition cursor-pointer ${
                    selectedGroup === grp ? 'bg-blue-900 text-white' : 'text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportFullReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl transition shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Выгрузить отчет (XLSX)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Средний балл БРС</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 font-mono">{avgPoints} б.</div>
          <p className="text-[11px] text-stone-400 mt-1">По шкале из 100 баллов</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Средняя посещаемость</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 font-mono">{avgAttendance}%</div>
          <p className="text-[11px] text-emerald-600 mt-1">↑ +4% выше среднего по факультету</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Качество успеваемости</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 font-mono">
            {groupStudents.length > 0
              ? Math.round(((gradeCounts.excellent + gradeCounts.good) / groupStudents.length) * 100)
              : 0}
            %
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Студенты на «4» и «5»</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Студенты в зоне риска</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2 font-mono">{gradeCounts.failed} чел.</div>
          <p className="text-[11px] text-rose-500 mt-1">Менее 55 баллов БРС</p>
        </div>
      </div>

      {/* Charts Section: Grade distribution & Attendance curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">
              Распределение оценок в группе {selectedGroup}
            </h3>
            <span className="text-xs text-stone-400">По шкале БРС</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Отлично (85 - 100 б.)
                </span>
                <span>
                  {gradeCounts.excellent} чел. (
                  {groupStudents.length > 0 ? Math.round((gradeCounts.excellent / groupStudents.length) * 100) : 0}%)
                </span>
              </div>
              <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${groupStudents.length > 0 ? (gradeCounts.excellent / groupStudents.length) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
                <span className="flex items-center gap-1.5 text-blue-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Хорошо (70 - 84 б.)
                </span>
                <span>
                  {gradeCounts.good} чел. (
                  {groupStudents.length > 0 ? Math.round((gradeCounts.good / groupStudents.length) * 100) : 0}%)
                </span>
              </div>
              <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${groupStudents.length > 0 ? (gradeCounts.good / groupStudents.length) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
                <span className="flex items-center gap-1.5 text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Удовлетворительно (55 - 69 б.)
                </span>
                <span>
                  {gradeCounts.satisfactory} чел. (
                  {groupStudents.length > 0
                    ? Math.round((gradeCounts.satisfactory / groupStudents.length) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${
                      groupStudents.length > 0 ? (gradeCounts.satisfactory / groupStudents.length) * 100 : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
                <span className="flex items-center gap-1.5 text-rose-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Неудовлетворительно (&lt; 55 б.)
                </span>
                <span>
                  {gradeCounts.failed} чел. (
                  {groupStudents.length > 0 ? Math.round((gradeCounts.failed / groupStudents.length) * 100) : 0}%)
                </span>
              </div>
              <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{
                    width: `${groupStudents.length > 0 ? (gradeCounts.failed / groupStudents.length) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Activity Metrics */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">Посещаемость по формам занятий</h3>
            <span className="text-xs text-stone-400">10 прошедших занятий</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-150 text-center space-y-1">
              <span className="text-xs font-bold text-indigo-900">Лекции (ЛК)</span>
              <div className="text-xl font-bold text-indigo-700 font-mono">92%</div>
              <span className="text-[10px] text-indigo-600 block">4 занятия</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-150 text-center space-y-1">
              <span className="text-xs font-bold text-amber-900">Лабораторные (ЛБ)</span>
              <div className="text-xl font-bold text-amber-700 font-mono">86%</div>
              <span className="text-[10px] text-amber-600 block">4 занятия</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-150 text-center space-y-1">
              <span className="text-xs font-bold text-emerald-900">Практики (ПР)</span>
              <div className="text-xl font-bold text-emerald-700 font-mono">88%</div>
              <span className="text-[10px] text-emerald-600 block">2 занятия</span>
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
            <p className="font-semibold text-stone-800">Цифровой след и активность в LMS:</p>
            <p className="text-[11px] text-stone-500">
              Материалы Модуля 1 скачали <span className="font-bold text-stone-800">96%</span> студентов. Тест №1
              завершили <span className="font-bold text-stone-800">88%</span> студентов.
            </p>
          </div>
        </div>
      </div>

      {/* Академическая группа риска (ТЗ 3.6) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-stone-900 text-base">
              Группа академического риска (угроза недопуска к сессии)
            </h3>
          </div>
          <span className="text-xs text-stone-500">Автоматический мониторинг</span>
        </div>

        <div className="space-y-3">
          {riskStudents.map((st) => {
            const brs = calculateStudentBRS(st.id);
            const att = calculateStudentAttendance(st.id);
            const isNotified = notificationSent[st.id];

            return (
              <div
                key={st.id}
                className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{st.fullName}</span>
                    <span className="font-mono text-stone-500 bg-white px-2 py-0.5 rounded border">
                      {st.group} • {st.recordBookNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                      Критический риск
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-stone-600 text-[11px] flex-wrap">
                    <span>
                      Балл БРС: <strong className="text-rose-700">{brs.totalPoints} б.</strong>
                    </span>
                    <span>
                      Посещаемость: <strong className="text-rose-700">{att.percentage}%</strong> ({att.present} из{' '}
                      {att.total})
                    </span>
                    <span>
                      Последний вход в LMS: <strong>{st.lastActivityDate}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isNotified ? (
                    <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1 bg-emerald-100 px-3 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Уведомление отправлено
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendCuratorAlert(st.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Уведомить куратора и студента</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
