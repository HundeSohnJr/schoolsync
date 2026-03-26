import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Calculator, Grid3x3, BookOpen, Tag, Layers, PenTool, Clock, ArrowLeftRight, MessageCircle, Scissors, History, TrendingUp, Settings, Menu, X, Home } from 'lucide-react';

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

function NavContent({ onItemClick }) {
  return (
    <>
      {navGroups.map((group) => (
        <div key={group.label} className="mb-4">
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
                    onClick={onItemClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-150 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
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

      <div className="mt-2 pt-3 border-t border-gray-200">
        <NavLink
          to="/einstellungen"
          onClick={onItemClick}
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
    </>
  );
}

/**
 * Layout-Komponente mit responsiver Navigation
 * Desktop: Sidebar | Mobile: Hamburger-Menü mit Overlay
 */
export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Find current page label for mobile header
  const allItems = navGroups.flatMap(g => g.items);
  const currentItem = allItems.find(item => item.path === location.pathname);
  const currentLabel = currentItem?.label || 'SchoolSync';

  return (
    <div className="flex min-h-screen bg-[#fefefe]">
      {/* Desktop Sidebar — hidden on mobile */}
      <nav
        className="hidden md:block w-64 bg-white border-r-4 border-red-500 shadow-sm overflow-y-auto flex-shrink-0"
        aria-label="Hauptnavigation"
      >
        <div className="p-6">
          <Link to="/" className="block text-2xl font-bold text-gray-800 mb-6 hover:text-blue-600 transition-colors">
            SchoolSync
          </Link>
          <NavContent onItemClick={() => {}} />
        </div>
      </nav>

      {/* Mobile Header — shown on mobile only */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b-4 border-red-500 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Menü öffnen"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <Link to="/" className="text-lg font-bold text-gray-800 truncate hover:text-blue-600 transition-colors">
            {currentLabel}
          </Link>
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Startseite"
          >
            <Home className="w-5 h-5 text-gray-700" />
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Slide-in menu */}
          <nav
            className="absolute top-0 left-0 bottom-0 w-72 bg-white shadow-xl overflow-y-auto"
            aria-label="Hauptnavigation"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                  SchoolSync
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Menü schließen"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
              <NavContent onItemClick={() => setMobileMenuOpen(false)} />
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 paper-texture overflow-auto">
        {/* Mobile top padding for fixed header */}
        <div className="md:hidden h-14" />
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
