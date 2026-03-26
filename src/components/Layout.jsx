import { NavLink } from 'react-router-dom';
import { Calculator, Grid3x3, BookOpen, Tag, Layers, PenTool, Clock, ArrowLeftRight, MessageCircle, Scissors, History, TrendingUp, Settings } from 'lucide-react';

/**
 * Layout-Komponente mit Sidebar-Navigation und Hauptbereich
 * Design: Digitales Schulheft mit Heftrand und Papier-Textur
 */
export default function Layout({ children }) {
  const navGroups = [
    {
      label: 'Mathe',
      items: [
        { path: '/schriftlich-rechnen', label: 'Schriftlich Rechnen', icon: Calculator },
        { path: '/einmaleins', label: '1×1 Training', icon: Grid3x3 },
        { path: '/uhrzeit', label: 'Uhrzeit', icon: Clock },
      ],
    },
    {
      label: 'Grammatik',
      items: [
        { path: '/wortarten', label: 'Wortarten', icon: BookOpen },
        { path: '/der-die-das', label: 'der/die/das', icon: Tag },
        { path: '/einzahl-mehrzahl', label: 'Einzahl & Mehrzahl', icon: ArrowLeftRight },
        { path: '/satzglieder', label: 'Satzglieder', icon: Layers },
        { path: '/satzarten', label: 'Satzarten . ? !', icon: MessageCircle },
        { path: '/zeitformen', label: 'Zeitformen', icon: History },
        { path: '/steigerung', label: 'Steigerung', icon: TrendingUp },
      ],
    },
    {
      label: 'Rechtschreibung',
      items: [
        { path: '/rechtschreibung', label: 'Rechtschreibung', icon: PenTool },
        { path: '/silbentrennung', label: 'Silbentrennung', icon: Scissors },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#fefefe]">
      {/* Sidebar Navigation */}
      <nav
        className="w-64 bg-white border-r-4 border-red-500 shadow-sm overflow-y-auto"
        aria-label="Hauptnavigation"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            SchoolSync
          </h1>

          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">
                {group.label}
              </h2>
              <ul className="space-y-1" role="list">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-150 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            isActive
                              ? 'bg-blue-100 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`
                        }
                        aria-current={({ isActive }) =>
                          isActive ? 'page' : undefined
                        }
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Einstellungen separat */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <NavLink
              to="/einstellungen"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-150 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Settings className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>Einstellungen</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Hauptbereich mit Schulheft-Design */}
      <main className="flex-1 paper-texture overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
