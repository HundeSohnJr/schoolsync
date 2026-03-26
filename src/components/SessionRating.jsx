import { useState } from 'react';

/**
 * SessionRating — Selbsteinschätzung nach einer Session
 * Zeigt 3 Emoji-Buttons: Leicht / Mittel / Schwer
 * Bei Klick wird ein "Danke!"-Feedback angezeigt
 */
export default function SessionRating() {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <div className="text-center my-6 py-4">
        <p className="text-lg text-gray-600 font-semibold">Danke!</p>
      </div>
    );
  }

  return (
    <div className="text-center my-6 py-4">
      <p className="text-sm text-gray-500 mb-3 font-semibold">
        Wie schwer war das für dich?
      </p>
      <div className="flex gap-4 justify-center">
        {[
          { emoji: '\uD83D\uDE0A', label: 'Leicht' },
          { emoji: '\uD83D\uDE10', label: 'Mittel' },
          { emoji: '\uD83D\uDE13', label: 'Schwer' },
        ].map(({ emoji, label }) => (
          <button
            key={label}
            onClick={() => setSelected(label)}
            className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-xs font-semibold text-gray-600">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
