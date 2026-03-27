import { Link } from 'react-router-dom';
import { useAllProgress, useStreak } from '../context/AppContext';
import { Flame } from 'lucide-react';
import { DASHBOARD_SECTIONS } from '../data/modules';

const colorMap = {
  blue: {
    section: 'text-blue-700',
    bg: 'bg-blue-50',
    icon: 'text-blue-500',
    button: 'bg-blue-500 hover:bg-blue-600',
    border: 'border-blue-200',
  },
  purple: {
    section: 'text-purple-700',
    bg: 'bg-purple-50',
    icon: 'text-purple-500',
    button: 'bg-purple-500 hover:bg-purple-600',
    border: 'border-purple-200',
  },
  green: {
    section: 'text-green-700',
    bg: 'bg-green-50',
    icon: 'text-green-500',
    button: 'bg-green-500 hover:bg-green-600',
    border: 'border-green-200',
  },
};

export default function Dashboard() {
  const progress = useAllProgress();
  const { streak } = useStreak();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Hallo Fina!
          </h1>
          <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full">
            <Flame className="w-5 h-5" />
            <span className="font-bold text-lg">{streak}</span>
            <span className="text-sm font-medium">Tage</span>
          </div>
        </div>

        {/* Sections */}
        {DASHBOARD_SECTIONS.map((section) => {
          const colors = colorMap[section.color];
          return (
            <div key={section.label} className="mb-8">
              <h2 className={`text-lg font-bold uppercase tracking-wider mb-4 ${colors.section}`}>
                {section.label}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {section.modules.map((mod) => {
                  const Icon = mod.icon;
                  const p = progress[mod.key] || { today: 0, total: 0, correct: 0, attempts: 0 };
                  const accuracy = p.attempts > 0 ? p.correct / p.attempts : null;
                  const hasBadge = p.attempts >= 5;

                  let badgeLabel = null;
                  let badgeColor = null;
                  if (hasBadge && accuracy !== null) {
                    if (accuracy >= 0.85) {
                      badgeLabel = 'Super!';
                      badgeColor = 'bg-green-500 text-white';
                    } else if (accuracy >= 0.60) {
                      badgeLabel = 'Gut';
                      badgeColor = 'bg-yellow-400 text-yellow-900';
                    } else {
                      badgeLabel = 'Üben!';
                      badgeColor = 'bg-red-500 text-white';
                    }
                  }

                  return (
                    <div
                      key={mod.key}
                      className={`${colors.bg} border ${colors.border} rounded-xl p-4 flex flex-col items-center text-center transition-transform hover:scale-105 hover:shadow-md relative`}
                    >
                      {badgeLabel && (
                        <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeColor}`}>
                          {badgeLabel}
                        </span>
                      )}
                      <Icon className={`w-8 h-8 mb-2 ${colors.icon}`} />
                      <h3 className="font-semibold text-gray-800 text-sm mb-2 leading-tight">
                        {mod.label}
                      </h3>
                      <div className="text-xs text-gray-500 mb-3 space-y-0.5">
                        <div>Heute: <span className="font-bold text-gray-700">{p.today}</span></div>
                        <div>Gesamt: <span className="font-bold text-gray-700">{p.total}</span></div>
                      </div>
                      <Link
                        to={mod.path}
                        className={`mt-auto px-4 py-1.5 ${colors.button} text-white text-sm font-semibold rounded-lg transition-colors`}
                      >
                        Üben
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
