import { NavLink } from 'react-router-dom';
import { Calculator, Grid3x3, BookOpen, Tag, Layers, PenTool, Clock, ArrowLeftRight, MessageCircle, Scissors, History, TrendingUp, Settings } from 'lucide-react';

/**
 * Layout-Komponente mit Sidebar-Navigation und Hauptbereich
 * Design: Digitales Schulheft mit Heftrand und Papier-Textur
 */
export default function Layout({ children }) {
  const navItems = [
    {
      path: '/schriftlich-rechnen',
      label: 'Mathe: Schriftlich Rechnen',
      icon: Calculator,
    },
    {
      path: '/einmaleins',
      label: 'Mathe: 1x1 Training',
      icon: Grid3x3,
    },
    {
      path: '/wortarten',
      label: 'Deutsch: Wortarten',
      icon: BookOpen,
    },
    {
      path: '/der-die-das',
      label: 'Deutsch: der/die/das',
      icon: Tag,
    },
    {
      path: '/satzglieder',
      label: 'Deutsch: Satzglieder',
      icon: Layers,
    },
    {
      path: '/rechtschreibung',
      label: 'Deutsch: Rechtschreibung',
      icon: PenTool,
    },
    {
      path: '/uhrzeit',
      label: 'Mathe: Uhrzeit',
      icon: Clock,
    },
    {
      path: '/einzahl-mehrzahl',
      label: 'Deutsch: Einzahl/Mehrzahl',
      icon: ArrowLeftRight,
    },
    {
      path: '/satzarten',
      label: 'Deutsch: Satzarten',
      icon: MessageCircle,
    },
    {
      path: '/silbentrennung',
      label: 'Deutsch: Silbentrennung',
      icon: Scissors,
    },
    {
      path: '/zeitformen',
      label: 'Deutsch: Zeitformen',
      icon: History,
    },
    {
      path: '/steigerung',
      label: 'Deutsch: Steigerung',
      icon: TrendingUp,
    },
    {
      path: '/einstellungen',
      label: 'Einstellungen',
      icon: Settings,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#fefefe]">
      {/* Sidebar Navigation */}
      <nav
        className="w-64 bg-white border-r-4 border-red-500 shadow-sm"
        aria-label="Hauptnavigation"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">
            SchoolSync
          </h1>

          {/* Navigationslinks */}
          <ul className="space-y-2" role="list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                    aria-current={({ isActive }) =>
                      isActive ? 'page' : undefined
                    }
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
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
