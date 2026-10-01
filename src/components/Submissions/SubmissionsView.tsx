import React, { useState } from 'react';
import { useLMS } from '../../context/LMSContext';
import {
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
  FileCode,
  Send,
  RotateCcw,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Percent,
  Search,
  User,
} from 'lucide-react';
import { Submission } from '../../types/lms';

export const SubmissionsView: React.FC = () => {
  const {
    submissions,
    students,
    gradeSubmission,
    sendSubmissionForRevision,
    triggerAntiplagiatCheck,
    systemSyncStatus,
  } = useLMS();

  const [selectedSubId, setSelectedSubId] = useState<string>(submissions[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'graded' | 'revision_needed'>('all');

  const selectedSub = submissions.find((s) => s.id === selectedSubId) || submissions[0];
  const student = students.find((s) => s.id === selectedSub?.studentId);

  // Rubric local form state
  const [rubricScores, setRubricScores] = useState<number[]>(
    selectedSub ? selectedSub.rubric.map((r) => r.awardedScore) : []
  );
  const [feedbackText, setFeedbackText] = useState(selectedSub?.feedback || '');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<number>(selectedSub?.version || 1);

  // Update rubric scores when selecting a different submission
  React.useEffect(() => {
    if (selectedSub) {
      setRubricScores(selectedSub.rubric.map((r) => r.awardedScore));
      setFeedbackText(selectedSub.feedback || '');
      setSelectedVersion(selectedSub.version);
      setActionSuccessMsg('');
    }
  }, [selectedSubId]);

  const totalCalculatedScore = rubricScores.reduce((a, b) => a + b, 0);

  const filteredSubmissions = submissions.filter((s) => {
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
  });

  const handleGrade = () => {
    if (!selectedSub) return;
    gradeSubmission(selectedSub.id, totalCalculatedScore, feedbackText, rubricScores);
    setActionSuccessMsg(`Оценка ${totalCalculatedScore}/${selectedSub.maxScore} успешно выставлена и занесена в БРС!`);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const handleRevision = () => {
    if (!selectedSub) return;
    sendSubmissionForRevision(selectedSub.id, feedbackText || 'Работа отправлена на доработку. Устраните замечания.');
    setActionSuccessMsg('Работа возвращена студенту со статусом «На доработке».');
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-700" />
              <h1 className="text-xl font-bold text-stone-900">Рецензирование и проверка работ</h1>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Проверка решений студентов, интеграция с «Антиплагиат.ВУЗ», критериальное оценивание по рубрикам.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterStatus === 'all' ? 'bg-blue-900 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              Все ({submissions.length})
            </button>
            <button
              onClick={() => setFilterStatus('submitted')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterStatus === 'submitted' ? 'bg-blue-900 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              На проверке ({submissions.filter((s) => s.status === 'submitted').length})
            </button>
            <button
              onClick={() => setFilterStatus('graded')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterStatus === 'graded' ? 'bg-blue-900 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              Проверено ({submissions.filter((s) => s.status === 'graded').length})
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Panel Layout: Submissions List (Left) & Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: List of submissions */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-1">
            Сданные работы ({filteredSubmissions.length})
          </div>

          <div className="space-y-2.5">
            {filteredSubmissions.map((sub) => {
              const st = students.find((x) => x.id === sub.studentId);
              const isSelected = sub.id === selectedSubId;
              const isPassed = sub.plagiarismReport.status === 'passed';

              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubId(sub.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                        {st?.fullName || 'Студент'}
                      </div>
                      <div className="text-[11px] text-stone-500">{sub.groupName}</div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        sub.status === 'submitted'
                          ? 'bg-amber-100 text-amber-800'
                          : sub.status === 'graded'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {sub.status === 'submitted'
                        ? 'На проверке'
                        : sub.status === 'graded'
                        ? `${sub.score} / ${sub.maxScore} б.`
                        : 'На доработке'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 font-medium mt-2 line-clamp-1">{sub.assignmentTitle}</p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100 text-[11px]">
                    <span className="text-stone-400">{sub.submittedAt}</span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isPassed ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                      title={sub.plagiarismReport.engine}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {sub.plagiarismReport.originalityPercent}% ориг.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Workbench / Inspector */}
        {selectedSub && (
          <div className="lg:col-span-8 space-y-6">
            {/* Action Alert Banner */}
            {actionSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-2 border border-emerald-300 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Header of selected submission */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-stone-100 text-stone-700 font-mono px-2 py-0.5 rounded">
                      {selectedSub.groupName}
                    </span>

                    {/* Version History buttons */}
                    <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                      <button
                        onClick={() => setSelectedVersion(1)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                          selectedVersion === 1
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Версия 1 (Первоначальная)
                      </button>
                      {selectedSub.version >= 2 && (
                        <button
                          onClick={() => setSelectedVersion(2)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                            selectedVersion === 2
                              ? 'bg-blue-900 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Версия 2 (Исправленная)
                        </button>
                      )}
                    </div>

                    <span className="text-xs text-stone-500">{selectedSub.submittedAt}</span>
                  </div>
                  <h2 className="text-lg font-bold text-stone-900">{selectedSub.assignmentTitle}</h2>
                  <p className="text-xs text-stone-600">
                    Студент:{' '}
                    <span className="font-semibold text-stone-900">
                      {student?.fullName} ({student?.recordBookNumber})
                    </span>
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500">Файл работы:</span>
                  <span className="text-xs font-mono bg-stone-100 text-stone-800 px-2 py-1 rounded border">
                    {selectedSub.fileName} ({selectedSub.fileSize})
                  </span>
                </div>
              </div>

              {/* Антиплагиат.ВУЗ Report Panel (ТЗ 4) */}
              <div className="bg-gradient-to-r from-stone-900 to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Отчет системы «Антиплагиат.ВУЗ»
                      </span>
                    </div>
                    <p className="text-xs text-stone-300">{selectedSub.plagiarismReport.engine}</p>
                    <p className="text-[10px] text-stone-400">
                      Дата проверки: {selectedSub.plagiarismReport.checkedAt} • Проверка по базам РГБ, eLibrary и сети Интернет
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-center px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
                      <div className="text-lg font-extrabold text-emerald-400 font-mono">
                        {selectedSub.plagiarismReport.originalityPercent}%
                      </div>
                      <div className="text-[10px] text-stone-300 uppercase tracking-wider">Оригинальность</div>
                    </div>

                    <div className="text-center px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
                      <div className="text-lg font-extrabold text-rose-400 font-mono">
                        {selectedSub.plagiarismReport.borrowingPercent}%
                      </div>
                      <div className="text-[10px] text-stone-300 uppercase tracking-wider">Заимствования</div>
                    </div>

                    <div className="text-center px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
                      <div className="text-lg font-extrabold text-blue-400 font-mono">
                        {selectedSub.plagiarismReport.citationPercent}%
                      </div>
                      <div className="text-[10px] text-stone-300 uppercase tracking-wider">Цитирования</div>
                    </div>
                  </div>
                </div>

                {/* Status message or Re-check */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  {selectedSub.plagiarismReport.status === 'passed' ? (
                    <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Порог оригинальности пройден (&gt; 75%)
                    </span>
                  ) : (
                    <span className="text-rose-300 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Внимание: обнаружено высокое заимствование ({selectedSub.plagiarismReport.borrowingPercent}%)
                    </span>
                  )}

                  <button
                    onClick={() => triggerAntiplagiatCheck(selectedSub.id)}
                    disabled={systemSyncStatus.antiplagiat.status === 'checking'}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded transition cursor-pointer"
                  >
                    <RotateCcw
                      className={`w-3 h-3 ${systemSyncStatus.antiplagiat.status === 'checking' ? 'animate-spin' : ''}`}
                    />
                    <span>Повторная проверка</span>
                  </button>
                </div>
              </div>

              {/* Code / Document snippet viewer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                  <span className="flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-stone-500" />
                    Содержимое сданного файла / Решение:
                  </span>
                  <span className="text-stone-400">Синтаксис: Java / Spring</span>
                </div>
                <pre className="p-4 bg-stone-900 text-stone-100 rounded-xl text-xs font-mono overflow-x-auto border border-stone-800 leading-relaxed max-h-56">
                  {selectedSub.fileSnippet}
                </pre>
              </div>

              {/* Rubric Criteria Assessment (Критериальное оценивание) */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-900 text-xs sm:text-sm">
                    Критерии оценивания (Рубрика кафедры)
                  </h3>
                  <div className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    Итог: {totalCalculatedScore} из {selectedSub.maxScore} баллов
                  </div>
                </div>

                <div className="space-y-2.5">
                  {selectedSub.rubric.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-stone-900">{item.name}</span>
                        <div className="text-[11px] text-stone-500">Максимум: {item.maxScore} баллов</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={item.maxScore}
                          value={rubricScores[idx] ?? item.awardedScore}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const next = [...rubricScores];
                            next[idx] = val;
                            setRubricScores(next);
                          }}
                          className="w-32 accent-blue-700 cursor-pointer"
                        />
                        <span className="w-10 text-center font-bold font-mono text-xs bg-white px-2 py-1 rounded border">
                          {rubricScores[idx] ?? item.awardedScore} б.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Comment & Actions */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-stone-700">
                  Рецензия преподавателя (комментарий студенту):
                </label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Укажите замечания, сильные стороны работы или требования к доработке..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-2">
                  <button
                    onClick={handleRevision}
                    className="px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Отправить на доработку</span>
                  </button>

                  <button
                    onClick={handleGrade}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Утвердить оценку ({totalCalculatedScore} б.) в БРС</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
