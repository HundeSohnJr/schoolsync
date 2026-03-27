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
  { key: 'plus-minus', label: 'Plus & Minus' },
  { key: 'verdoppeln', label: 'Verdoppeln & Halbieren' },
  { key: 'ketten', label: 'Kettenaufgaben' },
  { key: 'ergaenzen', label: 'Ergänzen' },
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

// ---------------------------------------------------------------------------
// Aufgaben-Generatoren
// ---------------------------------------------------------------------------

/**
 * Plus & Minus bis 100
 */
const generatePlusMinus = (difficulty) => {
  if (difficulty === 'leicht') {
    // Bis 50, ohne Zehnerüberschreitung
    const op = pick(['+', '-']);
    if (op === '+') {
      const a = rand(10, 40);
      // Einer von a + Einer von b < 10 (kein Zehnerübergang)
      const einerA = a % 10;
      const maxEiner = Math.min(9 - einerA, 9);
      const bEiner = rand(1, Math.max(1, maxEiner));
      const bZehner = rand(0, Math.min(4, Math.floor((50 - a) / 10)));
      const b = bZehner * 10 + bEiner;
      if (b <= 0 || a + b > 50) {
        // Fallback
        const fb = rand(1, 10);
        return { display: `${a} + ${fb}`, answer: a + fb, mode: 'plus-minus' };
      }
      return { display: `${a} + ${b}`, answer: a + b, mode: 'plus-minus' };
    } else {
      const a = rand(15, 50);
      const einerA = a % 10;
      const bEiner = rand(1, Math.max(1, einerA));
      const bZehner = rand(0, Math.min(3, Math.floor(a / 10) - 1));
      const b = bZehner * 10 + bEiner;
      if (b <= 0 || a - b < 0) {
        const fb = rand(1, Math.min(a, 10));
        return { display: `${a} - ${fb}`, answer: a - fb, mode: 'plus-minus' };
      }
      return { display: `${a} - ${b}`, answer: a - b, mode: 'plus-minus' };
    }
  }

  // Mittel & Schwer — bis 100, mit Zehnerüberschreitung
  const op = pick(['+', '-']);
  const minSize = difficulty === 'schwer' ? 20 : 10;
  if (op === '+') {
    const a = rand(minSize, 70);
    const b = rand(minSize, 100 - a);
    return { display: `${a} + ${b}`, answer: a + b, mode: 'plus-minus' };
  } else {
    const a = rand(Math.max(minSize + 10, 30), 100);
    const b = rand(minSize, a - 1);
    return { display: `${a} - ${b}`, answer: a - b, mode: 'plus-minus' };
  }
};

/**
 * Verdoppeln & Halbieren (nur ganzzahlige Ergebnisse)
 */
const generateVerdoppeln = (difficulty) => {
  const isDouble = Math.random() < 0.5;
  const maxNum = difficulty === 'leicht' ? 25 : 50;

  if (isDouble) {
    const n = rand(difficulty === 'schwer' ? 15 : 5, maxNum);
    return { display: `Verdopple ${n}`, answer: n * 2, mode: 'verdoppeln' };
  } else {
    // Halbieren — nur gerade Zahlen für ganzzahliges Ergebnis
    let n = rand(difficulty === 'schwer' ? 20 : 10, maxNum * 2);
    if (n % 2 !== 0) n += 1;
    if (n > 100) n = 100;
    return { display: `Halbiere ${n}`, answer: n / 2, mode: 'verdoppeln' };
  }
};

/**
 * Kettenaufgaben — 3 Schritte
 */
const generateKette = (difficulty) => {
  const maxStart = difficulty === 'leicht' ? 20 : difficulty === 'mittel' ? 30 : 40;
  const maxStep = difficulty === 'leicht' ? 15 : difficulty === 'mittel' ? 25 : 35;

  let result = rand(5, maxStart);
  const parts = [String(result)];

  for (let i = 0; i < 3; i++) {
    const canAdd = result < (difficulty === 'leicht' ? 45 : 90);
    const canSub = result > maxStep;

    let op;
    if (canAdd && canSub) op = pick(['+', '-']);
    else if (canAdd) op = '+';
    else op = '-';

    let step;
    if (op === '+') {
      const upper = Math.min(maxStep, (difficulty === 'leicht' ? 50 : 100) - result);
      step = rand(3, Math.max(3, upper));
      result += step;
    } else {
      step = rand(3, Math.min(maxStep, result - 1));
      result -= step;
    }
    parts.push(`${op} ${step}`);
  }

  return {
    display: parts.join(' '),
    answer: result,
    mode: 'ketten',
  };
};

/**
 * Ergänzen (Complement)
 */
const generateErgaenzen = (difficulty) => {
  if (difficulty === 'leicht') {
    // Ergänzen zum nächsten Zehner oder zu 50
    const target = pick([50, ...([10, 20, 30, 40])]);
    const n = rand(1, target - 1);
    return {
      display: `${n} + ___ = ${target}`,
      answer: target - n,
      mode: 'ergaenzen',
    };
  }

  // Mittel: Ergänzen zu 100, 50 oder rundem Zehner
  // Schwer: Ergänzen zu 100 mit größeren Zahlen
  const targets = difficulty === 'schwer'
    ? [100]
    : [50, 100, ...([60, 70, 80, 90])];
  const target = pick(targets);
  const minN = difficulty === 'schwer' ? 10 : 1;
  const n = rand(minN, target - 1);
  return {
    display: `${n} + ___ = ${target}`,
    answer: target - n,
    mode: 'ergaenzen',
  };
};

/**
 * Erzeugt eine einzelne Aufgabe je nach Modus & Schwierigkeit
 */
const generateQuestion = (mode, difficulty) => {
  if (mode === 'gemischt') {
    const sub = pick(['plus-minus', 'verdoppeln', 'ketten', 'ergaenzen']);
    return generateQuestion(sub, difficulty);
  }
  switch (mode) {
    case 'plus-minus': return generatePlusMinus(difficulty);
    case 'verdoppeln': return generateVerdoppeln(difficulty);
    case 'ketten': return generateKette(difficulty);
    case 'ergaenzen': return generateErgaenzen(difficulty);
    default: return generatePlusMinus(difficulty);
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
  'So schnell wie Loki!',
  'Papa wäre stolz!',
  'Blitzschnell, Fina!',
];

const STREAK_MESSAGES = [
  'Fina, du bist ein Rechengenie!',
  'Unglaublich, Fina!',
];

// ---------------------------------------------------------------------------
// Komponente
// ---------------------------------------------------------------------------
export default function Kopfrechnen() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('kopfrechnen');
  const { addError } = useErrors();
  const { autoCheck, showTimer } = useSettings();

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
  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now());
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
  const handleCheck = (overrideAnswer) => {
    const answerStr = overrideAnswer !== undefined ? overrideAnswer : userAnswer;
    if (!answerStr && answerStr !== '0') return;

    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const current = questions[currentIndex];
    const userNum = parseInt(answerStr, 10);
    const correct = userNum === current.answer;

    const result = {
      display: current.display,
      userAnswer: userNum,
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

      // Personalisierte Nachricht
      if (timeTaken < 3) {
        setFeedbackMessage(pick(FAST_MESSAGES));
      } else if (newStreak >= 5) {
        setFeedbackMessage(pick(STREAK_MESSAGES));
      } else {
        setFeedbackMessage('');
      }

      // 10er-Streak
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

      // Auto-advance 800ms
      setTimeout(() => advanceToNext(newResults), 800);
    } else {
      addError('kopfrechnen', current.display);
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
    // Zahlen, optional mit führendem Minus (für theoretische negative Ergebnisse)
    if (/^-?\d{0,4}$/.test(value)) {
      setUserAnswer(value);

      // Auto-check: wenn genug Ziffern eingegeben
      const current = questions[currentIndex];
      if (autoCheck && current && !autoCheckFiredRef.current && !showFeedback) {
        const expectedLength = current.answer.toString().length;
        // Only auto-check for positive numeric values (skip if user typed minus)
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

    // Per-mode breakdown
    const byMode = {};
    for (const m of ['plus-minus', 'verdoppeln', 'ketten', 'ergaenzen']) {
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

  const MODE_LABELS = {
    'plus-minus': 'Plus & Minus',
    'verdoppeln': 'Verdoppeln & Halbieren',
    'ketten': 'Kettenaufgaben',
    'ergaenzen': 'Ergänzen',
  };

  return (
    <div className="min-h-screen bg-gray-50 exercise-content">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Kopfrechnen</h1>

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
        <TheoryPanel title="Kopfrechen-Tricks">
          <div className="space-y-3">
            <p>
              <strong>Zuerst die Zehner, dann die Einer:</strong><br />
              47 + 36 → Zuerst 47 + 30 = 77, dann 77 + 6 = 83
            </p>
            <p>
              <strong>Verdoppeln als Brücke:</strong><br />
              48 + 49 → Das ist fast 48 + 48! Also 96 + 1 = 97
            </p>
            <p>
              <strong>Ergänzen zum Zehner:</strong><br />
              63 + 28 → Zuerst 63 + 7 = 70, dann 70 + 21 = 91
            </p>
            <p>
              <strong>Halbieren — Zehner und Einer getrennt:</strong><br />
              86 halbieren → 80 / 2 = 40, und 6 / 2 = 3, also 43!
            </p>
            <p>
              <strong>Kettenaufgaben:</strong><br />
              Immer von links nach rechts rechnen. Merk dir das Zwischenergebnis!
            </p>
            <p>
              <strong>Minus-Trick:</strong><br />
              82 - 37 → Zieh zuerst 40 ab: 82 - 40 = 42, dann 3 wieder dazu: 42 + 3 = 45
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
              <div className="text-4xl sm:text-6xl font-bold text-gray-800 mb-8 leading-tight">
                {current.display}{current.mode !== 'ergaenzen' ? ' = ?' : ''}
              </div>

              {/* Input-Feld */}
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

              {/* Button */}
              {!showFeedback ? (
                <button
                  onClick={handleCheck}
                  disabled={!userAnswer && userAnswer !== '0'}
                  className="px-12 py-4 bg-green-600 text-white text-xl font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Prüfen
                </button>
              ) : !isCorrect && (
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
                Session beendet! ✓
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
                          <span className="text-gray-800 font-medium">
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
                        • {m.display} = {m.correctAnswer}
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
              Fina, du bist ein Rechengenie! 🏆
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
