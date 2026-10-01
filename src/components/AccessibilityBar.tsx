import React from 'react';
import { useLMS } from '../context/LMSContext';
import { Eye, Type, Contrast, RotateCcw } from 'lucide-react';

export const AccessibilityBar: React.FC = () => {
  const { accessibility, updateAccessibility } = useLMS();

  if (!accessibility.enabled) return null;

  return (
    <div className="bg-amber-100 border-b border-amber-300 text-stone-900 px-4 py-2 text-sm font-sans flex flex-wrap items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-2 font-medium">
        <Eye className="w-4 h-4 text-amber-800" />
        <span>Панель доступности (Версия для слабовидящих — ФГОС ВО ст. 79)</span>
      </div>

      <div className="flex items-center flex-wrap gap-4">
        {/* Размер шрифта */}
        <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded border border-amber-200">
          <Type className="w-3.5 h-3.5 text-stone-600" />
          <span className="text-xs text-stone-600 mr-1">Шрифт:</span>
          <button
            onClick={() => updateAccessibility({ fontSize: 'normal' })}
            className={`px-2 py-0.5 text-xs rounded font-medium ${
              accessibility.fontSize === 'normal' ? 'bg-amber-800 text-white' : 'hover:bg-amber-200 text-stone-800'
            }`}
          >
            A (100%)
          </button>
          <button
            onClick={() => updateAccessibility({ fontSize: 'large' })}
            className={`px-2 py-0.5 text-sm rounded font-medium ${
              accessibility.fontSize === 'large' ? 'bg-amber-800 text-white' : 'hover:bg-amber-200 text-stone-800'
            }`}
          >
            A+ (125%)
          </button>
          <button
            onClick={() => updateAccessibility({ fontSize: 'huge' })}
            className={`px-2 py-0.5 text-base rounded font-bold ${
              accessibility.fontSize === 'huge' ? 'bg-amber-800 text-white' : 'hover:bg-amber-200 text-stone-800'
            }`}
          >
            A++ (150%)
          </button>
        </div>

        {/* Цветовая схема */}
        <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded border border-amber-200">
          <Contrast className="w-3.5 h-3.5 text-stone-600" />
          <span className="text-xs text-stone-600 mr-1">Контраст:</span>
          <button
            onClick={() => updateAccessibility({ contrastTheme: 'standard' })}
            className={`px-2 py-0.5 text-xs rounded font-medium ${
              accessibility.contrastTheme === 'standard' ? 'bg-stone-800 text-white' : 'hover:bg-amber-200 text-stone-800'
            }`}
          >
            Обычная
          </button>
          <button
            onClick={() => updateAccessibility({ contrastTheme: 'contrast_black_white' })}
            className={`px-2 py-0.5 text-xs rounded font-medium border border-stone-900 ${
              accessibility.contrastTheme === 'contrast_black_white'
                ? 'bg-black text-white font-bold'
                : 'bg-white text-black hover:bg-stone-100'
            }`}
          >
            Ч/Б
          </button>
          <button
            onClick={() => updateAccessibility({ contrastTheme: 'contrast_yellow_black' })}
            className={`px-2 py-0.5 text-xs rounded font-bold ${
              accessibility.contrastTheme === 'contrast_yellow_black'
                ? 'bg-yellow-400 text-black border-2 border-black'
                : 'bg-yellow-200 text-black hover:bg-yellow-300'
            }`}
          >
            Желтый на черном
          </button>
        </div>

        {/* Шрифт: с засечками или без */}
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded border border-amber-200">
          <span className="text-xs text-stone-600 mr-1">Гарнитура:</span>
          <button
            onClick={() => updateAccessibility({ fontFamily: 'sans' })}
            className={`px-2 py-0.5 text-xs rounded font-sans ${
              accessibility.fontFamily === 'sans' ? 'bg-amber-800 text-white' : 'hover:bg-amber-200 text-stone-800'
            }`}
          >
            Без засечек
          </button>
          <button
            onClick={() => updateAccessibility({ fontFamily: 'serif' })}
            className={`px-2 py-0.5 text-xs rounded font-serif ${
              accessibility.fontFamily === 'serif' ? 'bg-amber-800 text-white' : 'hover:bg-amber-200 text-stone-800'
            }`}
          >
            С засечками
          </button>
        </div>

        {/* Закрыть / сбросить */}
        <button
          onClick={() =>
            updateAccessibility({
              enabled: false,
              fontSize: 'normal',
              contrastTheme: 'standard',
              fontFamily: 'sans',
            })
          }
          className="flex items-center gap-1 text-xs text-amber-900 hover:text-red-700 underline font-medium cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Обычная версия
        </button>
      </div>
    </div>
  );
};
