import { useState, useEffect, useRef } from 'react';
import { useStreak, useProgress, useErrors } from '../context/AppContext';
import { Flame, Check, X, Trophy, Zap, ArrowUpRight, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';

/**
 * Adjektiv-Datenbank mit Steigerungsformen für Klasse 3
 */
const ADJECTIVES = [
  // Regelmäßig (20+)
  { grundform: "schnell", komparativ: "schneller", superlativ: "am schnellsten", category: "regelmäßig" },
  { grundform: "klein", komparativ: "kleiner", superlativ: "am kleinsten", category: "regelmäßig" },
  { grundform: "langsam", komparativ: "langsamer", superlativ: "am langsamsten", category: "regelmäßig" },
  { grundform: "leise", komparativ: "leiser", superlativ: "am leisesten", category: "regelmäßig" },
  { grundform: "laut", komparativ: "lauter", superlativ: "am lautesten", category: "regelmäßig" },
  { grundform: "lustig", komparativ: "lustiger", superlativ: "am lustigsten", category: "regelmäßig" },
  { grundform: "fleißig", komparativ: "fleißiger", superlativ: "am fleißigsten", category: "regelmäßig" },
  { grundform: "freundlich", komparativ: "freundlicher", superlativ: "am freundlichsten", category: "regelmäßig" },
  { grundform: "schön", komparativ: "schöner", superlativ: "am schönsten", category: "regelmäßig" },
  { grundform: "dünn", komparativ: "dünner", superlativ: "am dünnsten", category: "regelmäßig" },
  { grundform: "hell", komparativ: "heller", superlativ: "am hellsten", category: "regelmäßig" },
  { grundform: "dunkel", komparativ: "dunkler", superlativ: "am dunkelsten", category: "regelmäßig" },
  { grundform: "bunt", komparativ: "bunter", superlativ: "am buntesten", category: "regelmäßig" },
  { grundform: "neu", komparativ: "neuer", superlativ: "am neuesten", category: "regelmäßig" },
  { grundform: "weit", komparativ: "weiter", superlativ: "am weitesten", category: "regelmäßig" },
  { grundform: "billig", komparativ: "billiger", superlativ: "am billigsten", category: "regelmäßig" },
  { grundform: "mutig", komparativ: "mutiger", superlativ: "am mutigsten", category: "regelmäßig" },
  { grundform: "traurig", komparativ: "trauriger", superlativ: "am traurigsten", category: "regelmäßig" },
  { grundform: "wichtig", komparativ: "wichtiger", superlativ: "am wichtigsten", category: "regelmäßig" },
  { grundform: "lecker", komparativ: "leckerer", superlativ: "am leckersten", category: "regelmäßig" },
  { grundform: "schlecht", komparativ: "schlechter", superlativ: "am schlechtesten", category: "regelmäßig" },
  { grundform: "lieb", komparativ: "lieber", superlativ: "am liebsten", category: "regelmäßig" },

  // Mit Umlaut (12+)
  { grundform: "groß", komparativ: "größer", superlativ: "am größten", category: "umlaut" },
  { grundform: "alt", komparativ: "älter", superlativ: "am ältesten", category: "umlaut" },
  { grundform: "kalt", komparativ: "kälter", superlativ: "am kältesten", category: "umlaut" },
  { grundform: "warm", komparativ: "wärmer", superlativ: "am wärmsten", category: "umlaut" },
  { grundform: "klug", komparativ: "klüger", superlativ: "am klügsten", category: "umlaut" },
  { grundform: "jung", komparativ: "jünger", superlativ: "am jüngsten", category: "umlaut" },
  { grundform: "stark", komparativ: "stärker", superlativ: "am stärksten", category: "umlaut" },
  { grundform: "lang", komparativ: "länger", superlativ: "am längsten", category: "umlaut" },
  { grundform: "kurz", komparativ: "kürzer", superlativ: "am kürzesten", category: "umlaut" },
  { grundform: "dumm", komparativ: "dümmer", superlativ: "am dümmsten", category: "umlaut" },
  { grundform: "hart", komparativ: "härter", superlativ: "am härtesten", category: "umlaut" },
  { grundform: "scharf", komparativ: "schärfer", superlativ: "am schärfsten", category: "umlaut" },
  { grundform: "schwach", komparativ: "schwächer", superlativ: "am schwächsten", category: "umlaut" },

  // Unregelmäßig (5+)
  { grundform: "gut", komparativ: "besser", superlativ: "am besten", category: "unregelmäßig" },
  { grundform: "viel", komparativ: "mehr", superlativ: "am meisten", category: "unregelmäßig" },
  { grundform: "gern", komparativ: "lieber", superlativ: "am liebsten", category: "unregelmäßig" },
  { grundform: "hoch", komparativ: "höher", superlativ: "am höchsten", category: "unregelmäßig" },
  { grundform: "nah", komparativ: "näher", superlativ: "am nächsten", category: "unregelmäßig" },
];

/**
 * Personalisierte Sätze für Mode 2 ("Welche Form?")
 * Jeder Satz enthält ein hervorgehobenes Adjektiv und die korrekte Form
 */
const SENTENCES = [
  // Komparativ
  { sentence: "Loki ist §schneller§ als Elvis.", highlighted: "schneller", form: "komparativ" },
  { sentence: "Mama Anastasia kocht §besser§ als Papa Philipp.", highlighted: "besser", form: "komparativ" },
  { sentence: "Oma Angelika ist §älter§ als Papa.", highlighted: "älter", form: "komparativ" },
  { sentence: "Elvis ist §größer§ als Loki.", highlighted: "größer", form: "komparativ" },
  { sentence: "Im Winter ist es §kälter§ als im Herbst.", highlighted: "kälter", form: "komparativ" },
  { sentence: "Fina läuft §schneller§ als ihre Freundin.", highlighted: "schneller", form: "komparativ" },
  { sentence: "Papa Philipp ist §stärker§ als Fina.", highlighted: "stärker", form: "komparativ" },

  // Superlativ
  { sentence: "Fina ist das §fleißigste§ Mädchen im Turnverein.", highlighted: "fleißigste", form: "superlativ" },
  { sentence: "Loki bellt §am lautesten§ von allen Hunden.", highlighted: "am lautesten", form: "superlativ" },
  { sentence: "TSG Bürstadt hat die §beste§ Mannschaft.", highlighted: "beste", form: "superlativ" },
  { sentence: "Oma Angelika backt den §leckersten§ Kuchen.", highlighted: "leckersten", form: "superlativ" },
  { sentence: "Elvis ist der §liebste§ Hund der Welt.", highlighted: "liebste", form: "superlativ" },
  { sentence: "Im Sommer sind die Tage §am längsten§.", highlighted: "am längsten", form: "superlativ" },
  { sentence: "Mama Anastasia singt §am schönsten§ in der Familie.", highlighted: "am schönsten", form: "superlativ" },

  // Grundform
  { sentence: "Papa kocht §leckeres§ Essen.", highlighted: "leckeres", form: "grundform" },
  { sentence: "Loki ist ein §kleiner§ Hund.", highlighted: "kleiner", form: "grundform" },
  { sentence: "Fina hat eine §gute§ Note bekommen.", highlighted: "gute", form: "grundform" },
  { sentence: "Elvis hat ein §weiches§ Fell.", highlighted: "weiches", form: "grundform" },
  { sentence: "Die TSG Bürstadt hat ein §großes§ Sportfeld.", highlighted: "großes", form: "grundform" },
  { sentence: "Oma Angelika erzählt §lustige§ Geschichten.", highlighted: "lustige", form: "grundform" },
];

const MODES = [
  { id: 'steigern', label: 'Steigere das Adjektiv', icon: ArrowUpRight },
  { id: 'erkennen', label: 'Welche Form?', icon: HelpCircle },
];

const CATEGORIES = ['Alle', 'regelmäßig', 'umlaut', 'unregelmäßig'];

const CATEGORY_LABELS = {
  'Alle': 'Alle',
  'regelmäßig': 'Regelmäßig',
  'umlaut': 'Mit Umlaut',
  'unregelmäßig': 'Unregelmäßig',
};

const FORM_COLORS = {
  grundform: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', light: 'bg-blue-100 text-blue-700', ring: 'ring-blue-500' },
  komparativ: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', light: 'bg-purple-100 text-purple-700', ring: 'ring-purple-500' },
  superlativ: { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', light: 'bg-amber-100 text-amber-700', ring: 'ring-amber-500' },
};

const FORM_LABELS = {
  grundform: 'Grundform',
  komparativ: 'Komparativ',
  superlativ: 'Superlativ',
};

/**
 * Generiert falsche Optionen für Mode 1 (Steigern)
 */
const generateDistractors = (correct, field, adjective) => {
  const allForms = ADJECTIVES.map(a => a[field]).filter(f => f !== correct);
  const shuffled = allForms.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
};

/**
 * Generiert eine Session für Mode 1
 */
const generateSteigernSession = (count = 15, filterCategory = null) => {
  let pool = filterCategory && filterCategory !== 'Alle'
    ? ADJECTIVES.filter(a => a.category === filterCategory)
    : [...ADJECTIVES];

  pool = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));

  return pool.map(adj => {
    // Randomly ask for komparativ or superlativ (or both)
    const askType = Math.random();
    let question;

    if (askType < 0.4) {
      // Ask for Komparativ
      const distractors = generateDistractors(adj.komparativ, 'komparativ', adj);
      const options = [adj.komparativ, ...distractors].sort(() => Math.random() - 0.5);
      question = {
        type: 'komparativ',
        adjective: adj,
        given: adj.grundform,
        givenLabel: 'Grundform',
        askLabel: 'Komparativ',
        correctAnswer: adj.komparativ,
        options,
      };
    } else if (askType < 0.8) {
      // Ask for Superlativ
      const distractors = generateDistractors(adj.superlativ, 'superlativ', adj);
      const options = [adj.superlativ, ...distractors].sort(() => Math.random() - 0.5);
      question = {
        type: 'superlativ',
        adjective: adj,
        given: adj.grundform,
        givenLabel: 'Grundform',
        askLabel: 'Superlativ',
        correctAnswer: adj.superlativ,
        options,
      };
    } else {
      // Ask for Grundform given Komparativ
      const distractors = generateDistractors(adj.grundform, 'grundform', adj);
      const options = [adj.grundform, ...distractors].sort(() => Math.random() - 0.5);
      question = {
        type: 'grundform',
        adjective: adj,
        given: adj.komparativ,
        givenLabel: 'Komparativ',
        askLabel: 'Grundform',
        correctAnswer: adj.grundform,
        options,
      };
    }

    return question;
  });
};

/**
 * Generiert eine Session für Mode 2
 */
const generateErkennenSession = (count = 15) => {
  const pool = [...SENTENCES].sort(() => Math.random() - 0.5);
  return pool.slice(0, Math.min(count, pool.length));
};

/**
 * Rendert einen Satz mit hervorgehobenem Adjektiv
 */
const HighlightedSentence = ({ sentence }) => {
  const parts = sentence.split('§');
  return (
    <span>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-bold underline decoration-2 decoration-purple-500 text-purple-700">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

/**
 * Seite: Deutsch - Adjektiv-Steigerung (Klasse 3)
 */
export default function Steigerung() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('wortarten');
  const { addError } = useErrors();

  const [mode, setMode] = useState('steigern');
  const [category, setCategory] = useState('Alle');
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

  const startNewSession = (newMode = mode, cat = category) => {
    setMode(newMode);
    setCategory(cat);
    if (newMode === 'steigern') {
      setQuestions(generateSteigernSession(15, cat));
    } else {
      setQuestions(generateErkennenSession(15));
    }
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

      const current = questions[currentIndex];
      if (!current) return;

      if (mode === 'steigern') {
        const options = current.options;
        if (e.key === '1' && options[0]) handleAnswer(options[0]);
        if (e.key === '2' && options[1]) handleAnswer(options[1]);
        if (e.key === '3' && options[2]) handleAnswer(options[2]);
      } else {
        if (e.key === '1') handleAnswer('grundform');
        if (e.key === '2') handleAnswer('komparativ');
        if (e.key === '3') handleAnswer('superlativ');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isSessionComplete, showFeedback, questions, mode]);

  const handleAnswer = (answer) => {
    if (showFeedback || isSessionComplete || questions.length === 0) return;

    const current = questions[currentIndex];
    const correctAnswer = mode === 'steigern' ? current.correctAnswer : current.form;
    const correct = answer === correctAnswer;
    const timeTaken = (Date.now() - startTime) / 1000;

    const result = {
      correct,
      time: timeTaken,
      userAnswer: answer,
      correctAnswer,
      question: mode === 'steigern'
        ? `${current.given} -> ${current.askLabel}`
        : current.sentence.replace(/§/g, ''),
    };

    setSessionResults(prev => [...prev, result]);
    setLastAnswer({
      correct,
      correctAnswer,
      correctLabel: mode === 'erkennen' ? FORM_LABELS[correctAnswer] : correctAnswer,
    });
    setShowFeedback(true);

    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);

      if (newStreak === 10) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#f59e0b', '#3b82f6'],
        });
        setShowStreakModal(true);
        setCorrectStreak(0);
      }
    } else {
      const errorLabel = mode === 'steigern'
        ? `${current.given} -> ${correctAnswer}`
        : `${current.highlighted}: ${FORM_LABELS[correctAnswer]}`;
      addError('steigerung', errorLabel);
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
    }, correct ? 800 : 1500);
  };

  const calculateStats = () => {
    if (sessionResults.length === 0) return null;
    const correct = sessionResults.filter(r => r.correct).length;
    const avgTime = sessionResults.reduce((sum, r) => sum + r.time, 0) / sessionResults.length;
    const mistakes = sessionResults.filter(r => !r.correct);

    return {
      score: `${correct}/${sessionResults.length}`,
      percentage: Math.round((correct / sessionResults.length) * 100),
      avgTime: avgTime.toFixed(1),
      mistakes,
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
            <h1 className="text-3xl font-bold text-gray-800">Adjektiv-Steigerung</h1>

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
            <div className="mb-4">
              <div className="flex gap-2 mb-3">
                {MODES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => startNewSession(id, category)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      mode === id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Category filter (only for steigern mode) */}
              {mode === 'steigern' && (
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => startNewSession(mode, cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                        category === cat
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12" ref={containerRef}>
        <TheoryPanel title="Adjektive steigern">
          <ul>
            <li><strong>Grundform:</strong> schnell, groß, gut</li>
            <li><strong>Komparativ</strong> (Vergleich, mit "-er"): schneller, größer, besser</li>
            <li><strong>Superlativ</strong> (am meisten, mit "am ...-sten"): am schnellsten, am größten, am besten</li>
          </ul>
          <p>Viele Adjektive bekommen einen <strong>Umlaut</strong>: groß → größer, alt → älter</p>
          <p><strong>Aufpassen bei:</strong> gut → besser → am besten, viel → mehr → am meisten</p>
        </TheoryPanel>

        {!isSessionComplete && current ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Aufgabe {currentIndex + 1}/{questions.length}
                </span>
                <span className="text-xs text-gray-400">
                  Tasten: 1 / 2 / 3
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Mode 1: Steigern */}
            {mode === 'steigern' && (
              <>
                <div className="text-center mb-8">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                    {CATEGORY_LABELS[current.adjective.category]}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">{current.givenLabel}:</div>
                  <div className={`text-5xl font-bold mb-4 transition-colors duration-200 ${
                    showFeedback
                      ? lastAnswer?.correct
                        ? 'text-green-600'
                        : 'text-red-600'
                      : 'text-gray-800'
                  }`}>
                    {current.given}
                  </div>
                  <div className="text-lg text-purple-600 font-semibold">
                    Wie lautet der {current.askLabel}?
                  </div>

                  {showFeedback && (
                    <div className={`mt-3 text-xl font-semibold ${lastAnswer?.correct ? 'text-green-600' : 'text-red-600'}`}>
                      {lastAnswer?.correct ? (
                        <span className="flex items-center justify-center gap-2">
                          <Check className="w-5 h-5" /> Richtig!
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <X className="w-5 h-5" /> Richtig wäre: {lastAnswer?.correctLabel}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Option Buttons */}
                <div className="flex flex-col gap-3">
                  {current.options.map((option, idx) => {
                    const isCorrect = showFeedback && option === current.correctAnswer;
                    const isWrong = showFeedback && lastAnswer && !lastAnswer.correct && option === lastAnswer?.correctAnswer;

                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswer(option)}
                        disabled={showFeedback}
                        className={`w-full py-4 px-6 text-lg font-semibold rounded-xl transition-all duration-150
                          ${showFeedback && isCorrect
                            ? 'bg-green-500 text-white ring-4 ring-green-300'
                            : showFeedback
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-gray-100 text-gray-800 hover:bg-purple-100 hover:text-purple-700'
                          }
                          disabled:cursor-not-allowed
                          focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-offset-2
                          active:scale-[0.98]`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{option}</span>
                          <span className="text-sm opacity-50">{idx + 1}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Mode 2: Erkennen */}
            {mode === 'erkennen' && (
              <>
                <div className="text-center mb-8">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-4">
                    Welche Form ist das markierte Adjektiv?
                  </div>
                  <div className={`text-2xl leading-relaxed mb-4 transition-colors duration-200 ${
                    showFeedback
                      ? lastAnswer?.correct
                        ? 'text-green-700'
                        : 'text-red-700'
                      : 'text-gray-800'
                  }`}>
                    <HighlightedSentence sentence={current.sentence} />
                  </div>

                  {showFeedback && (
                    <div className={`mt-3 text-xl font-semibold ${lastAnswer?.correct ? 'text-green-600' : 'text-red-600'}`}>
                      {lastAnswer?.correct ? (
                        <span className="flex items-center justify-center gap-2">
                          <Check className="w-5 h-5" /> Richtig!
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <X className="w-5 h-5" /> Es ist: {lastAnswer?.correctLabel}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex gap-4 justify-center">
                  {['grundform', 'komparativ', 'superlativ'].map((form, idx) => {
                    const colors = FORM_COLORS[form];
                    return (
                      <button
                        key={form}
                        onClick={() => handleAnswer(form)}
                        disabled={showFeedback}
                        className={`flex-1 h-20 text-lg font-bold text-white rounded-xl transition-all duration-150
                          ${colors.bg} ${colors.hover}
                          disabled:opacity-50 disabled:cursor-not-allowed
                          focus:outline-none focus:ring-4 ${colors.ring} focus:ring-offset-2
                          active:scale-95`}
                      >
                        {FORM_LABELS[form]}
                        <div className="text-xs opacity-70">{idx + 1}</div>
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
                  : `Falsch. Richtige Antwort: ${lastAnswer?.correctLabel}`}
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
                {stats.percentage >= 80 ? '🎉' : stats.percentage >= 60 ? '👍' : '💪'}
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {stats.score} richtig ({stats.percentage}%)
              </div>
              <div className="text-lg text-gray-600 mb-6">
                Durchschnittszeit: {stats.avgTime}s
              </div>

              {/* Per-form breakdown */}
              <div className="flex gap-4 justify-center mb-8">
                {['grundform', 'komparativ', 'superlativ'].map((form) => {
                  const relevant = sessionResults.filter(r => r.correctAnswer === form || r.correctAnswer === form);
                  const correctCount = relevant.filter(r => r.correct).length;
                  const pct = relevant.length > 0 ? Math.round((correctCount / relevant.length) * 100) : null;
                  return (
                    <div key={form} className={`rounded-lg px-4 py-3 ${FORM_COLORS[form].light}`}>
                      <div className="text-base font-bold">{FORM_LABELS[form]}</div>
                      <div className="text-sm">{pct !== null ? `${pct}%` : '—'}</div>
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
                        <span className="font-bold">{m.question}</span>
                        <span className="text-red-600 ml-2">
                          (du: {mode === 'erkennen' ? FORM_LABELS[m.userAnswer] || m.userAnswer : m.userAnswer}, richtig: {mode === 'erkennen' ? FORM_LABELS[m.correctAnswer] || m.correctAnswer : m.correctAnswer})
                        </span>
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
                <button
                  onClick={() => startNewSession(mode === 'steigern' ? 'erkennen' : 'steigern')}
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
              Du bist ein Steigerungs-Profi!
            </p>
            <button
              onClick={() => setShowStreakModal(false)}
              className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Weiter üben!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
