import { createContext, useContext, useState, useEffect } from 'react';
import { MODULE_KEYS } from '../data/modules';

const AppContext = createContext(null);

const STORAGE_KEY = 'schoolsync-data';

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
const DEFAULT_STATE = {
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
    autoCheck: false,
    showTimer: true,
  },
};

const getInitialState = () => {
  let stored;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    console.error('localStorage nicht verfügbar:', e);
    return { ...DEFAULT_STATE, progress: buildDefaultProgress() };
  }

  if (stored) {
    try {
      const parsed = JSON.parse(stored);

      // Validate basic structure — if it's not an object, reset
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        console.warn('Ungültige Datenstruktur, wird zurückgesetzt');
        localStorage.removeItem(STORAGE_KEY);
        return { ...DEFAULT_STATE, progress: buildDefaultProgress() };
      }

      // Ensure streak is valid
      const streak = {
        count: typeof parsed.streak?.count === 'number' && isFinite(parsed.streak.count)
          ? parsed.streak.count : 0,
        lastVisit: parsed.streak?.lastVisit || null,
      };

      // Merge progress with defaults to support new module keys
      const defaultProgress = buildDefaultProgress();
      const mergedProgress = {};
      for (const key of Object.keys({ ...defaultProgress, ...parsed.progress })) {
        const def = defaultProgress[key] || { today: 0, total: 0, correct: 0, attempts: 0 };
        const existing = parsed.progress?.[key] || {};
        mergedProgress[key] = {
          today: typeof existing.today === 'number' && isFinite(existing.today) ? existing.today : def.today,
          total: typeof existing.total === 'number' && isFinite(existing.total) ? existing.total : def.total,
          correct: typeof existing.correct === 'number' && isFinite(existing.correct) ? existing.correct : def.correct,
          attempts: typeof existing.attempts === 'number' && isFinite(existing.attempts) ? existing.attempts : def.attempts,
        };
      }

      // Ensure errors is a valid array
      const errors = Array.isArray(parsed.errors) ? parsed.errors.slice(-20) : [];

      // Merge settings with defaults
      const settings = { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) };

      return { streak, progress: mergedProgress, errors, settings };
    } catch (e) {
      console.error('Fehler beim Laden der Daten, wird zurückgesetzt:', e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return { ...DEFAULT_STATE, progress: buildDefaultProgress() };
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
