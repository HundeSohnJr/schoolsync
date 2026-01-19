import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'schoolsync-data';

/**
 * Initiale Datenstruktur
 */
const getInitialState = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Fehler beim Laden der Daten:', e);
    }
  }

  return {
    streak: {
      count: 0,
      lastVisit: null,
    },
    progress: {
      schriftlich: { today: 0, total: 0 },
      einmaleins: { today: 0, total: 0 },
      wortarten: { today: 0, total: 0 },
    },
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
 * @param {string|null} lastVisit - ISO Date String
 * @returns {boolean} true wenn Streak fortgesetzt werden kann
 */
const canContinueStreak = (lastVisit) => {
  if (!lastVisit) return false;

  const last = new Date(lastVisit);
  const today = new Date();

  // Setze beide Daten auf Mitternacht für Tagesvergleich
  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today - last;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // Streak bleibt bei 1 Tag Pause, resettet bei 2+ Tagen
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
      setState((prev) => ({
        ...prev,
        progress: {
          schriftlich: { ...prev.progress.schriftlich, today: 0 },
          einmaleins: { ...prev.progress.einmaleins, today: 0 },
          wortarten: { ...prev.progress.wortarten, today: 0 },
        },
      }));
    }
  }, [state.streak.lastVisit]);

  /**
   * Update Streak beim Lösen einer Aufgabe
   */
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

  /**
   * Erhöhe Fortschritt für ein Modul
   */
  const incrementProgress = (module) => {
    setState((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        [module]: {
          today: prev.progress[module].today + 1,
          total: prev.progress[module].total + 1,
        },
      },
    }));
    
    // Update Streak
    updateStreak();
  };

  /**
   * Füge Fehler zur Historie hinzu (max 20, FIFO)
   */
  const addError = (type, question) => {
    setState((prev) => {
      const newError = {
        type,
        question,
        date: new Date().toISOString(),
      };

      const updatedErrors = [...prev.errors, newError];
      
      // Behalte nur die letzten 20 Einträge
      if (updatedErrors.length > 20) {
        updatedErrors.shift();
      }

      return {
        ...prev,
        errors: updatedErrors,
      };
    });
  };

  /**
   * Update Settings
   */
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

/**
 * Custom Hook: useStreak
 * @returns {{ streak: number, lastVisit: string|null, updateStreak: function }}
 */
export function useStreak() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useStreak muss innerhalb von AppProvider verwendet werden');
  }

  return {
    streak: context.state.streak.count,
    lastVisit: context.state.streak.lastVisit,
    updateStreak: context.updateStreak,
  };
}

/**
 * Custom Hook: useProgress
 * @param {string} module - "schriftlich" | "einmaleins" | "wortarten"
 * @returns {{ today: number, total: number, increment: function }}
 */
export function useProgress(module) {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useProgress muss innerhalb von AppProvider verwendet werden');
  }

  const progress = context.state.progress[module];

  return {
    today: progress.today,
    total: progress.total,
    increment: () => context.incrementProgress(module),
  };
}

/**
 * Custom Hook: useErrors
 * @returns {{ errors: Array, addError: function }}
 */
export function useErrors() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useErrors muss innerhalb von AppProvider verwendet werden');
  }

  return {
    errors: context.state.errors,
    addError: context.addError,
  };
}

/**
 * Custom Hook: useSettings
 * @returns {{ textSize: string, highContrast: boolean, mathMethod: string, updateSettings: function }}
 */
export function useSettings() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useSettings muss innerhalb von AppProvider verwendet werden');
  }

  return {
    ...context.state.settings,
    updateSettings: context.updateSettings,
  };
}
