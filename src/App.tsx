/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LMSProvider, useLMS } from './context/LMSContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { AccessibilityBar } from './components/AccessibilityBar';
import { Navigation, TabType } from './components/Navigation';
import { DashboardView } from './components/Dashboard/DashboardView';
import { CoursesView } from './components/Courses/CoursesView';
import { JournalView } from './components/Journal/JournalView';
import { SubmissionsView } from './components/Submissions/SubmissionsView';
import { ExamStatementsView } from './components/Exams/ExamStatementsView';
import { CommunicationView } from './components/Communication/CommunicationView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { IntegrationsView } from './components/Integrations/IntegrationsView';
import { AuthModal } from './components/Auth/AuthModal';
import { MySQLManagerModal } from './components/Auth/MySQLManagerModal';
import { ShieldCheck, GraduationCap } from 'lucide-react';

const LMSApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { accessibility } = useLMS();

  // Dynamic styling for accessibility mode (ФГОС ВО ст. 79)
  const getAccessibilityClasses = () => {
    let classes = '';
    if (accessibility.enabled) {
      if (accessibility.fontSize === 'large') classes += ' text-[16px] leading-relaxed';
      if (accessibility.fontSize === 'huge') classes += ' text-[18px] leading-loose';
      if (accessibility.fontFamily === 'serif') classes += ' font-serif';

      if (accessibility.contrastTheme === 'contrast_black_white') {
        classes += ' bg-white text-black grayscale contrast-125';
      } else if (accessibility.contrastTheme === 'contrast_yellow_black') {
        classes += ' bg-black text-yellow-300';
      }
    }
    return classes;
  };

  return (
    <div className={`min-h-screen bg-stone-100/70 text-stone-900 font-sans flex flex-col ${getAccessibilityClasses()}`}>
      {/* Accessibility Toolbar */}
      <AccessibilityBar />

      {/* Academic Header */}
      <Header />

      {/* Navigation tabs */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'courses' && <CoursesView />}
        {activeTab === 'journal' && <JournalView />}
        {activeTab === 'submissions' && <SubmissionsView />}
        {activeTab === 'exams' && <ExamStatementsView />}
        {activeTab === 'communication' && <CommunicationView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'integrations' && <IntegrationsView />}
      </main>

      {/* University Footer */}
      <footer className="bg-white border-t border-stone-200 mt-auto py-5 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-800" />
            <span className="font-semibold text-stone-800">
              Единая цифровая образовательная среда (ЭИОС) университета
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-400 flex-wrap">
            <span>ФГОС ВО 3++</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ФЗ-152 «О персональных данных»
            </span>
            <span>•</span>
            <span>MySQL 8.0+ • Версия ПО: 4.8.2-Release</span>
          </div>
        </div>
      </footer>

      {/* Auth and MySQL Modals */}
      <AuthModal />
      <MySQLManagerModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LMSProvider>
        <LMSApp />
      </LMSProvider>
    </AuthProvider>
  );
}
