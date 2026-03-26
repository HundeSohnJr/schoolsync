import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Collapsible theory/explanation panel for exercise modules.
 * Shows a small button that expands to reveal rules and tips.
 *
 * @param {string} title - Short label, e.g. "Erklärung"
 * @param {React.ReactNode} children - Theory content (JSX)
 */
export default function TheoryPanel({ title = 'Erklärung', children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-expanded={open}
      >
        <Lightbulb className="w-4 h-4" />
        <span>{title}</span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5" />
          : <ChevronDown className="w-3.5 h-3.5" />
        }
      </button>

      {open && (
        <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-gray-700 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
