import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'schoolsync-data';

/**
 * All module keys for progress tracking
 */
const MODULE_KEYS = [
  'schriftlich', 'einmaleins', 'kopfrechnen', 'geld-rechnen', 'uhrzeit', 'zahlenraum',
  'wortarten', 'der-die-das', 'einzahl-mehrzahl',
  'satzglieder', 'satzarten', 'zeitformen',
  'steigerung', 'rechtschreibung', 'silbentrennung', 'gross-klein',
];

const buildDefaultProgress = () => {
  const progress = {};
  for (const key of MODULE_KEYS) {
    progress[key] = { today: 0, total: 0, correct: 0, attempts: 0 };
  }
  return progress;
};

/**
 * Initiale Datenstruktur
 */
const getInitialState = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Merge with defaults to support new module keys and new fields
      const defaultProgress = buildDefaultProgress();
      const mergedProgress = {};
      for (const key of Object.keys({ ...defaultProgress, ...parsed.progress })) {
        const def = defaultProgress[key] || { today: 0, total: 0, correct: 0, attempts: 0 };
        const existing = parsed.progress?.[key] || {};
        mergedProgress[key] = {
          today: existing.today ?? def.today,
          total: existing.total ?? def.total,
          correct: existing.correct ?? def.correct,
          attempts: existing.attempts ?? def.attempts,
        };
      }
      parsed.progress = mergedProgress;
      return parsed;
    } catch (e) {
      console.error('Fehler beim Laden der Daten:', e);
    }
  }

  return {
    streak: {
      count: 0,
      lastVisit: null,
    },
    progress: buildDefaultProgress(),
    errors: [],
    settings: {
      textSize: 'normal',
      highContrast: false,
      mathMethod: 'Entbündeln',
      difficulty: 'mittel',
    },
  };
};

/**
 * Berechnet ob Streak fortgesetzt werden kann
 */
const canContinueStreak = (lastVisit) => {
  if (!lastVisit) return false;

  const last = new Date(lastVisit);
  const today = new Date();

  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today - last;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays <= 2;
};

/**
 * Prüft ob es ein neuer Tag ist
 */
const isNewDay = (lastVisit) => {
  if (!lastVisit) return true;

  const last = new Date(lastVisit);
  const today = new Date();

  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return today > last;
};

/**
 * AppProvider - Verwaltet globalen App-State mit localStorage
 */
export function AppProvider({ children }) {
  const [state, setState] = useState(getInitialState);

  // Speichere State in localStorage bei jeder Änderung
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Reset "today" counts wenn neuer Tag
  useEffect(() => {
    if (isNewDay(state.streak.lastVisit)) {
      setState((prev) => {
        const resetProgress = {};
        for (const key of Object.keys(prev.progress)) {
          resetProgress[key] = { ...prev.progress[key], today: 0 };
        }
        return { ...prev, progress: resetProgress };
      });
    }
  }, [state.streak.lastVisit]);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    // Text size
    root.classList.remove('text-size-small', 'text-size-normal', 'text-size-large');
    root.classList.add(`text-size-${state.settings.textSize}`);
    // High contrast
    root.classList.toggle('high-contrast', state.settings.highContrast);
  }, [state.settings.textSize, state.settings.highContrast]);

  const updateStreak = () => {
    const now = new Date().toISOString();

    setState((prev) => {
      const canContinue = canContinueStreak(prev.streak.lastVisit);
      const isNew = isNewDay(prev.streak.lastVisit);

      return {
        ...prev,
        streak: {
          count: canContinue && isNew ? prev.streak.count + 1 : !isNew ? prev.streak.count : 1,
          lastVisit: now,
        },
      };
    });
  };

  const incrementProgress = (module, wasCorrect) => {
    setState((prev) => {
      const current = prev.progress[module] || { today: 0, total: 0, correct: 0, attempts: 0 };
      const updated = { ...current };

      if (wasCorrect === undefined) {
        // Legacy call: session completion (increment today/total as before)
        updated.today = current.today + 1;
        updated.total = current.total + 1;
      } else {
        // New call: also track accuracy
        updated.today = current.today + 1;
        updated.total = current.total + 1;
        updated.attempts = current.attempts + 1;
        if (wasCorrect) {
          updated.correct = current.correct + 1;
        }
      }

      return {
        ...prev,
        progress: {
          ...prev.progress,
          [module]: updated,
        },
      };
    });

    updateStreak();
  };

  const recordAttempt = (module, wasCorrect) => {
    setState((prev) => {
      const current = prev.progress[module] || { today: 0, total: 0, correct: 0, attempts: 0 };
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [module]: {
            ...current,
            attempts: current.attempts + 1,
            correct: wasCorrect ? current.correct + 1 : current.correct,
          },
        },
      };
    });
  };

  const addError = (type, question) => {
    setState((prev) => {
      const newError = {
        type,
        question,
        date: new Date().toISOString(),
      };

      const updatedErrors = [...prev.errors, newError];

      if (updatedErrors.length > 20) {
        updatedErrors.shift();
      }

      return {
        ...prev,
        errors: updatedErrors,
      };
    });
  };

  const updateSettings = (key, value) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }));
  };

  const value = {
    state,
    updateStreak,
    incrementProgress,
    recordAttempt,
    addError,
    updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useStreak() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useStreak muss innerhalb von AppProvider verwendet werden');

  return {
    streak: context.state.streak.count,
    lastVisit: context.state.streak.lastVisit,
    updateStreak: context.updateStreak,
  };
}

export function useProgress(module) {
  const context = useContext(AppContext);
  if (!context) throw new Error('useProgress muss innerhalb von AppProvider verwendet werden');

  const progress = context.state.progress[module] || { today: 0, total: 0, correct: 0, attempts: 0 };

  return {
    today: progress.today,
    total: progress.total,
    correct: progress.correct,
    attempts: progress.attempts,
    increment: (wasCorrect) => context.incrementProgress(module, wasCorrect),
  };
}

export function useRecordAttempt() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useRecordAttempt muss innerhalb von AppProvider verwendet werden');
  return context.recordAttempt;
}

export function useAllProgress() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAllProgress muss innerhalb von AppProvider verwendet werden');
  return context.state.progress;
}

export function useErrors() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useErrors muss innerhalb von AppProvider verwendet werden');

  return {
    errors: context.state.errors,
    addError: context.addError,
  };
}

export function useSettings() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useSettings muss innerhalb von AppProvider verwendet werden');

  return {
    ...context.state.settings,
    updateSettings: context.updateSettings,
  };
}
