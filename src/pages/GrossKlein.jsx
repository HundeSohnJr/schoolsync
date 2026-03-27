import { useState, useEffect, useRef } from 'react';
import { useStreak, useProgress, useErrors, useSettings } from '../context/AppContext';
import { Flame, Check, X, Trophy, Zap, ToggleLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';
import SessionRating from '../components/SessionRating';

/**
 * Mode 1: "Richtig oder Falsch?"
 * Ein Wort ist hervorgehoben — ist die Groß-/Kleinschreibung korrekt?
 */
const MODE1_ITEMS = [
  // === Correct cases (isCorrectCase: true) ===
  { sentence: "Fina geht mit Loki in den Park.", highlightedWord: "Loki", isCorrectCase: true },
  { sentence: "Papa Philipp kocht das Abendessen.", highlightedWord: "Abendessen", isCorrectCase: true },
  { sentence: "Mama Anastasia liest ein Buch.", highlightedWord: "Buch", isCorrectCase: true },
  { sentence: "Loki schläft in seinem Körbchen.", highlightedWord: "Körbchen", isCorrectCase: true },
  { sentence: "Elvis wartet vor der Haustür.", highlightedWord: "Haustür", isCorrectCase: true },
  { sentence: "Fina hat Training bei der TSG Bürstadt.", highlightedWord: "TSG Bürstadt", isCorrectCase: true },
  { sentence: "Oma Angelika hat einen Kuchen gebacken.", highlightedWord: "Kuchen", isCorrectCase: true },
  { sentence: "Opa Roland arbeitet im Garten.", highlightedWord: "Garten", isCorrectCase: true },
  { sentence: "Tante Kathi spielt gerne Karten.", highlightedWord: "Karten", isCorrectCase: true },
  { sentence: "Onkel Robin fährt ein schnelles Auto.", highlightedWord: "schnelles", isCorrectCase: true },
  { sentence: "Der Hund bellt laut im Garten.", highlightedWord: "Hund", isCorrectCase: true },
  { sentence: "Fina mag das Lesen sehr gerne.", highlightedWord: "Lesen", isCorrectCase: true },
  { sentence: "Oma Katja schickt ein Paket.", highlightedWord: "Paket", isCorrectCase: true },
  { sentence: "Opa Dima erzählt lustige Geschichten.", highlightedWord: "lustige", isCorrectCase: true },
  { sentence: "Die Schule beginnt um acht Uhr.", highlightedWord: "Schule", isCorrectCase: true },

  // === Incorrect cases (isCorrectCase: false) ===
  { sentence: "fina geht mit Loki in den Park.", highlightedWord: "fina", isCorrectCase: false, corrected: "Fina" },
  { sentence: "Papa philipp kocht das Abendessen.", highlightedWord: "philipp", isCorrectCase: false, corrected: "Philipp" },
  { sentence: "Mama Anastasia liest ein buch.", highlightedWord: "buch", isCorrectCase: false, corrected: "Buch" },
  { sentence: "loki schläft in seinem Körbchen.", highlightedWord: "loki", isCorrectCase: false, corrected: "Loki" },
  { sentence: "elvis wartet vor der Haustür.", highlightedWord: "elvis", isCorrectCase: false, corrected: "Elvis" },
  { sentence: "Fina hat training bei der TSG Bürstadt.", highlightedWord: "training", isCorrectCase: false, corrected: "Training" },
  { sentence: "Oma angelika hat einen Kuchen gebacken.", highlightedWord: "angelika", isCorrectCase: false, corrected: "Angelika" },
  { sentence: "Opa Roland arbeitet im garten.", highlightedWord: "garten", isCorrectCase: false, corrected: "Garten" },
  { sentence: "Tante kathi spielt gerne Karten.", highlightedWord: "kathi", isCorrectCase: false, corrected: "Kathi" },
  { sentence: "Onkel Robin fährt ein Schnelles Auto.", highlightedWord: "Schnelles", isCorrectCase: false, corrected: "schnelles" },
  { sentence: "Der hund bellt laut im Garten.", highlightedWord: "hund", isCorrectCase: false, corrected: "Hund" },
  { sentence: "Fina und Loki Spielen im Garten.", highlightedWord: "Spielen", isCorrectCase: false, corrected: "spielen" },
  { sentence: "Oma Katja Kocht sehr gerne.", highlightedWord: "Kocht", isCorrectCase: false, corrected: "kocht" },
  { sentence: "Opa Dima erzählt Lustige Geschichten.", highlightedWord: "Lustige", isCorrectCase: false, corrected: "lustige" },
  { sentence: "Die schule beginnt um acht Uhr.", highlightedWord: "schule", isCorrectCase: false, corrected: "Schule" },
  { sentence: "Papa Philipp und Mama anastasia gehen spazieren.", highlightedWord: "anastasia", isCorrectCase: false, corrected: "Anastasia" },
  { sentence: "Fina mag das lesen sehr gerne.", highlightedWord: "lesen", isCorrectCase: false, corrected: "Lesen" },
  { sentence: "Das Schwimmen macht Fina Großen Spaß.", highlightedWord: "Großen", isCorrectCase: false, corrected: "großen" },
];

/**
 * Mode 2: "Korrigiere den Satz"
 * Jedes Wort ist ein Button — tippen um Groß-/Kleinschreibung zu wechseln.
 */
const MODE2_ITEMS = [
  {
    text: "fina und loki Gehen in den garten.",
    words: [
      { word: "fina", correct: "Fina" }, { word: "und", correct: "und" }, { word: "loki", correct: "Loki" },
      { word: "Gehen", correct: "gehen" }, { word: "in", correct: "in" }, { word: "den", correct: "den" },
      { word: "garten.", correct: "Garten." },
    ],
  },
  {
    text: "papa philipp Kocht das abendessen.",
    words: [
      { word: "papa", correct: "Papa" }, { word: "philipp", correct: "Philipp" }, { word: "Kocht", correct: "kocht" },
      { word: "das", correct: "das" }, { word: "abendessen.", correct: "Abendessen." },
    ],
  },
  {
    text: "mama anastasia Liest ein buch auf dem sofa.",
    words: [
      { word: "mama", correct: "Mama" }, { word: "anastasia", correct: "Anastasia" }, { word: "Liest", correct: "liest" },
      { word: "ein", correct: "ein" }, { word: "buch", correct: "Buch" }, { word: "auf", correct: "auf" },
      { word: "dem", correct: "dem" }, { word: "sofa.", correct: "Sofa." },
    ],
  },
  {
    text: "oma angelika und opa roland Kommen zu besuch.",
    words: [
      { word: "oma", correct: "Oma" }, { word: "angelika", correct: "Angelika" }, { word: "und", correct: "und" },
      { word: "opa", correct: "Opa" }, { word: "roland", correct: "Roland" }, { word: "Kommen", correct: "kommen" },
      { word: "zu", correct: "zu" }, { word: "besuch.", correct: "Besuch." },
    ],
  },
  {
    text: "elvis und loki Spielen im garten.",
    words: [
      { word: "elvis", correct: "Elvis" }, { word: "und", correct: "und" }, { word: "loki", correct: "Loki" },
      { word: "Spielen", correct: "spielen" }, { word: "im", correct: "im" }, { word: "garten.", correct: "Garten." },
    ],
  },
  {
    text: "tante kathi und onkel robin Fahren nach bürstadt.",
    words: [
      { word: "tante", correct: "Tante" }, { word: "kathi", correct: "Kathi" }, { word: "und", correct: "und" },
      { word: "onkel", correct: "Onkel" }, { word: "robin", correct: "Robin" }, { word: "Fahren", correct: "fahren" },
      { word: "nach", correct: "nach" }, { word: "bürstadt.", correct: "Bürstadt." },
    ],
  },
  {
    text: "Die tsg bürstadt hat ein Tolles turnier.",
    words: [
      { word: "Die", correct: "Die" }, { word: "tsg", correct: "TSG" }, { word: "bürstadt", correct: "Bürstadt" },
      { word: "hat", correct: "hat" }, { word: "ein", correct: "ein" }, { word: "Tolles", correct: "tolles" },
      { word: "turnier.", correct: "Turnier." },
    ],
  },
  {
    text: "oma katja Schickt ein paket aus russland.",
    words: [
      { word: "oma", correct: "Oma" }, { word: "katja", correct: "Katja" }, { word: "Schickt", correct: "schickt" },
      { word: "ein", correct: "ein" }, { word: "paket", correct: "Paket" }, { word: "aus", correct: "aus" },
      { word: "russland.", correct: "Russland." },
    ],
  },
  {
    text: "opa dima Erzählt eine Lustige geschichte.",
    words: [
      { word: "opa", correct: "Opa" }, { word: "dima", correct: "Dima" }, { word: "Erzählt", correct: "erzählt" },
      { word: "eine", correct: "eine" }, { word: "Lustige", correct: "lustige" }, { word: "geschichte.", correct: "Geschichte." },
    ],
  },
  {
    text: "fina Geht Gerne zum turnen.",
    words: [
      { word: "fina", correct: "Fina" }, { word: "Geht", correct: "geht" }, { word: "Gerne", correct: "gerne" },
      { word: "zum", correct: "zum" }, { word: "turnen.", correct: "Turnen." },
    ],
  },
  {
    text: "Der Kleine hund Heißt loki.",
    words: [
      { word: "Der", correct: "Der" }, { word: "Kleine", correct: "kleine" }, { word: "hund", correct: "Hund" },
      { word: "Heißt", correct: "heißt" }, { word: "loki.", correct: "Loki." },
    ],
  },
  {
    text: "fina Mag das Schwimmen und das lesen.",
    words: [
      { word: "fina", correct: "Fina" }, { word: "Mag", correct: "mag" }, { word: "das", correct: "das" },
      { word: "Schwimmen", correct: "Schwimmen" }, { word: "und", correct: "und" }, { word: "das", correct: "das" },
      { word: "lesen.", correct: "Lesen." },
    ],
  },
  {
    text: "Am samstag Besuchen wir oma angelika.",
    words: [
      { word: "Am", correct: "Am" }, { word: "samstag", correct: "Samstag" }, { word: "Besuchen", correct: "besuchen" },
      { word: "wir", correct: "wir" }, { word: "oma", correct: "Oma" }, { word: "angelika.", correct: "Angelika." },
    ],
  },
  {
    text: "papa philipp und fina Gehen in den park.",
    words: [
      { word: "papa", correct: "Papa" }, { word: "philipp", correct: "Philipp" }, { word: "und", correct: "und" },
      { word: "fina", correct: "Fina" }, { word: "Gehen", correct: "gehen" }, { word: "in", correct: "in" },
      { word: "den", correct: "den" }, { word: "park.", correct: "Park." },
    ],
  },
  {
    text: "Das Schnelle auto von onkel robin ist Rot.",
    words: [
      { word: "Das", correct: "Das" }, { word: "Schnelle", correct: "schnelle" }, { word: "auto", correct: "Auto" },
      { word: "von", correct: "von" }, { word: "onkel", correct: "Onkel" }, { word: "robin", correct: "Robin" },
      { word: "ist", correct: "ist" }, { word: "Rot.", correct: "rot." },
    ],
  },
  {
    text: "loki und elvis Sind Sehr Lustige hunde.",
    words: [
      { word: "loki", correct: "Loki" }, { word: "und", correct: "und" }, { word: "elvis", correct: "Elvis" },
      { word: "Sind", correct: "sind" }, { word: "Sehr", correct: "sehr" }, { word: "Lustige", correct: "lustige" },
      { word: "hunde.", correct: "Hunde." },
    ],
  },
  {
    text: "Die schule in bürstadt ist Groß und Schön.",
    words: [
      { word: "Die", correct: "Die" }, { word: "schule", correct: "Schule" }, { word: "in", correct: "in" },
      { word: "bürstadt", correct: "Bürstadt" }, { word: "ist", correct: "ist" }, { word: "Groß", correct: "groß" },
      { word: "und", correct: "und" }, { word: "Schön.", correct: "schön." },
    ],
  },
  {
    text: "mama anastasia Backt einen Leckeren kuchen.",
    words: [
      { word: "mama", correct: "Mama" }, { word: "anastasia", correct: "Anastasia" }, { word: "Backt", correct: "backt" },
      { word: "einen", correct: "einen" }, { word: "Leckeren", correct: "leckeren" }, { word: "kuchen.", correct: "Kuchen." },
    ],
  },
];

/**
 * Helper: Toggle first letter case of a word
 */
const toggleCase = (word) => {
  if (!word) return word;
  // Handle punctuation at end
  const match = word.match(/^([a-zA-ZäöüÄÖÜß]+)(.*)/);
  if (!match) return word;
  const [, letters, rest] = match;
  const first = letters[0];
  const toggled = first === first.toUpperCase()
    ? first.toLowerCase() + letters.slice(1) + rest
    : first.toUpperCase() + letters.slice(1) + rest;
  return toggled;
};

/**
 * Generiert eine gemischte Session mit 10 Fragen aus beiden Modi
 */
const generateSession = () => {
  const mode1 = MODE1_ITEMS
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((item) => ({ ...item, mode: 1 }));

  const mode2 = MODE2_ITEMS
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((item) => ({ ...item, mode: 2 }));

  return [...mode1, ...mode2].sort(() => Math.random() - 0.5);
};

/**
 * Seite: Deutsch - Groß-/Kleinschreibung
 * Klasse 3 — personalisiert für Fina
 */
export default function GrossKlein() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('gross-klein');
  const { addError } = useErrors();
  const { showTimer } = useSettings();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  // Mode 2 state: current word states (toggled or not)
  const [wordStates, setWordStates] = useState([]);
  const [mode2Submitted, setMode2Submitted] = useState(false);

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
    setWordStates([]);
    setMode2Submitted(false);
  };

  useEffect(() => {
    startNewSession();
  }, []);

  // Initialize word states when entering a Mode 2 question
  useEffect(() => {
    const current = questions[currentIndex];
    if (current?.mode === 2) {
      setWordStates(current.words.map((w) => w.word));
      setMode2Submitted(false);
    }
  }, [currentIndex, questions]);

  // Keyboard support for Mode 1: G = GROSS, K = klein
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSessionComplete || showFeedback) return;
      const current = questions[currentIndex];
      if (!current || current.mode !== 1) return;
      if (e.key === 'g' || e.key === 'G') handleMode1Answer(true);
      if (e.key === 'k' || e.key === 'K') handleMode1Answer(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isSessionComplete, showFeedback, questions]);

  const handleMode1Answer = (userSaysGross) => {
    if (showFeedback || isSessionComplete || questions.length === 0) return;

    const current = questions[currentIndex];
    const wordIsCapitalized = current.highlightedWord[0] === current.highlightedWord[0].toUpperCase();
    const userSaysCorrect = (wordIsCapitalized && userSaysGross) || (!wordIsCapitalized && !userSaysGross);
    const correct = userSaysCorrect === current.isCorrectCase;
    const timeTaken = (Date.now() - startTime) / 1000;

    const explanation = current.isCorrectCase
      ? `"${current.highlightedWord}" ist richtig geschrieben.`
      : `"${current.highlightedWord}" muss "${current.corrected}" heißen.`;

    const result = {
      mode: 1,
      sentence: current.sentence,
      word: current.highlightedWord,
      correct,
      explanation,
      time: timeTaken,
    };

    setSessionResults((prev) => [...prev, result]);
    setLastAnswer({ correct, explanation });
    setShowFeedback(true);

    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      if (newStreak === 10) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#22c55e', '#f59e0b'],
        });
        setShowStreakModal(true);
        setCorrectStreak(0);
      }
    } else {
      addError('gross-klein', `${current.sentence} → ${current.highlightedWord}${current.corrected ? ' → ' + current.corrected : ''}`);
      setCorrectStreak(0);
    }

    setTimeout(() => {
      advanceToNext();
    }, correct ? 800 : 2000);
  };

  const handleMode2Submit = () => {
    if (mode2Submitted || showFeedback) return;

    const current = questions[currentIndex];
    const timeTaken = (Date.now() - startTime) / 1000;

    // Check each word
    let allCorrect = true;
    const corrections = [];
    for (let i = 0; i < current.words.length; i++) {
      if (wordStates[i] !== current.words[i].correct) {
        allCorrect = false;
        corrections.push({ given: wordStates[i], expected: current.words[i].correct });
      }
    }

    const result = {
      mode: 2,
      sentence: current.text,
      correct: allCorrect,
      corrections,
      time: timeTaken,
    };

    setSessionResults((prev) => [...prev, result]);
    setMode2Submitted(true);
    setLastAnswer({
      correct: allCorrect,
      explanation: allCorrect
        ? 'Alle Wörter sind richtig!'
        : `Korrektur: ${current.words.map((w) => w.correct).join(' ')}`,
    });
    setShowFeedback(true);

    if (allCorrect) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      if (newStreak === 10) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#22c55e', '#f59e0b'],
        });
        setShowStreakModal(true);
        setCorrectStreak(0);
      }
    } else {
      addError('gross-klein', `${current.words.map((w) => w.correct).join(' ')}`);
      setCorrectStreak(0);
    }

    setTimeout(() => {
      advanceToNext();
    }, allCorrect ? 1200 : 3000);
  };

  const toggleWord = (index) => {
    if (mode2Submitted) return;
    setWordStates((prev) => {
      const next = [...prev];
      next[index] = toggleCase(next[index]);
      return next;
    });
  };

  const advanceToNext = () => {
    setShowFeedback(false);
    setLastAnswer(null);
    setMode2Submitted(false);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      setIsSessionComplete(true);
      increment();
      updateStreak();
    } else {
      setCurrentIndex(nextIndex);
      setStartTime(Date.now());
    }
  };

  const calculateStats = () => {
    if (sessionResults.length === 0) return null;
    const correct = sessionResults.filter((r) => r.correct).length;
    const avgTime = sessionResults.reduce((sum, r) => sum + r.time, 0) / sessionResults.length;
    const mistakes = sessionResults.filter((r) => !r.correct);
    const mode1Results = sessionResults.filter((r) => r.mode === 1);
    const mode2Results = sessionResults.filter((r) => r.mode === 2);

    return {
      score: `${correct}/${sessionResults.length}`,
      percentage: Math.round((correct / sessionResults.length) * 100),
      avgTime: avgTime.toFixed(1),
      mistakes,
      mode1Accuracy: mode1Results.length > 0
        ? Math.round((mode1Results.filter((r) => r.correct).length / mode1Results.length) * 100)
        : null,
      mode2Accuracy: mode2Results.length > 0
        ? Math.round((mode2Results.filter((r) => r.correct).length / mode2Results.length) * 100)
        : null,
    };
  };

  const current = questions[currentIndex];
  const stats = calculateStats();

  /**
   * Render the sentence for Mode 1, highlighting the target word
   */
  const renderHighlightedSentence = (sentence, highlightedWord) => {
    const idx = sentence.indexOf(highlightedWord);
    if (idx === -1) return <span>{sentence}</span>;
    const before = sentence.slice(0, idx);
    const after = sentence.slice(idx + highlightedWord.length);
    return (
      <>
        <span>{before}</span>
        <span className="bg-yellow-200 px-1 rounded font-bold underline decoration-2 decoration-yellow-500">
          {highlightedWord}
        </span>
        <span>{after}</span>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Groß- und Kleinschreibung</h1>
              <p className="text-sm text-gray-500 mt-1">Groß oder klein? Entscheide richtig!</p>
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
        <TheoryPanel title="Groß oder klein?">
          <ul className="space-y-1.5">
            <li><strong>Nomen</strong> schreibt man IMMER groß: <em>Hund, Schule, Mama</em></li>
            <li><strong>Namen</strong> schreibt man IMMER groß: <em>Fina, Loki, Bürstadt</em></li>
            <li><strong>Verben</strong> schreibt man klein: <em>spielen, laufen</em> — AUSSER am Satzanfang!</li>
            <li><strong>Adjektive</strong> schreibt man klein: <em>schnell, lustig</em></li>
            <li>Nach einem <strong>Punkt</strong>: Das nächste Wort wird großgeschrieben.</li>
            <li><strong>Test:</strong> Kann man <em>&bdquo;der/die/das&ldquo;</em> davor setzen? Dann ist es ein Nomen → GROSS!</li>
          </ul>
        </TheoryPanel>

        {!isSessionComplete && current ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Aufgabe {currentIndex + 1}/{questions.length}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <ToggleLeft className="w-3.5 h-3.5" />
                  {current.mode === 1 ? 'Richtig oder Falsch?' : 'Korrigiere den Satz'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Mode 1: Richtig oder Falsch? */}
            {current.mode === 1 && (
              <>
                <div className="text-center mb-3">
                  <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full uppercase tracking-wide">
                    Richtig oder Falsch?
                  </span>
                </div>

                <div className="text-center mb-4">
                  <p className="text-sm text-gray-500">Ist das markierte Wort richtig geschrieben?</p>
                </div>

                <div className={`text-center mb-10 transition-colors duration-200 ${
                  showFeedback
                    ? lastAnswer?.correct ? 'text-green-600' : 'text-red-600'
                    : 'text-gray-800'
                }`}>
                  <div className="text-2xl sm:text-3xl font-semibold leading-relaxed">
                    {renderHighlightedSentence(current.sentence, current.highlightedWord)}
                  </div>

                  {showFeedback && (
                    <div className={`text-lg font-semibold mt-4 ${lastAnswer?.correct ? 'text-green-600' : 'text-red-600'}`}>
                      {lastAnswer?.correct ? (
                        <span className="flex items-center justify-center gap-2">
                          <Check className="w-5 h-5" /> Richtig!
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <X className="w-5 h-5" /> {lastAnswer?.explanation}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Answer Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => handleMode1Answer(true)}
                    disabled={showFeedback}
                    className="px-8 py-4 text-xl font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
                  >
                    GROSS
                    <div className="text-xs opacity-70 font-normal mt-1">G</div>
                  </button>
                  <button
                    onClick={() => handleMode1Answer(false)}
                    disabled={showFeedback}
                    className="px-8 py-4 text-xl font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-offset-2 active:scale-95"
                  >
                    klein
                    <div className="text-xs opacity-70 font-normal mt-1">K</div>
                  </button>
                </div>
              </>
            )}

            {/* Mode 2: Korrigiere den Satz */}
            {current.mode === 2 && (
              <>
                <div className="text-center mb-3">
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full uppercase tracking-wide">
                    Korrigiere den Satz
                  </span>
                </div>

                <div className="text-center mb-4">
                  <p className="text-sm text-gray-500">Tippe auf ein Wort, um groß/klein zu wechseln.</p>
                </div>

                {/* Word Buttons */}
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {wordStates.map((word, idx) => {
                    const isCorrect = word === current.words[idx].correct;
                    const wasChanged = word !== current.words[idx].word;

                    let btnClass = 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-2 border-transparent';
                    if (mode2Submitted) {
                      btnClass = isCorrect
                        ? 'bg-green-100 text-green-800 border-2 border-green-400'
                        : 'bg-red-100 text-red-800 border-2 border-red-400';
                    } else if (wasChanged) {
                      btnClass = 'bg-blue-100 text-blue-800 border-2 border-blue-400';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => toggleWord(idx)}
                        disabled={mode2Submitted}
                        className={`px-3 py-2 text-lg sm:text-xl font-semibold rounded-lg transition-all duration-150 ${btnClass} disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95`}
                      >
                        {word}
                        {mode2Submitted && !isCorrect && (
                          <span className="block text-xs text-green-700 font-normal">
                            {current.words[idx].correct}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Submit / Feedback */}
                {!mode2Submitted && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleMode2Submit}
                      className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Fertig!
                    </button>
                  </div>
                )}

                {showFeedback && (
                  <div className={`text-center text-lg font-semibold mt-4 ${lastAnswer?.correct ? 'text-green-600' : 'text-red-600'}`}>
                    {lastAnswer?.correct ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" /> Super, alles richtig!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <X className="w-5 h-5" /> {lastAnswer?.explanation}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Screen Reader */}
            {showFeedback && (
              <div className="sr-only" aria-live="polite" role="status">
                {lastAnswer?.correct ? 'Richtig!' : lastAnswer?.explanation}
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
              {showTimer && (
                <div className="text-lg text-gray-600 mb-6">
                  Durchschnittszeit: {stats.avgTime}s
                </div>
              )}

              {/* Per-mode breakdown */}
              <div className="flex gap-4 justify-center mb-8">
                <div className="rounded-lg px-5 py-3 bg-purple-100 text-purple-700">
                  <div className="text-sm font-bold">Richtig/Falsch?</div>
                  <div className="text-2xl font-bold mt-1">
                    {stats.mode1Accuracy !== null ? `${stats.mode1Accuracy}%` : '—'}
                  </div>
                </div>
                <div className="rounded-lg px-5 py-3 bg-green-100 text-green-700">
                  <div className="text-sm font-bold">Korrigieren</div>
                  <div className="text-2xl font-bold mt-1">
                    {stats.mode2Accuracy !== null ? `${stats.mode2Accuracy}%` : '—'}
                  </div>
                </div>
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
                        {m.mode === 1 ? (
                          <>
                            <span className="font-medium">{m.sentence}</span>
                            <span className="text-sm text-gray-500 ml-2">{m.explanation}</span>
                          </>
                        ) : (
                          <>
                            <span className="font-medium">{m.sentence}</span>
                            {m.corrections.length > 0 && (
                              <span className="text-sm text-green-700 ml-2">
                                ({m.corrections.map((c) => `${c.given} → ${c.expected}`).join(', ')})
                              </span>
                            )}
                          </>
                        )}
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
              Du bist ein Rechtschreib-Profi!
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
