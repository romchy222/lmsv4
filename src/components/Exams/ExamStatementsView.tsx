import React, { useState } from 'react';
import { useLMS } from '../../context/LMSContext';
import {
  Award,
  ShieldCheck,
  Lock,
  Printer,
  FileCheck2,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  Sparkles,
  Key,
  Info,
  Calendar,
  Users,
  FileText,
  X,
} from 'lucide-react';
import { ExamStatement } from '../../types/lms';

export const ExamStatementsView: React.FC = () => {
  const { examStatements, students, profile, signExamStatementWithEDS, calculateStudentBRS } = useLMS();

  const [selectedStatementId, setSelectedStatementId] = useState<string>(examStatements[0]?.id || '');
  const [showSignModal, setShowSignModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const selectedStatement = examStatements.find((s) => s.id === selectedStatementId) || examStatements[0];
  const statementStudents = students.filter((s) => s.group === selectedStatement.groupName);

  const handleSignConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode || pinCode.length < 4) {
      setPinError('Введите 4-значный ПИН-код аппаратного токена или 2FA.');
      return;
    }

    setPinError('');
    setIsSigning(true);
    await new Promise((r) => setTimeout(r, 1000));
    await signExamStatementWithEDS(selectedStatement.id, profile.digitalCertificate.serialNumber);
    setIsSigning(false);
    setShowSignModal(false);
    setPinCode('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <h1 className="text-xl font-bold text-stone-900">Прием и контроль экзаменов / Зачетные ведомости</h1>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Формирование сессионных ведомостей из БРС, подписание усиленной квалифицированной ЭЦП (ГОСТ Р 34.10) и сдача в деканат.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl transition shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Печать ГОСТ-бланка</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Panel Layout: Statements list & Statement preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Statement Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-1">
            Ведомости сессии ({examStatements.length})
          </div>

          <div className="space-y-2.5">
            {examStatements.map((stmt) => {
              const isSelected = stmt.id === selectedStatementId;

              return (
                <div
                  key={stmt.id}
                  onClick={() => setSelectedStatementId(stmt.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-mono text-xs font-bold text-stone-900">{stmt.statementNumber}</div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        stmt.isSigned
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {stmt.isSigned ? 'Подписана ЭЦП' : 'Требует подписи'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-800 font-semibold mt-2 line-clamp-1">{stmt.disciplineName}</p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Группа: <span className="font-semibold text-stone-700">{stmt.groupName}</span> • Форма:{' '}
                    {stmt.controlType}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-400">
                    <span>{stmt.date}</span>
                    <span>{stmt.semester}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Statement Document Preview & Electronic Signature */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-6">
            {/* Header of official statement document */}
            <div className="border-b border-stone-200 pb-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                    Форма Министерства науки и высшего образования РФ (№ В-04)
                  </div>
                  <h2 className="text-lg font-bold text-stone-900 mt-0.5">
                    Экзаменационная ведомость {selectedStatement.statementNumber}
                  </h2>
                  <p className="text-xs text-stone-600">
                    Дисциплина: <span className="font-semibold text-stone-900">{selectedStatement.disciplineName}</span>
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {selectedStatement.isSigned ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-semibold">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Заблокирована (Сдана в деканат)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowSignModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Подписать ЭЦП и сдать</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <span className="text-stone-400 block text-[10px]">Группа:</span>
                  <span className="font-semibold text-stone-800">{selectedStatement.groupName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Форма контроля:</span>
                  <span className="font-semibold text-stone-800">{selectedStatement.controlType}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Семестр:</span>
                  <span className="font-semibold text-stone-800">{selectedStatement.semester}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Преподаватель:</span>
                  <span className="font-semibold text-stone-800">{profile.fullName}</span>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider">
                    <th className="p-3 w-10 text-center">№</th>
                    <th className="p-3">ФИО Студента</th>
                    <th className="p-3">№ Зачетной книжки</th>
                    <th className="p-3 text-center">Балл БРС (из 100)</th>
                    <th className="p-3 text-center">Оценка (ECTS)</th>
                    <th className="p-3 text-center">Итоговая оценка</th>
                    <th className="p-3 text-center">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {statementStudents.map((st, idx) => {
                    const brs = calculateStudentBRS(st.id);

                    return (
                      <tr key={st.id} className="hover:bg-stone-50 transition">
                        <td className="p-3 text-center text-stone-400 font-mono">{idx + 1}</td>
                        <td className="p-3 font-semibold text-stone-900">{st.fullName}</td>
                        <td className="p-3 font-mono text-stone-500">{st.recordBookNumber}</td>
                        <td className="p-3 text-center font-mono font-bold text-stone-900">{brs.totalPoints}</td>
                        <td className="p-3 text-center font-bold text-blue-700">{brs.ectsGrade}</td>
                        <td className="p-3 text-center font-bold">
                          <span className={brs.passStatus ? 'text-stone-900' : 'text-rose-600'}>
                            {brs.traditionalGrade}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              brs.passStatus ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {brs.passStatus ? 'Сдано' : 'Не сдано'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Official Digital Signature Stamp (ГОСТ Р 34.10) if signed */}
            {selectedStatement.isSigned && selectedStatement.digitalSignatureStamp && (
              <div className="p-5 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <span className="font-bold text-emerald-950 uppercase tracking-wide">
                      ДОКУМЕНТ ПОДПИСАН ЭЛЕКТРОННОЙ ПОДПИСЬЮ
                    </span>
                  </div>
                  <p className="text-emerald-900 text-[11px]">
                    Сертификат:{' '}
                    <span className="font-mono font-bold">
                      {selectedStatement.digitalSignatureStamp.certificateSerial}
                    </span>
                  </p>
                  <p className="text-emerald-900 text-[11px]">
                    Владелец: <span className="font-semibold">{selectedStatement.digitalSignatureStamp.signerName}</span>
                  </p>
                  <p className="text-emerald-900 text-[11px]">
                    Организация: {selectedStatement.digitalSignatureStamp.organization}
                  </p>
                  <p className="text-emerald-800 text-[10px]">
                    Метка времени: {selectedStatement.digitalSignatureStamp.timestamp} • Хэш ГОСТ: {selectedStatement.digitalSignatureStamp.signatureHash.substring(0, 24)}...
                  </p>
                </div>

                <div className="p-2 bg-white rounded-lg border border-emerald-300 shadow-2xs shrink-0 flex flex-col items-center">
                  <QrCode className="w-16 h-16 text-emerald-900" />
                  <span className="text-[9px] font-mono text-emerald-800 mt-1">Проверено ЦИТиС</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Подписание ЭЦП (ГОСТ) */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-stone-900 text-base">Подписание ведомости ЭЦП</h3>
              </div>
              <button onClick={() => setShowSignModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <p className="font-bold text-blue-900">Усиленная квалифицированная электронная подпись (УКЭП):</p>
                <p className="text-blue-800">
                  Сертификат: <span className="font-mono">{profile.digitalCertificate.serialNumber}</span>
                </p>
                <p className="text-blue-800">Владелец: {profile.digitalCertificate.owner}</p>
                <p className="text-blue-700 text-[11px]">Действителен до: {profile.digitalCertificate.validUntil}</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Внимание: после подписания ведомости редактирование оценок в системе блокируется, данные
                  автоматически отправляются в АСУ ВУЗ «1С:Университет ПРОФ» и деканат факультета.
                </p>
              </div>

              <form onSubmit={handleSignConfirm} className="space-y-3 pt-2">
                {pinError && (
                  <div className="p-2.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-300">
                    {pinError}
                  </div>
                )}
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    ПИН-код аппаратного токена (Рутокен / JaCarta) или 2FA-код:
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={8}
                    placeholder="Введите 4-значный ПИН..."
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full text-base p-2.5 rounded-xl border border-stone-300 font-mono tracking-widest text-center"
                    autoFocus
                  />
                  <span className="text-[11px] text-stone-400 block mt-1 text-center">
                    (Для тестирования введите любой 4-значный код, например: 1234)
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowSignModal(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSigning}
                    className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    {isSigning ? (
                      <span>Формирование подписи ГОСТ...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Подписать и зафиксировать</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Печатная форма ведомости по ГОСТу */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-stone-900 text-sm">Печатный бланк: Зачетно-экзаменационная ведомость</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const lines = [
                      'Министерство науки и высшего образования Российской Федерации',
                      'ФГАОУ ВО «НАЦИОНАЛЬНЫЙ ИССЛЕДОВАТЕЛЬСКИЙ УНИВЕРСИТЕТ»',
                      `ЗАЧЕТНО-ЭКЗАМЕНАЦИОННАЯ ВЕДОМОСТЬ № ${selectedStatement.statementNumber}`,
                      `Дисциплина: ${selectedStatement.disciplineName}`,
                      `Учебная группа: ${selectedStatement.groupName}`,
                      `Форма контроля: ${selectedStatement.controlType}`,
                      `Экзаменатор: ${profile.fullName} (${profile.academicDegree})`,
                      `Дата: ${selectedStatement.date}`,
                      '====================================================================',
                      '№  | ФИО Студента                     | № зачетки | Балл | Оценка',
                      '--------------------------------------------------------------------',
                      ...statementStudents.map((st, i) => {
                        const brs = calculateStudentBRS(st.id);
                        return `${(i + 1).toString().padEnd(3)}| ${st.fullName.padEnd(33)}| ${st.recordBookNumber.padEnd(10)}| ${brs.totalPoints.toString().padEnd(5)}| ${brs.traditionalGrade}`;
                      }),
                      '====================================================================',
                    ];
                    if (selectedStatement.isSigned && selectedStatement.digitalSignatureStamp) {
                      lines.push('ДОКУМЕНТ ПОДПИСАН УСИЛЕННОЙ КВАЛИФИЦИРОВАННОЙ ЭЛЕКТРОННОЙ ПОДПИСЬЮ:');
                      lines.push(`Сертификат: ${selectedStatement.digitalSignatureStamp.certificateSerial}`);
                      lines.push(`Владелец: ${selectedStatement.digitalSignatureStamp.signerName}`);
                      lines.push(`Дата подписания: ${selectedStatement.digitalSignatureStamp.timestamp}`);
                      lines.push(`Хэш-сумма подписи: ${selectedStatement.digitalSignatureStamp.signatureHash}`);
                    }
                    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Ведомость_${selectedStatement.statementNumber}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Скачать / Печать ведомости</span>
                </button>
                <button onClick={() => setShowPrintModal(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="text-center space-y-1 font-serif">
              <p className="text-xs uppercase tracking-wider text-stone-600">
                Министерство науки и высшего образования Российской Федерации
              </p>
              <p className="text-sm font-bold text-stone-900">
                ФГАОУ ВО «НАЦИОНАЛЬНЫЙ ИССЛЕДОВАТЕЛЬСКИЙ УНИВЕРСИТЕТ»
              </p>
              <h2 className="text-base font-extrabold text-stone-900 pt-2">
                ЗАЧЕТНО-ЭКЗАМЕНАЦИОННАЯ ВЕДОМОСТЬ № {selectedStatement.statementNumber}
              </h2>
            </div>

            <div className="text-xs font-serif space-y-1 border-y py-3">
              <p>Дисциплина: <span className="font-bold">{selectedStatement.disciplineName}</span></p>
              <p>Учебная группа: <span className="font-bold">{selectedStatement.groupName}</span></p>
              <p>Форма контроля: <span className="font-bold">{selectedStatement.controlType}</span></p>
              <p>Экзаменатор: <span className="font-bold">{profile.fullName}</span> ({profile.academicDegree})</p>
              <p>Дата проведения: <span className="font-bold">{selectedStatement.date}</span></p>
            </div>

            <table className="w-full text-left text-xs font-serif border border-stone-400 border-collapse">
              <thead>
                <tr className="border-b border-stone-400 bg-stone-100">
                  <th className="border-r border-stone-400 p-2 text-center w-8">№</th>
                  <th className="border-r border-stone-400 p-2">ФИО Студента</th>
                  <th className="border-r border-stone-400 p-2 text-center">№ зачетки</th>
                  <th className="border-r border-stone-400 p-2 text-center">Балл БРС</th>
                  <th className="border-r border-stone-400 p-2 text-center">Оценка</th>
                  <th className="p-2 text-center">Подпись экзаменатора</th>
                </tr>
              </thead>
              <tbody>
                {statementStudents.map((st, i) => {
                  const brs = calculateStudentBRS(st.id);
                  return (
                    <tr key={st.id} className="border-b border-stone-300">
                      <td className="border-r border-stone-300 p-2 text-center font-mono">{i + 1}</td>
                      <td className="border-r border-stone-300 p-2">{st.fullName}</td>
                      <td className="border-r border-stone-300 p-2 text-center font-mono">{st.recordBookNumber}</td>
                      <td className="border-r border-stone-300 p-2 text-center font-bold">{brs.totalPoints}</td>
                      <td className="border-r border-stone-300 p-2 text-center font-bold">{brs.traditionalGrade}</td>
                      <td className="p-2 text-center text-[10px] text-stone-500 italic">
                        {selectedStatement.isSigned ? 'Подписано ЭЦП ГОСТ' : '________________'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {selectedStatement.isSigned && selectedStatement.digitalSignatureStamp && (
              <div className="p-3 border border-stone-800 text-xs font-mono space-y-0.5">
                <p className="font-bold">ДОКУМЕНТ ПОДПИСАН ЭЛЕКТРОННОЙ ПОДПИСЬЮ В LMS ВУЗ</p>
                <p>Сертификат: {selectedStatement.digitalSignatureStamp.certificateSerial}</p>
                <p>Владелец: {selectedStatement.digitalSignatureStamp.signerName}</p>
                <p>Дата: {selectedStatement.digitalSignatureStamp.timestamp}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
