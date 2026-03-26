import { useState, useEffect, useRef } from 'react';
import { useStreak, useProgress, useErrors } from '../context/AppContext';
import { Flame, Check, X, Trophy, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';
import SessionRating from '../components/SessionRating';

/**
 * Nomen-Datenbank mit Artikeln für Klasse 3
 * Kategorisiert nach Themen für abwechslungsreiche Sessions
 */
const NOUNS = [
  // Tiere
  { word: "Hund", article: "der", hint: "Tier" },
  { word: "Katze", article: "die", hint: "Tier" },
  { word: "Pferd", article: "das", hint: "Tier" },
  { word: "Vogel", article: "der", hint: "Tier" },
  { word: "Maus", article: "die", hint: "Tier" },
  { word: "Kaninchen", article: "das", hint: "Tier" },
  { word: "Fisch", article: "der", hint: "Tier" },
  { word: "Ente", article: "die", hint: "Tier" },
  { word: "Schaf", article: "das", hint: "Tier" },
  { word: "Hase", article: "der", hint: "Tier" },
  { word: "Kuh", article: "die", hint: "Tier" },
  { word: "Schwein", article: "das", hint: "Tier" },
  { word: "Bär", article: "der", hint: "Tier" },
  { word: "Schlange", article: "die", hint: "Tier" },
  { word: "Eichhörnchen", article: "das", hint: "Tier" },
  { word: "Frosch", article: "der", hint: "Tier" },
  { word: "Schildkröte", article: "die", hint: "Tier" },
  { word: "Reh", article: "das", hint: "Tier" },
  { word: "Schmetterling", article: "der", hint: "Tier" },
  { word: "Biene", article: "die", hint: "Tier" },

  // Schule
  { word: "Lehrer", article: "der", hint: "Schule" },
  { word: "Schule", article: "die", hint: "Schule" },
  { word: "Buch", article: "das", hint: "Schule" },
  { word: "Stift", article: "der", hint: "Schule" },
  { word: "Tasche", article: "die", hint: "Schule" },
  { word: "Heft", article: "das", hint: "Schule" },
  { word: "Tisch", article: "der", hint: "Schule" },
  { word: "Tafel", article: "die", hint: "Schule" },
  { word: "Lineal", article: "das", hint: "Schule" },
  { word: "Radiergummi", article: "der", hint: "Schule" },
  { word: "Schere", article: "die", hint: "Schule" },
  { word: "Papier", article: "das", hint: "Schule" },
  { word: "Stuhl", article: "der", hint: "Schule" },
  { word: "Kreide", article: "die", hint: "Schule" },
  { word: "Klassenzimmer", article: "das", hint: "Schule" },

  // Familie & Menschen
  { word: "Vater", article: "der", hint: "Familie" },
  { word: "Mutter", article: "die", hint: "Familie" },
  { word: "Kind", article: "das", hint: "Familie" },
  { word: "Bruder", article: "der", hint: "Familie" },
  { word: "Schwester", article: "die", hint: "Familie" },
  { word: "Baby", article: "das", hint: "Familie" },
  { word: "Opa", article: "der", hint: "Familie" },
  { word: "Oma", article: "die", hint: "Familie" },
  { word: "Mädchen", article: "das", hint: "Familie" },
  { word: "Junge", article: "der", hint: "Familie" },
  { word: "Freundin", article: "die", hint: "Familie" },

  // Essen & Trinken
  { word: "Apfel", article: "der", hint: "Essen" },
  { word: "Banane", article: "die", hint: "Essen" },
  { word: "Brot", article: "das", hint: "Essen" },
  { word: "Kuchen", article: "der", hint: "Essen" },
  { word: "Suppe", article: "die", hint: "Essen" },
  { word: "Ei", article: "das", hint: "Essen" },
  { word: "Käse", article: "der", hint: "Essen" },
  { word: "Milch", article: "die", hint: "Essen" },
  { word: "Wasser", article: "das", hint: "Essen" },
  { word: "Saft", article: "der", hint: "Essen" },
  { word: "Kartoffel", article: "die", hint: "Essen" },
  { word: "Brötchen", article: "das", hint: "Essen" },
  { word: "Salat", article: "der", hint: "Essen" },
  { word: "Tomate", article: "die", hint: "Essen" },
  { word: "Eis", article: "das", hint: "Essen" },

  // Natur & Wetter
  { word: "Baum", article: "der", hint: "Natur" },
  { word: "Blume", article: "die", hint: "Natur" },
  { word: "Blatt", article: "das", hint: "Natur" },
  { word: "Wald", article: "der", hint: "Natur" },
  { word: "Wiese", article: "die", hint: "Natur" },
  { word: "Gras", article: "das", hint: "Natur" },
  { word: "Regen", article: "der", hint: "Natur" },
  { word: "Sonne", article: "die", hint: "Natur" },
  { word: "Gewitter", article: "das", hint: "Natur" },
  { word: "Wind", article: "der", hint: "Natur" },
  { word: "Wolke", article: "die", hint: "Natur" },
  { word: "Meer", article: "das", hint: "Natur" },
  { word: "Berg", article: "der", hint: "Natur" },
  { word: "Straße", article: "die", hint: "Natur" },
  { word: "Feld", article: "das", hint: "Natur" },

  // Haus & Gegenstände
  { word: "Schrank", article: "der", hint: "Haus" },
  { word: "Lampe", article: "die", hint: "Haus" },
  { word: "Fenster", article: "das", hint: "Haus" },
  { word: "Spiegel", article: "der", hint: "Haus" },
  { word: "Tür", article: "die", hint: "Haus" },
  { word: "Bett", article: "das", hint: "Haus" },
  { word: "Teller", article: "der", hint: "Haus" },
  { word: "Tasse", article: "die", hint: "Haus" },
  { word: "Glas", article: "das", hint: "Haus" },
  { word: "Löffel", article: "der", hint: "Haus" },
  { word: "Gabel", article: "die", hint: "Haus" },
  { word: "Messer", article: "das", hint: "Haus" },
  { word: "Schlüssel", article: "der", hint: "Haus" },
  { word: "Uhr", article: "die", hint: "Haus" },
  { word: "Bild", article: "das", hint: "Haus" },

  // Kleidung
  { word: "Schuh", article: "der", hint: "Kleidung" },
  { word: "Hose", article: "die", hint: "Kleidung" },
  { word: "Kleid", article: "das", hint: "Kleidung" },
  { word: "Mantel", article: "der", hint: "Kleidung" },
  { word: "Jacke", article: "die", hint: "Kleidung" },
  { word: "T-Shirt", article: "das", hint: "Kleidung" },
  { word: "Hut", article: "der", hint: "Kleidung" },
  { word: "Mütze", article: "die", hint: "Kleidung" },
  { word: "Hemd", article: "das", hint: "Kleidung" },

  // Sport & Freizeit
  { word: "Ball", article: "der", hint: "Sport" },
  { word: "Puppe", article: "die", hint: "Sport" },
  { word: "Fahrrad", article: "das", hint: "Sport" },
  { word: "Roller", article: "der", hint: "Sport" },
  { word: "Gitarre", article: "die", hint: "Sport" },
  { word: "Spiel", article: "das", hint: "Sport" },
  { word: "Computer", article: "der", hint: "Sport" },
  { word: "Flöte", article: "die", hint: "Sport" },
  { word: "Spielzeug", article: "das", hint: "Sport" },
];

/**
 * Generiert eine zufällige Auswahl von Nomen
 * Wenn errorNouns vorhanden, werden bis zu 3 davon bevorzugt eingemischt
 */
const generateSession = (count = 10, filterCategory = null, errorNouns = []) => {
  let pool = filterCategory
    ? NOUNS.filter(n => n.hint === filterCategory)
    : [...NOUNS];

  // Include up to 3 previously-wrong nouns
  const prioritized = [];
  if (errorNouns.length > 0) {
    const shuffledErrors = [...errorNouns].sort(() => Math.random() - 0.5);
    for (const errNoun of shuffledErrors) {
      if (prioritized.length >= 3) break;
      const match = pool.find(n => n.word === errNoun);
      if (match && !prioritized.includes(match)) {
        prioritized.push(match);
      }
    }
  }

  // Fill the rest randomly (excluding already picked)
  const prioritizedWords = new Set(prioritized.map(n => n.word));
  const remaining = pool
    .filter(n => !prioritizedWords.has(n.word))
    .sort(() => Math.random() - 0.5)
    .slice(0, count - prioritized.length);

  // Combine and shuffle
  return [...prioritized, ...remaining].sort(() => Math.random() - 0.5);
};

const CATEGORIES = ['Alle', 'Tier', 'Schule', 'Familie', 'Essen', 'Natur', 'Haus', 'Kleidung', 'Sport'];

const ARTICLE_COLORS = {
  der: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', light: 'bg-blue-100 text-blue-700', ring: 'ring-blue-500' },
  die: { bg: 'bg-red-500', hover: 'hover:bg-red-600', light: 'bg-red-100 text-red-700', ring: 'ring-red-500' },
  das: { bg: 'bg-green-500', hover: 'hover:bg-green-600', light: 'bg-green-100 text-green-700', ring: 'ring-green-500' },
};

/**
 * Seite: Deutsch - der/die/das Training
 */
export default function DerDieDas() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('der-die-das');
  const { errors, addError } = useErrors();

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

  const startNewSession = (cat = category) => {
    setCategory(cat);
    const filter = cat === 'Alle' ? null : cat;
    // Extract nouns from article errors (format: "der Hund" -> "Hund")
    const errorNouns = errors
      .filter(e => e.type === 'article')
      .map(e => {
        const parts = e.question.split(' ');
        return parts.length >= 2 ? parts.slice(1).join(' ') : null;
      })
      .filter(Boolean);
    setQuestions(generateSession(10, filter, errorNouns));
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
      if (e.key === '1') handleAnswer('der');
      if (e.key === '2') handleAnswer('die');
      if (e.key === '3') handleAnswer('das');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isSessionComplete, showFeedback, questions]);

  const handleAnswer = (article) => {
    if (showFeedback || isSessionComplete || questions.length === 0) return;

    const current = questions[currentIndex];
    const correct = article === current.article;
    const timeTaken = (Date.now() - startTime) / 1000;

    const result = {
      word: current.word,
      correctArticle: current.article,
      userArticle: article,
      correct,
      time: timeTaken,
      hint: current.hint,
    };

    setSessionResults(prev => [...prev, result]);
    setLastAnswer({ correct, correctArticle: current.article });
    setShowFeedback(true);

    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);

      if (newStreak === 10) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#ef4444', '#22c55e'],
        });
        setShowStreakModal(true);
        setCorrectStreak(0);
      }
    } else {
      addError('article', `${current.article} ${current.word}`);
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

    // Per-article accuracy
    const byArticle = {};
    for (const article of ['der', 'die', 'das']) {
      const relevant = sessionResults.filter(r => r.correctArticle === article);
      const correctCount = relevant.filter(r => r.correct).length;
      byArticle[article] = relevant.length > 0
        ? Math.round((correctCount / relevant.length) * 100)
        : null;
    }

    return {
      score: `${correct}/${sessionResults.length}`,
      percentage: Math.round((correct / sessionResults.length) * 100),
      avgTime: avgTime.toFixed(1),
      mistakes,
      byArticle,
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
            <h1 className="text-3xl font-bold text-gray-800">der / die / das</h1>

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

          {/* Kategorie-Auswahl */}
          {!isSessionComplete && (
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => startNewSession(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    category === cat
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12" ref={containerRef}>
        <TheoryPanel title="der, die oder das?">
          <ul>
            <li><strong>der</strong> = männlich (maskulin): der Hund, der Tisch, der Vater</li>
            <li><strong>die</strong> = weiblich (feminin): die Katze, die Blume, die Mutter</li>
            <li><strong>das</strong> = sächlich (neutral): das Kind, das Buch, das Haus</li>
          </ul>
          <p><strong>Tipp:</strong> Bei "-ung", "-heit", "-keit" ist es immer DIE. Bei "-chen" und "-lein" ist es immer DAS.</p>
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
                  Tasten: 1=der  2=die  3=das
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Word Display */}
            <div className="text-center mb-8">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                {current.hint}
              </div>
              <div className={`text-6xl font-bold mb-2 transition-colors duration-200 ${
                showFeedback
                  ? lastAnswer?.correct
                    ? 'text-green-600'
                    : 'text-red-600'
                  : 'text-gray-800'
              }`}>
                {showFeedback && !lastAnswer?.correct && (
                  <span className="text-3xl">{lastAnswer?.correctArticle} </span>
                )}
                {current.word}
              </div>

              {showFeedback && (
                <div className={`text-xl font-semibold ${lastAnswer?.correct ? 'text-green-600' : 'text-red-600'}`}>
                  {lastAnswer?.correct ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" /> Richtig!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <X className="w-5 h-5" /> Es heißt: {lastAnswer?.correctArticle} {current.word}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Article Buttons */}
            <div className="flex gap-4 justify-center">
              {['der', 'die', 'das'].map((article, idx) => (
                <button
                  key={article}
                  onClick={() => handleAnswer(article)}
                  disabled={showFeedback}
                  className={`w-20 h-16 sm:w-28 sm:h-20 text-2xl font-bold text-white rounded-xl transition-all duration-150
                    ${ARTICLE_COLORS[article].bg} ${ARTICLE_COLORS[article].hover}
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-4 ${ARTICLE_COLORS[article].ring} focus:ring-offset-2
                    active:scale-95`}
                >
                  {article}
                  <div className="text-xs opacity-70">{idx + 1}</div>
                </button>
              ))}
            </div>

            {/* Screen Reader */}
            {showFeedback && (
              <div className="sr-only" aria-live="polite" role="status">
                {lastAnswer?.correct
                  ? `Richtig! ${current.article} ${current.word}`
                  : `Falsch. Es heißt ${current.article} ${current.word}`}
              </div>
            )}
          </div>
        ) : isSessionComplete && stats ? (
          /* Session Summary */
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
              <div className="text-lg text-gray-600 mb-6">
                Durchschnittszeit: {stats.avgTime}s
              </div>

              {/* Per-article breakdown */}
              <div className="flex gap-4 justify-center mb-8">
                {['der', 'die', 'das'].map((article) => (
                  <div key={article} className={`rounded-lg px-4 py-3 ${ARTICLE_COLORS[article].light}`}>
                    <div className="text-xl font-bold">{article}</div>
                    <div className="text-sm">
                      {stats.byArticle[article] !== null
                        ? `${stats.byArticle[article]}%`
                        : '—'}
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
                  <ul className="space-y-2">
                    {stats.mistakes.map((m, idx) => (
                      <li key={idx} className="text-gray-700">
                        • <span className="font-bold">{m.correctArticle}</span> {m.word}
                        <span className="text-red-600 ml-2">(du: {m.userArticle})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <SessionRating />

              {/* Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => startNewSession()}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              Du kennst dich super aus mit der/die/das! 🏆
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
