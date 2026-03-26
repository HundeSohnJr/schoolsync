import { useState, useEffect, useRef } from 'react';
import { useStreak, useProgress, useErrors } from '../context/AppContext';
import { Flame, Check, X, Trophy, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';

/**
 * Satzarten-Datenbank: Aussagesatz, Fragesatz, Ausrufesatz
 * Personalisiert mit Finas Familie und Umfeld
 */
const SENTENCES = [
  // === Aussagesätze (.) ===
  { id: 1, text: "Fina geht heute zum Turnen", type: "aussage", punctuation: "." },
  { id: 2, text: "Papa Philipp kocht das Abendessen", type: "aussage", punctuation: "." },
  { id: 3, text: "Mama Anastasia liest ein Buch auf dem Sofa", type: "aussage", punctuation: "." },
  { id: 4, text: "Loki schläft in seinem Körbchen", type: "aussage", punctuation: "." },
  { id: 5, text: "Elvis wartet vor der Haustür", type: "aussage", punctuation: "." },
  { id: 6, text: "Fina hat Training bei der TSG Bürstadt", type: "aussage", punctuation: "." },
  { id: 7, text: "Tante Kathi und Onkel Robin kommen am Samstag", type: "aussage", punctuation: "." },
  { id: 8, text: "Opa Roland arbeitet im Garten", type: "aussage", punctuation: "." },
  { id: 9, text: "Oma Angelika hat einen Kuchen gebacken", type: "aussage", punctuation: "." },
  { id: 10, text: "Fina wohnt in Bürstadt", type: "aussage", punctuation: "." },
  { id: 11, text: "Oma Katja hat ein Paket geschickt", type: "aussage", punctuation: "." },
  { id: 12, text: "Opa Dima erzählt gerne Geschichten", type: "aussage", punctuation: "." },
  { id: 13, text: "Die zwei Hunde spielen im Garten", type: "aussage", punctuation: "." },
  { id: 14, text: "Fina ist in der dritten Klasse", type: "aussage", punctuation: "." },
  { id: 15, text: "Am Wochenende fährt die Familie in den Park", type: "aussage", punctuation: "." },

  // === Fragesätze (?) ===
  { id: 16, text: "Wann kommt Oma Angelika zu Besuch", type: "frage", punctuation: "?" },
  { id: 17, text: "Hat Fina heute Turnen bei der TSG Bürstadt", type: "frage", punctuation: "?" },
  { id: 18, text: "Wo ist Elvis hingelaufen", type: "frage", punctuation: "?" },
  { id: 19, text: "Darf Loki mit auf das Sofa", type: "frage", punctuation: "?" },
  { id: 20, text: "Was kocht Papa Philipp heute", type: "frage", punctuation: "?" },
  { id: 21, text: "Kommt Tante Kathi morgen vorbei", type: "frage", punctuation: "?" },
  { id: 22, text: "Warum bellt Loki so laut", type: "frage", punctuation: "?" },
  { id: 23, text: "Hast du Opa Roland schon angerufen", type: "frage", punctuation: "?" },
  { id: 24, text: "Wann fängt das Training an", type: "frage", punctuation: "?" },
  { id: 25, text: "Kann Mama Anastasia mich zur Schule bringen", type: "frage", punctuation: "?" },
  { id: 26, text: "Wie heißt Finas Lieblingslied", type: "frage", punctuation: "?" },
  { id: 27, text: "Haben Onkel Robin und Tante Kathi ihren Hund dabei", type: "frage", punctuation: "?" },
  { id: 28, text: "Wo wohnt Oma Katja", type: "frage", punctuation: "?" },
  { id: 29, text: "Spielen Loki und Elvis gerade draußen", type: "frage", punctuation: "?" },
  { id: 30, text: "Hat Opa Dima das Geschenk schon eingepackt", type: "frage", punctuation: "?" },

  // === Ausrufesätze (!) ===
  { id: 31, text: "Loki, komm sofort her", type: "ausruf", punctuation: "!" },
  { id: 32, text: "Fina hat eine Eins geschrieben", type: "ausruf", punctuation: "!" },
  { id: 33, text: "Pass auf, Elvis", type: "ausruf", punctuation: "!" },
  { id: 34, text: "Das Turnen war heute so toll", type: "ausruf", punctuation: "!" },
  { id: 35, text: "Oma Angelika, du bist die Beste", type: "ausruf", punctuation: "!" },
  { id: 36, text: "Endlich sind Tante Kathi und Onkel Robin da", type: "ausruf", punctuation: "!" },
  { id: 37, text: "Hör auf damit, Loki", type: "ausruf", punctuation: "!" },
  { id: 38, text: "Papa, schau mal was ich kann", type: "ausruf", punctuation: "!" },
  { id: 39, text: "Das ist ja unglaublich", type: "ausruf", punctuation: "!" },
  { id: 40, text: "Opa Roland, warte auf mich", type: "ausruf", punctuation: "!" },
  { id: 41, text: "Die TSG Bürstadt hat gewonnen", type: "ausruf", punctuation: "!" },
  { id: 42, text: "Mama, komm schnell", type: "ausruf", punctuation: "!" },
  { id: 43, text: "Elvis, lass das Essen stehen", type: "ausruf", punctuation: "!" },
  { id: 44, text: "So ein schöner Tag in Bürstadt", type: "ausruf", punctuation: "!" },
  { id: 45, text: "Oma Katja hat die besten Pelmeni gemacht", type: "ausruf", punctuation: "!" },
];

/**
 * Generiert eine Session mit 15 Sätzen (5 pro Typ, gemischt)
 */
const generateSession = () => {
  const byType = {
    aussage: SENTENCES.filter(s => s.type === 'aussage').sort(() => Math.random() - 0.5).slice(0, 5),
    frage: SENTENCES.filter(s => s.type === 'frage').sort(() => Math.random() - 0.5).slice(0, 5),
    ausruf: SENTENCES.filter(s => s.type === 'ausruf').sort(() => Math.random() - 0.5).slice(0, 5),
  };
  return [...byType.aussage, ...byType.frage, ...byType.ausruf].sort(() => Math.random() - 0.5);
};

const PUNCTUATION_STYLES = {
  '.': { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', light: 'bg-blue-100 text-blue-700', ring: 'ring-blue-500', label: 'Aussagesatz' },
  '?': { bg: 'bg-green-500', hover: 'hover:bg-green-600', light: 'bg-green-100 text-green-700', ring: 'ring-green-500', label: 'Fragesatz' },
  '!': { bg: 'bg-red-500', hover: 'hover:bg-red-600', light: 'bg-red-100 text-red-700', ring: 'ring-red-500', label: 'Ausrufesatz' },
};

const TYPE_LABELS = {
  aussage: 'Aussagesatz',
  frage: 'Fragesatz',
  ausruf: 'Ausrufesatz',
};

/**
 * Seite: Deutsch - Satzarten & Satzzeichen Training
 * Klasse 2-3
 */
export default function Satzarten() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('wortarten');
  const { addError } = useErrors();

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

  const startNewSession = () => {
    setQuestions(generateSession());
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

  // Keyboard support: 1 = .  2 = ?  3 = !
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSessionComplete || showFeedback) return;
      if (e.key === '1') handleAnswer('.');
      if (e.key === '2') handleAnswer('?');
      if (e.key === '3') handleAnswer('!');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isSessionComplete, showFeedback, questions]);

  const handleAnswer = (punctuation) => {
    if (showFeedback || isSessionComplete || questions.length === 0) return;

    const current = questions[currentIndex];
    const correct = punctuation === current.punctuation;
    const timeTaken = (Date.now() - startTime) / 1000;

    const result = {
      text: current.text,
      correctPunctuation: current.punctuation,
      userPunctuation: punctuation,
      type: current.type,
      correct,
      time: timeTaken,
    };

    setSessionResults(prev => [...prev, result]);
    setLastAnswer({ correct, correctPunctuation: current.punctuation, type: current.type });
    setShowFeedback(true);

    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);

      if (newStreak === 10) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#22c55e', '#ef4444'],
        });
        setShowStreakModal(true);
        setCorrectStreak(0);
      }
    } else {
      addError('satzarten', `${current.text}${current.punctuation} (${TYPE_LABELS[current.type]})`);
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

    // Per-punctuation accuracy
    const byPunctuation = {};
    for (const p of ['.', '?', '!']) {
      const relevant = sessionResults.filter(r => r.correctPunctuation === p);
      const correctCount = relevant.filter(r => r.correct).length;
      byPunctuation[p] = relevant.length > 0
        ? Math.round((correctCount / relevant.length) * 100)
        : null;
    }

    return {
      score: `${correct}/${sessionResults.length}`,
      percentage: Math.round((correct / sessionResults.length) * 100),
      avgTime: avgTime.toFixed(1),
      mistakes,
      byPunctuation,
    };
  };

  const current = questions[currentIndex];
  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Satzarten</h1>
              <p className="text-sm text-gray-500 mt-1">Welches Satzzeichen passt?</p>
            </div>

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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12" ref={containerRef}>
        <TheoryPanel title="Welches Satzzeichen?">
          <ul>
            <li><strong>Aussagesatz</strong> = erzählt etwas → Punkt (<strong>.</strong>) Beispiel: Fina geht zur Schule.</li>
            <li><strong>Fragesatz</strong> = fragt etwas → Fragezeichen (<strong>?</strong>) Beispiel: Wann kommt Mama?</li>
            <li><strong>Ausrufesatz</strong> = ruft, befiehlt, staunt → Ausrufezeichen (<strong>!</strong>) Beispiel: Komm sofort her!</li>
          </ul>
        </TheoryPanel>

        {!isSessionComplete && current ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Satz {currentIndex + 1}/{questions.length}
                </span>
                <span className="text-xs text-gray-400">
                  Tasten: 1=.  2=?  3=!
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Sentence Display */}
            <div className="text-center mb-10">
              <div className={`text-3xl sm:text-4xl font-bold leading-relaxed transition-colors duration-200 ${
                showFeedback
                  ? lastAnswer?.correct
                    ? 'text-green-600'
                    : 'text-red-600'
                  : 'text-gray-800'
              }`}>
                {current.text}
                <span className={`inline-block w-10 text-center ${
                  showFeedback
                    ? lastAnswer?.correct ? 'text-green-600' : 'text-red-600'
                    : 'text-gray-300'
                }`}>
                  {showFeedback ? current.punctuation : '_'}
                </span>
              </div>

              {showFeedback && (
                <div className={`text-xl font-semibold mt-4 ${lastAnswer?.correct ? 'text-green-600' : 'text-red-600'}`}>
                  {lastAnswer?.correct ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" /> Richtig! ({TYPE_LABELS[lastAnswer.type]})
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <X className="w-5 h-5" /> Das ist ein {TYPE_LABELS[current.type]} &rarr; {current.punctuation}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Punctuation Buttons */}
            <div className="flex gap-4 justify-center">
              {['.', '?', '!'].map((p, idx) => (
                <button
                  key={p}
                  onClick={() => handleAnswer(p)}
                  disabled={showFeedback}
                  className={`w-28 h-24 text-5xl font-bold text-white rounded-xl transition-all duration-150
                    ${PUNCTUATION_STYLES[p].bg} ${PUNCTUATION_STYLES[p].hover}
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-4 ${PUNCTUATION_STYLES[p].ring} focus:ring-offset-2
                    active:scale-95`}
                >
                  {p}
                  <div className="text-xs opacity-70 font-normal mt-1">{idx + 1}</div>
                </button>
              ))}
            </div>

            {/* Screen Reader */}
            {showFeedback && (
              <div className="sr-only" aria-live="polite" role="status">
                {lastAnswer?.correct
                  ? `Richtig! ${current.text}${current.punctuation} ist ein ${TYPE_LABELS[current.type]}.`
                  : `Falsch. ${current.text}${current.punctuation} ist ein ${TYPE_LABELS[current.type]}.`}
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
                {stats.percentage >= 80 ? '🎉' : stats.percentage >= 60 ? '✓' : '💪'}
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {stats.score} richtig ({stats.percentage}%)
              </div>
              <div className="text-lg text-gray-600 mb-6">
                Durchschnittszeit: {stats.avgTime}s
              </div>

              {/* Per-punctuation breakdown */}
              <div className="flex gap-4 justify-center mb-8">
                {['.', '?', '!'].map((p) => (
                  <div key={p} className={`rounded-lg px-5 py-3 ${PUNCTUATION_STYLES[p].light}`}>
                    <div className="text-3xl font-bold">{p}</div>
                    <div className="text-xs font-semibold">{PUNCTUATION_STYLES[p].label}</div>
                    <div className="text-sm mt-1">
                      {stats.byPunctuation[p] !== null
                        ? `${stats.byPunctuation[p]}%`
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
                        <span className="font-medium">{m.text}</span>
                        <span className="font-bold text-green-700">{m.correctPunctuation}</span>
                        <span className="text-sm text-gray-500 ml-2">({TYPE_LABELS[m.type]})</span>
                        <span className="text-red-600 ml-2 text-sm">(du: {m.userPunctuation})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
              Du bist ein Satzzeichen-Profi!
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
