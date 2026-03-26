import { useState, useRef, useEffect, useCallback } from 'react';
import { useStreak, useProgress, useErrors } from '../context/AppContext';
import { Flame, Check, X, Trophy, Zap, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';
import SessionRating from '../components/SessionRating';

// ---------------------------------------------------------------------------
// Modus-Definitionen
// ---------------------------------------------------------------------------
const MODES = [
  { key: 'wie-viel', label: 'Wie viel kostet es?' },
  { key: 'rueckgeld', label: 'Wie viel Rückgeld?' },
  { key: 'muenzen', label: 'Münzen zählen' },
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

/** Formatiere Cent-Betrag als deutschen Euro-String: 350 → "3,50€" */
const formatEuro = (cents) => {
  const euros = Math.floor(cents / 100);
  const ct = cents % 100;
  return `${euros},${String(ct).padStart(2, '0')}€`;
};

/** Parse "3,50€" or "3,50" back to cents (integer) */
const parseEuroInput = (str) => {
  const cleaned = str.replace(/€/g, '').replace(/\s/g, '');
  // Handle both comma and period as decimal separator
  const match = cleaned.match(/^(\d+)[,.](\d{1,2})$/);
  if (match) {
    const euros = parseInt(match[1], 10);
    let cents = match[2];
    if (cents.length === 1) cents = cents + '0';
    return euros * 100 + parseInt(cents, 10);
  }
  // Whole number — could be euros
  const wholeMatch = cleaned.match(/^(\d+)$/);
  if (wholeMatch) {
    return parseInt(wholeMatch[1], 10) * 100;
  }
  return NaN;
};

// ---------------------------------------------------------------------------
// Waren-Katalog (~20 Artikel mit realistischen Preisen in Cent)
// ---------------------------------------------------------------------------
const SHOPS = [
  {
    name: 'Bäcker',
    context: (items) => `Fina ist beim Bäcker und kauft ${items}.`,
    items: [
      { name: 'eine Brezel', price: 120 },
      { name: 'ein Brötchen', price: 45 },
      { name: 'ein Stück Kuchen', price: 280 },
      { name: 'ein Croissant', price: 150 },
      { name: 'einen Berliner', price: 130 },
    ],
  },
  {
    name: 'Eisdiele',
    context: (items) => `Fina kauft ${items} an der Eisdiele.`,
    items: [
      { name: 'eine Kugel Eis', price: 150 },
      { name: 'zwei Kugeln Eis', price: 300 },
      { name: 'ein Eis am Stiel', price: 120 },
      { name: 'einen Eisbecher', price: 450 },
    ],
  },
  {
    name: 'Supermarkt',
    context: (items) => `Papa ist im Supermarkt und kauft ${items}.`,
    items: [
      { name: 'eine Milch', price: 129 },
      { name: 'ein Brot', price: 289 },
      { name: 'einen Apfel', price: 40 },
      { name: 'eine Banane', price: 30 },
      { name: 'einen Joghurt', price: 69 },
      { name: 'eine Butter', price: 219 },
    ],
  },
  {
    name: 'Blumenladen',
    context: (items) => `Mama kauft im Blumenladen ${items}.`,
    items: [
      { name: 'eine Rose', price: 350 },
      { name: 'einen Tulpenstrauß', price: 499 },
      { name: 'eine Sonnenblume', price: 250 },
      { name: 'einen kleinen Kaktus', price: 399 },
    ],
  },
  {
    name: 'Schreibwarengeschäft',
    context: (items) => `Fina kauft im Schreibwarengeschäft ${items}.`,
    items: [
      { name: 'ein Heft', price: 99 },
      { name: 'einen Stift', price: 149 },
      { name: 'einen Radiergummi', price: 79 },
      { name: 'einen Anspitzer', price: 119 },
      { name: 'ein Lineal', price: 129 },
    ],
  },
  {
    name: 'TSG Bürstadt Kiosk',
    context: (items) => `Fina kauft am TSG Bürstadt Kiosk ${items}.`,
    items: [
      { name: 'eine Brezel', price: 100 },
      { name: 'eine Wurst', price: 250 },
      { name: 'ein Wasser', price: 150 },
      { name: 'eine Limo', price: 200 },
      { name: 'einen Schokoriegel', price: 80 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Aufgaben-Generatoren
// ---------------------------------------------------------------------------

/**
 * Runde einen Cent-Betrag auf den nächsten durch 5 teilbaren Wert
 * (damit die Beträge realistischer sind)
 */
const roundTo5 = (cents) => Math.round(cents / 5) * 5;

/**
 * Modus 1: "Wie viel kostet es?" — Addition von 2-4 Artikeln
 */
const generateWieViel = (difficulty) => {
  let maxTotal, useWholeCents, itemCount;
  if (difficulty === 'leicht') {
    maxTotal = 1000;  // 10€
    useWholeCents = true; // nur ganze Euro
    itemCount = 2;
  } else if (difficulty === 'mittel') {
    maxTotal = 2000;  // 20€
    useWholeCents = false;
    itemCount = pick([2, 3]);
  } else {
    maxTotal = 5000;  // 50€
    useWholeCents = false;
    itemCount = pick([3, 4]);
  }

  const shop = pick(SHOPS);
  const selected = [];
  const available = [...shop.items];

  for (let i = 0; i < itemCount && available.length > 0; i++) {
    const idx = rand(0, available.length - 1);
    const item = available.splice(idx, 1)[0];
    let price = item.price;
    if (useWholeCents) {
      price = Math.round(price / 100) * 100;
      if (price === 0) price = 100;
    }
    selected.push({ ...item, price });
  }

  let total = selected.reduce((sum, it) => sum + it.price, 0);
  if (total > maxTotal) {
    // Scale down to fit
    const scale = maxTotal / total;
    for (const it of selected) {
      it.price = roundTo5(Math.round(it.price * scale));
      if (it.price < 5) it.price = 5;
      if (useWholeCents) it.price = Math.round(it.price / 100) * 100 || 100;
    }
    total = selected.reduce((sum, it) => sum + it.price, 0);
  }

  const itemList = selected.map((it) => `${it.name} (${formatEuro(it.price)})`).join(', ');
  const display = shop.context(itemList) + ' Wie viel bezahlt sie insgesamt?';

  // Generate 3 wrong options
  const options = generateOptions(total, useWholeCents);

  return {
    display,
    answer: total,
    answerFormatted: formatEuro(total),
    mode: 'wie-viel',
    options,
  };
};

/**
 * Modus 2: "Wie viel Rückgeld?" — Subtraktion
 */
const generateRueckgeld = (difficulty) => {
  const shop = pick(SHOPS);
  const item = pick(shop.items);
  let price = item.price;

  if (difficulty === 'leicht') {
    price = Math.round(price / 100) * 100;
    if (price === 0) price = 100;
  }

  // Choose a payment amount (next round note/coin)
  const paymentOptions = [200, 500, 1000, 2000, 5000];
  const validPayments = paymentOptions.filter((p) => p > price);
  let maxPayment;
  if (difficulty === 'leicht') {
    maxPayment = validPayments.find((p) => p <= 1000) || validPayments[0];
  } else if (difficulty === 'mittel') {
    maxPayment = validPayments.find((p) => p <= 2000) || validPayments[0];
  } else {
    maxPayment = pick(validPayments.slice(0, 4)) || validPayments[0];
  }

  const change = maxPayment - price;

  const persons = [
    { name: 'Fina', verb: 'bezahlt' },
    { name: 'Papa', verb: 'bezahlt' },
    { name: 'Mama', verb: 'bezahlt' },
  ];
  const person = pick(persons);

  const display = `${person.name} kauft ${item.name} (${formatEuro(price)}) und ${person.verb} mit ${formatEuro(maxPayment)}. Wie viel Rückgeld bekommt ${person.name === 'Fina' ? 'sie' : person.name === 'Papa' ? 'er' : 'sie'}?`;

  const useWhole = difficulty === 'leicht';
  const options = generateOptions(change, useWhole);

  return {
    display,
    answer: change,
    answerFormatted: formatEuro(change),
    mode: 'rueckgeld',
    options,
  };
};

/**
 * Modus 3: "Münzen zählen" — Münzen/Scheine zusammenzählen
 */
const COINS = [5, 10, 20, 50, 100, 200]; // in Cent
const BILLS = [500, 1000, 2000];

const generateMuenzen = (difficulty) => {
  let targetMin, targetMax, pool;
  if (difficulty === 'leicht') {
    targetMin = 100;
    targetMax = 1000;
    pool = [100, 200]; // only whole euro coins
  } else if (difficulty === 'mittel') {
    targetMin = 100;
    targetMax = 2000;
    pool = [5, 10, 20, 50, 100, 200];
  } else {
    targetMin = 500;
    targetMax = 5000;
    pool = [5, 10, 20, 50, 100, 200, 500, 1000, 2000];
  }

  const target = roundTo5(rand(targetMin, targetMax));

  // Build coin collection that sums to target
  let remaining = target;
  const coins = [];

  // Start with larger denominations
  const sorted = [...pool].sort((a, b) => b - a);
  for (const denom of sorted) {
    while (remaining >= denom && coins.length < 8) {
      // Randomly decide to use this denomination
      if (remaining >= denom && (Math.random() < 0.6 || remaining === denom)) {
        coins.push(denom);
        remaining -= denom;
      } else {
        break;
      }
    }
  }

  // If there's remaining, fill with smallest denomination
  if (remaining > 0) {
    const smallest = sorted[sorted.length - 1];
    remaining = roundTo5(remaining);
    while (remaining > 0 && coins.length < 12) {
      const toAdd = Math.min(remaining, smallest);
      coins.push(toAdd);
      remaining -= toAdd;
    }
  }

  // Recalculate actual total (in case of rounding)
  const actualTotal = coins.reduce((s, c) => s + c, 0);

  // Shuffle coins for display
  const shuffled = [...coins].sort(() => Math.random() - 0.5);

  const formatCoin = (c) => {
    if (c >= 100) return `${c / 100}€`;
    return `${c}ct`;
  };

  const display = 'Zähle die Münzen und Scheine: ' + shuffled.map(formatCoin).join(' + ');

  const useWhole = difficulty === 'leicht';
  const options = generateOptions(actualTotal, useWhole);

  return {
    display,
    answer: actualTotal,
    answerFormatted: formatEuro(actualTotal),
    mode: 'muenzen',
    options,
  };
};

/**
 * Erzeuge 4 Optionen (inkl. der richtigen Antwort) als Multiple-Choice
 */
const generateOptions = (correctCents, wholeEurosOnly) => {
  const opts = new Set();
  opts.add(correctCents);

  const offsets = wholeEurosOnly
    ? [100, -100, 200, -200, 300, -300]
    : [10, -10, 20, -20, 50, -50, 100, -100, 30, -30, 5, -5, 15, -15];

  const shuffledOffsets = [...offsets].sort(() => Math.random() - 0.5);

  for (const off of shuffledOffsets) {
    if (opts.size >= 4) break;
    const v = correctCents + off;
    if (v > 0) opts.add(v);
  }

  // Fallback: fill with random nearby values
  while (opts.size < 4) {
    const delta = wholeEurosOnly ? rand(1, 5) * 100 : rand(1, 50) * 5;
    const v = correctCents + (Math.random() < 0.5 ? delta : -delta);
    if (v > 0) opts.add(v);
  }

  return [...opts].sort(() => Math.random() - 0.5);
};

// ---------------------------------------------------------------------------
// Aufgabe generieren
// ---------------------------------------------------------------------------
const generateQuestion = (mode, difficulty) => {
  switch (mode) {
    case 'wie-viel': return generateWieViel(difficulty);
    case 'rueckgeld': return generateRueckgeld(difficulty);
    case 'muenzen': return generateMuenzen(difficulty);
    default: return generateWieViel(difficulty);
  }
};

const generateSession = (mode, difficulty) => {
  const questions = [];
  const modes = mode === 'gemischt'
    ? ['wie-viel', 'rueckgeld', 'muenzen']
    : [mode];

  for (let i = 0; i < 10; i++) {
    const m = pick(modes);
    questions.push(generateQuestion(m, difficulty));
  }
  return questions;
};

// ---------------------------------------------------------------------------
// Speed-Rating
// ---------------------------------------------------------------------------
const getSpeedRating = (seconds) => {
  if (seconds < 5) return { label: 'Blitzschnell!', color: 'text-green-600' };
  if (seconds < 10) return { label: 'Gut!', color: 'text-blue-600' };
  if (seconds < 15) return { label: 'Okay', color: 'text-yellow-600' };
  return { label: 'Übe weiter', color: 'text-orange-600' };
};

// ---------------------------------------------------------------------------
// Personalisierte Nachrichten
// ---------------------------------------------------------------------------
const FAST_MESSAGES = [
  'So schnell wie an der Kasse!',
  'Papa wäre stolz!',
  'Blitzschnell, Fina!',
];

const STREAK_MESSAGES = [
  'Fina, du bist ein Geld-Genie!',
  'Unglaublich, Fina!',
];

// ---------------------------------------------------------------------------
// Komponente
// ---------------------------------------------------------------------------
export default function GeldRechnen() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('geld-rechnen');
  const { addError } = useErrors();

  // Session state
  const [mode, setMode] = useState('wie-viel');
  const [difficulty, setDifficulty] = useState('mittel');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
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

  const timerRef = useRef(null);

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
    setSelectedOption(null);
    setShowFeedback(false);
    setIsCorrect(null);
    setCorrectAnswer(null);
    setFeedbackMessage('');
    setQuestionStartTime(Date.now());
    setElapsedSeconds(0);
  }, [mode, difficulty]);

  // Initiale Session
  useEffect(() => {
    startNewSession('wie-viel', 'mittel');
  }, []);

  // -------------------------------------------------------------------------
  // Antwort prüfen (Multiple Choice)
  // -------------------------------------------------------------------------
  const handleOptionSelect = (optionCents) => {
    if (showFeedback) return;

    setSelectedOption(optionCents);

    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const current = questions[currentIndex];
    const correct = optionCents === current.answer;

    const result = {
      display: current.display,
      userAnswer: formatEuro(optionCents),
      correctAnswer: current.answer,
      correctAnswerFormatted: current.answerFormatted,
      correct,
      time: timeTaken,
      mode: current.mode,
    };

    const newResults = [...sessionResults, result];
    setSessionResults(newResults);
    setIsCorrect(correct);
    setCorrectAnswer(current.answerFormatted);
    setShowFeedback(true);

    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);

      if (timeTaken < 5) {
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
      addError('geld-rechnen', current.display);
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
      setSelectedOption(null);
      setShowFeedback(false);
      setIsCorrect(null);
      setCorrectAnswer(null);
      setFeedbackMessage('');
      setQuestionStartTime(Date.now());
      setElapsedSeconds(0);
    }
  };

  const handleNext = () => {
    advanceToNext(sessionResults);
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
    for (const m of ['wie-viel', 'rueckgeld', 'muenzen']) {
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
    'wie-viel': 'Wie viel kostet es?',
    'rueckgeld': 'Rückgeld',
    'muenzen': 'Münzen zählen',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Geld rechnen</h1>

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
        <TheoryPanel title="Mit Geld rechnen">
          <div className="space-y-3">
            <p>
              <strong>1€ = 100 Cent</strong>
            </p>
            <p>
              <strong>Beim Addieren:</strong> Erst die Euro, dann die Cent.<br />
              2,50€ + 1,30€ → Erst 2€ + 1€ = 3€, dann 50ct + 30ct = 80ct → 3,80€
            </p>
            <p>
              <strong>Wenn Cent über 100:</strong> 1€ mehr!<br />
              z.B. 80ct + 50ct = 130ct = 1,30€
            </p>
            <p>
              <strong>Rückgeld:</strong> Von dem Preis bis zum bezahlten Betrag hochzählen.<br />
              Preis 3,70€, bezahlt mit 5€ → 3,70€ + 30ct = 4€ + 1€ = 5€ → Rückgeld: 1,30€
            </p>
            <p>
              <strong>Tipp:</strong> Runde auf den nächsten Euro auf, dann rechne den Rest!<br />
              1,80€ → aufrunden auf 2€ (fehlen 20ct), dann weiterrechnen.
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
                <span className="text-sm text-gray-500">
                  Ø {getCurrentAvgTime()}s
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Timer */}
            <div className="flex justify-center mb-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-lg font-mono font-semibold ${
                elapsedSeconds < 5
                  ? 'bg-green-100 text-green-700'
                  : elapsedSeconds < 10
                    ? 'bg-blue-100 text-blue-700'
                    : elapsedSeconds < 15
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
              }`}>
                <Timer className="w-5 h-5" />
                {elapsedSeconds.toFixed(1)}s
              </div>
            </div>

            {/* Aufgabe */}
            <div className="text-center mb-8">
              <div className="text-lg sm:text-xl font-semibold text-gray-800 mb-8 leading-relaxed px-4">
                {current.display}
              </div>

              {/* Multiple Choice Optionen */}
              <div className="grid grid-cols-2 gap-3 mb-6 max-w-md mx-auto">
                {current.options.map((opt, idx) => {
                  let btnClass = 'border-2 border-gray-300 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50';

                  if (showFeedback) {
                    if (opt === current.answer) {
                      btnClass = 'border-2 border-green-500 bg-green-100 text-green-800';
                    } else if (opt === selectedOption && !isCorrect) {
                      btnClass = 'border-2 border-red-500 bg-red-100 text-red-800';
                    } else {
                      btnClass = 'border-2 border-gray-200 bg-gray-50 text-gray-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(opt)}
                      disabled={showFeedback}
                      className={`px-4 py-4 rounded-xl text-xl font-bold transition-colors ${btnClass} disabled:cursor-not-allowed`}
                    >
                      {formatEuro(opt)}
                    </button>
                  );
                })}
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
                {stats.percentage >= 80 ? '🎉' : stats.percentage >= 60 ? '👍' : '💪'}
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {stats.score} richtig ({stats.percentage}%)
              </div>
              <div className="text-lg text-gray-600 mb-2">
                Durchschnittszeit: {stats.avgTime}s
              </div>

              {/* Speed Rating */}
              <div className={`text-xl font-semibold mb-6 ${getSpeedRating(parseFloat(stats.avgTime)).color}`}>
                {getSpeedRating(parseFloat(stats.avgTime)).label}
              </div>

              {/* Schnellste / Langsamste */}
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
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {r.correct
                            ? <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            : <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                          }
                          <span className="text-gray-800 font-medium text-sm truncate">
                            {r.correctAnswerFormatted}
                          </span>
                          {!r.correct && (
                            <span className="text-red-600 text-sm flex-shrink-0">(du: {r.userAnswer})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-sm text-gray-500">{r.time.toFixed(1)}s</span>
                          <span className={`text-xs font-semibold ${speed.color}`}>{speed.label}</span>
                        </div>
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
                      <li key={idx} className="text-gray-700 text-sm">
                        • Richtig: {m.correctAnswerFormatted}
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
              Fina, du bist ein Geld-Genie!
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
