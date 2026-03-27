import { useState, useRef, useEffect, useCallback } from 'react';
import { useStreak, useProgress, useErrors, useSettings } from '../context/AppContext';
import { Flame, Check, X, Trophy, Zap, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';
import SessionRating from '../components/SessionRating';

// ---------------------------------------------------------------------------
// Modus-Definitionen
// ---------------------------------------------------------------------------
const MODES = [
  { key: 'gemischt', label: 'Gemischt' },
  { key: 'stellenwerte', label: 'Stellenwerte' },
  { key: 'vergleichen', label: 'Vergleichen & Ordnen' },
  { key: 'runden', label: 'Runden' },
  { key: 'zahlenfolgen', label: 'Zahlenfolgen' },
];

const DIFFICULTIES = [
  { key: 'leicht', label: 'Leicht', color: '#22c55e' },
  { key: 'mittel', label: 'Mittel', color: '#eab308' },
  { key: 'schwer', label: 'Schwer', color: '#ef4444' },
];

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const maxNumber = (difficulty) =>
  difficulty === 'leicht' ? 500 : 1000;

/** Shuffle an array (Fisher-Yates) */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ---------------------------------------------------------------------------
// Aufgaben-Generatoren
// ---------------------------------------------------------------------------

/**
 * Stellenwerte — Identify H/Z/E or compose number from H+Z+E
 * Returns { display, answer, options, mode }
 */
const generateStellenwerte = (difficulty) => {
  const max = maxNumber(difficulty);
  const n = rand(100, max);
  const h = Math.floor(n / 100);
  const z = Math.floor((n % 100) / 10);
  const e = n % 10;

  const variant = rand(0, 3);

  if (variant === 0) {
    // Ask for Hunderter
    return {
      display: `${n} — Wie viele Hunderter?`,
      answer: h,
      options: null,
      mode: 'stellenwerte',
    };
  } else if (variant === 1) {
    // Ask for Zehner
    return {
      display: `${n} — Wie viele Zehner?`,
      answer: z,
      options: null,
      mode: 'stellenwerte',
    };
  } else if (variant === 2) {
    // Ask for Einer
    return {
      display: `${n} — Wie viele Einer?`,
      answer: e,
      options: null,
      mode: 'stellenwerte',
    };
  } else {
    // Reverse: compose from H+Z+E
    const choices = new Set([n]);
    while (choices.size < 4) {
      // Generate plausible wrong answers by swapping digits
      const variants = [
        h * 100 + e * 10 + z,
        z * 100 + h * 10 + e,
        e * 100 + z * 10 + h,
        h * 100 + z * 10 + rand(0, 9),
        h * 100 + rand(0, 9) * 10 + e,
        rand(1, 9) * 100 + z * 10 + e,
      ].filter((v) => v >= 100 && v <= 999);
      if (variants.length > 0) {
        choices.add(pick(variants));
      } else {
        choices.add(rand(100, 999));
      }
    }
    return {
      display: `${h}H + ${z}Z + ${e}E = ?`,
      answer: n,
      options: shuffle([...choices]),
      mode: 'stellenwerte',
    };
  }
};

/**
 * Vergleichen & Ordnen
 */
const generateVergleichen = (difficulty) => {
  const max = maxNumber(difficulty);
  const isOrdering = Math.random() < 0.35;

  if (isOrdering) {
    // Ordering: arrange 4 numbers smallest to largest
    const count = difficulty === 'schwer' ? 5 : 4;
    const nums = new Set();
    while (nums.size < count) {
      nums.add(rand(100, max));
    }
    const sorted = [...nums].sort((a, b) => a - b);
    // Generate 3 wrong orderings
    const options = new Set();
    options.add(sorted.join(', '));
    let attempts = 0;
    while (options.size < 4 && attempts < 50) {
      const shuffled = shuffle([...nums]);
      const key = shuffled.join(', ');
      if (key !== sorted.join(', ')) {
        options.add(key);
      }
      attempts++;
    }
    // Fill remaining with reversed if needed
    if (options.size < 4) {
      options.add([...sorted].reverse().join(', '));
    }

    return {
      display: `Ordne: ${shuffle([...nums]).join(', ')}`,
      answer: sorted.join(', '),
      options: shuffle([...options]),
      mode: 'vergleichen',
    };
  }

  // Comparison: pick >, < or =
  let a = rand(100, max);
  let b;
  if (Math.random() < 0.1) {
    b = a; // occasional equal
  } else {
    b = rand(100, max);
    while (b === a) b = rand(100, max);
  }

  const correctSymbol = a > b ? '>' : a < b ? '<' : '=';

  return {
    display: `${a} ___ ${b}`,
    answer: correctSymbol,
    options: ['<', '>', '='],
    mode: 'vergleichen',
  };
};

/**
 * Runden
 */
const generateRunden = (difficulty) => {
  const max = maxNumber(difficulty);
  const n = rand(101, max - 1);

  // Difficulty determines what rounding is available
  const roundTypes =
    difficulty === 'leicht'
      ? ['zehner']
      : ['zehner', 'hunderter'];
  const roundTo = pick(roundTypes);

  let answer;
  let label;

  if (roundTo === 'zehner') {
    answer = Math.round(n / 10) * 10;
    label = `Runde ${n} auf den nächsten Zehner`;
  } else {
    answer = Math.round(n / 100) * 100;
    label = `Runde ${n} auf den nächsten Hunderter`;
  }

  // Generate plausible multiple-choice options
  const choices = new Set([answer]);
  if (roundTo === 'zehner') {
    choices.add(Math.floor(n / 10) * 10);
    choices.add(Math.ceil(n / 10) * 10);
    choices.add(Math.round(n / 100) * 100);
    // Add one more if needed
    while (choices.size < 4) {
      choices.add(Math.floor(n / 10) * 10 + pick([-10, 10, 20, -20]));
    }
  } else {
    choices.add(Math.floor(n / 100) * 100);
    choices.add(Math.ceil(n / 100) * 100);
    choices.add(Math.round(n / 10) * 10);
    while (choices.size < 4) {
      choices.add(Math.floor(n / 100) * 100 + pick([-100, 100, 200]));
    }
  }

  return {
    display: label,
    answer,
    options: shuffle([...choices].filter((v) => v >= 0).slice(0, 4)),
    mode: 'runden',
  };
};

/**
 * Zahlenfolgen — find the missing number in a sequence
 */
const generateZahlenfolgen = (difficulty) => {
  let steps;
  if (difficulty === 'leicht') {
    steps = [10, 100, -10, -100];
  } else if (difficulty === 'mittel') {
    steps = [5, 10, 25, 50, 100, -5, -10, -25, -50, -100];
  } else {
    steps = [5, 10, 11, 15, 25, 50, 100, -5, -10, -11, -15, -25, -50];
  }

  const step = pick(steps);
  const seqLength = 5;
  const gapIndex = rand(1, seqLength - 2); // Gap not at first or last

  // Determine a valid start so all values stay in range 0..1000
  let minStart, maxStart;
  if (step > 0) {
    minStart = Math.max(0, 0);
    maxStart = Math.max(minStart, 1000 - step * (seqLength - 1));
  } else {
    minStart = Math.max(0, -step * (seqLength - 1));
    maxStart = 1000;
  }
  if (maxStart < minStart) maxStart = minStart;

  const start = rand(minStart, maxStart);
  const sequence = [];
  for (let i = 0; i < seqLength; i++) {
    sequence.push(start + step * i);
  }

  const answer = sequence[gapIndex];
  const displayParts = sequence.map((v, i) =>
    i === gapIndex ? '___' : String(v)
  );

  // Multiple-choice options
  const choices = new Set([answer]);
  choices.add(answer + step);
  choices.add(answer - step);
  choices.add(answer + Math.abs(step) * (Math.random() < 0.5 ? 2 : -1));
  while (choices.size < 4) {
    choices.add(answer + rand(-3, 3) * Math.max(1, Math.abs(step)));
  }

  return {
    display: displayParts.join(', '),
    answer,
    options: shuffle(
      [...choices].filter((v) => v >= 0 && v <= 1000).slice(0, 4)
    ),
    mode: 'zahlenfolgen',
  };
};

/**
 * Erzeugt eine einzelne Aufgabe je nach Modus & Schwierigkeit
 */
const generateQuestion = (mode, difficulty) => {
  if (mode === 'gemischt') {
    const sub = pick(['stellenwerte', 'vergleichen', 'runden', 'zahlenfolgen']);
    return generateQuestion(sub, difficulty);
  }
  switch (mode) {
    case 'stellenwerte':
      return generateStellenwerte(difficulty);
    case 'vergleichen':
      return generateVergleichen(difficulty);
    case 'runden':
      return generateRunden(difficulty);
    case 'zahlenfolgen':
      return generateZahlenfolgen(difficulty);
    default:
      return generateStellenwerte(difficulty);
  }
};

/**
 * Erzeugt eine Session mit 10 Aufgaben
 */
const generateSession = (mode, difficulty) => {
  const questions = [];
  for (let i = 0; i < 10; i++) {
    questions.push(generateQuestion(mode, difficulty));
  }
  return questions;
};

// ---------------------------------------------------------------------------
// Speed-Rating
// ---------------------------------------------------------------------------
const getSpeedRating = (seconds) => {
  if (seconds < 3) return { label: 'Blitzschnell!', color: 'text-green-600' };
  if (seconds < 6) return { label: 'Gut!', color: 'text-blue-600' };
  if (seconds < 10) return { label: 'Okay', color: 'text-yellow-600' };
  return { label: 'Übe weiter', color: 'text-orange-600' };
};

// ---------------------------------------------------------------------------
// Personalisierte Nachrichten
// ---------------------------------------------------------------------------
const FAST_MESSAGES = [
  'Blitzschnell, Fina!',
  'So schnell wie Loki!',
  'Papa wäre stolz!',
];

const STREAK_MESSAGES = [
  'Fina, du bist ein Zahlengenie!',
  'Unglaublich, Fina!',
];

// ---------------------------------------------------------------------------
// Mode Labels
// ---------------------------------------------------------------------------
const MODE_LABELS = {
  stellenwerte: 'Stellenwerte',
  vergleichen: 'Vergleichen & Ordnen',
  runden: 'Runden',
  zahlenfolgen: 'Zahlenfolgen',
};

// ---------------------------------------------------------------------------
// Komponente
// ---------------------------------------------------------------------------
export default function Zahlenraum() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('zahlenraum');
  const { addError } = useErrors();
  const { autoCheck: autoCheckSetting, showTimer } = useSettings();

  // Session state
  const [mode, setMode] = useState('gemischt');
  const [difficulty, setDifficulty] = useState('mittel');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [sessionResults, setSessionResults] = useState([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);

  // Timer state
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Streak modal
  const [showStreakModal, setShowStreakModal] = useState(false);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const autoCheckFiredRef = useRef(false);

  // -------------------------------------------------------------------------
  // Timer
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (showFeedback || isSessionComplete) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds(((Date.now() - questionStartTime) / 1000));
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [questionStartTime, showFeedback, isSessionComplete]);

  // -------------------------------------------------------------------------
  // Session starten
  // -------------------------------------------------------------------------
  const startNewSession = useCallback((newMode = mode, newDifficulty = difficulty) => {
    const q = generateSession(newMode, newDifficulty);
    setMode(newMode);
    setDifficulty(newDifficulty);
    setQuestions(q);
    setCurrentIndex(0);
    setSessionResults([]);
    setIsSessionComplete(false);
    setCorrectStreak(0);
    setUserAnswer('');
    setShowFeedback(false);
    setIsCorrect(null);
    setCorrectAnswer(null);
    setFeedbackMessage('');
    setQuestionStartTime(Date.now());
    setElapsedSeconds(0);
    autoCheckFiredRef.current = false;
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [mode, difficulty]);

  // Initiale Session
  useEffect(() => {
    startNewSession('gemischt', 'mittel');
  }, []);

  // -------------------------------------------------------------------------
  // Antwort prüfen
  // -------------------------------------------------------------------------
  const handleCheck = (selectedOption) => {
    const current = questions[currentIndex];
    const hasOptions = current.options !== null;

    // Determine what the user answered
    let userValue;
    if (hasOptions) {
      userValue = selectedOption;
    } else {
      const answerStr = typeof selectedOption === 'string' ? selectedOption : userAnswer;
      if (!answerStr && answerStr !== '0') return;
      userValue = parseInt(answerStr, 10);
    }

    const timeTaken = (Date.now() - questionStartTime) / 1000;

    // Compare: options may be string or number
    let correct;
    if (typeof current.answer === 'string') {
      correct = String(userValue) === current.answer;
    } else {
      correct = Number(userValue) === current.answer;
    }

    const result = {
      display: current.display,
      userAnswer: userValue,
      correctAnswer: current.answer,
      correct,
      time: timeTaken,
      mode: current.mode,
    };

    const newResults = [...sessionResults, result];
    setSessionResults(newResults);
    setIsCorrect(correct);
    setCorrectAnswer(current.answer);
    setShowFeedback(true);

    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);

      if (timeTaken < 3) {
        setFeedbackMessage(pick(FAST_MESSAGES));
      } else if (newStreak >= 5) {
        setFeedbackMessage(pick(STREAK_MESSAGES));
      } else {
        setFeedbackMessage('');
      }

      if (newStreak === 10) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b'],
        });
        setShowStreakModal(true);
        setCorrectStreak(0);
      }

      setTimeout(() => advanceToNext(newResults), 800);
    } else {
      addError('zahlenraum', current.display);
      setCorrectStreak(0);
      setFeedbackMessage('');
    }
  };

  // -------------------------------------------------------------------------
  // Nächste Aufgabe
  // -------------------------------------------------------------------------
  const advanceToNext = (results) => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= 10) {
      setIsSessionComplete(true);
      setSessionResults(results || sessionResults);
      increment();
      updateStreak();
    } else {
      setCurrentIndex(nextIndex);
      setUserAnswer('');
      setShowFeedback(false);
      setIsCorrect(null);
      setCorrectAnswer(null);
      setFeedbackMessage('');
      setQuestionStartTime(Date.now());
      setElapsedSeconds(0);
      autoCheckFiredRef.current = false;
    }
  };

  const handleNext = () => {
    advanceToNext(sessionResults);
  };

  // -------------------------------------------------------------------------
  // Input-Handling
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!showFeedback && !isSessionComplete && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showFeedback, isSessionComplete, currentIndex]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^-?\d{0,4}$/.test(value)) {
      setUserAnswer(value);

      // Auto-check: wenn genug Ziffern eingegeben (nur für Text-Input-Fragen)
      const current = questions[currentIndex];
      if (autoCheckSetting && current && !current.options && !autoCheckFiredRef.current && !showFeedback) {
        const expectedLength = current.answer.toString().length;
        if (value.length >= expectedLength && /^\d+$/.test(value)) {
          autoCheckFiredRef.current = true;
          setTimeout(() => handleCheck(value), 0);
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (showFeedback && !isCorrect) {
        handleNext();
      } else if (!showFeedback) {
        handleCheck();
      }
    }
  };

  // -------------------------------------------------------------------------
  // Statistiken
  // -------------------------------------------------------------------------
  const calculateStats = () => {
    if (sessionResults.length === 0) return null;

    const correct = sessionResults.filter((r) => r.correct).length;
    const times = sessionResults.map((r) => r.time);
    const avgTime = times.reduce((s, t) => s + t, 0) / times.length;
    const fastest = Math.min(...times);
    const slowest = Math.max(...times);
    const mistakes = sessionResults.filter((r) => !r.correct);

    const byMode = {};
    for (const m of ['stellenwerte', 'vergleichen', 'runden', 'zahlenfolgen']) {
      const modeResults = sessionResults.filter((r) => r.mode === m);
      if (modeResults.length > 0) {
        const mCorrect = modeResults.filter((r) => r.correct).length;
        byMode[m] = {
          total: modeResults.length,
          correct: mCorrect,
          percentage: Math.round((mCorrect / modeResults.length) * 100),
        };
      }
    }

    return {
      score: `${correct}/${sessionResults.length}`,
      percentage: Math.round((correct / sessionResults.length) * 100),
      avgTime: avgTime.toFixed(1),
      fastest: fastest.toFixed(1),
      slowest: slowest.toFixed(1),
      mistakes,
      byMode,
    };
  };

  const getCurrentAvgTime = () => {
    if (sessionResults.length === 0) return '0.0';
    const total = sessionResults.reduce((sum, r) => sum + r.time, 0);
    return (total / sessionResults.length).toFixed(1);
  };

  const current = questions[currentIndex];
  const stats = calculateStats();
  const hasOptions = current?.options !== null && current?.options !== undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Zahlenraum bis 1000</h1>

            <div className="flex items-center gap-4">
              {correctStreak > 0 && (
                <div className={`text-sm font-semibold flex items-center gap-1 ${correctStreak >= 5 ? 'text-green-600' : 'text-gray-600'}`}>
                  <Zap className="w-4 h-4" />
                  {correctStreak}/10
                </div>
              )}

              <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg">
                <Flame className="w-5 h-5" aria-hidden="true" />
                <span className="font-semibold">{streak} Tage</span>
              </div>
            </div>
          </div>

          {/* Schwierigkeit */}
          {!isSessionComplete && (
            <div className="flex gap-2 items-center flex-wrap mb-3">
              <span className="text-sm font-semibold text-gray-500">Schwierigkeit:</span>
              {DIFFICULTIES.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => {
                    setDifficulty(key);
                    startNewSession(mode, key);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    difficulty === key
                      ? 'text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={difficulty === key ? { backgroundColor: color, color: 'white' } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Modus-Auswahl */}
          {!isSessionComplete && (
            <div className="flex gap-2 items-center flex-wrap">
              {MODES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => startNewSession(key, difficulty)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    mode === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <TheoryPanel title="Zahlen bis 1000">
          <div className="space-y-3">
            <p>
              <strong>Hunderter (H), Zehner (Z), Einer (E):</strong><br />
              347 = 3H + 4Z + 7E
            </p>
            <p>
              <strong>Vergleichen:</strong><br />
              Erst die Hunderter vergleichen, dann Zehner, dann Einer.
            </p>
            <p>
              <strong>Runden auf Zehner:</strong><br />
              Schau auf die Einer. 0-4 abrunden, 5-9 aufrunden.<br />
              347 auf Zehner = 350 (Einer ist 7, also aufrunden)
            </p>
            <p>
              <strong>Runden auf Hunderter:</strong><br />
              Schau auf die Zehner. 0-4 abrunden, 5-9 aufrunden.<br />
              347 auf Hunderter = 300 (Zehner ist 4, also abrunden)
            </p>
            <p>
              <strong>Zahlenfolgen:</strong><br />
              Finde den Unterschied zwischen zwei Zahlen, dann weiterzählen.
            </p>
          </div>
        </TheoryPanel>

        {!isSessionComplete && current ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Fortschrittsanzeige */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Aufgabe {currentIndex + 1}/10
                </span>
                {showTimer && (
                  <span className="text-sm text-gray-500">
                    Ø {getCurrentAvgTime()}s
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Timer */}
            {showTimer && (
              <div className="flex justify-center mb-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-lg font-mono font-semibold ${
                  elapsedSeconds < 3
                    ? 'bg-green-100 text-green-700'
                    : elapsedSeconds < 6
                      ? 'bg-blue-100 text-blue-700'
                      : elapsedSeconds < 10
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                }`}>
                  <Timer className="w-5 h-5" />
                  {elapsedSeconds.toFixed(1)}s
                </div>
              </div>
            )}

            {/* Aufgabe */}
            <div className="text-center mb-8">
              <div className="text-3xl sm:text-5xl font-bold text-gray-800 mb-8 leading-tight">
                {current.display}
              </div>

              {/* Multiple-Choice Optionen */}
              {hasOptions ? (
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-6">
                  {current.options.map((option, idx) => {
                    const optStr = String(option);
                    const isSelected = showFeedback && String(correctAnswer) === optStr;
                    const isWrong = showFeedback && !isCorrect && String(sessionResults[sessionResults.length - 1]?.userAnswer) === optStr;

                    return (
                      <button
                        key={idx}
                        onClick={() => !showFeedback && handleCheck(option)}
                        disabled={showFeedback}
                        className={`px-4 py-4 rounded-xl text-lg sm:text-xl font-bold transition-all border-2 ${
                          showFeedback
                            ? isSelected
                              ? 'border-green-500 bg-green-100 text-green-700'
                              : isWrong
                                ? 'border-red-500 bg-red-100 text-red-700'
                                : 'border-gray-200 bg-gray-50 text-gray-400'
                            : 'border-gray-200 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Text-Input */
                <div className="flex justify-center mb-6">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={userAnswer}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={showFeedback}
                    className="w-28 h-16 sm:w-36 sm:h-20 text-center text-4xl sm:text-5xl font-bold border-4 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                    maxLength={4}
                    autoFocus
                  />
                </div>
              )}

              {/* Feedback */}
              {showFeedback && (
                <div className={`mb-6 text-xl font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? (
                    <div>
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-6 h-6" />
                        Richtig!
                      </div>
                      {feedbackMessage && (
                        <div className="text-lg mt-1 text-green-500">
                          {feedbackMessage}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <X className="w-6 h-6" />
                        Nicht ganz.
                      </div>
                      <div className="text-gray-700">
                        Die richtige Antwort ist: <span className="text-red-600 font-bold">{correctAnswer}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Button — nur für text-input Fragen */}
              {!hasOptions && !showFeedback && (
                <button
                  onClick={() => handleCheck()}
                  disabled={!userAnswer && userAnswer !== '0'}
                  className="px-12 py-4 bg-green-600 text-white text-xl font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Prüfen
                </button>
              )}

              {/* Weiter-Button bei falscher Antwort */}
              {showFeedback && !isCorrect && (
                <button
                  onClick={handleNext}
                  className="px-12 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Weiter
                </button>
              )}
            </div>

            {/* Screen Reader Feedback */}
            {showFeedback && (
              <div className="sr-only" aria-live="polite" role="status">
                {isCorrect ? 'Richtig!' : `Falsch. Die richtige Antwort ist ${correctAnswer}`}
              </div>
            )}
          </div>
        ) : isSessionComplete && stats ? (
          /* Session Zusammenfassung */
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Session beendet!
              </h2>

              <div className="text-6xl font-bold mb-2">
                {stats.percentage >= 80 ? '🎉' : stats.percentage >= 60 ? '✓' : '💪'}
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {stats.score} richtig ({stats.percentage}%)
              </div>
              {showTimer && (
                <div className="text-lg text-gray-600 mb-2">
                  Durchschnittszeit: {stats.avgTime}s
                </div>
              )}

              {/* Speed Rating */}
              {showTimer && (
                <div className={`text-xl font-semibold mb-6 ${getSpeedRating(parseFloat(stats.avgTime)).color}`}>
                  {getSpeedRating(parseFloat(stats.avgTime)).label}
                </div>
              )}

              {/* Schnellste / Langsamste */}
              {showTimer && (
                <div className="flex gap-6 justify-center mb-8">
                  <div className="bg-green-50 rounded-lg px-5 py-3 text-center">
                    <div className="text-sm text-gray-500">Schnellste</div>
                    <div className="text-2xl font-bold text-green-600">{stats.fastest}s</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg px-5 py-3 text-center">
                    <div className="text-sm text-gray-500">Langsamste</div>
                    <div className="text-2xl font-bold text-orange-600">{stats.slowest}s</div>
                  </div>
                </div>
              )}

              {/* Per-Mode Breakdown */}
              {Object.keys(stats.byMode).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Nach Aufgabentyp:
                  </h3>
                  <div className="flex gap-3 justify-center flex-wrap">
                    {Object.entries(stats.byMode).map(([m, data]) => (
                      <div
                        key={m}
                        className={`rounded-lg px-4 py-3 text-center ${
                          data.percentage >= 80
                            ? 'bg-green-100 text-green-700'
                            : data.percentage >= 50
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <div className="text-sm font-semibold">{MODE_LABELS[m] || m}</div>
                        <div className="text-lg font-bold">{data.correct}/{data.total}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Einzelergebnisse */}
              <div className="mb-8 text-left">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Alle Aufgaben:
                </h3>
                <div className="space-y-2">
                  {sessionResults.map((r, idx) => {
                    const speed = getSpeedRating(r.time);
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                          r.correct ? 'bg-green-50' : 'bg-red-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {r.correct
                            ? <Check className="w-4 h-4 text-green-600" />
                            : <X className="w-4 h-4 text-red-600" />
                          }
                          <span className="text-gray-800 font-medium text-sm">
                            {r.display} = {r.correctAnswer}
                          </span>
                          {!r.correct && (
                            <span className="text-red-600 text-sm">(du: {r.userAnswer})</span>
                          )}
                        </div>
                        {showTimer && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{r.time.toFixed(1)}s</span>
                            <span className={`text-xs font-semibold ${speed.color}`}>{speed.label}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fehler-Aufgaben */}
              {stats.mistakes.length > 0 && (
                <div className="mb-8 text-left bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Schwierige Aufgaben:
                  </h3>
                  <ul className="space-y-2">
                    {stats.mistakes.map((m, idx) => (
                      <li key={idx} className="text-gray-700">
                        {m.display} = {m.correctAnswer}
                        <span className="text-red-600 ml-2">(du: {m.userAnswer})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <SessionRating />

              {/* Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => startNewSession(mode, difficulty)}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Neue Session starten
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 10er-Streak Modal */}
      {showStreakModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              10 richtig hintereinander!
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Fina, du bist ein Zahlengenie!
            </p>
            <button
              onClick={() => setShowStreakModal(false)}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Weiter rechnen!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
