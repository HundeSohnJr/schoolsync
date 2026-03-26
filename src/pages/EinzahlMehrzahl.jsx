import { useState, useEffect, useRef } from 'react';
import { useStreak, useProgress, useErrors } from '../context/AppContext';
import { Flame, Check, X, Trophy, Zap, ArrowRightLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';

/**
 * Wortpaare: Einzahl/Mehrzahl für Klasse 3
 * Kategorisiert nach Plural-Bildungsmuster
 */
const WORD_PAIRS = [
  // -e ending
  { singular: "der Hund", plural: "die Hunde", pattern: "-e" },
  { singular: "der Tisch", plural: "die Tische", pattern: "-e" },
  { singular: "der Stift", plural: "die Stifte", pattern: "-e" },
  { singular: "der Schuh", plural: "die Schuhe", pattern: "-e" },
  { singular: "der Arm", plural: "die Arme", pattern: "-e" },
  { singular: "der Tag", plural: "die Tage", pattern: "-e" },
  { singular: "der Weg", plural: "die Wege", pattern: "-e" },
  { singular: "der Berg", plural: "die Berge", pattern: "-e" },
  { singular: "der Brief", plural: "die Briefe", pattern: "-e" },
  { singular: "der Fisch", plural: "die Fische", pattern: "-e" },
  { singular: "das Pferd", plural: "die Pferde", pattern: "-e" },
  { singular: "das Tier", plural: "die Tiere", pattern: "-e" },

  // -er ending
  { singular: "das Kind", plural: "die Kinder", pattern: "-er" },
  { singular: "das Bild", plural: "die Bilder", pattern: "-er" },
  { singular: "das Kleid", plural: "die Kleider", pattern: "-er" },
  { singular: "das Feld", plural: "die Felder", pattern: "-er" },
  { singular: "das Lied", plural: "die Lieder", pattern: "-er" },
  { singular: "das Schild", plural: "die Schilder", pattern: "-er" },
  { singular: "das Ei", plural: "die Eier", pattern: "-er" },

  // -en/-n ending
  { singular: "die Blume", plural: "die Blumen", pattern: "-en/-n" },
  { singular: "die Katze", plural: "die Katzen", pattern: "-en/-n" },
  { singular: "die Straße", plural: "die Straßen", pattern: "-en/-n" },
  { singular: "die Lampe", plural: "die Lampen", pattern: "-en/-n" },
  { singular: "die Hose", plural: "die Hosen", pattern: "-en/-n" },
  { singular: "die Jacke", plural: "die Jacken", pattern: "-en/-n" },
  { singular: "die Tasche", plural: "die Taschen", pattern: "-en/-n" },
  { singular: "die Wolke", plural: "die Wolken", pattern: "-en/-n" },
  { singular: "die Farbe", plural: "die Farben", pattern: "-en/-n" },
  { singular: "die Schule", plural: "die Schulen", pattern: "-en/-n" },
  { singular: "die Birne", plural: "die Birnen", pattern: "-en/-n" },
  { singular: "die Tasse", plural: "die Tassen", pattern: "-en/-n" },
  { singular: "die Kartoffel", plural: "die Kartoffeln", pattern: "-en/-n" },
  { singular: "die Schwester", plural: "die Schwestern", pattern: "-en/-n" },
  { singular: "die Uhr", plural: "die Uhren", pattern: "-en/-n" },
  { singular: "die Zahl", plural: "die Zahlen", pattern: "-en/-n" },
  { singular: "die Frau", plural: "die Frauen", pattern: "-en/-n" },

  // -s ending
  { singular: "das Auto", plural: "die Autos", pattern: "-s" },
  { singular: "das Kino", plural: "die Kinos", pattern: "-s" },
  { singular: "das Foto", plural: "die Fotos", pattern: "-s" },
  { singular: "das Radio", plural: "die Radios", pattern: "-s" },
  { singular: "das Sofa", plural: "die Sofas", pattern: "-s" },
  { singular: "das Baby", plural: "die Babys", pattern: "-s" },
  { singular: "der Opa", plural: "die Opas", pattern: "-s" },
  { singular: "die Oma", plural: "die Omas", pattern: "-s" },
  { singular: "der Park", plural: "die Parks", pattern: "-s" },
  { singular: "das Taxi", plural: "die Taxis", pattern: "-s" },

  // Umlaut + -e
  { singular: "der Baum", plural: "die Bäume", pattern: "Umlaut + -e" },
  { singular: "die Hand", plural: "die Hände", pattern: "Umlaut + -e" },
  { singular: "der Ball", plural: "die Bälle", pattern: "Umlaut + -e" },
  { singular: "die Wand", plural: "die Wände", pattern: "Umlaut + -e" },
  { singular: "der Stuhl", plural: "die Stühle", pattern: "Umlaut + -e" },
  { singular: "die Stadt", plural: "die Städte", pattern: "Umlaut + -e" },
  { singular: "die Frucht", plural: "die Früchte", pattern: "Umlaut + -e" },
  { singular: "der Zug", plural: "die Züge", pattern: "Umlaut + -e" },
  { singular: "die Nacht", plural: "die Nächte", pattern: "Umlaut + -e" },
  { singular: "die Kuh", plural: "die Kühe", pattern: "Umlaut + -e" },
  { singular: "der Hut", plural: "die Hüte", pattern: "Umlaut + -e" },

  // Umlaut + -er
  { singular: "das Haus", plural: "die Häuser", pattern: "Umlaut + -er" },
  { singular: "der Wald", plural: "die Wälder", pattern: "Umlaut + -er" },
  { singular: "das Buch", plural: "die Bücher", pattern: "Umlaut + -er" },
  { singular: "das Glas", plural: "die Gläser", pattern: "Umlaut + -er" },
  { singular: "das Dach", plural: "die Dächer", pattern: "Umlaut + -er" },
  { singular: "das Rad", plural: "die Räder", pattern: "Umlaut + -er" },
  { singular: "das Blatt", plural: "die Blätter", pattern: "Umlaut + -er" },
  { singular: "der Mann", plural: "die Männer", pattern: "Umlaut + -er" },
  { singular: "das Wort", plural: "die Wörter", pattern: "Umlaut + -er" },
  { singular: "das Land", plural: "die Länder", pattern: "Umlaut + -er" },

  // No change
  { singular: "der Lehrer", plural: "die Lehrer", pattern: "keine Änderung" },
  { singular: "das Mädchen", plural: "die Mädchen", pattern: "keine Änderung" },
  { singular: "das Fenster", plural: "die Fenster", pattern: "keine Änderung" },
  { singular: "der Spiegel", plural: "die Spiegel", pattern: "keine Änderung" },
  { singular: "das Messer", plural: "die Messer", pattern: "keine Änderung" },
  { singular: "der Teller", plural: "die Teller", pattern: "keine Änderung" },
  { singular: "das Zimmer", plural: "die Zimmer", pattern: "keine Änderung" },
  { singular: "der Löffel", plural: "die Löffel", pattern: "keine Änderung" },
  { singular: "das Brötchen", plural: "die Brötchen", pattern: "keine Änderung" },
  { singular: "der Kuchen", plural: "die Kuchen", pattern: "keine Änderung" },

  // Umlaut only
  { singular: "der Vater", plural: "die Väter", pattern: "nur Umlaut" },
  { singular: "die Mutter", plural: "die Mütter", pattern: "nur Umlaut" },
  { singular: "der Bruder", plural: "die Brüder", pattern: "nur Umlaut" },
  { singular: "die Tochter", plural: "die Töchter", pattern: "nur Umlaut" },
  { singular: "der Mantel", plural: "die Mäntel", pattern: "nur Umlaut" },
  { singular: "der Apfel", plural: "die Äpfel", pattern: "nur Umlaut" },
  { singular: "der Vogel", plural: "die Vögel", pattern: "nur Umlaut" },
  { singular: "der Garten", plural: "die Gärten", pattern: "nur Umlaut" },
];

const PATTERNS = [
  'Alle',
  '-e',
  '-er',
  '-en/-n',
  '-s',
  'Umlaut + -e',
  'Umlaut + -er',
  'keine Änderung',
  'nur Umlaut',
];

const MODES = [
  { key: 'singular-to-plural', label: 'Einzahl \u2192 Mehrzahl' },
  { key: 'plural-to-singular', label: 'Mehrzahl \u2192 Einzahl' },
];

/**
 * Shuffle-Hilfe
 */
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

/**
 * Generiert 4 Antwort-Optionen (1 richtig, 3 falsch) aus dem Pool
 */
const generateOptions = (correctAnswer, pool, mode) => {
  const field = mode === 'singular-to-plural' ? 'plural' : 'singular';
  const distractors = shuffle(
    pool.filter((w) => w[field] !== correctAnswer)
  )
    .map((w) => w[field])
    .slice(0, 3);

  return shuffle([correctAnswer, ...distractors]);
};

/**
 * Generiert eine Session
 */
const generateSession = (count = 15, filterPattern = null, mode = 'singular-to-plural') => {
  let pool = filterPattern
    ? WORD_PAIRS.filter((w) => w.pattern === filterPattern)
    : [...WORD_PAIRS];

  const shuffled = shuffle(pool);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // Erstelle Fragen mit Optionen
  return selected.map((pair) => {
    const questionField = mode === 'singular-to-plural' ? 'singular' : 'plural';
    const answerField = mode === 'singular-to-plural' ? 'plural' : 'singular';
    const correctAnswer = pair[answerField];

    // Nutze den gesamten Pool als Basis fuer Distraktoren
    const fullPool = filterPattern
      ? WORD_PAIRS.filter((w) => w.pattern === filterPattern)
      : WORD_PAIRS;

    const options = generateOptions(correctAnswer, fullPool, mode);

    return {
      question: pair[questionField],
      correctAnswer,
      options,
      pattern: pair.pattern,
      singular: pair.singular,
      plural: pair.plural,
    };
  });
};

const PATTERN_COLORS = {
  '-e': { light: 'bg-blue-100 text-blue-700' },
  '-er': { light: 'bg-purple-100 text-purple-700' },
  '-en/-n': { light: 'bg-pink-100 text-pink-700' },
  '-s': { light: 'bg-yellow-100 text-yellow-700' },
  'Umlaut + -e': { light: 'bg-orange-100 text-orange-700' },
  'Umlaut + -er': { light: 'bg-red-100 text-red-700' },
  'keine Änderung': { light: 'bg-green-100 text-green-700' },
  'nur Umlaut': { light: 'bg-teal-100 text-teal-700' },
};

/**
 * Seite: Deutsch - Einzahl/Mehrzahl Training
 */
export default function EinzahlMehrzahl() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('wortarten');
  const { addError } = useErrors();

  const [mode, setMode] = useState('singular-to-plural');
  const [patternFilter, setPatternFilter] = useState('Alle');
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

  const startNewSession = (pat = patternFilter, m = mode) => {
    setPatternFilter(pat);
    setMode(m);
    const filter = pat === 'Alle' ? null : pat;
    setQuestions(generateSession(15, filter, m));
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

  // Keyboard support: 1-4 for options
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSessionComplete || showFeedback) return;
      const current = questions[currentIndex];
      if (!current) return;

      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= 4 && current.options[keyNum - 1]) {
        handleAnswer(current.options[keyNum - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isSessionComplete, showFeedback, questions]);

  const handleAnswer = (answer) => {
    if (showFeedback || isSessionComplete || questions.length === 0) return;

    const current = questions[currentIndex];
    const correct = answer === current.correctAnswer;
    const timeTaken = (Date.now() - startTime) / 1000;

    const result = {
      question: current.question,
      correctAnswer: current.correctAnswer,
      userAnswer: answer,
      correct,
      time: timeTaken,
      pattern: current.pattern,
      singular: current.singular,
      plural: current.plural,
    };

    setSessionResults((prev) => [...prev, result]);
    setLastAnswer({ correct, correctAnswer: current.correctAnswer });
    setShowFeedback(true);

    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);

      if (newStreak === 10) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#ec4899', '#f59e0b'],
        });
        setShowStreakModal(true);
        setCorrectStreak(0);
      }
    } else {
      addError('plural', `${current.singular} → ${current.plural}`);
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

        // Confetti for good results
        const correctCount = [...sessionResults, result].filter((r) => r.correct).length;
        const pct = Math.round((correctCount / questions.length) * 100);
        if (pct >= 80) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      } else {
        setCurrentIndex(nextIndex);
        setStartTime(Date.now());
      }
    }, correct ? 800 : 1500);
  };

  const calculateStats = () => {
    if (sessionResults.length === 0) return null;
    const correct = sessionResults.filter((r) => r.correct).length;
    const avgTime = sessionResults.reduce((sum, r) => sum + r.time, 0) / sessionResults.length;
    const mistakes = sessionResults.filter((r) => !r.correct);

    // Per-pattern accuracy
    const byPattern = {};
    for (const pat of PATTERNS.filter((p) => p !== 'Alle')) {
      const relevant = sessionResults.filter((r) => r.pattern === pat);
      const correctCount = relevant.filter((r) => r.correct).length;
      byPattern[pat] = relevant.length > 0
        ? { pct: Math.round((correctCount / relevant.length) * 100), count: relevant.length }
        : null;
    }

    return {
      score: `${correct}/${sessionResults.length}`,
      percentage: Math.round((correct / sessionResults.length) * 100),
      avgTime: avgTime.toFixed(1),
      mistakes,
      byPattern,
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
            <h1 className="text-3xl font-bold text-gray-800">Einzahl / Mehrzahl</h1>

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

          {/* Modus-Auswahl */}
          {!isSessionComplete && (
            <>
              <div className="flex gap-2 mb-3">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => startNewSession(patternFilter, m.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                      mode === m.key
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Muster-Filter */}
              <div className="flex gap-2 flex-wrap">
                {PATTERNS.map((pat) => (
                  <button
                    key={pat}
                    onClick={() => startNewSession(pat, mode)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      patternFilter === pat
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pat}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12" ref={containerRef}>
        <TheoryPanel title="Einzahl und Mehrzahl">
          <ul>
            <li>Mehrzahl mit <strong>-e</strong>: der Hund → die Hunde</li>
            <li>Mehrzahl mit <strong>-er</strong>: das Kind → die Kinder</li>
            <li>Mehrzahl mit <strong>-en/-n</strong>: die Blume → die Blumen</li>
            <li>Mehrzahl mit <strong>Umlaut</strong>: der Baum → die Bäume (a→ä, o→ö, u→ü)</li>
            <li>Manche ändern sich <strong>gar nicht</strong>: der Lehrer → die Lehrer</li>
          </ul>
          <p>In der Mehrzahl ist der Artikel immer <strong>"die"</strong>!</p>
        </TheoryPanel>

        {!isSessionComplete && current ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Wort {currentIndex + 1}/{questions.length}
                </span>
                <span className="text-xs text-gray-400">
                  Tasten: 1-4 zum Antworten
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Word Display */}
            <div className="text-center mb-8">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                {mode === 'singular-to-plural' ? 'Wie heißt die Mehrzahl?' : 'Wie heißt die Einzahl?'}
              </div>
              <div className="text-xs text-gray-400 mb-3">
                Muster: {current.pattern}
              </div>
              <div className={`text-5xl font-bold mb-2 transition-colors duration-200 ${
                showFeedback
                  ? lastAnswer?.correct
                    ? 'text-green-600'
                    : 'text-red-600'
                  : 'text-gray-800'
              }`}>
                {current.question}
              </div>

              {showFeedback && (
                <div className={`text-xl font-semibold mt-4 ${lastAnswer?.correct ? 'text-green-600' : 'text-red-600'}`}>
                  {lastAnswer?.correct ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" /> Richtig!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <X className="w-5 h-5" /> Richtig wäre: {lastAnswer?.correctAnswer}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-2 gap-3">
              {current.options.map((option, idx) => {
                const isCorrect = showFeedback && option === current.correctAnswer;
                const isWrong = showFeedback && lastAnswer && !lastAnswer.correct && option === lastAnswer?.correctAnswer ? false : showFeedback && option !== current.correctAnswer && option === sessionResults[sessionResults.length - 1]?.userAnswer;

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={showFeedback}
                    className={`relative px-4 py-4 text-lg font-semibold rounded-xl transition-all duration-150
                      focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2
                      active:scale-95
                      ${showFeedback && isCorrect
                        ? 'bg-green-500 text-white ring-2 ring-green-600'
                        : showFeedback && isWrong
                          ? 'bg-red-500 text-white ring-2 ring-red-600'
                          : showFeedback
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-gray-100 text-gray-800 hover:bg-purple-100 hover:text-purple-800'
                      }
                      disabled:cursor-not-allowed`}
                  >
                    <span className="absolute top-1.5 left-3 text-xs opacity-50">{idx + 1}</span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Screen Reader */}
            {showFeedback && (
              <div className="sr-only" aria-live="polite" role="status">
                {lastAnswer?.correct
                  ? `Richtig! ${current.correctAnswer}`
                  : `Falsch. Die richtige Antwort ist ${current.correctAnswer}`}
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

              {/* Per-pattern breakdown */}
              <div className="flex gap-2 flex-wrap justify-center mb-8">
                {PATTERNS.filter((p) => p !== 'Alle').map((pat) => {
                  const data = stats.byPattern[pat];
                  if (!data) return null;
                  const colors = PATTERN_COLORS[pat] || { light: 'bg-gray-100 text-gray-700' };
                  return (
                    <div key={pat} className={`rounded-lg px-3 py-2 ${colors.light}`}>
                      <div className="text-sm font-bold">{pat}</div>
                      <div className="text-xs">{data.pct}% ({data.count})</div>
                    </div>
                  );
                })}
              </div>

              {/* Mistakes */}
              {stats.mistakes.length > 0 && (
                <div className="mb-8 text-left bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Zum Merken:
                  </h3>
                  <ul className="space-y-2">
                    {stats.mistakes.map((m, idx) => (
                      <li key={idx} className="text-gray-700">
                        <span className="font-bold">{m.singular}</span>
                        {' \u2192 '}
                        <span className="font-bold">{m.plural}</span>
                        <span className="text-sm text-gray-500 ml-2">({m.pattern})</span>
                        <br />
                        <span className="text-red-600 text-sm ml-4">deine Antwort: {m.userAnswer}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => startNewSession()}
                  className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Neue Session
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
              Du bist ein Mehrzahl-Profi!
            </p>
            <button
              onClick={() => setShowStreakModal(false)}
              className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Weiter!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
