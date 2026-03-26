import { useState, useEffect, useCallback } from 'react';
import { useStreak, useProgress, useErrors } from '../context/AppContext';
import { Flame, Check, X, Trophy, Zap, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';

// ---------------------------------------------------------------------------
// Reusable SVG Analog Clock
// ---------------------------------------------------------------------------

function AnalogClock({ hours, minutes, size = 180, interactive = false, onClick }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;
  const numberRadius = size * 0.34;

  // Minute hand angle: 6 degrees per minute
  const minuteAngle = (minutes / 60) * 360 - 90;
  // Hour hand angle: 30 degrees per hour + 0.5 degrees per minute
  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30 - 90;

  const toRad = (deg) => (deg * Math.PI) / 180;

  const minuteHand = {
    x: cx + radius * 0.78 * Math.cos(toRad(minuteAngle)),
    y: cy + radius * 0.78 * Math.sin(toRad(minuteAngle)),
  };

  const hourHand = {
    x: cx + radius * 0.52 * Math.cos(toRad(hourAngle)),
    y: cy + radius * 0.52 * Math.sin(toRad(hourAngle)),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={interactive ? 'cursor-pointer hover:drop-shadow-lg transition-all' : ''}
      onClick={onClick}
      role={interactive ? 'button' : 'img'}
      aria-label={`Uhr zeigt ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`}
    >
      {/* Face */}
      <circle cx={cx} cy={cy} r={radius} fill="white" stroke="#374151" strokeWidth={size * 0.02} />

      {/* Tick marks */}
      {Array.from({ length: 60 }, (_, i) => {
        const angle = (i / 60) * 360 - 90;
        const isMajor = i % 5 === 0;
        const innerR = radius * (isMajor ? 0.85 : 0.92);
        const outerR = radius * 0.97;
        return (
          <line
            key={i}
            x1={cx + innerR * Math.cos(toRad(angle))}
            y1={cy + innerR * Math.sin(toRad(angle))}
            x2={cx + outerR * Math.cos(toRad(angle))}
            y2={cy + outerR * Math.sin(toRad(angle))}
            stroke="#374151"
            strokeWidth={isMajor ? size * 0.015 : size * 0.005}
          />
        );
      })}

      {/* Numbers */}
      {Array.from({ length: 12 }, (_, i) => {
        const num = i + 1;
        const angle = (num / 12) * 360 - 90;
        return (
          <text
            key={num}
            x={cx + numberRadius * Math.cos(toRad(angle))}
            y={cy + numberRadius * Math.sin(toRad(angle))}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={size * 0.1}
            fontWeight="bold"
            fill="#374151"
          >
            {num}
          </text>
        );
      })}

      {/* Hour hand */}
      <line
        x1={cx}
        y1={cy}
        x2={hourHand.x}
        y2={hourHand.y}
        stroke="#1f2937"
        strokeWidth={size * 0.04}
        strokeLinecap="round"
      />

      {/* Minute hand */}
      <line
        x1={cx}
        y1={cy}
        x2={minuteHand.x}
        y2={minuteHand.y}
        stroke="#374151"
        strokeWidth={size * 0.025}
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={size * 0.025} fill="#1f2937" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Time generation helpers
// ---------------------------------------------------------------------------

const FULL_HOURS = Array.from({ length: 12 }, (_, i) => ({ h: i + 1, m: 0 }));
const HALF_HOURS = Array.from({ length: 12 }, (_, i) => ({ h: i + 1, m: 30 }));
const QUARTER_HOURS = Array.from({ length: 12 }, (_, i) => [
  { h: i + 1, m: 15 },
  { h: i + 1, m: 45 },
]).flat();
const FIVE_MINUTES = Array.from({ length: 12 }, (_, i) =>
  [5, 10, 20, 25, 35, 40, 50, 55].map((m) => ({ h: i + 1, m }))
).flat();

const ALL_TIMES = [...FULL_HOURS, ...HALF_HOURS, ...QUARTER_HOURS, ...FIVE_MINUTES];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatTimeGerman(h, m) {
  // Returns a natural German time string for display
  if (m === 0) return `${h} Uhr`;
  return `${h} Uhr ${m}`;
}

// ---------------------------------------------------------------------------
// Mode 1: generate "what time is it?" questions
// ---------------------------------------------------------------------------

function generateMode1Questions(count) {
  const times = shuffle(ALL_TIMES).slice(0, count);
  return times.map((t) => ({
    mode: 1,
    hours: t.h,
    minutes: t.m,
    answer: formatTime(t.h, m_to_display(t.h, t.m)),
  }));
}

function m_to_display(h, m) {
  return m; // identity, keep minutes as-is
}

// ---------------------------------------------------------------------------
// Mode 2: generate "set the clock" questions (pick correct clock from 4)
// ---------------------------------------------------------------------------

function generateDistractorTime(h, m) {
  // Generate a plausible but wrong time
  const strategies = [
    () => ({ h: ((h + Math.floor(Math.random() * 3) + 1) % 12) || 12, m }), // wrong hour
    () => ({ h, m: (m + (Math.random() > 0.5 ? 15 : 30)) % 60 }), // wrong minutes
    () => ({ h: ((h + 6) % 12) || 12, m }), // opposite hour
    () => ({ h, m: (60 - m) % 60 }), // mirror minutes
  ];
  const result = pickRandom(strategies)();
  // Make sure it's actually different
  if (result.h === h && result.m === m) {
    return { h: (h % 12) + 1, m: (m + 15) % 60 };
  }
  return result;
}

function generateMode2Questions(count) {
  const times = shuffle(ALL_TIMES).slice(0, count);
  return times.map((t) => {
    const distractors = [];
    const seen = new Set([`${t.h}:${t.m}`]);
    while (distractors.length < 3) {
      const d = generateDistractorTime(t.h, t.m);
      const key = `${d.h}:${d.m}`;
      if (!seen.has(key)) {
        seen.add(key);
        distractors.push(d);
      }
    }
    const options = shuffle([
      { h: t.h, m: t.m, correct: true },
      ...distractors.map((d) => ({ ...d, correct: false })),
    ]);
    return {
      mode: 2,
      displayTime: formatTime(t.h, t.m),
      hours: t.h,
      minutes: t.m,
      options,
    };
  });
}

// ---------------------------------------------------------------------------
// Mode 3: Time span word problems with personalized scenarios
// ---------------------------------------------------------------------------

const TIME_SPAN_PROBLEMS = [
  { text: "Finas Turnen bei der TSG Bürstadt beginnt um {start} und endet um {end}. Wie lange dauert das Training?", minSpan: 60, maxSpan: 120 },
  { text: "Fina geht um {start} mit Loki und Elvis Gassi. Sie kommt um {end} zurück. Wie lange war der Spaziergang?", minSpan: 30, maxSpan: 90 },
  { text: "Papa Philipp fährt Fina um {start} zur Schule. Er holt sie um {end} ab. Wie lange war Fina in der Schule?", minSpan: 180, maxSpan: 300 },
  { text: "Fina besucht Oma Angelika um {start}. Um {end} fährt sie wieder nach Hause. Wie lange war der Besuch?", minSpan: 60, maxSpan: 180 },
  { text: "Mama Anastasia und Fina backen ab {start} einen Kuchen. Um {end} ist er fertig. Wie lange hat das Backen gedauert?", minSpan: 45, maxSpan: 90 },
  { text: "Fina macht um {start} ihre Hausaufgaben. Um {end} ist sie fertig. Wie lange hat sie gebraucht?", minSpan: 30, maxSpan: 90 },
  { text: "Loki und Elvis schlafen ab {start}. Um {end} wachen sie auf und wollen spielen. Wie lange haben sie geschlafen?", minSpan: 60, maxSpan: 180 },
  { text: "Finas Schwimmkurs beginnt um {start} und endet um {end}. Wie lange dauert der Kurs?", minSpan: 45, maxSpan: 90 },
  { text: "Papa Philipp arbeitet ab {start} im Homeoffice. Um {end} macht er Feierabend. Wie lange hat er gearbeitet?", minSpan: 240, maxSpan: 480 },
  { text: "Fina liest ab {start} ein Buch. Um {end} hört sie auf. Wie lange hat sie gelesen?", minSpan: 30, maxSpan: 90 },
  { text: "Die Autofahrt zu Oma Angelika startet um {start}. Um {end} sind alle da. Wie lange hat die Fahrt gedauert?", minSpan: 30, maxSpan: 90 },
  { text: "Fina spielt ab {start} mit Loki im Garten. Um {end} gehen sie rein. Wie lange haben sie gespielt?", minSpan: 30, maxSpan: 90 },
  { text: "Mama Anastasia bringt Elvis um {start} zum Tierarzt. Um {end} sind sie zurück. Wie lange hat der Besuch gedauert?", minSpan: 30, maxSpan: 90 },
  { text: "Das Training bei der TSG Bürstadt fängt um {start} an. Um {end} duscht Fina. Wie lange hat sie trainiert?", minSpan: 60, maxSpan: 120 },
  { text: "Fina und Papa Philipp schauen ab {start} einen Film. Um {end} ist der Film zu Ende. Wie lange ging der Film?", minSpan: 90, maxSpan: 150 },
  { text: "Fina übt ab {start} Flöte. Um {end} hört sie auf. Wie lange hat sie geübt?", minSpan: 15, maxSpan: 45 },
  { text: "Oma Angelika kommt um {start} zu Besuch. Um {end} fährt sie wieder heim. Wie lange war sie da?", minSpan: 60, maxSpan: 180 },
  { text: "Fina schläft um {start} ein. Um {end} klingelt der Wecker. Wie lange hat sie geschlafen?", minSpan: 480, maxSpan: 600 },
  { text: "Mama Anastasia und Fina gehen um {start} einkaufen. Um {end} sind sie zurück. Wie lange waren sie unterwegs?", minSpan: 45, maxSpan: 120 },
  { text: "Fina und Elvis kuscheln ab {start} auf dem Sofa. Um {end} ist Abendessen. Wie lange haben sie gekuschelt?", minSpan: 30, maxSpan: 60 },
];

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} Minuten`;
  if (m === 0) return h === 1 ? '1 Stunde' : `${h} Stunden`;
  return `${h === 1 ? '1 Stunde' : `${h} Stunden`} und ${m} Minuten`;
}

function generateMode3Questions(count) {
  const problems = shuffle(TIME_SPAN_PROBLEMS).slice(0, count);
  return problems.map((p) => {
    // Generate start time (use reasonable hours)
    const startH = Math.floor(Math.random() * 12) + 7; // 7-18
    const startM = pickRandom([0, 15, 30, 45]);

    // Duration in minutes (snap to 15-minute intervals for cleanliness)
    const rawSpan = p.minSpan + Math.random() * (p.maxSpan - p.minSpan);
    const spanMinutes = Math.round(rawSpan / 15) * 15;
    const clampedSpan = Math.max(15, Math.min(spanMinutes, 600));

    const endTotalMinutes = startH * 60 + startM + clampedSpan;
    const endH = Math.floor(endTotalMinutes / 60) % 24;
    const endM = endTotalMinutes % 60;

    const correctAnswer = formatDuration(clampedSpan);

    // Generate distractors
    const distractorSpans = new Set([clampedSpan]);
    const distractorAnswers = [];
    const offsets = [15, -15, 30, -30, 60, -60, 45, -45];
    for (const off of shuffle(offsets)) {
      const alt = clampedSpan + off;
      if (alt > 0 && !distractorSpans.has(alt)) {
        distractorSpans.add(alt);
        distractorAnswers.push(formatDuration(alt));
        if (distractorAnswers.length === 3) break;
      }
    }
    // Fill if needed
    while (distractorAnswers.length < 3) {
      const alt = clampedSpan + (distractorAnswers.length + 2) * 15;
      distractorAnswers.push(formatDuration(alt));
    }

    const options = shuffle([
      { text: correctAnswer, correct: true },
      ...distractorAnswers.map((t) => ({ text: t, correct: false })),
    ]);

    const text = p.text
      .replace('{start}', formatTime(startH, startM))
      .replace('{end}', formatTime(endH, endM));

    return {
      mode: 3,
      text,
      correctAnswer,
      spanMinutes: clampedSpan,
      options,
    };
  });
}

// ---------------------------------------------------------------------------
// Session generation
// ---------------------------------------------------------------------------

const MODES = [
  { key: 1, label: 'Wie spat ist es?' },
  { key: 2, label: 'Stelle die Uhr' },
  { key: 3, label: 'Wie viel Zeit?' },
];

function generateSession(mode, count = 15) {
  if (mode === 1) return generateMode1Questions(count);
  if (mode === 2) return generateMode2Questions(count);
  if (mode === 3) return generateMode3Questions(count);
  // Mixed
  const perMode = Math.floor(count / 3);
  const extra = count - perMode * 3;
  return shuffle([
    ...generateMode1Questions(perMode + (extra > 0 ? 1 : 0)),
    ...generateMode2Questions(perMode + (extra > 1 ? 1 : 0)),
    ...generateMode3Questions(perMode),
  ]).slice(0, count);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function Uhrzeit() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('einmaleins'); // temporary
  const { addError } = useErrors();

  const [activeMode, setActiveMode] = useState(0); // 0 = mixed, 1/2/3
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  // Mode 1: text input state
  const [inputValue, setInputValue] = useState('');

  const startNewSession = useCallback((mode = activeMode) => {
    setActiveMode(mode);
    setQuestions(generateSession(mode || 0, 15));
    setCurrentIndex(0);
    setSessionResults([]);
    setIsSessionComplete(false);
    setCorrectStreak(0);
    setShowFeedback(false);
    setLastAnswer(null);
    setInputValue('');
    setStartTime(Date.now());
  }, [activeMode]);

  useEffect(() => {
    startNewSession(0);
  }, []);

  // Keyboard support for mode 2 (1-4 keys) and mode 3 (1-4 keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSessionComplete || showFeedback) return;
      const q = questions[currentIndex];
      if (!q) return;

      if (q.mode === 2 || q.mode === 3) {
        const idx = parseInt(e.key) - 1;
        if (idx >= 0 && idx < 4) {
          handleOptionSelect(idx);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isSessionComplete, showFeedback, questions]);

  const processAnswer = (correct, errorLabel) => {
    const timeTaken = (Date.now() - startTime) / 1000;
    const q = questions[currentIndex];

    const result = {
      mode: q.mode,
      correct,
      time: timeTaken,
      question: errorLabel,
    };

    setSessionResults((prev) => [...prev, result]);
    setLastAnswer({ correct });
    setShowFeedback(true);

    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);

      if (newStreak === 10) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#f59e0b', '#22c55e'],
        });
        setShowStreakModal(true);
        setCorrectStreak(0);
      }
    } else {
      addError('uhrzeit', errorLabel);
      setCorrectStreak(0);
    }

    setTimeout(() => {
      setShowFeedback(false);
      setLastAnswer(null);
      setInputValue('');
      const nextIndex = currentIndex + 1;

      if (nextIndex >= questions.length) {
        setIsSessionComplete(true);
        increment();
        updateStreak();
      } else {
        setCurrentIndex(nextIndex);
        setStartTime(Date.now());
      }
    }, correct ? 800 : 2000);
  };

  // Mode 1: Check typed time
  const handleMode1Submit = (e) => {
    e.preventDefault();
    if (showFeedback) return;
    const q = questions[currentIndex];
    const input = inputValue.trim();

    // Accept multiple formats: "3:15", "03:15", "3 Uhr 15", "3 Uhr"
    let inputH = null;
    let inputM = null;

    // Try HH:MM or H:MM
    const colonMatch = input.match(/^(\d{1,2}):(\d{2})$/);
    if (colonMatch) {
      inputH = parseInt(colonMatch[1]);
      inputM = parseInt(colonMatch[2]);
    }

    // Try "X Uhr Y" or "X Uhr"
    if (inputH === null) {
      const uhrMatch = input.match(/^(\d{1,2})\s*Uhr\s*(\d{1,2})?$/i);
      if (uhrMatch) {
        inputH = parseInt(uhrMatch[1]);
        inputM = uhrMatch[2] ? parseInt(uhrMatch[2]) : 0;
      }
    }

    // Try just a number (full hour)
    if (inputH === null) {
      const numMatch = input.match(/^(\d{1,2})$/);
      if (numMatch) {
        inputH = parseInt(numMatch[1]);
        inputM = 0;
      }
    }

    const correct =
      inputH !== null &&
      inputM !== null &&
      inputH % 12 === q.hours % 12 &&
      inputM === q.minutes;

    processAnswer(correct, `${formatTime(q.hours, q.minutes)} (eingegeben: ${input})`);
  };

  // Mode 2 & 3: Multiple choice
  const handleOptionSelect = (optionIndex) => {
    if (showFeedback) return;
    const q = questions[currentIndex];
    const option = q.options[optionIndex];
    if (!option) return;

    const correct = option.correct;
    const label =
      q.mode === 2
        ? `Stelle die Uhr: ${q.displayTime}`
        : q.text.substring(0, 60) + '...';

    processAnswer(correct, label);
  };

  const calculateStats = () => {
    if (sessionResults.length === 0) return null;
    const correct = sessionResults.filter((r) => r.correct).length;
    const avgTime = sessionResults.reduce((sum, r) => sum + r.time, 0) / sessionResults.length;
    const mistakes = sessionResults.filter((r) => !r.correct);

    const byMode = {};
    for (const m of [1, 2, 3]) {
      const relevant = sessionResults.filter((r) => r.mode === m);
      const c = relevant.filter((r) => r.correct).length;
      byMode[m] = relevant.length > 0 ? Math.round((c / relevant.length) * 100) : null;
    }

    return {
      score: `${correct}/${sessionResults.length}`,
      percentage: Math.round((correct / sessionResults.length) * 100),
      avgTime: avgTime.toFixed(1),
      mistakes,
      byMode,
    };
  };

  const current = questions[currentIndex];
  const stats = calculateStats();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Clock className="w-8 h-8" />
              Uhrzeit
            </h1>

            <div className="flex items-center gap-4">
              {correctStreak > 0 && (
                <div
                  className={`text-sm font-semibold flex items-center gap-1 ${
                    correctStreak >= 5 ? 'text-green-600' : 'text-gray-600'
                  }`}
                >
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

          {/* Mode selector */}
          {!isSessionComplete && (
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 0, label: 'Gemischt' },
                { key: 1, label: 'Wie spat ist es?' },
                { key: 2, label: 'Stelle die Uhr' },
                { key: 3, label: 'Wie viel Zeit?' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => startNewSession(m.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    activeMode === m.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <TheoryPanel title="Die Uhr lesen">
          <p>Der <strong>kleine Zeiger</strong> zeigt die Stunde. Der <strong>große Zeiger</strong> zeigt die Minuten.</p>
          <ul>
            <li>Wenn der große Zeiger auf <strong>12</strong> steht: volle Stunde.</li>
            <li>Auf <strong>6</strong>: halb.</li>
            <li>Auf <strong>3</strong>: Viertel nach.</li>
            <li>Auf <strong>9</strong>: Viertel vor.</li>
          </ul>
        </TheoryPanel>

        {!isSessionComplete && current ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Aufgabe {currentIndex + 1}/{questions.length}
                </span>
                {(current.mode === 2 || current.mode === 3) && (
                  <span className="text-xs text-gray-400">Tasten: 1-4</span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* ---- Mode 1: Wie spat ist es? ---- */}
            {current.mode === 1 && (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-6">
                  Wie spat ist es?
                </h2>

                <div className="flex justify-center mb-8">
                  <AnalogClock hours={current.hours} minutes={current.minutes} size={220} />
                </div>

                {!showFeedback ? (
                  <form onSubmit={handleMode1Submit} className="flex flex-col items-center gap-4">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="z.B. 3:15 oder 3 Uhr 15"
                      className="w-64 px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      autoFocus
                      autoComplete="off"
                    />
                    <button
                      type="submit"
                      className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Prüfen
                    </button>
                  </form>
                ) : (
                  <div
                    className={`text-xl font-semibold ${
                      lastAnswer?.correct ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {lastAnswer?.correct ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" /> Richtig!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <X className="w-5 h-5" /> Es ist{' '}
                        {formatTimeGerman(current.hours, current.minutes)} (
                        {formatTime(current.hours, current.minutes)})
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ---- Mode 2: Stelle die Uhr ---- */}
            {current.mode === 2 && (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Stelle die Uhr
                </h2>
                <div className="text-4xl font-bold text-gray-800 mb-8 font-mono">
                  {current.displayTime}
                </div>

                <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
                  {current.options.map((opt, idx) => {
                    const isCorrect = opt.correct;
                    const isSelected = showFeedback && lastAnswer;
                    let borderClass = 'border-gray-200 hover:border-blue-400';
                    if (showFeedback) {
                      if (isCorrect) borderClass = 'border-green-500 bg-green-50';
                      else borderClass = 'border-gray-200 opacity-50';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={showFeedback}
                        className={`relative p-4 rounded-xl border-2 transition-all ${borderClass} disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      >
                        <div className="absolute top-2 left-3 text-xs font-bold text-gray-400">
                          {idx + 1}
                        </div>
                        <div className="flex justify-center">
                          <AnalogClock hours={opt.h} minutes={opt.m} size={120} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showFeedback && (
                  <div
                    className={`mt-6 text-xl font-semibold ${
                      lastAnswer?.correct ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {lastAnswer?.correct ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" /> Richtig!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <X className="w-5 h-5" /> Leider falsch!
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ---- Mode 3: Wie viel Zeit? ---- */}
            {current.mode === 3 && (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-6">
                  Wie viel Zeit?
                </h2>

                <div className="bg-blue-50 rounded-lg p-6 mb-8 text-lg text-gray-800 leading-relaxed">
                  {current.text}
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                  {current.options.map((opt, idx) => {
                    const isCorrect = opt.correct;
                    let btnClass =
                      'bg-white border-2 border-gray-200 hover:border-blue-400 text-gray-800';
                    if (showFeedback) {
                      if (isCorrect)
                        btnClass = 'bg-green-100 border-2 border-green-500 text-green-800';
                      else btnClass = 'bg-white border-2 border-gray-200 text-gray-400';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={showFeedback}
                        className={`relative px-4 py-4 rounded-xl font-semibold transition-all ${btnClass} disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      >
                        <span className="text-xs font-bold text-gray-400 absolute top-2 left-3">
                          {idx + 1}
                        </span>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

                {showFeedback && (
                  <div
                    className={`mt-6 text-xl font-semibold ${
                      lastAnswer?.correct ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {lastAnswer?.correct ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" /> Richtig!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <X className="w-5 h-5" /> Die Antwort ist: {current.correctAnswer}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Screen reader */}
            {showFeedback && (
              <div className="sr-only" aria-live="polite" role="status">
                {lastAnswer?.correct ? 'Richtig!' : 'Leider falsch.'}
              </div>
            )}
          </div>
        ) : isSessionComplete && stats ? (
          /* ---- Session Summary ---- */
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Session beendet!</h2>

              <div className="text-6xl font-bold mb-2">
                {stats.percentage >= 80 ? '🎉' : stats.percentage >= 60 ? '👍' : '💪'}
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {stats.score} richtig ({stats.percentage}%)
              </div>
              <div className="text-lg text-gray-600 mb-6">
                Durchschnittszeit: {stats.avgTime}s
              </div>

              {/* Per-mode breakdown */}
              <div className="flex gap-4 justify-center mb-8">
                {[
                  { key: 1, label: 'Ablesen', color: 'bg-blue-100 text-blue-700' },
                  { key: 2, label: 'Einstellen', color: 'bg-purple-100 text-purple-700' },
                  { key: 3, label: 'Zeitspanne', color: 'bg-amber-100 text-amber-700' },
                ].map(
                  (m) =>
                    stats.byMode[m.key] !== null && (
                      <div key={m.key} className={`rounded-lg px-4 py-3 ${m.color}`}>
                        <div className="text-sm font-semibold">{m.label}</div>
                        <div className="text-xl font-bold">{stats.byMode[m.key]}%</div>
                      </div>
                    )
                )}
              </div>

              {/* Mistakes */}
              {stats.mistakes.length > 0 && (
                <div className="mb-8 text-left bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Zum Merken:</h3>
                  <ul className="space-y-2">
                    {stats.mistakes.map((m, idx) => (
                      <li key={idx} className="text-gray-700">
                        • {m.question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => startNewSession(activeMode)}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Neue Session
                </button>
                {activeMode !== 0 && (
                  <button
                    onClick={() => startNewSession(0)}
                    className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    Alles gemischt
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Streak Modal */}
      {showStreakModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              10 richtig hintereinander!
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Fina, du kannst die Uhr super lesen! 🏆
            </p>
            <button
              onClick={() => setShowStreakModal(false)}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Weiter üben!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
