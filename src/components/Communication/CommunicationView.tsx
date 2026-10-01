import React, { useState } from 'react';
import { useLMS } from '../../context/LMSContext';
import {
  Video,
  Send,
  Bell,
  MessageSquare,
  Users,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  ScreenShare,
  MessageCircle,
  Copy,
  ExternalLink,
  Plus,
  AlertTriangle,
  Sparkles,
  Check,
  CheckCircle2,
} from 'lucide-react';

export const CommunicationView: React.FC = () => {
  const { announcements, addAnnouncement, forumMessages, addForumMessage, activeCourse } = useLMS();

  const [activeSubTab, setActiveSubTab] = useState<'vcs' | 'announcements' | 'forum'>('vcs');

  // VCS State
  const [selectedVcsPlatform, setSelectedVcsPlatform] = useState<
    'Яндекс Телемост' | 'BigBlueButton' | 'VK Звонки' | 'SberJazz'
  >('Яндекс Телемост');
  const [isMeetingLive, setIsMeetingLive] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(true);
  const [screenShareSource, setScreenShareSource] = useState<'slides' | 'ide'>('slides');
  const [copiedLink, setCopiedLink] = useState(false);
  const [meetingChat, setMeetingChat] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'Александров Д.', text: 'Добрый день, Алексей Валерьевич! Звук и слайды видны отлично.', time: '10:01' },
    { sender: 'Богданова Е.', text: 'Здравствуйте! Подскажите, будет ли доступна видеозапись?', time: '10:02' },
  ]);
  const [newMeetingMsg, setNewMeetingMsg] = useState('');

  // Announcement State
  const [showNewAnnModal, setShowNewAnnModal] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnGroup, setNewAnnGroup] = useState('ИВТ-401, ПИ-302');
  const [newAnnUrgent, setNewAnnUrgent] = useState(false);

  // Forum State
  const [forumTopic, setForumTopic] = useState('');
  const [forumText, setForumText] = useState('');

  const meetingUrl =
    selectedVcsPlatform === 'Яндекс Телемост'
      ? 'https://telemost.yandex.ru/j/82910394103'
      : selectedVcsPlatform === 'BigBlueButton'
      ? 'https://bbb.university.edu.ru/b/prof-smirnov-lecture'
      : selectedVcsPlatform === 'VK Звонки'
      ? 'https://vk.com/call/join/university_smirnov'
      : 'https://jazz.sber.ru/join/prof-smirnov-412';

  const copyMeetingLink = () => {
    navigator.clipboard?.writeText(meetingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    addAnnouncement({
      title: newAnnTitle,
      content: newAnnContent,
      disciplineId: activeCourse.id,
      groupTarget: newAnnGroup,
      authorName: 'Смирнов А.В.',
      isUrgent: newAnnUrgent,
    });

    setNewAnnTitle('');
    setNewAnnContent('');
    setShowNewAnnModal(false);
  };

  const handleSendMeetingMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingMsg.trim()) return;
    setMeetingChat((prev) => [
      ...prev,
      {
        sender: 'Смирнов А.В. (Преподаватель)',
        text: newMeetingMsg,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewMeetingMsg('');
  };

  const handlePostForumMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumTopic.trim() || !forumText.trim()) return;
    addForumMessage(forumTopic, forumText);
    setForumTopic('');
    setForumText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-700" />
              <h1 className="text-xl font-bold text-stone-900">Коммуникация, ВКС и форум</h1>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Проведение онлайн-занятий (Телемост / BBB / VK), рассылка объявлений по группам и консультирование на форуме.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('vcs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'vcs' ? 'bg-indigo-900 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Видеоконференции (ВКС)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('announcements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'announcements' ? 'bg-indigo-900 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Объявления ({announcements.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('forum')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'forum' ? 'bg-indigo-900 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Форум курса</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tab 1: ВКС Видеоконференцсвязь (ТЗ 3.5) */}
      {activeSubTab === 'vcs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-base font-bold text-stone-900">Виртуальная аудитория занятия</h2>
                <p className="text-xs text-stone-500">
                  Интеграция отечественных платформ ВКС: запуск лекции или семинара в 1 клик.
                </p>
              </div>

              {/* Platform Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-medium">Платформа:</span>
                <select
                  value={selectedVcsPlatform}
                  onChange={(e) => setSelectedVcsPlatform(e.target.value as any)}
                  className="text-xs font-semibold bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800"
                >
                  <option value="Яндекс Телемост">Яндекс Телемост</option>
                  <option value="BigBlueButton">BigBlueButton (ВУЗ-сервер)</option>
                  <option value="VK Звонки">VK Звонки</option>
                  <option value="SberJazz">SberJazz</option>
                </select>
              </div>
            </div>

            {/* Launch bar */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900">Постоянная ссылка на аудиторию:</span>
                  <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 truncate max-w-xs">
                    {meetingUrl}
                  </span>
                </div>
                <p className="text-stone-500 text-[11px]">
                  Доступ открыт для студентов групп {activeCourse.groups.join(', ')} по единому SSO логину.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={copyMeetingLink}
                  className="px-3 py-1.5 rounded-lg border bg-white hover:bg-stone-100 text-stone-700 font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Скопировано!' : 'Копировать ссылку'}</span>
                </button>

                <button
                  onClick={() => setIsMeetingLive(!isMeetingLive)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition cursor-pointer flex items-center gap-2 ${
                    isMeetingLive
                      ? 'bg-rose-600 hover:bg-rose-700 animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{isMeetingLive ? 'Завершить трансляцию' : 'Начать пару в ВКС'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Virtual Room Simulator */}
            {isMeetingLive ? (
              <div className="bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 text-white shadow-xl">
                {/* Top meeting bar */}
                <div className="p-4 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <span className="font-bold text-red-400">ИДЕТ ПРЯМОЙ ЭФИР • {selectedVcsPlatform}</span>
                    <span className="text-stone-500">|</span>
                    <span className="text-stone-300">
                      Лекция: «Шаблоны оркестрации микросервисов (Saga)» (18 слушателей)
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-stone-400">HD 1080p • 60 fps</div>
                </div>

                {/* Main Video stage & Chat split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 h-80">
                  {/* Presentation / Video Stage */}
                  <div className="lg:col-span-2 bg-gradient-to-tr from-stone-900 via-stone-800 to-indigo-950/40 p-6 flex flex-col justify-between relative">
                    {isScreenSharing ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-400/30">
                            {screenShareSource === 'slides'
                              ? 'Демонстрация: Презентация_Лекция2.pdf (Слайд 14 из 32)'
                              : 'Демонстрация: IntelliJ IDEA — OrderSagaOrchestrator.java'}
                          </span>

                          <div className="flex items-center gap-1 bg-stone-900/80 p-0.5 rounded border border-stone-700">
                            <button
                              onClick={() => setScreenShareSource('slides')}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                                screenShareSource === 'slides' ? 'bg-indigo-600 text-white' : 'text-stone-400 hover:text-white'
                              }`}
                            >
                              Слайды
                            </button>
                            <button
                              onClick={() => setScreenShareSource('ide')}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                                screenShareSource === 'ide' ? 'bg-indigo-600 text-white' : 'text-stone-400 hover:text-white'
                              }`}
                            >
                              Код IDE
                            </button>
                          </div>
                        </div>

                        {screenShareSource === 'slides' ? (
                          <div>
                            <h3 className="text-base font-bold text-stone-100">
                              Оркестратор Саги: Координация распределенных транзакций
                            </h3>
                            <div className="p-4 rounded-xl bg-black/40 border border-white/10 backdrop-blur-xs text-xs font-mono text-stone-300 space-y-1 mt-2">
                              <p className="text-emerald-400 font-bold">// Поток выполнения:</p>
                              <p>1. OrderCreatedEvent -&gt; Отправка события в Kafka</p>
                              <p>2. CustomerService -&gt; Резервирование кредитного лимита</p>
                              <p>3. В случае сбоя -&gt; Откат (Rollback compensation flow)</p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-base font-bold text-stone-100 font-mono">
                              Live-кодинг: Spring Boot + Apache Kafka
                            </h3>
                            <pre className="p-3 rounded-xl bg-black/70 border border-emerald-500/30 font-mono text-[11px] text-emerald-300 mt-2 max-h-36 overflow-x-auto">
{`@KafkaListener(topics = "order-compensation")
public void compensate(@Payload OrderFailedEvent e) {
    inventoryService.releaseStock(e.getOrderId());
}`}
                            </pre>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-20 h-20 rounded-full bg-indigo-900/60 border-2 border-indigo-400/40 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                          СА
                        </div>
                        <div>
                          <p className="font-bold text-stone-100 text-sm">{activeCourse.title}</p>
                          <p className="text-xs text-stone-400">Смирнов Алексей Валерьевич (Лектор)</p>
                          <span className="inline-block mt-2 text-[10px] text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-800">
                            Трансляция с камеры лектора активна
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Teacher camera thumbnail */}
                    <div className="absolute right-4 bottom-4 w-32 h-24 rounded-xl bg-stone-900 border-2 border-indigo-500/50 overflow-hidden shadow-lg flex items-center justify-center text-center p-2">
                      {cameraOff ? (
                        <div className="text-[10px] text-stone-500">Камера отключена</div>
                      ) : (
                        <div className="text-[10px] text-stone-200">
                          <div className="font-bold">Смирнов А.В.</div>
                          <div className="text-[9px] text-emerald-400">Говорит...</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Chat sidebar */}
                  <div className="border-t lg:border-t-0 lg:border-l border-stone-800 bg-stone-900 flex flex-col justify-between">
                    <div className="p-3 border-b border-stone-800 text-xs font-bold text-stone-300 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Чат аудитории (28 онлайн)</span>
                    </div>

                    <div className="p-3 space-y-2 overflow-y-auto max-h-48 text-xs">
                      {meetingChat.map((m, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[10px] text-stone-400">
                            <span className="font-semibold text-stone-300">{m.sender}</span>
                            <span>{m.time}</span>
                          </div>
                          <p className="text-stone-200 text-[11px] bg-stone-800/80 p-2 rounded-lg">{m.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMeetingMessage} className="p-2 border-t border-stone-800 flex gap-1">
                      <input
                        type="text"
                        placeholder="Написать в чат занятия..."
                        value={newMeetingMsg}
                        onChange={(e) => setNewMeetingMsg(e.target.value)}
                        className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>

                {/* Bottom Control Bar */}
                <div className="p-3 bg-stone-900 border-t border-stone-800 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setMicMuted(!micMuted)}
                    className={`p-2.5 rounded-full transition ${
                      micMuted ? 'bg-red-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-white'
                    }`}
                    title={micMuted ? 'Включить микрофон' : 'Выключить микрофон'}
                  >
                    {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setCameraOff(!cameraOff)}
                    className={`p-2.5 rounded-full transition ${
                      cameraOff ? 'bg-red-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-white'
                    }`}
                    title={cameraOff ? 'Включить камеру' : 'Выключить камеру'}
                  >
                    {cameraOff ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`p-2.5 rounded-full transition cursor-pointer ${
                      isScreenSharing ? 'bg-indigo-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                    }`}
                    title={isScreenSharing ? 'Остановить демонстрацию экрана' : 'Включить демонстрацию экрана'}
                  >
                    <ScreenShare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsMeetingLive(false)}
                    className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition"
                  >
                    Выйти из конференции
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-stone-300 rounded-2xl text-center space-y-2">
                <Video className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="font-semibold text-stone-800 text-sm">Виртуальная аудитория готова к началу пары</p>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Нажмите «Начать пару в ВКС» для инициализации трансляции и открытия входа студентам.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Доска объявлений курса (ТЗ 3.5) */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">Объявления и рассылки студентам</h2>
            <button
              onClick={() => setShowNewAnnModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать объявление</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-5 rounded-2xl border bg-white shadow-xs space-y-2 transition ${
                  ann.isUrgent ? 'border-amber-400 bg-amber-50/20' : 'border-stone-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ann.isUrgent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Срочно
                      </span>
                    )}
                    <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      Для: {ann.groupTarget}
                    </span>
                    <span className="text-xs text-stone-400">{ann.publishedAt}</span>
                  </div>

                  <span className="text-[11px] text-stone-500">Просмотрено: {ann.viewsCount} студентами</span>
                </div>

                <h3 className="font-bold text-stone-900 text-sm sm:text-base">{ann.title}</h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 3: Форум и консультации (ТЗ 3.5) */}
      {activeSubTab === 'forum' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
            <h2 className="text-base font-bold text-stone-900">Внутренний форум и консультации по дисциплине</h2>
            <p className="text-xs text-stone-500">
              Студенты задают вопросы по теории, выполнению лабораторных работ и подготовке к экзамену.
            </p>

            {/* Questions Thread */}
            <div className="space-y-3 pt-2">
              {forumMessages.map((msg) => (
                <div key={msg.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900 text-xs">{msg.senderName}</span>
                    <span className="text-[11px] text-stone-400">{msg.sentAt}</span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{msg.topic}</h4>
                  <p className="text-xs text-stone-700">{msg.content}</p>
                </div>
              ))}
            </div>

            {/* Teacher Quick Post */}
            <form onSubmit={handlePostForumMessage} className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3 text-xs">
              <span className="font-bold text-blue-950 block">Опубликовать ответ / новую тему консультации:</span>
              <input
                type="text"
                required
                placeholder="Тема вопроса или раздела..."
                value={forumTopic}
                onChange={(e) => setForumTopic(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
              />
              <textarea
                rows={2}
                required
                placeholder="Текст пояснения или методический комментарий..."
                value={forumText}
                onChange={(e) => setForumText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs cursor-pointer"
              >
                Отправить в тред
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Новое объявление */}
      {showNewAnnModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-stone-900 text-base">Создать объявление для студентов</h3>
            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Заголовок</label>
                <input
                  type="text"
                  required
                  placeholder="например: Изменение времени защиты лабораторных"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full text-sm p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Группы адресатов</label>
                <select
                  value={newAnnGroup}
                  onChange={(e) => setNewAnnGroup(e.target.value)}
                  className="w-full text-sm p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="ИВТ-401, ПИ-302">Все группы потока (ИВТ-401, ПИ-302)</option>
                  <option value="ИВТ-401">Только группа ИВТ-401</option>
                  <option value="ПИ-302">Только группа ПИ-302</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Текст сообщения</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Введите текст объявления..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full text-sm p-2 rounded-lg border border-stone-300"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newAnnUrgent}
                  onChange={(e) => setNewAnnUrgent(e.target.checked)}
                  className="text-blue-600 rounded"
                />
                <span className="font-semibold text-stone-800">Пометить как срочное уведомление (Push + Email)</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewAnnModal(false)}
                  className="px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800"
                >
                  Опубликовать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
