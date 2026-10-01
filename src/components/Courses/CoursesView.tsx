import React, { useState } from 'react';
import { useLMS } from '../../context/LMSContext';
import {
  BookOpen,
  Plus,
  FileText,
  Video,
  FileSpreadsheet,
  HelpCircle,
  Package,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Play,
  RotateCcw,
  Check,
  X,
  Layers,
  Shuffle,
  FileCheck,
} from 'lucide-react';
import { CourseModuleItem, TestQuestion, QuestionType } from '../../types/lms';

export const CoursesView: React.FC = () => {
  const {
    courses,
    activeCourseId,
    setActiveCourseId,
    activeCourse,
    addCourseModuleItem,
    role,
    addTestQuestion,
    toggleKumApproval,
  } = useLMS();

  const [activeTab, setActiveTab] = useState<'structure' | 'test_bank' | 'kum_files'>('structure');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-1': true,
    'mod-2': true,
  });

  // Modal for adding a new course item
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string>('mod-1');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState<CourseModuleItem['type']>('lecture_pdf');
  const [newItemDesc, setNewItemDesc] = useState('');

  // Interactive Test Preview Mode (Student simulator)
  const [previewTest, setPreviewTest] = useState<boolean>(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);

  // New question form state in Test Bank
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('single_choice');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionPoints, setNewQuestionPoints] = useState(2);
  const [newQuestionOption1, setNewQuestionOption1] = useState('');
  const [newQuestionOption2, setNewQuestionOption2] = useState('');
  const [newQuestionOption3, setNewQuestionOption3] = useState('');
  const [newQuestionOption4, setNewQuestionOption4] = useState('');
  const [newQuestionCorrect, setNewQuestionCorrect] = useState('');

  // Interactive SCORM Player Modal
  const [showScormModal, setShowScormModal] = useState(false);
  const [scormState, setScormState] = useState<'CLOSED' | 'OPEN' | 'HALF_OPEN'>('CLOSED');
  const [scormFailures, setScormFailures] = useState(0);
  const [scormStatusPassed, setScormStatusPassed] = useState(false);

  // Official RPD Reader Modal
  const [showRpdModal, setShowRpdModal] = useState(false);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    addCourseModuleItem(activeCourse.id, targetModuleId, {
      title: newItemTitle,
      type: newItemType,
      description: newItemDesc,
      fileSize: newItemType === 'scorm' ? '15.2 МБ' : newItemType === 'lecture_pdf' ? '3.5 МБ' : undefined,
      duration: newItemType === 'video' ? '45 мин' : undefined,
      linkUrl: newItemType === 'ebs_link' ? 'https://e.lanbook.com/book/manual' : undefined,
    });

    setNewItemTitle('');
    setNewItemDesc('');
    setShowAddModal(false);
  };

  const activeTest = activeCourse.tests?.[0];

  const handleSelectAnswer = (questionId: string, answer: any) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !activeTest) return;

    let options: string[] | undefined = undefined;
    let correctAnswer: string | string[] | undefined = undefined;
    let matchingPairs: { left: string; right: string }[] | undefined = undefined;

    if (newQuestionType === 'single_choice' || newQuestionType === 'multi_choice') {
      const opts = [newQuestionOption1, newQuestionOption2, newQuestionOption3, newQuestionOption4].filter(Boolean);
      options = opts;
      correctAnswer = newQuestionCorrect || opts[0];
    } else if (newQuestionType === 'matching') {
      matchingPairs = [
        { left: newQuestionOption1 || 'Паттерн A', right: newQuestionOption2 || 'Определение A' },
        { left: newQuestionOption3 || 'Паттерн B', right: newQuestionOption4 || 'Определение B' },
      ];
    } else if (newQuestionType === 'formula') {
      correctAnswer = newQuestionCorrect || 'L = lambda * W';
    } else if (newQuestionType === 'open_text') {
      correctAnswer = newQuestionCorrect;
    }

    const question: TestQuestion = {
      id: 'q-' + Date.now(),
      questionText: newQuestionText,
      type: newQuestionType,
      points: Number(newQuestionPoints),
      options,
      correctAnswer,
      matchingPairs,
      hint: newQuestionType === 'formula' ? 'Формула закона распределения' : undefined,
    };

    addTestQuestion(activeCourse.id, activeTest.id, question);
    setShowNewQuestionModal(false);
    setNewQuestionText('');
    setNewQuestionOption1('');
    setNewQuestionOption2('');
    setNewQuestionOption3('');
    setNewQuestionOption4('');
    setNewQuestionCorrect('');
  };

  return (
    <div className="space-y-6">
      {/* Course Header & Switcher */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-semibold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded">
                {activeCourse.code}
              </span>
              <span className="text-xs font-medium text-stone-500">{activeCourse.semester}</span>
              {activeCourse.kumApproved ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  КУМ утвержден
                </span>
              ) : (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  КУМ на согласовании
                </span>
              )}

              {/* Department Head Approval Control */}
              {role === 'head_of_department' && (
                <button
                  onClick={() => toggleKumApproval(activeCourse.id)}
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border transition cursor-pointer flex items-center gap-1 ${
                    activeCourse.kumApproved
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                  }`}
                  title="Право заведующего кафедрой утверждать КУМ"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{activeCourse.kumApproved ? 'Отозвать утверждение КУМ' : 'Утвердить КУМ (Зав. кафедрой)'}</span>
                </button>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">{activeCourse.title}</h1>
            <p className="text-xs sm:text-sm text-stone-500">
              Потоки: {activeCourse.groups.join(', ')} • Всего: {activeCourse.totalHours} часов (ЛК: {activeCourse.lectureHours}ч, ПР: {activeCourse.practiceHours}ч, ЛБ: {activeCourse.labHours}ч)
            </p>
          </div>

          {/* Course select pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 hidden sm:inline">Дисциплина:</span>
            <select
              value={activeCourseId}
              onChange={(e) => setActiveCourseId(e.target.value)}
              className="text-xs sm:text-sm font-medium bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-tabs: Структура курса, Банк тестов, РПД и КУМ */}
        <div className="flex items-center gap-2 border-t border-stone-200 mt-6 pt-4">
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === 'structure' ? 'bg-blue-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Конструктор курса и материалы
          </button>
          <button
            onClick={() => setActiveTab('test_bank')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === 'test_bank' ? 'bg-blue-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Банк заданий и тестов
          </button>
          <button
            onClick={() => setActiveTab('kum_files')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === 'kum_files' ? 'bg-blue-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            РПД, Силлабус и ЭБС
          </button>
        </div>
      </div>

      {/* Tab 1: Конструктор курса и материалов */}
      {activeTab === 'structure' && (
        <div className="space-y-4">
          {activeCourse.modules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500">
              Модули курса еще не сформированы для данной дисциплины.
            </div>
          ) : (
            activeCourse.modules.map((module, idx) => {
              const isExpanded = expandedModules[module.id] ?? true;

              return (
                <div key={module.id} className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                  {/* Module header */}
                  <div
                    onClick={() => toggleModule(module.id)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50/70 transition bg-stone-50/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs shrink-0">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold text-stone-900 text-base">{module.title}</h2>
                          <span className="text-xs bg-stone-200 text-stone-700 font-mono px-2 py-0.5 rounded">
                            {module.weekRange}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{module.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setTargetModuleId(module.id);
                          setShowAddModal(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-white hover:bg-stone-100 text-blue-800 border border-stone-300 px-3 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить материал</span>
                      </button>
                    </div>
                  </div>

                  {/* Module Items */}
                  {isExpanded && (
                    <div className="border-t border-stone-100 divide-y divide-stone-100 p-2">
                      {module.items.length === 0 ? (
                        <div className="p-4 text-center text-xs text-stone-400">В этом модуле пока нет материалов.</div>
                      ) : (
                        module.items.map((item) => {
                          return (
                            <div
                              key={item.id}
                              className="p-3.5 hover:bg-stone-50 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                                    item.type === 'lecture_pdf'
                                      ? 'bg-rose-100 text-rose-700'
                                      : item.type === 'video'
                                      ? 'bg-purple-100 text-purple-700'
                                      : item.type === 'scorm'
                                      ? 'bg-amber-100 text-amber-800'
                                      : item.type === 'test'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : item.type === 'ebs_link'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-stone-100 text-stone-700'
                                  }`}
                                >
                                  {item.type === 'lecture_pdf' && <FileText className="w-4 h-4" />}
                                  {item.type === 'video' && <Video className="w-4 h-4" />}
                                  {item.type === 'scorm' && <Package className="w-4 h-4" />}
                                  {item.type === 'test' && <HelpCircle className="w-4 h-4" />}
                                  {item.type === 'ebs_link' && <ExternalLink className="w-4 h-4" />}
                                  {item.type === 'lab_manual' && <FileSpreadsheet className="w-4 h-4" />}
                                  {item.type === 'presentation' && <Layers className="w-4 h-4" />}
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-stone-900 text-xs sm:text-sm">{item.title}</span>
                                    {item.type === 'scorm' && (
                                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                                        SCORM 2004 / xAPI
                                      </span>
                                    )}
                                  </div>
                                  {item.description && <p className="text-xs text-stone-500">{item.description}</p>}
                                  <div className="flex items-center gap-3 text-[11px] text-stone-400">
                                    {item.fileSize && <span>{item.fileSize}</span>}
                                    {item.duration && <span>Длительность: {item.duration}</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                {item.type === 'test' && (
                                  <button
                                    onClick={() => {
                                      setActiveTab('test_bank');
                                      setPreviewTest(true);
                                    }}
                                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                                  >
                                    Открыть тест
                                  </button>
                                )}
                                {item.type === 'scorm' && (
                                  <button
                                    onClick={() => setShowScormModal(true)}
                                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                  >
                                    <Play className="w-3 h-3" />
                                    <span>Запустить SCORM</span>
                                  </button>
                                )}
                                {item.linkUrl && (
                                  <a
                                    href={item.linkUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Открыть</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Банк заданий и тестов (ТЗ 3.2) */}
      {activeTab === 'test_bank' && (
        <div className="space-y-6">
          {activeTest ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Банк тестов курса
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      Всего вопросов: {activeTest.questions.length}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-stone-900 mt-1">{activeTest.title}</h2>
                  <div className="flex items-center gap-4 text-xs text-stone-600 mt-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      Лимит времени: {activeTest.timeLimitMinutes} минут
                    </span>
                    <span className="flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                      Попыток: {activeTest.maxAttempts}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shuffle className="w-3.5 h-3.5 text-stone-400" />
                      Случайная выборка: {activeTest.questionsPerAttempt} из {activeTest.questions.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewTest(!previewTest)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      previewTest
                        ? 'bg-stone-900 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{previewTest ? 'Закрыть предпросмотр' : 'Пройти тест как студент'}</span>
                  </button>
                  <button
                    onClick={() => setShowNewQuestionModal(true)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить вопрос</span>
                  </button>
                </div>
              </div>

              {/* Student Testing Simulator mode */}
              {previewTest ? (
                <div className="bg-stone-50 rounded-2xl p-6 border-2 border-emerald-500/40 space-y-6">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="font-bold text-sm text-stone-900">
                        Режим симуляции тестирования студента (Вопрос {currentTestIndex + 1} из{' '}
                        {activeTest.questions.length})
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-stone-700 bg-white px-3 py-1 rounded-lg border">
                      ⏱ Осталось: 29:45
                    </div>
                  </div>

                  {(() => {
                    const q = activeTest.questions[currentTestIndex];
                    if (!q) return null;

                    return (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-xs uppercase tracking-wider font-bold text-stone-500">
                            Тип: {q.type === 'single_choice' ? 'Одиночный выбор' : q.type === 'multi_choice' ? 'Множественный выбор' : q.type === 'matching' ? 'Сопоставление' : q.type === 'formula' ? 'Ввод формулы' : 'Открытый ответ'} • {q.points} балла
                          </span>
                          <h3 className="text-base font-semibold text-stone-900">{q.questionText}</h3>
                        </div>

                        {/* Question body based on type */}
                        {q.type === 'single_choice' && (
                          <div className="space-y-2">
                            {q.options?.map((opt, i) => (
                              <label
                                key={i}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition ${
                                  userAnswers[q.id] === opt
                                    ? 'bg-blue-50 border-blue-500 font-medium'
                                    : 'bg-white border-stone-200 hover:bg-stone-100'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  checked={userAnswers[q.id] === opt}
                                  onChange={() => handleSelectAnswer(q.id, opt)}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {q.type === 'multi_choice' && (
                          <div className="space-y-2">
                            {q.options?.map((opt, i) => {
                              const selected: string[] = userAnswers[q.id] || [];
                              const isChecked = selected.includes(opt);

                              return (
                                <label
                                  key={i}
                                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition ${
                                    isChecked
                                      ? 'bg-blue-50 border-blue-500 font-medium'
                                      : 'bg-white border-stone-200 hover:bg-stone-100'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      const next = isChecked
                                        ? selected.filter((x) => x !== opt)
                                        : [...selected, opt];
                                      handleSelectAnswer(q.id, next);
                                    }}
                                    className="text-blue-600 rounded focus:ring-blue-500"
                                  />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {q.type === 'matching' && (
                          <div className="space-y-2 bg-white p-4 rounded-xl border border-stone-200">
                            <p className="text-xs text-stone-500 mb-2">Сопоставленные пары понятий:</p>
                            {q.matchingPairs?.map((pair, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-stone-50 rounded-lg text-xs"
                              >
                                <span className="font-semibold text-stone-800">{pair.left}</span>
                                <span className="text-stone-400">➔</span>
                                <span className="text-stone-700 bg-white px-2 py-1 rounded border border-stone-200">
                                  {pair.right}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'formula' && (
                          <div className="space-y-2">
                            <label className="block text-xs text-stone-600">Введите математическую запись:</label>
                            <input
                              type="text"
                              placeholder="например: L = lambda * W"
                              value={userAnswers[q.id] || ''}
                              onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                              className="w-full text-sm font-mono p-3 rounded-xl border border-stone-300 bg-white"
                            />
                            {q.hint && <p className="text-xs text-stone-400 italic">Подсказка: {q.hint}</p>}
                          </div>
                        )}

                        {q.type === 'open_text' && (
                          <div className="space-y-2">
                            <label className="block text-xs text-stone-600">Развернутый ответ студента:</label>
                            <textarea
                              rows={3}
                              placeholder="Введите текстовый ответ..."
                              value={userAnswers[q.id] || ''}
                              onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                              className="w-full text-sm p-3 rounded-xl border border-stone-300 bg-white"
                            />
                            {q.hint && <p className="text-xs text-stone-400 italic">Ключевые слова: {q.hint}</p>}
                          </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                          <button
                            disabled={currentTestIndex === 0}
                            onClick={() => setCurrentTestIndex((prev) => prev - 1)}
                            className="px-3 py-1.5 rounded-lg border text-xs font-medium disabled:opacity-40 cursor-pointer"
                          >
                            Предыдущий вопрос
                          </button>

                          {currentTestIndex < activeTest.questions.length - 1 ? (
                            <button
                              onClick={() => setCurrentTestIndex((prev) => prev + 1)}
                              className="px-4 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-medium cursor-pointer"
                            >
                              Следующий вопрос
                            </button>
                          ) : (
                            <button
                              onClick={() => setTestSubmitted(true)}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                            >
                              Завершить симуляцию теста
                            </button>
                          )}
                        </div>

                        {testSubmitted && (
                          <div className="p-4 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-medium flex items-center justify-between">
                            <span>Тест успешно завершен! Результат симуляции: 100% правильных ответов.</span>
                            <button
                              onClick={() => {
                                setTestSubmitted(false);
                                setUserAnswers({});
                                setCurrentTestIndex(0);
                              }}
                              className="underline text-emerald-950 font-bold"
                            >
                              Пройти снова
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Question List */
                <div className="space-y-3">
                  {activeTest.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-stone-200 hover:border-stone-300 bg-white space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          Вопрос {idx + 1} • {q.points} балла
                        </span>
                        <span className="text-[11px] text-stone-500 font-medium">
                          {q.type === 'single_choice'
                            ? 'Одиночный выбор'
                            : q.type === 'multi_choice'
                            ? 'Множественный выбор'
                            : q.type === 'matching'
                            ? 'Сопоставление'
                            : q.type === 'formula'
                            ? 'Формула LaTeX'
                            : 'Развернутый ответ'}
                        </span>
                      </div>
                      <p className="font-semibold text-stone-900 text-sm">{q.questionText}</p>
                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-600 pt-1">
                          {q.options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                              <span
                                className={
                                  opt === q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt))
                                    ? 'text-emerald-700 font-medium'
                                    : ''
                                }
                              >
                                {opt}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500">
              В данном курсе еще не созданы тесты.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Управление файлами, РПД и ЭБС (ТЗ 3.2) */}
      {activeTab === 'kum_files' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* РПД и Силлабус */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700" />
                <span>Рабочая программа дисциплины (РПД)</span>
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Утверждено деканатом
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              РПД соответствует Федеральному государственному образовательному стандарту высшего образования (ФГОС ВО 3++) по направлению подготовки 09.03.04 «Программная инженерия».
            </p>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                <span>Файл: rpd_architecture_enterprise_2026.pdf</span>
                <span className="text-stone-500">4.8 МБ</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Электронная цифровая подпись: Зав. кафедрой Ковалев М.И., Проректор по учебной работе.
              </p>
              <button
                onClick={() => setShowRpdModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-white hover:bg-stone-100 border border-stone-300 px-3 py-1.5 rounded-lg transition cursor-pointer shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Просмотреть и скачать РПД</span>
              </button>
            </div>
          </div>

          {/* Интеграция с ЭБС (Лань, Znanium) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-indigo-700" />
                <span>Электронно-библиотечные системы (ЭБС)</span>
              </h3>
              <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                Бесшовный SSO доступ
              </span>
            </div>

            <p className="text-xs text-stone-600">
              Студенты и преподаватели имеют прямой переход к рекомендованным учебникам без дополнительного ввода логина и пароля.
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl border border-stone-200 hover:border-indigo-300 transition flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-stone-900">Фаулер М. Архитектура корпоративных приложений</p>
                  <p className="text-stone-500 text-[11px]">ЭБС «Лань» • Изд-во Вильямс, 2024</p>
                </div>
                <a
                  href="https://e.lanbook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 font-semibold hover:underline shrink-0"
                >
                  Перейти в ЭБС
                </a>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 hover:border-indigo-300 transition flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-stone-900">Клеппман М. Высоконагруженные приложения. Программирование</p>
                  <p className="text-stone-500 text-[11px]">ЭБС «Znanium» • Изд-во Питер, 2025</p>
                </div>
                <a
                  href="https://znanium.ru"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 font-semibold hover:underline shrink-0"
                >
                  Перейти в ЭБС
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Добавление нового учебного материала */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-stone-900 text-base">Добавить материал в курс</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Название материала</label>
                <input
                  type="text"
                  required
                  placeholder="например, Презентация: Event-Driven Architecture"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Формат / Тип ресурса</label>
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value as any)}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="lecture_pdf">Лекция (PDF-документ)</option>
                  <option value="presentation">Презентация (PPTX / Слайды)</option>
                  <option value="video">Видеозапись лекции (ВКС / Видеохостинг)</option>
                  <option value="lab_manual">Методические указания к лабораторной</option>
                  <option value="scorm">Интерактивный SCORM 2004 пакет (.zip)</option>
                  <option value="ebs_link">Ссылка на электронный учебник ЭБС</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Краткое описание / Инструкции студенту</label>
                <textarea
                  rows={3}
                  placeholder="Аннотация, дедлайны или методические рекомендации..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800"
                >
                  Сохранить и опубликовать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Добавление вопроса в Банк заданий и тестов */}
      {showNewQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-stone-900 text-base">Конструктор вопросов банка тестов</h3>
              <button onClick={() => setShowNewQuestionModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Тип тестового задания (ТЗ 3.2)</label>
                <select
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value as any)}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="single_choice">Одиночный выбор (Single Choice)</option>
                  <option value="multi_choice">Множественный выбор (Multiple Choice)</option>
                  <option value="matching">На сопоставление (Matching)</option>
                  <option value="formula">Ввод формулы (Formula / LaTeX)</option>
                  <option value="open_text">Открытый текстовый ответ</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Формулировка вопроса</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Введите текст вопроса или задания..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Балл за вопрос</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newQuestionPoints}
                    onChange={(e) => setNewQuestionPoints(Number(e.target.value))}
                    className="w-full text-sm p-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              {(newQuestionType === 'single_choice' || newQuestionType === 'multi_choice') && (
                <div className="space-y-2 pt-2 border-t">
                  <label className="block text-stone-700 font-semibold">Варианты ответа:</label>
                  <input
                    type="text"
                    required
                    placeholder="Вариант 1 (Правильный по умолчанию)"
                    value={newQuestionOption1}
                    onChange={(e) => setNewQuestionOption1(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Вариант 2"
                    value={newQuestionOption2}
                    onChange={(e) => setNewQuestionOption2(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300"
                  />
                  <input
                    type="text"
                    placeholder="Вариант 3 (опционально)"
                    value={newQuestionOption3}
                    onChange={(e) => setNewQuestionOption3(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300"
                  />
                  <input
                    type="text"
                    placeholder="Вариант 4 (опционально)"
                    value={newQuestionOption4}
                    onChange={(e) => setNewQuestionOption4(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300"
                  />
                </div>
              )}

              {newQuestionType === 'matching' && (
                <div className="space-y-2 pt-2 border-t">
                  <label className="block text-stone-700 font-semibold">Пары для сопоставления:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Элемент слева 1"
                      value={newQuestionOption1}
                      onChange={(e) => setNewQuestionOption1(e.target.value)}
                      className="text-xs p-2 rounded-lg border"
                    />
                    <input
                      type="text"
                      placeholder="Соответствие справа 1"
                      value={newQuestionOption2}
                      onChange={(e) => setNewQuestionOption2(e.target.value)}
                      className="text-xs p-2 rounded-lg border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Элемент слева 2"
                      value={newQuestionOption3}
                      onChange={(e) => setNewQuestionOption3(e.target.value)}
                      className="text-xs p-2 rounded-lg border"
                    />
                    <input
                      type="text"
                      placeholder="Соответствие справа 2"
                      value={newQuestionOption4}
                      onChange={(e) => setNewQuestionOption4(e.target.value)}
                      className="text-xs p-2 rounded-lg border"
                    />
                  </div>
                </div>
              )}

              {(newQuestionType === 'formula' || newQuestionType === 'open_text') && (
                <div className="pt-2 border-t">
                  <label className="block text-stone-700 font-semibold mb-1">
                    {newQuestionType === 'formula' ? 'Эталонная формула (LaTeX / текст):' : 'Ключевые фразы правильного ответа:'}
                  </label>
                  <input
                    type="text"
                    placeholder={newQuestionType === 'formula' ? 'например: L = lambda * W' : 'Ключевые понятия для автоматической проверки'}
                    value={newQuestionCorrect}
                    onChange={(e) => setNewQuestionCorrect(e.target.value)}
                    className="w-full text-sm p-2 rounded-lg border border-stone-300"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewQuestionModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800"
                >
                  Добавить в банк
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive SCORM Player Modal (ТЗ 3.2: Поддержка формата SCORM) */}
      {showScormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    SCORM 2004 Плеер: Паттерны отказоустойчивости (Circuit Breaker)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Стандарт обмена учебным контентом xAPI / SCORM 2004 4th Edition
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScormModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SCORM Simulator Stage */}
            <div className="bg-stone-900 text-white rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3 text-xs">
                <span className="font-mono text-amber-400 font-bold">
                  // Интерактивный тренажер переключения состояний предохранителя
                </span>
                <span
                  className={`font-mono px-2 py-0.5 rounded font-bold ${
                    scormState === 'CLOSED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : scormState === 'OPEN'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  Текущее состояние: {scormState}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                <div
                  className={`p-4 rounded-xl border transition ${
                    scormState === 'CLOSED'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                      : 'bg-stone-800 border-stone-700 text-stone-400'
                  }`}
                >
                  <p className="text-sm font-mono">1. CLOSED (Норма)</p>
                  <p className="text-[11px] mt-1">Запросы проходят в сервис без задержек</p>
                </div>
                <div
                  className={`p-4 rounded-xl border transition ${
                    scormState === 'OPEN'
                      ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                      : 'bg-stone-800 border-stone-700 text-stone-400'
                  }`}
                >
                  <p className="text-sm font-mono">2. OPEN (Сбой)</p>
                  <p className="text-[11px] mt-1">Трафик отсекается, возврат fallback-ответа</p>
                </div>
                <div
                  className={`p-4 rounded-xl border transition ${
                    scormState === 'HALF_OPEN'
                      ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                      : 'bg-stone-800 border-stone-700 text-stone-400'
                  }`}
                >
                  <p className="text-sm font-mono">3. HALF-OPEN (Проверка)</p>
                  <p className="text-[11px] mt-1">Пробные запросы для проверки восстановления</p>
                </div>
              </div>

              {/* Action Simulation Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => {
                    const next = scormFailures + 1;
                    setScormFailures(next);
                    if (next >= 3) {
                      setScormState('OPEN');
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Симулировать ошибку запроса HTTP 500 (Ошибок: {scormFailures})
                </button>

                <button
                  onClick={() => {
                    setScormState('HALF_OPEN');
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Таймаут сброса (перейти в HALF-OPEN)
                </button>

                <button
                  onClick={() => {
                    setScormState('CLOSED');
                    setScormFailures(0);
                    setScormStatusPassed(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Успешный ответ (Восстановить в CLOSED)
                </button>
              </div>

              {/* SCORM API Runtime Communication Log */}
              <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 font-mono text-[11px] text-stone-300 space-y-1">
                <p className="text-amber-400 font-bold">LMS SCORM Runtime API (Лог взаимодействия):</p>
                <p>cmi.core.lesson_location: "slide_circuit_breaker_interactive"</p>
                <p>
                  cmi.core.lesson_status:{' '}
                  <span className={scormStatusPassed ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    "{scormStatusPassed ? 'completed' : 'incomplete'}"
                  </span>
                </p>
                <p>cmi.core.score.raw: {scormStatusPassed ? '100' : '65'}</p>
                <p>cmi.suspend_data: "failures={scormFailures}&amp;state={scormState}"</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-stone-500">
                {scormStatusPassed
                  ? 'Статус: Модуль успешно пройден и зафиксирован в журнале LMS'
                  : 'Завершите интерактивный сценарий для фиксации прохождения'}
              </span>
              <button
                onClick={() => {
                  setScormStatusPassed(true);
                  setShowScormModal(false);
                }}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs cursor-pointer"
              >
                Сохранить результат и закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official RPD Reader & Downloader Modal (ТЗ 3.2) */}
      {showRpdModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-stone-900 text-base">
                  Рабочая программа дисциплины (РПД 2025/2026 уч. год)
                </h3>
              </div>
              <button onClick={() => setShowRpdModal(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs font-serif space-y-3 leading-relaxed">
              <div className="text-center space-y-0.5 border-b pb-2">
                <p className="font-bold uppercase text-[11px]">ФГАОУ ВО Национальный исследовательский университет</p>
                <p className="font-semibold text-stone-700">Институт компьютерных технологий и безопасности</p>
                <p className="text-blue-950 font-bold text-sm pt-1">
                  РАБОЧАЯ ПРОГРАММА ДИСЦИПЛИНЫ «{activeCourse.title.toUpperCase()}»
                </p>
                <p className="text-stone-500 font-mono text-[10px]">Код направления: 09.03.04 Программная инженерия</p>
              </div>

              <div>
                <p className="font-bold text-stone-900">1. Цели и задачи освоения дисциплины:</p>
                <p className="text-stone-700">
                  Формирование у студентов углубленных профессиональных компетенций в области проектирования,
                  архитектурного анализа и сопровождения высоконагруженных распределенных корпоративных систем.
                </p>
              </div>

              <div>
                <p className="font-bold text-stone-900">2. Формируемые компетенции (ФГОС ВО 3++):</p>
                <ul className="list-disc pl-5 text-stone-700 space-y-0.5">
                  <li><strong>ОПК-2:</strong> Способен разрабатывать оригинальные алгоритмы и программные модули.</li>
                  <li><strong>ПК-1:</strong> Способен осуществлять концептуальное и архитектурное проектирование ИС.</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-stone-900">3. Распределение академической нагрузки:</p>
                <p className="text-stone-700">
                  Всего: {activeCourse.totalHours} часов. Лекции: {activeCourse.lectureHours}ч, Лабораторные: {activeCourse.labHours}ч, Практики: {activeCourse.practiceHours}ч.
                  Форма итоговой аттестации: Экзамен с защитой курсового проекта.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded border border-stone-300 font-mono text-[10px] space-y-0.5">
                <p className="font-bold text-emerald-900">ДОКУМЕНТ ПОДПИСАН ЭЛЕКТРОННОЙ ПОДПИСЬЮ УМК</p>
                <p>Сертификат: RU-77-2026-9812-4019-ГОСТ-34.10</p>
                <p>Подписант: Зав. кафедрой Ковалев М.И., Проректор по УР</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowRpdModal(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs"
              >
                Закрыть
              </button>
              <button
                onClick={() => {
                  const content = `ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ АВТОНОМНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ\nРАБОЧАЯ ПРОГРАММА ДИСЦИПЛИНЫ: ${activeCourse.title}\nНаправление: 09.03.04 Программная инженерия\nОбъем: ${activeCourse.totalHours} часов\nСтатус: Утверждено Учебно-методическим советом\nЭЦП: Сертификат RU-77-2026-9812-4019-ГОСТ-34.10`;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `RPD_${activeCourse.code}_2026.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Скачать официальный файл РПД</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
