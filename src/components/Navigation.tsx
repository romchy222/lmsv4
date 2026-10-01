import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileCheck2,
  Award,
  Video,
  BarChart3,
  Server,
} from 'lucide-react';
import { useLMS } from '../context/LMSContext';

export type TabType =
  | 'dashboard'
  | 'courses'
  | 'journal'
  | 'submissions'
  | 'exams'
  | 'communication'
  | 'analytics'
  | 'integrations';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { submissions, examStatements, role } = useLMS();

  const pendingSubmissions = submissions.filter((s) => s.status === 'submitted').length;
  const unsignedStatements = examStatements.filter((s) => !s.isSigned).length;

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Дашборд',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'courses' as TabType,
      label: 'Мои курсы и КУМ',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'journal' as TabType,
      label: 'Журнал и БРС',
      icon: ClipboardList,
      badge: null,
    },
    {
      id: 'submissions' as TabType,
      label: 'Проверка работ',
      icon: FileCheck2,
      badge: pendingSubmissions > 0 ? pendingSubmissions : null,
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'exams' as TabType,
      label: 'Ведомости и ЭЦП',
      icon: Award,
      badge: unsignedStatements > 0 ? `${unsignedStatements} на подпись` : null,
      badgeColor: 'bg-amber-600 text-white font-semibold',
    },
    {
      id: 'communication' as TabType,
      label: 'Коммуникация и ВКС',
      icon: Video,
      badge: null,
    },
    {
      id: 'analytics' as TabType,
      label: role === 'head_of_department' ? 'Аналитика кафедры' : 'Аналитика',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'integrations' as TabType,
      label: 'Интеграции и Аудит',
      icon: Server,
      badge: null,
    },
  ];

  return (
    <nav className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full uppercase tracking-wider ${
                      item.badgeColor || 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
