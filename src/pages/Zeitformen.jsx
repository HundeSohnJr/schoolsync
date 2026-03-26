import { useState, useEffect, useRef } from 'react';
import { useStreak, useProgress, useErrors } from '../context/AppContext';
import { Flame, Check, X, Trophy, Zap, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';
import SessionRating from '../components/SessionRating';

/**
 * Verb-Datenbank mit allen drei Zeitformen in personalisierten Sätzen für Fina
 * Mix aus regelmäßigen und unregelmäßigen Verben, haben-Perfekt und sein-Perfekt
 */
const VERB_SETS = [
  // Regelmäßige Verben
  {
    verb: "spielen",
    präsens: { sentence: "Fina spielt mit Loki im Garten.", subject: "Fina" },
    präteritum: { sentence: "Fina spielte mit Loki im Garten.", subject: "Fina" },
    perfekt: { sentence: "Fina hat mit Loki im Garten gespielt.", subject: "Fina" },
  },
  {
    verb: "machen",
    präsens: { sentence: "Mama Anastasia macht das Abendessen.", subject: "Mama Anastasia" },
    präteritum: { sentence: "Mama Anastasia machte das Abendessen.", subject: "Mama Anastasia" },
    perfekt: { sentence: "Mama Anastasia hat das Abendessen gemacht.", subject: "Mama Anastasia" },
  },
  {
    verb: "kochen",
    präsens: { sentence: "Oma Angelika kocht Pfannkuchen für Fina.", subject: "Oma Angelika" },
    präteritum: { sentence: "Oma Angelika kochte Pfannkuchen für Fina.", subject: "Oma Angelika" },
    perfekt: { sentence: "Oma Angelika hat Pfannkuchen für Fina gekocht.", subject: "Oma Angelika" },
  },
  {
    verb: "turnen",
    präsens: { sentence: "Fina turnt bei der TSG Bürstadt.", subject: "Fina" },
    präteritum: { sentence: "Fina turnte bei der TSG Bürstadt.", subject: "Fina" },
    perfekt: { sentence: "Fina hat bei der TSG Bürstadt geturnt.", subject: "Fina" },
  },
  {
    verb: "basteln",
    präsens: { sentence: "Fina bastelt ein Geschenk für Papa Philipp.", subject: "Fina" },
    präteritum: { sentence: "Fina bastelte ein Geschenk für Papa Philipp.", subject: "Fina" },
    perfekt: { sentence: "Fina hat ein Geschenk für Papa Philipp gebastelt.", subject: "Fina" },
  },
  {
    verb: "malen",
    präsens: { sentence: "Fina malt ein Bild von Elvis.", subject: "Fina" },
    präteritum: { sentence: "Fina malte ein Bild von Elvis.", subject: "Fina" },
    perfekt: { sentence: "Fina hat ein Bild von Elvis gemalt.", subject: "Fina" },
  },
  {
    verb: "hören",
    präsens: { sentence: "Opa Roland hört Musik im Wohnzimmer.", subject: "Opa Roland" },
    präteritum: { sentence: "Opa Roland hörte Musik im Wohnzimmer.", subject: "Opa Roland" },
    perfekt: { sentence: "Opa Roland hat Musik im Wohnzimmer gehört.", subject: "Opa Roland" },
  },
  {
    verb: "kaufen",
    präsens: { sentence: "Papa Philipp kauft Hundefutter für Loki und Elvis.", subject: "Papa Philipp" },
    präteritum: { sentence: "Papa Philipp kaufte Hundefutter für Loki und Elvis.", subject: "Papa Philipp" },
    perfekt: { sentence: "Papa Philipp hat Hundefutter für Loki und Elvis gekauft.", subject: "Papa Philipp" },
  },
  {
    verb: "lernen",
    präsens: { sentence: "Fina lernt fleißig für die Schule.", subject: "Fina" },
    präteritum: { sentence: "Fina lernte fleißig für die Schule.", subject: "Fina" },
    perfekt: { sentence: "Fina hat fleißig für die Schule gelernt.", subject: "Fina" },
  },
  {
    verb: "lachen",
    präsens: { sentence: "Tante Kathi lacht über einen Witz.", subject: "Tante Kathi" },
    präteritum: { sentence: "Tante Kathi lachte über einen Witz.", subject: "Tante Kathi" },
    perfekt: { sentence: "Tante Kathi hat über einen Witz gelacht.", subject: "Tante Kathi" },
  },
  {
    verb: "tanzen",
    präsens: { sentence: "Fina tanzt in ihrem Zimmer.", subject: "Fina" },
    präteritum: { sentence: "Fina tanzte in ihrem Zimmer.", subject: "Fina" },
    perfekt: { sentence: "Fina hat in ihrem Zimmer getanzt.", subject: "Fina" },
  },
  {
    verb: "suchen",
    präsens: { sentence: "Elvis sucht seinen Ball im Garten.", subject: "Elvis" },
    präteritum: { sentence: "Elvis suchte seinen Ball im Garten.", subject: "Elvis" },
    perfekt: { sentence: "Elvis hat seinen Ball im Garten gesucht.", subject: "Elvis" },
  },
  {
    verb: "zeigen",
    präsens: { sentence: "Onkel Robin zeigt Fina ein lustiges Video.", subject: "Onkel Robin" },
    präteritum: { sentence: "Onkel Robin zeigte Fina ein lustiges Video.", subject: "Onkel Robin" },
    perfekt: { sentence: "Onkel Robin hat Fina ein lustiges Video gezeigt.", subject: "Onkel Robin" },
  },
  {
    verb: "streicheln",
    präsens: { sentence: "Fina streichelt Loki auf dem Sofa.", subject: "Fina" },
    präteritum: { sentence: "Fina streichelte Loki auf dem Sofa.", subject: "Fina" },
    perfekt: { sentence: "Fina hat Loki auf dem Sofa gestreichelt.", subject: "Fina" },
  },
  {
    verb: "wünschen",
    präsens: { sentence: "Oma Katja wünscht Fina einen schönen Tag.", subject: "Oma Katja" },
    präteritum: { sentence: "Oma Katja wünschte Fina einen schönen Tag.", subject: "Oma Katja" },
    perfekt: { sentence: "Oma Katja hat Fina einen schönen Tag gewünscht.", subject: "Oma Katja" },
  },
  // Unregelmäßige Verben
  {
    verb: "gehen",
    präsens: { sentence: "Fina geht mit Elvis durch Bürstadt.", subject: "Fina" },
    präteritum: { sentence: "Fina ging mit Elvis durch Bürstadt.", subject: "Fina" },
    perfekt: { sentence: "Fina ist mit Elvis durch Bürstadt gegangen.", subject: "Fina" },
  },
  {
    verb: "lesen",
    präsens: { sentence: "Fina liest ein spannendes Buch.", subject: "Fina" },
    präteritum: { sentence: "Fina las ein spannendes Buch.", subject: "Fina" },
    perfekt: { sentence: "Fina hat ein spannendes Buch gelesen.", subject: "Fina" },
  },
  {
    verb: "essen",
    präsens: { sentence: "Fina isst Spaghetti bei Oma Angelika.", subject: "Fina" },
    präteritum: { sentence: "Fina aß Spaghetti bei Oma Angelika.", subject: "Fina" },
    perfekt: { sentence: "Fina hat Spaghetti bei Oma Angelika gegessen.", subject: "Fina" },
  },
  {
    verb: "fahren",
    präsens: { sentence: "Papa Philipp fährt mit Fina zum Turnen.", subject: "Papa Philipp" },
    präteritum: { sentence: "Papa Philipp fuhr mit Fina zum Turnen.", subject: "Papa Philipp" },
    perfekt: { sentence: "Papa Philipp ist mit Fina zum Turnen gefahren.", subject: "Papa Philipp" },
  },
  {
    verb: "schlafen",
    präsens: { sentence: "Loki schläft auf Finas Bett.", subject: "Loki" },
    präteritum: { sentence: "Loki schlief auf Finas Bett.", subject: "Loki" },
    perfekt: { sentence: "Loki hat auf Finas Bett geschlafen.", subject: "Loki" },
  },
  {
    verb: "laufen",
    präsens: { sentence: "Fina läuft beim Turnen ganz schnell.", subject: "Fina" },
    präteritum: { sentence: "Fina lief beim Turnen ganz schnell.", subject: "Fina" },
    perfekt: { sentence: "Fina ist beim Turnen ganz schnell gelaufen.", subject: "Fina" },
  },
  {
    verb: "singen",
    präsens: { sentence: "Mama Anastasia singt ein Lied für Fina.", subject: "Mama Anastasia" },
    präteritum: { sentence: "Mama Anastasia sang ein Lied für Fina.", subject: "Mama Anastasia" },
    perfekt: { sentence: "Mama Anastasia hat ein Lied für Fina gesungen.", subject: "Mama Anastasia" },
  },
  {
    verb: "schreiben",
    präsens: { sentence: "Fina schreibt einen Brief an Oma Katja.", subject: "Fina" },
    präteritum: { sentence: "Fina schrieb einen Brief an Oma Katja.", subject: "Fina" },
    perfekt: { sentence: "Fina hat einen Brief an Oma Katja geschrieben.", subject: "Fina" },
  },
  {
    verb: "trinken",
    präsens: { sentence: "Opa Dima trinkt Tee in der Küche.", subject: "Opa Dima" },
    präteritum: { sentence: "Opa Dima trank Tee in der Küche.", subject: "Opa Dima" },
    perfekt: { sentence: "Opa Dima hat Tee in der Küche getrunken.", subject: "Opa Dima" },
  },
  {
    verb: "geben",
    präsens: { sentence: "Opa Roland gibt Fina ein Eis.", subject: "Opa Roland" },
    präteritum: { sentence: "Opa Roland gab Fina ein Eis.", subject: "Opa Roland" },
    perfekt: { sentence: "Opa Roland hat Fina ein Eis gegeben.", subject: "Opa Roland" },
  },
  {
    verb: "nehmen",
    präsens: { sentence: "Fina nimmt Elvis an die Leine.", subject: "Fina" },
    präteritum: { sentence: "Fina nahm Elvis an die Leine.", subject: "Fina" },
    perfekt: { sentence: "Fina hat Elvis an die Leine genommen.", subject: "Fina" },
  },
  {
    verb: "kommen",
    präsens: { sentence: "Tante Kathi kommt zu Besuch nach Bürstadt.", subject: "Tante Kathi" },
    präteritum: { sentence: "Tante Kathi kam zu Besuch nach Bürstadt.", subject: "Tante Kathi" },
    perfekt: { sentence: "Tante Kathi ist zu Besuch nach Bürstadt gekommen.", subject: "Tante Kathi" },
  },
  {
    verb: "finden",
    präsens: { sentence: "Loki findet einen Stock im Park.", subject: "Loki" },
    präteritum: { sentence: "Loki fand einen Stock im Park.", subject: "Loki" },
    perfekt: { sentence: "Loki hat einen Stock im Park gefunden.", subject: "Loki" },
  },
  {
    verb: "springen",
    präsens: { sentence: "Fina springt beim Turnen über den Kasten.", subject: "Fina" },
    präteritum: { sentence: "Fina sprang beim Turnen über den Kasten.", subject: "Fina" },
    perfekt: { sentence: "Fina ist beim Turnen über den Kasten gesprungen.", subject: "Fina" },
  },
  {
    verb: "schwimmen",
    präsens: { sentence: "Onkel Robin schwimmt mit Fina im Freibad.", subject: "Onkel Robin" },
    präteritum: { sentence: "Onkel Robin schwamm mit Fina im Freibad.", subject: "Onkel Robin" },
    perfekt: { sentence: "Onkel Robin ist mit Fina im Freibad geschwommen.", subject: "Onkel Robin" },
  },
];

const TENSES = ['präsens', 'präteritum', 'perfekt'];

const TENSE_LABELS = {
  präsens: 'Präsens',
  präteritum: 'Präteritum',
  perfekt: 'Perfekt',
};

const TENSE_COLORS = {
  präsens: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', light: 'bg-blue-100 text-blue-700', ring: 'ring-blue-500', text: 'text-blue-600' },
  präteritum: { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', light: 'bg-amber-100 text-amber-700', ring: 'ring-amber-500', text: 'text-amber-600' },
  perfekt: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', light: 'bg-purple-100 text-purple-700', ring: 'ring-purple-500', text: 'text-purple-600' },
};

const TENSE_HINTS = {
  präsens: 'jetzt / heute',
  präteritum: 'früher (Erzählung)',
  perfekt: 'hat/ist ... gemacht',
};

const MODES = [
  { key: 'identify', label: 'Welche Zeitform?', icon: '?' },
  { key: 'transform', label: 'Verwandle den Satz', icon: '\u2192' },
];

/**
 * Shuffle-Hilfsfunktion (Fisher-Yates)
 */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Generiert eine Session mit 10 Fragen
 */
const generateSession = (mode, count = 10) => {
  const pool = shuffle(VERB_SETS);
  const selected = pool.slice(0, Math.min(count, pool.length));

  if (mode === 'identify') {
    return selected.map((verbSet) => {
      const tense = TENSES[Math.floor(Math.random() * 3)];
      return {
        type: 'identify',
        verbSet,
        shownTense: tense,
        sentence: verbSet[tense].sentence,
        correctAnswer: tense,
      };
    });
  }

  // Transform mode
  return selected.map((verbSet) => {
    const sourceTense = TENSES[Math.floor(Math.random() * 3)];
    const otherTenses = TENSES.filter((t) => t !== sourceTense);
    const targetTense = otherTenses[Math.floor(Math.random() * 2)];
    const wrongTense = otherTenses.find((t) => t !== targetTense) || sourceTense;

    const correctSentence = verbSet[targetTense].sentence;
    const wrongOption1 = verbSet[wrongTense].sentence;
    const wrongOption2 = verbSet[sourceTense].sentence;

    // Build unique options (source might equal one wrong)
    const optionsSet = new Set([correctSentence, wrongOption1, wrongOption2]);
    // If duplicates collapsed, re-add from remaining tenses
    if (optionsSet.size < 3) {
      for (const t of TENSES) {
        optionsSet.add(verbSet[t].sentence);
        if (optionsSet.size >= 3) break;
      }
    }
    const options = shuffle([...optionsSet].slice(0, 3));

    return {
      type: 'transform',
      verbSet,
      sourceTense,
      targetTense,
      sentence: verbSet[sourceTense].sentence,
      correctAnswer: correctSentence,
      options,
    };
  });
};

/**
 * Seite: Deutsch - Zeitformen Training (Klasse 3)
 * Personalisiert für Fina
 */
export default function Zeitformen() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('zeitformen');
  const { addError } = useErrors();

  const [mode, setMode] = useState('identify');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const containerRef = useRef(null);

  const startNewSession = (newMode = mode) => {
    setMode(newMode);
    setQuestions(generateSession(newMode, 10));
    setCurrentIndex(0);
    setSessionResults([]);
    setIsSessionComplete(false);
    setCorrectStreak(0);
    setShowFeedback(false);
    setLastAnswer(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    startNewSession();
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSessionComplete || showFeedback) return;
      if (!questions[currentIndex]) return;

      const q = questions[currentIndex];

      if (q.type === 'identify') {
        if (e.key === '1') handleAnswer('präsens');
        if (e.key === '2') handleAnswer('präteritum');
        if (e.key === '3') handleAnswer('perfekt');
      } else {
        if (e.key === '1' && q.options[0]) handleAnswer(q.options[0]);
        if (e.key === '2' && q.options[1]) handleAnswer(q.options[1]);
        if (e.key === '3' && q.options[2]) handleAnswer(q.options[2]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isSessionComplete, showFeedback, questions]);

  const handleAnswer = (answer) => {
    if (showFeedback || isSessionComplete || questions.length === 0) return;

    const q = questions[currentIndex];
    const correct = answer === q.correctAnswer;
    const timeTaken = (Date.now() - startTime) / 1000;

    // Determine which tense this question was testing
    const testedTense = q.type === 'identify' ? q.shownTense : q.targetTense;

    const result = {
      question: q,
      userAnswer: answer,
      correct,
      time: timeTaken,
      testedTense,
    };

    setSessionResults((prev) => [...prev, result]);
    setLastAnswer({ correct, question: q, userAnswer: answer });
    setShowFeedback(true);

    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);

      if (newStreak === 10) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#f59e0b', '#a855f7'],
        });
        setShowStreakModal(true);
        setCorrectStreak(0);
      }
    } else {
      const errorLabel = q.type === 'identify'
        ? `${q.sentence} → ${TENSE_LABELS[q.correctAnswer]}`
        : `${q.sentence} → ${TENSE_LABELS[q.targetTense]}: ${q.correctAnswer}`;
      addError('zeitform', errorLabel);
      setCorrectStreak(0);
    }

    // Auto-advance
    setTimeout(() => {
      setShowFeedback(false);
      setLastAnswer(null);
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

  const calculateStats = () => {
    if (sessionResults.length === 0) return null;
    const correct = sessionResults.filter((r) => r.correct).length;
    const avgTime = sessionResults.reduce((sum, r) => sum + r.time, 0) / sessionResults.length;
    const mistakes = sessionResults.filter((r) => !r.correct);

    // Per-tense accuracy
    const byTense = {};
    for (const tense of TENSES) {
      const relevant = sessionResults.filter((r) => r.testedTense === tense);
      const correctCount = relevant.filter((r) => r.correct).length;
      byTense[tense] = relevant.length > 0
        ? Math.round((correctCount / relevant.length) * 100)
        : null;
    }

    return {
      score: `${correct}/${sessionResults.length}`,
      percentage: Math.round((correct / sessionResults.length) * 100),
      avgTime: avgTime.toFixed(1),
      mistakes,
      byTense,
    };
  };

  const current = questions[currentIndex];
  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Zeitformen</h1>

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

          {/* Mode Selector */}
          {!isSessionComplete && (
            <div className="flex gap-3">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => startNewSession(m.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    mode === m.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12" ref={containerRef}>
        <TheoryPanel title="Die drei Zeitformen">
          <ul>
            <li><strong>Präsens</strong> = jetzt, heute: Fina spielt mit Loki.</li>
            <li><strong>Präteritum</strong> = früher, es war einmal: Fina spielte mit Loki.</li>
            <li><strong>Perfekt</strong> = es ist passiert (mit "hat" oder "ist"): Fina hat mit Loki gespielt.</li>
          </ul>
          <p><strong>Tipp:</strong> Im Perfekt steht das zweite Verb am Ende! (hat ... gespielt, ist ... gelaufen)</p>
        </TheoryPanel>

        {!isSessionComplete && current ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Satz {currentIndex + 1}/{questions.length}
                </span>
                <span className="text-xs text-gray-400">
                  Tasten: 1 / 2 / 3
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* --- MODE: IDENTIFY --- */}
            {current.type === 'identify' && (
              <>
                <div className="text-center mb-8">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">
                    Welche Zeitform ist das?
                  </div>
                  <div className={`text-2xl sm:text-3xl font-bold leading-relaxed transition-colors duration-200 ${
                    showFeedback
                      ? lastAnswer?.correct ? 'text-green-600' : 'text-red-600'
                      : 'text-gray-800'
                  }`}>
                    &bdquo;{current.sentence}&ldquo;
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Verb: <span className="font-semibold">{current.verbSet.verb}</span>
                  </div>

                  {showFeedback && (
                    <div className={`mt-4 text-lg font-semibold ${lastAnswer?.correct ? 'text-green-600' : 'text-red-600'}`}>
                      {lastAnswer?.correct ? (
                        <span className="flex items-center justify-center gap-2">
                          <Check className="w-5 h-5" /> Richtig! Das ist {TENSE_LABELS[current.correctAnswer]}.
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <X className="w-5 h-5" /> Das ist {TENSE_LABELS[current.correctAnswer]}, nicht {TENSE_LABELS[lastAnswer?.userAnswer]}.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Tense Buttons */}
                <div className="flex gap-4 justify-center flex-wrap">
                  {TENSES.map((tense, idx) => (
                    <button
                      key={tense}
                      onClick={() => handleAnswer(tense)}
                      disabled={showFeedback}
                      className={`w-36 py-4 text-lg font-bold text-white rounded-xl transition-all duration-150
                        ${TENSE_COLORS[tense].bg} ${TENSE_COLORS[tense].hover}
                        disabled:opacity-50 disabled:cursor-not-allowed
                        focus:outline-none focus:ring-4 ${TENSE_COLORS[tense].ring} focus:ring-offset-2
                        active:scale-95`}
                    >
                      {TENSE_LABELS[tense]}
                      <div className="text-xs opacity-70 mt-1">{TENSE_HINTS[tense]}</div>
                      <div className="text-xs opacity-60 mt-0.5">{idx + 1}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* --- MODE: TRANSFORM --- */}
            {current.type === 'transform' && (
              <>
                <div className="text-center mb-8">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                    Verwandle den Satz
                  </div>

                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${TENSE_COLORS[current.sourceTense].light}`}>
                      {TENSE_LABELS[current.sourceTense]}
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${TENSE_COLORS[current.targetTense].light} ring-2 ${TENSE_COLORS[current.targetTense].ring}`}>
                      {TENSE_LABELS[current.targetTense]}
                    </span>
                  </div>

                  <div className={`text-2xl sm:text-3xl font-bold leading-relaxed transition-colors duration-200 ${
                    showFeedback
                      ? lastAnswer?.correct ? 'text-green-600' : 'text-red-600'
                      : 'text-gray-800'
                  }`}>
                    &bdquo;{current.sentence}&ldquo;
                  </div>

                  {showFeedback && (
                    <div className={`mt-4 text-lg font-semibold ${lastAnswer?.correct ? 'text-green-600' : 'text-red-600'}`}>
                      {lastAnswer?.correct ? (
                        <span className="flex items-center justify-center gap-2">
                          <Check className="w-5 h-5" /> Richtig!
                        </span>
                      ) : (
                        <span className="flex flex-col items-center gap-1">
                          <span className="flex items-center gap-2">
                            <X className="w-5 h-5" /> Richtig wäre:
                          </span>
                          <span className="text-base">&bdquo;{current.correctAnswer}&ldquo;</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Option Buttons */}
                <div className="flex flex-col gap-3">
                  {current.options.map((option, idx) => {
                    const isCorrectOption = option === current.correctAnswer;
                    const isSelected = showFeedback && lastAnswer?.userAnswer === option;

                    let btnClass = 'bg-white border-2 border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50';
                    if (showFeedback) {
                      if (isCorrectOption) {
                        btnClass = 'bg-green-50 border-2 border-green-500 text-green-800';
                      } else if (isSelected && !lastAnswer?.correct) {
                        btnClass = 'bg-red-50 border-2 border-red-500 text-red-800';
                      } else {
                        btnClass = 'bg-white border-2 border-gray-200 text-gray-400';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        disabled={showFeedback}
                        className={`w-full py-4 px-6 text-left text-lg rounded-xl transition-all duration-150
                          ${btnClass}
                          disabled:cursor-not-allowed
                          focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2
                          active:scale-[0.98]`}
                      >
                        <span className="text-sm font-bold text-gray-400 mr-3">{idx + 1}</span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Screen Reader */}
            {showFeedback && (
              <div className="sr-only" aria-live="polite" role="status">
                {lastAnswer?.correct
                  ? 'Richtig!'
                  : `Falsch. Die richtige Antwort ist: ${
                      current.type === 'identify'
                        ? TENSE_LABELS[current.correctAnswer]
                        : current.correctAnswer
                    }`}
              </div>
            )}
          </div>
        ) : isSessionComplete && stats ? (
          /* Session Summary */
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Session beendet!
              </h2>

              <div className="text-6xl font-bold mb-2">
                {stats.percentage >= 80 ? '\uD83C\uDF89' : stats.percentage >= 60 ? '\u2713' : '\uD83D\uDCAA'}
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {stats.score} richtig ({stats.percentage}%)
              </div>
              <div className="text-lg text-gray-600 mb-6">
                Durchschnittszeit: {stats.avgTime}s
              </div>

              {/* Per-tense breakdown */}
              <div className="flex gap-4 justify-center mb-8 flex-wrap">
                {TENSES.map((tense) => (
                  <div key={tense} className={`rounded-lg px-4 py-3 ${TENSE_COLORS[tense].light}`}>
                    <div className="text-lg font-bold">{TENSE_LABELS[tense]}</div>
                    <div className="text-sm">
                      {stats.byTense[tense] !== null
                        ? `${stats.byTense[tense]}%`
                        : '\u2014'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mistakes */}
              {stats.mistakes.length > 0 && (
                <div className="mb-8 text-left bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Zum Merken:
                  </h3>
                  <ul className="space-y-3">
                    {stats.mistakes.map((m, idx) => (
                      <li key={idx} className="text-gray-700">
                        {m.question.type === 'identify' ? (
                          <>
                            <span className="font-medium">&bdquo;{m.question.sentence}&ldquo;</span>
                            {' '}&rarr;{' '}
                            <span className="font-bold">{TENSE_LABELS[m.question.correctAnswer]}</span>
                            <span className="text-red-600 ml-2">(du: {TENSE_LABELS[m.userAnswer]})</span>
                          </>
                        ) : (
                          <>
                            <span className="font-medium">&bdquo;{m.question.sentence}&ldquo;</span>
                            {' '}&rarr; {TENSE_LABELS[m.question.targetTense]}:
                            <br />
                            <span className="font-bold ml-4">&bdquo;{m.question.correctAnswer}&ldquo;</span>
                            <span className="text-red-600 ml-2">(du: &bdquo;{m.userAnswer}&ldquo;)</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <SessionRating />

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => startNewSession(mode)}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Nochmal ({mode === 'identify' ? 'Erkennen' : 'Verwandeln'})
                </button>
                <button
                  onClick={() => startNewSession(mode === 'identify' ? 'transform' : 'identify')}
                  className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Modus wechseln
                </button>
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
              Du bist ein Zeitformen-Profi, Fina!
            </p>
            <button
              onClick={() => setShowStreakModal(false)}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Weiter!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
