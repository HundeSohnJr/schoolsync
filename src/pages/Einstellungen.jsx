import { useSettings, useStreak, useAllProgress, useErrors } from '../context/AppContext';
import { Settings, Type, Contrast, RotateCcw, Flame } from 'lucide-react';

/**
 * Seite: Einstellungen
 * Erlaubt Anpassung von Textgröße, Kontrast und Rechenmethode
 */
export default function Einstellungen() {
  const { textSize, highContrast, mathMethod, difficulty, updateSettings } = useSettings();
  const { streak } = useStreak();
  const progress = useAllProgress();
  const { errors } = useErrors();

  const allModules = [
    { key: 'schriftlich', label: 'Schriftlich Rechnen' },
    { key: 'einmaleins', label: '1x1 Training' },
    { key: 'uhrzeit', label: 'Uhrzeit' },
    { key: 'wortarten', label: 'Wortarten' },
    { key: 'der-die-das', label: 'der/die/das' },
    { key: 'einzahl-mehrzahl', label: 'Einzahl & Mehrzahl' },
    { key: 'satzglieder', label: 'Satzglieder' },
    { key: 'satzarten', label: 'Satzarten' },
    { key: 'zeitformen', label: 'Zeitformen' },
    { key: 'steigerung', label: 'Steigerung' },
    { key: 'rechtschreibung', label: 'Rechtschreibung' },
    { key: 'silbentrennung', label: 'Silbentrennung' },
  ];

  const totalSessions = allModules.reduce((sum, m) => sum + (progress[m.key]?.total || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-800">Einstellungen</h1>
        </div>

        {/* Anzeige */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Type className="w-5 h-5" />
            Anzeige
          </h2>

          {/* Textgröße */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Textgröße
            </label>
            <div className="flex gap-2">
              {[
                { key: 'small', label: 'Klein', size: 'text-sm' },
                { key: 'normal', label: 'Normal', size: 'text-base' },
                { key: 'large', label: 'Groß', size: 'text-lg' },
              ].map(({ key, label, size }) => (
                <button
                  key={key}
                  onClick={() => updateSettings('textSize', key)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${size} ${
                    textSize === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Hoher Kontrast */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => updateSettings('highContrast', !highContrast)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  highContrast ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${
                    highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
              <div>
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                  <Contrast className="w-4 h-4" />
                  Hoher Kontrast
                </span>
                <span className="text-sm text-gray-500">Stärkere Farben und dickere Schrift</span>
              </div>
            </label>
          </div>
        </div>

        {/* Mathe-Einstellungen */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Mathe-Einstellungen
          </h2>

          {/* Subtraktionsmethode */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Subtraktionsmethode
            </label>
            <div className="flex gap-2">
              {['Entbündeln', 'Ergänzen'].map((method) => (
                <button
                  key={method}
                  onClick={() => updateSettings('mathMethod', method)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    mathMethod === method
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {mathMethod === 'Entbündeln'
                ? 'Zehner werden aufgelöst und zur nächsten Stelle addiert'
                : 'Die Ergänzungsmethode nutzt Auffüllen statt Abziehen'}
            </p>
          </div>

          {/* Standard-Schwierigkeit */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Standard-Schwierigkeit (Schriftliches Rechnen)
            </label>
            <div className="flex gap-2">
              {[
                { key: 'leicht', label: 'Leicht' },
                { key: 'mittel', label: 'Mittel' },
                { key: 'schwer', label: 'Schwer' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => updateSettings('difficulty', key)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    difficulty === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Statistiken */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Statistiken
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-gray-800">{streak}</div>
              <div className="text-sm text-gray-600">Tage-Streak</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">
                {totalSessions}
              </div>
              <div className="text-sm text-gray-600">Sessions gesamt</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {allModules.map((mod) => {
              const p = progress[mod.key] || { today: 0, total: 0 };
              return (
                <div key={mod.key} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-semibold text-gray-700 mb-1 truncate">{mod.label}</div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Heute: <span className="font-bold text-gray-700">{p.today}</span></span>
                    <span>Gesamt: <span className="font-bold text-gray-700">{p.total}</span></span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-600 mb-2">Fehler-Speicher</div>
            <div className="text-2xl font-bold text-gray-800">{errors.length}/20</div>
            <div className="text-sm text-gray-500">Gespeicherte Fehler</div>
          </div>
        </div>

        {/* Daten zurücksetzen */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Daten
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Alle Fortschritte, Streaks und Fehler werden im Browser gespeichert.
            Beim Zurücksetzen geht alles verloren.
          </p>
          <button
            onClick={() => {
              if (window.confirm('Wirklich alle Daten löschen? Streak, Fortschritt und Fehler gehen verloren.')) {
                localStorage.removeItem('schoolsync-data');
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors"
          >
            Alle Daten zurücksetzen
          </button>
        </div>
      </div>
    </div>
  );
}
