import React, { useState } from 'react';
import { useLMS } from '../../context/LMSContext';
import {
  Calendar,
  Users,
  CheckCircle,
  FileSpreadsheet,
  Download,
  Plus,
  Sliders,
  Check,
  AlertCircle,
  History,
  TrendingUp,
  FileText,
  UserCheck,
} from 'lucide-react';
import { AttendanceStatus, GradeItem } from '../../types/lms';

export const JournalView: React.FC = () => {
  const {
    students,
    selectedGroup,
    setSelectedGroup,
    lessonDates,
    attendanceRecords,
    setAttendance,
    setBulkAttendance,
    gradeItems,
    studentGrades,
    updateGrade,
    addGradeItem,
    calculateStudentBRS,
    calculateStudentAttendance,
    activeCourse,
    brsScaleSettings,
    updateBrsScaleSettings,
    categoryWeights,
    updateCategoryWeights,
  } = useLMS();

  const [activeTab, setActiveTab] = useState<'attendance' | 'brs_grades'>('attendance');
  const [selectedDateForBulk, setSelectedDateForBulk] = useState<string>(lessonDates[0].date);
  const [showNewGradeModal, setShowNewGradeModal] = useState(false);
  const [newGradeName, setNewGradeName] = useState('');
  const [newGradeMax, setNewGradeMax] = useState(20);
  const [newGradeCat, setNewGradeCat] = useState<GradeItem['category']>('current');

  // BRS Settings Modal state
  const [showBrsSettingsModal, setShowBrsSettingsModal] = useState(false);
  const [tempScale, setTempScale] = useState(brsScaleSettings);
  const [tempWeights, setTempWeights] = useState(categoryWeights);

  // Filter students by selected group
  const groupStudents = students.filter((s) => s.group === selectedGroup);

  // Status mapping helpers
  const attendanceDisplay: Record<AttendanceStatus, { label: string; badge: string; text: string }> = {
    present: { label: 'П', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', text: 'Присутствовал' },
    absent: { label: 'Н', badge: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', text: 'Отсутствовал' },
    excused: { label: 'УП', badge: 'bg-amber-100 text-amber-800 border-amber-300', text: 'Уважительная причина' },
    late: { label: 'О', badge: 'bg-purple-100 text-purple-800 border-purple-300', text: 'Опоздал' },
  };

  const getAttendanceRecord = (studentId: string, date: string) => {
    return attendanceRecords.find((r) => r.studentId === studentId && r.lessonDate === date);
  };

  const cycleAttendance = (studentId: string, date: string) => {
    const current = getAttendanceRecord(studentId, date)?.status;
    const order: AttendanceStatus[] = ['present', 'absent', 'excused', 'late'];
    const nextIdx = current ? (order.indexOf(current) + 1) % order.length : 0;
    setAttendance(studentId, date, order[nextIdx]);
  };

  const handleExportCSV = () => {
    if (activeTab === 'attendance') {
      let csv = 'ФИО Студента;Группа;' + lessonDates.map((d) => `${d.date} (${d.type})`).join(';') + ';Посещаемость (%)\n';
      groupStudents.forEach((st) => {
        const row = [
          st.fullName,
          st.group,
          ...lessonDates.map((d) => {
            const rec = getAttendanceRecord(st.id, d.date);
            return rec ? attendanceDisplay[rec.status].label : '—';
          }),
          calculateStudentAttendance(st.id).percentage + '%',
        ];
        csv += row.join(';') + '\n';
      });

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Журнал_посещаемости_${selectedGroup}_${activeCourse.code}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      let csv = 'ФИО Студента;Группа;' + gradeItems.map((gi) => `${gi.name} [макс ${gi.maxPoints}]`).join(';') + ';Итого БРС;ECTS;Традиционная оценка\n';
      groupStudents.forEach((st) => {
        const brs = calculateStudentBRS(st.id);
        const gradesRow = gradeItems.map((gi) => {
          const g = studentGrades.find((gr) => gr.studentId === st.id && gr.gradeItemId === gi.id);
          return g ? g.points : 0;
        });
        const row = [st.fullName, st.group, ...gradesRow, `${brs.totalPoints}/${brs.maxPoints}`, brs.ectsGrade, brs.traditionalGrade];
        csv += row.join(';') + '\n';
      });

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ведомость_БРС_${selectedGroup}_${activeCourse.code}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAddNewGradeItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradeName.trim()) return;
    addGradeItem({
      name: newGradeName,
      maxPoints: Number(newGradeMax),
      weightPercent: 20,
      category: newGradeCat,
      date: new Date().toLocaleDateString('ru-RU'),
    });
    setNewGradeName('');
    setShowNewGradeModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                {activeCourse.code}
              </span>
              <h1 className="text-xl font-bold text-stone-900">Электронный журнал и БРС</h1>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Дисциплина: {activeCourse.title} • Учебный год 2025/2026
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Group Selector */}
            <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-xl border border-stone-200">
              <span className="text-xs text-stone-500 font-medium pl-2">Группа:</span>
              {(['ИВТ-401', 'ПИ-302'] as const).map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    selectedGroup === grp
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>

            {/* Export button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl transition shadow-2xs cursor-pointer"
              title="Выгрузить данные в формате Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Экспорт XLSX / CSV</span>
            </button>
          </div>
        </div>

        {/* View mode tabs: Посещаемость vs БРС */}
        <div className="flex items-center gap-2 border-t border-stone-200 mt-6 pt-4">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'attendance'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Журнал посещаемости</span>
          </button>

          <button
            onClick={() => setActiveTab('brs_grades')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'brs_grades'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Балльно-рейтинговая система (БРС)</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Журнал посещаемости (ТЗ 3.3) */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          {/* Attendance Toolbar: Bulk action & Legend */}
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            {/* Legend */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-stone-500 font-medium">Обозначения:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                П — Присутствовал
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                Н — Отсутствовал
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                УП — Уважительная причина
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-purple-800 bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
                О — Опоздал
              </span>
            </div>

            {/* Mass marking (Массовая простановка) */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-stone-600 font-medium">Массовая отметка на:</span>
              <select
                value={selectedDateForBulk}
                onChange={(e) => setSelectedDateForBulk(e.target.value)}
                className="text-xs font-semibold bg-stone-50 border rounded px-2 py-1"
              >
                {lessonDates.map((d) => (
                  <option key={d.date} value={d.date}>
                    {d.date} ({d.type})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setBulkAttendance(selectedDateForBulk, 'present')}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition cursor-pointer"
                title="Отметить всех студентов группы присутствующими"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Все присутствуют (П)</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider">
                  <th className="p-3 sticky left-0 bg-stone-100 z-10 w-12 text-center">№</th>
                  <th className="p-3 sticky left-12 bg-stone-100 z-10 min-w-[200px]">ФИО Студента</th>
                  <th className="p-3 min-w-[90px]">Зачетка</th>
                  {lessonDates.map((item) => (
                    <th key={item.date} className="p-2 text-center min-w-[54px] border-l border-stone-200">
                      <div>{item.date}</div>
                      <div className="text-[10px] text-stone-400 font-normal">{item.type}</div>
                    </th>
                  ))}
                  <th className="p-3 text-center min-w-[100px] border-l border-stone-200 bg-stone-50">
                    Итог (% посещ.)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {groupStudents.map((student, sIdx) => {
                  const att = calculateStudentAttendance(student.id);

                  return (
                    <tr key={student.id} className="hover:bg-blue-50/30 transition">
                      <td className="p-3 text-center sticky left-0 bg-white text-stone-400 font-mono text-xs">
                        {sIdx + 1}
                      </td>
                      <td className="p-3 sticky left-12 bg-white font-medium text-stone-900 whitespace-nowrap">
                        {student.fullName}
                      </td>
                      <td className="p-3 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                        {student.recordBookNumber}
                      </td>

                      {lessonDates.map((item) => {
                        const rec = getAttendanceRecord(student.id, item.date);
                        const status = rec?.status;

                        return (
                          <td
                            key={item.date}
                            onClick={() => cycleAttendance(student.id, item.date)}
                            className="p-1 text-center border-l border-stone-200 cursor-pointer hover:bg-stone-100 transition select-none"
                            title={`Кликните для смены отметки (П -> Н -> УП -> О) ${rec?.note ? `\nЗаметка: ${rec.note}` : ''}`}
                          >
                            {status ? (
                              <span
                                className={`inline-block w-8 py-1 rounded text-xs font-bold border ${attendanceDisplay[status].badge}`}
                              >
                                {attendanceDisplay[status].label}
                              </span>
                            ) : (
                              <span className="text-stone-300 hover:text-stone-500 font-mono">—</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="p-3 text-center border-l border-stone-200 bg-stone-50/50">
                        <div className="flex items-center justify-center gap-1.5 font-bold">
                          <span
                            className={
                              att.percentage >= 80
                                ? 'text-emerald-700'
                                : att.percentage >= 60
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }
                          >
                            {att.percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mode 2: Балльно-рейтинговая система (БРС) (ТЗ 3.3) */}
      {activeTab === 'brs_grades' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            {/* BRS Toolbar */}
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-stone-700 font-semibold">Шкала БРС ВУЗа:</span>
                <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-medium">
                  85-100 б. = «5 (Отлично) / ECTS A, B»
                </span>
                <span className="text-blue-800 bg-blue-100 px-2 py-0.5 rounded font-medium">
                  70-84 б. = «4 (Хорошо) / ECTS C»
                </span>
                <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-medium">
                  55-69 б. = «3 (Удовл.) / ECTS D, E»
                </span>
                <span className="text-rose-800 bg-rose-100 px-2 py-0.5 rounded font-medium">
                  &lt; 55 б. = «2 (Неуд.) / FX»
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setTempScale(brsScaleSettings);
                    setTempWeights(categoryWeights);
                    setShowBrsSettingsModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold text-xs transition cursor-pointer border border-stone-300"
                  title="Настройка весов категорий и порогов шкалы БРС"
                >
                  <Sliders className="w-3.5 h-3.5 text-stone-600" />
                  <span>Веса и шкала БРС</span>
                </button>

                <button
                  onClick={() => setShowNewGradeModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить КТ / Задание в БРС</span>
                </button>
              </div>
            </div>

            {/* BRS Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider">
                    <th className="p-3 sticky left-0 bg-stone-100 z-10 w-12 text-center">№</th>
                    <th className="p-3 sticky left-12 bg-stone-100 z-10 min-w-[200px]">ФИО Студента</th>
                    <th className="p-3 min-w-[80px]">Зачетка</th>
                    {gradeItems.map((gi) => (
                      <th key={gi.id} className="p-2.5 text-center min-w-[110px] border-l border-stone-200">
                        <div className="font-semibold text-stone-900 leading-snug">{gi.name}</div>
                        <div className="text-[10px] text-blue-700 font-mono mt-0.5">макс. {gi.maxPoints} б.</div>
                      </th>
                    ))}
                    <th className="p-3 text-center min-w-[90px] border-l border-stone-200 bg-blue-50/50 text-blue-900">
                      Итог БРС
                    </th>
                    <th className="p-3 text-center min-w-[70px] border-l border-stone-200 bg-stone-50">ECTS</th>
                    <th className="p-3 text-center min-w-[110px] border-l border-stone-200 bg-stone-50">
                      Аттестация
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {groupStudents.map((student, sIdx) => {
                    const brs = calculateStudentBRS(student.id);

                    return (
                      <tr key={student.id} className="hover:bg-blue-50/30 transition">
                        <td className="p-3 text-center sticky left-0 bg-white text-stone-400 font-mono">
                          {sIdx + 1}
                        </td>
                        <td className="p-3 sticky left-12 bg-white font-medium text-stone-900 whitespace-nowrap">
                          {student.fullName}
                        </td>
                        <td className="p-3 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                          {student.recordBookNumber}
                        </td>

                        {/* Grade points inputs */}
                        {gradeItems.map((gi) => {
                          const record = studentGrades.find(
                            (g) => g.studentId === student.id && g.gradeItemId === gi.id
                          );
                          const currentVal = record ? record.points : 0;

                          return (
                            <td key={gi.id} className="p-1.5 text-center border-l border-stone-200">
                              <input
                                type="number"
                                min={0}
                                max={gi.maxPoints}
                                value={currentVal}
                                onChange={(e) => {
                                  const val = Math.min(gi.maxPoints, Math.max(0, Number(e.target.value)));
                                  updateGrade(student.id, gi.id, val);
                                }}
                                className="w-16 text-center font-bold text-xs py-1 px-1 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                              />
                            </td>
                          );
                        })}

                        {/* Calculated total points */}
                        <td className="p-3 text-center border-l border-stone-200 bg-blue-50/30 font-bold text-blue-950 font-mono text-sm">
                          {brs.totalPoints}{' '}
                          <span className="text-[10px] text-stone-400 font-normal">/ {brs.maxPoints}</span>
                        </td>

                        {/* ECTS Grade */}
                        <td className="p-3 text-center border-l border-stone-200 bg-stone-50/30">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                              brs.ectsGrade === 'A' || brs.ectsGrade === 'B'
                                ? 'bg-emerald-100 text-emerald-800'
                                : brs.ectsGrade === 'C'
                                ? 'bg-blue-100 text-blue-800'
                                : brs.ectsGrade === 'D' || brs.ectsGrade === 'E'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {brs.ectsGrade}
                          </span>
                        </td>

                        {/* Traditional grade label */}
                        <td className="p-3 text-center border-l border-stone-200 bg-stone-50/30 whitespace-nowrap">
                          <span
                            className={`font-semibold text-xs ${
                              brs.passStatus ? 'text-stone-900' : 'text-rose-600 font-bold'
                            }`}
                          >
                            {brs.traditionalGrade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Добавить новый элемент БРС */}
      {showNewGradeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-stone-900 text-base">Добавить контрольное мероприятие в БРС</h3>
            <form onSubmit={handleAddNewGradeItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Название контрольной точки</label>
                <input
                  type="text"
                  required
                  placeholder="например: Коллоквиум по разделу 2"
                  value={newGradeName}
                  onChange={(e) => setNewGradeName(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Максимальный балл</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={50}
                  value={newGradeMax}
                  onChange={(e) => setNewGradeMax(Number(e.target.value))}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Категория контроля</label>
                <select
                  value={newGradeCat}
                  onChange={(e) => setNewGradeCat(e.target.value as any)}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="current">Текущий контроль (лабораторная, тест)</option>
                  <option value="milestone">Рубежный контроль (коллоквиум, КТ)</option>
                  <option value="term_paper">Курсовая работа / проект</option>
                  <option value="exam">Итоговый контроль (экзамен / зачет)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewGradeModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Настройка шкалы и весов БРС (ТЗ 3.3) */}
      {showBrsSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-800" />
                <h3 className="font-bold text-stone-900 text-base">Настройка весов и шкалы оценивания БРС</h3>
              </div>
              <button onClick={() => setShowBrsSettingsModal(false)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            {/* Thresholds */}
            <div className="space-y-3">
              <h4 className="font-bold text-stone-800 uppercase tracking-wide text-[11px]">
                Пороговые значения 100-балльной шкалы и ECTS:
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="font-semibold text-emerald-900 block mb-1">«Отлично» (5 / A, B)</span>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-500">от</span>
                    <input
                      type="number"
                      min={70}
                      max={95}
                      value={tempScale.excellentThreshold}
                      onChange={(e) => setTempScale({ ...tempScale, excellentThreshold: Number(e.target.value) })}
                      className="w-16 p-1 text-center font-bold bg-white rounded border border-emerald-300"
                    />
                    <span className="text-stone-500">б.</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <span className="font-semibold text-blue-900 block mb-1">«Хорошо» (4 / C)</span>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-500">от</span>
                    <input
                      type="number"
                      min={60}
                      max={85}
                      value={tempScale.goodThreshold}
                      onChange={(e) => setTempScale({ ...tempScale, goodThreshold: Number(e.target.value) })}
                      className="w-16 p-1 text-center font-bold bg-white rounded border border-blue-300"
                    />
                    <span className="text-stone-500">б.</span>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="font-semibold text-amber-900 block mb-1">«Удовл.» (3 / D, E)</span>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-500">от</span>
                    <input
                      type="number"
                      min={40}
                      max={70}
                      value={tempScale.satisfactoryThreshold}
                      onChange={(e) => setTempScale({ ...tempScale, satisfactoryThreshold: Number(e.target.value) })}
                      className="w-16 p-1 text-center font-bold bg-white rounded border border-amber-300"
                    />
                    <span className="text-stone-500">б.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Weights */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-800 uppercase tracking-wide text-[11px]">
                  Веса категорий контроля в итоговом рейтинге:
                </h4>
                <span className="text-[11px] font-bold text-blue-900 font-mono">
                  Сумма: {tempWeights.current + tempWeights.milestone + tempWeights.term_paper + tempWeights.exam}%
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Текущий контроль (лабораторные, тесты):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={tempWeights.current}
                      onChange={(e) => setTempWeights({ ...tempWeights, current: Number(e.target.value) })}
                      className="w-16 p-1 text-center font-bold border rounded bg-stone-50"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Рубежный контроль (коллоквиумы, КТ):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={tempWeights.milestone}
                      onChange={(e) => setTempWeights({ ...tempWeights, milestone: Number(e.target.value) })}
                      className="w-16 p-1 text-center font-bold border rounded bg-stone-50"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Курсовой проект / СРС:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={tempWeights.term_paper}
                      onChange={(e) => setTempWeights({ ...tempWeights, term_paper: Number(e.target.value) })}
                      className="w-16 p-1 text-center font-bold border rounded bg-stone-50"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Итоговый экзамен / Зачет:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={tempWeights.exam}
                      onChange={(e) => setTempWeights({ ...tempWeights, exam: Number(e.target.value) })}
                      className="w-16 p-1 text-center font-bold border rounded bg-stone-50"
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowBrsSettingsModal(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  updateBrsScaleSettings(tempScale);
                  updateCategoryWeights(tempWeights);
                  setShowBrsSettingsModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800"
              >
                Применить настройки
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
