import React from 'react';
import { useLMS } from '../../context/LMSContext';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  FileCheck2,
  AlertCircle,
  ExternalLink,
  Users,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Sparkles,
  RefreshCw,
  BellRing,
  Award,
} from 'lucide-react';
import { TabType } from '../Navigation';

interface DashboardViewProps {
  onNavigate: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    profile,
    timetable,
    courses,
    submissions,
    examStatements,
    students,
    role,
    syncOneC,
    systemSyncStatus,
    setActiveCourseId,
    setSelectedGroup,
    addAuditLog,
  } = useLMS();

  const [curatorNotified, setCuratorNotified] = React.useState(false);

  const handleSendCuratorNotice = () => {
    setCuratorNotified(true);
    addAuditLog(
      'Экстренное оповещение куратора',
      'Студенты группы риска (Волков М.С., Дмитриев А.В.)',
      '—',
      'Официальное уведомление куратору и в деканат направлено'
    );
    setTimeout(() => setCuratorNotified(false), 3500);
  };

  const pendingSubmissions = submissions.filter((s) => s.status === 'submitted');
  const unsignedStatements = examStatements.filter((s) => !s.isSigned);
  const criticalStudents = students.filter((s) => s.riskStatus === 'critical' || s.riskStatus === 'warning');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none transform translate-x-32 -translate-y-32"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-medium backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Цифровое рабочее место ППС • ФГОС ВО 3++</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Здравствуйте, {profile.fullName.split(' ')[0]} {profile.fullName.split(' ')[1]}!
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              {role === 'head_of_department' ? (
                <>Панель заведующего кафедрой: мониторинг выполнения учебных планов, согласование КУМ и аудит сессионных ведомостей.</>
              ) : role === 'admin' ? (
                <>Панель администратора: мониторинг интеграционных шлюзов (1С:Университет, Антиплагиат.ВУЗ, SSO) и аудит ФЗ-152.</>
              ) : (
                <>
                  Сегодня запланировано <span className="font-semibold text-white">3 учебных занятия</span>. На проверке{' '}
                  <span className="font-semibold text-amber-300">{pendingSubmissions.length} студенческие работы</span> с отчетами Антиплагиата.
                </>
              )}
            </p>
          </div>

          {/* Quick Stats / Action */}
          <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
            <button
              onClick={() => onNavigate('submissions')}
              className="flex items-center justify-between gap-3 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xs px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-300" />
                <span>Работ на проверке:</span>
              </div>
              <span className="bg-amber-400 text-stone-900 font-bold px-2 py-0.5 rounded-full text-xs">
                {pendingSubmissions.length}
              </span>
            </button>

            <button
              onClick={() => onNavigate('exams')}
              className="flex items-center justify-between gap-3 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xs px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-300" />
                <span>Ведомостей на подпись:</span>
              </div>
              <span className="bg-emerald-400 text-stone-900 font-bold px-2 py-0.5 rounded-full text-xs">
                {unsignedStatements.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Schedule & Deadlines), Right Column (Courses & Risk Students) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* 3.1 Расписание на сегодня */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900">Расписание занятий на сегодня</h2>
                  <p className="text-xs text-stone-500">Четверг, 1 октября 2026 г. • 5-я неделя (Знаменатель)</p>
                </div>
              </div>
              <button
                onClick={syncOneC}
                disabled={systemSyncStatus.oneC.status === 'syncing'}
                className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1 font-medium bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 transition cursor-pointer"
                title="Синхронизировать расписание из АСУ ВУЗ / 1С"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${systemSyncStatus.oneC.status === 'syncing' ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">1С: Расписание</span>
              </button>
            </div>

            <div className="space-y-3">
              {timetable.map((slot) => {
                const isInProgress = slot.status === 'in_progress';
                const isCompleted = slot.status === 'completed';

                return (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isInProgress
                        ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                        : isCompleted
                        ? 'bg-stone-50/60 border-stone-200 opacity-80'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono">
                            {slot.time}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              slot.type === 'Лекция'
                                ? 'bg-indigo-100 text-indigo-800'
                                : slot.type === 'Лабораторная'
                                ? 'bg-amber-100 text-amber-800'
                                : slot.type === 'Практика'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {slot.type}
                          </span>
                          {isInProgress && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-red-600"></span>
                              Идет пара
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3 text-stone-400" />
                              Завершено
                            </span>
                          )}
                        </div>

                        <div className="font-semibold text-stone-900 text-sm">{slot.disciplineName}</div>

                        <div className="flex items-center gap-4 text-xs text-stone-600 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            {slot.groupName}
                          </span>
                          <span className="flex items-center gap-1">
                            {slot.isOnline ? (
                              <Video className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            )}
                            {slot.classroom}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {slot.isOnline && slot.vcsLink && (
                          <button
                            onClick={() => onNavigate('communication')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Вход в ВКС</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveCourseId(slot.disciplineId);
                            if (slot.groupName.includes('ИВТ-401')) setSelectedGroup('ИВТ-401');
                            else if (slot.groupName.includes('ПИ-302')) setSelectedGroup('ПИ-302');
                            onNavigate('journal');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition cursor-pointer"
                        >
                          <span>Журнал</span>
                          <ArrowRight className="w-3 h-3 text-stone-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3.1 Карточки активных дисциплин текущего семестра */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-700" />
                <h2 className="text-base font-bold text-stone-900">Активные дисциплины семестра</h2>
              </div>
              <button
                onClick={() => onNavigate('courses')}
                className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Все курсы</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-xl border border-stone-200 hover:border-blue-300 hover:shadow-xs transition bg-gradient-to-b from-stone-50/50 to-white flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                        {course.code}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        КУМ утвержден
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm leading-snug">{course.title}</h3>
                    <p className="text-xs text-stone-500">Группы: {course.groups.join(', ')}</p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="text-stone-600">
                      <span className="font-semibold text-stone-900">{course.totalHours}</span> акад. часов
                    </div>
                    <button
                      onClick={() => {
                        setActiveCourseId(course.id);
                        onNavigate('courses');
                      }}
                      className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Открыть курс</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Deadlines & Risk-Alerts */}
        <div className="space-y-6">
          {/* Срочные задачи и дедлайны */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-3">
              <BellRing className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-stone-900 text-sm">Срочные задачи и дедлайны</h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-amber-900">
                  <span>Сдача ведомости промежуточного контроля</span>
                  <span className="text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded">До 15.06</span>
                </div>
                <p className="text-amber-800 text-[11px]">
                  Ведомость № В-04/2026-ИВТ-401 сформирована на основе БРС и ждет подписания ЭЦП.
                </p>
                <button
                  onClick={() => onNavigate('exams')}
                  className="mt-2 text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Перейти к подписанию</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-blue-900">
                  <span>Рецензирование лабораторных</span>
                  <span className="text-[10px] bg-blue-200/80 px-1.5 py-0.5 rounded">2 работы</span>
                </div>
                <p className="text-blue-800 text-[11px]">
                  Студенты загрузили решения лаб. №2. Требуется рецензирование и выставление оценок.
                </p>
                <button
                  onClick={() => onNavigate('submissions')}
                  className="mt-2 text-xs font-semibold text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Проверить работы</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Студенты «группы риска» (ТЗ 3.6) */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-stone-900 text-sm">Группа академического риска</h3>
              </div>
              <button
                onClick={() => onNavigate('analytics')}
                className="text-[11px] text-blue-700 hover:underline cursor-pointer"
              >
                Подробнее
              </button>
            </div>

            <div className="space-y-2.5">
              {criticalStudents.slice(0, 3).map((st) => (
                <div
                  key={st.id}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 truncate">{st.fullName}</p>
                    <p className="text-[11px] text-stone-500">
                      {st.group} • Не был в системе {st.lastActivityDate}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      st.riskStatus === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {st.riskStatus === 'critical' ? 'Угроза отчисления' : 'Низкий балл'}
                  </span>
                </div>
              ))}
            </div>

            {curatorNotified ? (
              <div className="mt-3 p-2 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Уведомление кураторам отправлено</span>
              </div>
            ) : (
              <button
                onClick={handleSendCuratorNotice}
                className="mt-3 w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium text-center transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Отправить уведомление куратору</span>
              </button>
            )}
          </div>

          {/* Быстрые действия */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-2">
            <h3 className="font-bold text-stone-900 text-sm mb-2">Быстрые действия</h3>
            <button
              onClick={() => onNavigate('journal')}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-stone-100 text-xs font-medium text-stone-700 flex items-center justify-between transition cursor-pointer"
            >
              <span>Заполнить электронный журнал</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
            <button
              onClick={() => onNavigate('communication')}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-stone-100 text-xs font-medium text-stone-700 flex items-center justify-between transition cursor-pointer"
            >
              <span>Создать объявление для групп</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
            <button
              onClick={() => onNavigate('courses')}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-stone-100 text-xs font-medium text-stone-700 flex items-center justify-between transition cursor-pointer"
            >
              <span>Конструктор тестов и банк вопросов</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
