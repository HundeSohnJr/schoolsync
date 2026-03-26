import { useState, useEffect } from 'react';
import { useStreak, useProgress, useErrors } from '../context/AppContext';
import { Flame, Check, X, Trophy, Zap, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';
import SessionRating from '../components/SessionRating';

/**
 * Satzglieder-Datenbank für Klasse 3
 * Jedes Wort wird einem Satzglied zugeordnet:
 *   "subjekt"  = Wer oder was?
 *   "prädikat" = Was tut?
 *   "objekt"   = Wen oder was? / Wem?
 *   null       = keines (Adverbiale, Präpositionen, etc.)
 */
const SENTENCES = [
  {
    id: 1,
    text: "Fina streichelt den Loki.",
    words: [
      { word: "Fina", part: "subjekt" },
      { word: "streichelt", part: "prädikat" },
      { word: "den", part: "objekt" },
      { word: "Loki.", part: "objekt" },
    ]
  },
  {
    id: 2,
    text: "Loki und Elvis fressen das Futter.",
    words: [
      { word: "Loki", part: "subjekt" },
      { word: "und", part: "subjekt" },
      { word: "Elvis", part: "subjekt" },
      { word: "fressen", part: "prädikat" },
      { word: "das", part: "objekt" },
      { word: "Futter.", part: "objekt" },
    ]
  },
  {
    id: 3,
    text: "Papa Philipp liest Fina ein Buch vor.",
    words: [
      { word: "Papa", part: "subjekt" },
      { word: "Philipp", part: "subjekt" },
      { word: "liest", part: "prädikat" },
      { word: "Fina", part: "objekt" },
      { word: "ein", part: "objekt" },
      { word: "Buch", part: "objekt" },
      { word: "vor.", part: "prädikat" },
    ]
  },
  {
    id: 4,
    text: "Mama Anastasia kocht das Abendessen.",
    words: [
      { word: "Mama", part: "subjekt" },
      { word: "Anastasia", part: "subjekt" },
      { word: "kocht", part: "prädikat" },
      { word: "das", part: "objekt" },
      { word: "Abendessen.", part: "objekt" },
    ]
  },
  {
    id: 5,
    text: "Fina turnt am Samstag bei der TSG Bürstadt.",
    words: [
      { word: "Fina", part: "subjekt" },
      { word: "turnt", part: "prädikat" },
      { word: "am", part: null },
      { word: "Samstag", part: null },
      { word: "bei", part: null },
      { word: "der", part: null },
      { word: "TSG", part: null },
      { word: "Bürstadt.", part: null },
    ]
  },
  {
    id: 6,
    text: "Opa Roland erzählt im Garten eine Geschichte.",
    words: [
      { word: "Opa", part: "subjekt" },
      { word: "Roland", part: "subjekt" },
      { word: "erzählt", part: "prädikat" },
      { word: "im", part: null },
      { word: "Garten", part: null },
      { word: "eine", part: "objekt" },
      { word: "Geschichte.", part: "objekt" },
    ]
  },
  {
    id: 7,
    text: "Fina gibt dem Elvis ein Leckerli.",
    words: [
      { word: "Fina", part: "subjekt" },
      { word: "gibt", part: "prädikat" },
      { word: "dem", part: "objekt" },
      { word: "Elvis", part: "objekt" },
      { word: "ein", part: "objekt" },
      { word: "Leckerli.", part: "objekt" },
    ]
  },
  {
    id: 8,
    text: "Tante Kathi und Onkel Robin besuchen die Familie.",
    words: [
      { word: "Tante", part: "subjekt" },
      { word: "Kathi", part: "subjekt" },
      { word: "und", part: "subjekt" },
      { word: "Onkel", part: "subjekt" },
      { word: "Robin", part: "subjekt" },
      { word: "besuchen", part: "prädikat" },
      { word: "die", part: "objekt" },
      { word: "Familie.", part: "objekt" },
    ]
  },
  {
    id: 9,
    text: "Am Morgen füttert Fina die Hunde.",
    words: [
      { word: "Am", part: null },
      { word: "Morgen", part: null },
      { word: "füttert", part: "prädikat" },
      { word: "Fina", part: "subjekt" },
      { word: "die", part: "objekt" },
      { word: "Hunde.", part: "objekt" },
    ]
  },
  {
    id: 10,
    text: "Oma Angelika backt einen leckeren Kuchen.",
    words: [
      { word: "Oma", part: "subjekt" },
      { word: "Angelika", part: "subjekt" },
      { word: "backt", part: "prädikat" },
      { word: "einen", part: "objekt" },
      { word: "leckeren", part: "objekt" },
      { word: "Kuchen.", part: "objekt" },
    ]
  },
  {
    id: 11,
    text: "Der kleine Loki holt den Ball.",
    words: [
      { word: "Der", part: "subjekt" },
      { word: "kleine", part: "subjekt" },
      { word: "Loki", part: "subjekt" },
      { word: "holt", part: "prädikat" },
      { word: "den", part: "objekt" },
      { word: "Ball.", part: "objekt" },
    ]
  },
  {
    id: 12,
    text: "Fina und Mama Anastasia backen Plätzchen.",
    words: [
      { word: "Fina", part: "subjekt" },
      { word: "und", part: "subjekt" },
      { word: "Mama", part: "subjekt" },
      { word: "Anastasia", part: "subjekt" },
      { word: "backen", part: "prädikat" },
      { word: "Plätzchen.", part: "objekt" },
    ]
  },
  {
    id: 13,
    text: "Oma Katja schenkt Fina ein schönes Kleid.",
    words: [
      { word: "Oma", part: "subjekt" },
      { word: "Katja", part: "subjekt" },
      { word: "schenkt", part: "prädikat" },
      { word: "Fina", part: "objekt" },
      { word: "ein", part: "objekt" },
      { word: "schönes", part: "objekt" },
      { word: "Kleid.", part: "objekt" },
    ]
  },
  {
    id: 14,
    text: "In Bürstadt geht Fina zur Schule.",
    words: [
      { word: "In", part: null },
      { word: "Bürstadt", part: null },
      { word: "geht", part: "prädikat" },
      { word: "Fina", part: "subjekt" },
      { word: "zur", part: null },
      { word: "Schule.", part: null },
    ]
  },
  {
    id: 15,
    text: "Papa Philipp wirft dem Loki den Stock.",
    words: [
      { word: "Papa", part: "subjekt" },
      { word: "Philipp", part: "subjekt" },
      { word: "wirft", part: "prädikat" },
      { word: "dem", part: "objekt" },
      { word: "Loki", part: "objekt" },
      { word: "den", part: "objekt" },
      { word: "Stock.", part: "objekt" },
    ]
  },
  {
    id: 16,
    text: "Elvis schläft auf dem Sofa.",
    words: [
      { word: "Elvis", part: "subjekt" },
      { word: "schläft", part: "prädikat" },
      { word: "auf", part: null },
      { word: "dem", part: null },
      { word: "Sofa.", part: null },
    ]
  },
  {
    id: 17,
    text: "Beim Turnen übt Fina eine schwere Rolle.",
    words: [
      { word: "Beim", part: null },
      { word: "Turnen", part: null },
      { word: "übt", part: "prädikat" },
      { word: "Fina", part: "subjekt" },
      { word: "eine", part: "objekt" },
      { word: "schwere", part: "objekt" },
      { word: "Rolle.", part: "objekt" },
    ]
  },
  {
    id: 18,
    text: "Opa Dima zeigt Fina ein altes Foto.",
    words: [
      { word: "Opa", part: "subjekt" },
      { word: "Dima", part: "subjekt" },
      { word: "zeigt", part: "prädikat" },
      { word: "Fina", part: "objekt" },
      { word: "ein", part: "objekt" },
      { word: "altes", part: "objekt" },
      { word: "Foto.", part: "objekt" },
    ]
  },
  {
    id: 19,
    text: "Fina malt in der Schule ein Bild.",
    words: [
      { word: "Fina", part: "subjekt" },
      { word: "malt", part: "prädikat" },
      { word: "in", part: null },
      { word: "der", part: null },
      { word: "Schule", part: null },
      { word: "ein", part: "objekt" },
      { word: "Bild.", part: "objekt" },
    ]
  },
  {
    id: 20,
    text: "Philipp und Anastasia räumen die Küche auf.",
    words: [
      { word: "Philipp", part: "subjekt" },
      { word: "und", part: "subjekt" },
      { word: "Anastasia", part: "subjekt" },
      { word: "räumen", part: "prädikat" },
      { word: "die", part: "objekt" },
      { word: "Küche", part: "objekt" },
      { word: "auf.", part: "prädikat" },
    ]
  },
  {
    id: 21,
    text: "Fina hilft der Mama beim Einkaufen.",
    words: [
      { word: "Fina", part: "subjekt" },
      { word: "hilft", part: "prädikat" },
      { word: "der", part: "objekt" },
      { word: "Mama", part: "objekt" },
      { word: "beim", part: null },
      { word: "Einkaufen.", part: null },
    ]
  },
  {
    id: 22,
    text: "Am Abend liest Fina dem Papa eine Geschichte vor.",
    words: [
      { word: "Am", part: null },
      { word: "Abend", part: null },
      { word: "liest", part: "prädikat" },
      { word: "Fina", part: "subjekt" },
      { word: "dem", part: "objekt" },
      { word: "Papa", part: "objekt" },
      { word: "eine", part: "objekt" },
      { word: "Geschichte", part: "objekt" },
      { word: "vor.", part: "prädikat" },
    ]
  },
  {
    id: 23,
    text: "Loki bringt dem Papa den Schuh.",
    words: [
      { word: "Loki", part: "subjekt" },
      { word: "bringt", part: "prädikat" },
      { word: "dem", part: "objekt" },
      { word: "Papa", part: "objekt" },
      { word: "den", part: "objekt" },
      { word: "Schuh.", part: "objekt" },
    ]
  },
  {
    id: 24,
    text: "Onkel Robin spielt mit Fina ein Spiel.",
    words: [
      { word: "Onkel", part: "subjekt" },
      { word: "Robin", part: "subjekt" },
      { word: "spielt", part: "prädikat" },
      { word: "mit", part: null },
      { word: "Fina", part: null },
      { word: "ein", part: "objekt" },
      { word: "Spiel.", part: "objekt" },
    ]
  },
  {
    id: 25,
    text: "Fina schreibt der Oma Angelika einen Brief.",
    words: [
      { word: "Fina", part: "subjekt" },
      { word: "schreibt", part: "prädikat" },
      { word: "der", part: "objekt" },
      { word: "Oma", part: "objekt" },
      { word: "Angelika", part: "objekt" },
      { word: "einen", part: "objekt" },
      { word: "Brief.", part: "objekt" },
    ]
  },
  {
    id: 26,
    text: "Die ganze Familie besucht den Tierpark.",
    words: [
      { word: "Die", part: "subjekt" },
      { word: "ganze", part: "subjekt" },
      { word: "Familie", part: "subjekt" },
      { word: "besucht", part: "prädikat" },
      { word: "den", part: "objekt" },
      { word: "Tierpark.", part: "objekt" },
    ]
  },
  {
    id: 27,
    text: "Tante Kathi kauft Fina ein Eis.",
    words: [
      { word: "Tante", part: "subjekt" },
      { word: "Kathi", part: "subjekt" },
      { word: "kauft", part: "prädikat" },
      { word: "Fina", part: "objekt" },
      { word: "ein", part: "objekt" },
      { word: "Eis.", part: "objekt" },
    ]
  },
  {
    id: 28,
    text: "Nach dem Turnen trinkt Fina ein Glas Wasser.",
    words: [
      { word: "Nach", part: null },
      { word: "dem", part: null },
      { word: "Turnen", part: null },
      { word: "trinkt", part: "prädikat" },
      { word: "Fina", part: "subjekt" },
      { word: "ein", part: "objekt" },
      { word: "Glas", part: "objekt" },
      { word: "Wasser.", part: "objekt" },
    ]
  },
  {
    id: 29,
    text: "Loki und Elvis jagen die Katze durch den Garten.",
    words: [
      { word: "Loki", part: "subjekt" },
      { word: "und", part: "subjekt" },
      { word: "Elvis", part: "subjekt" },
      { word: "jagen", part: "prädikat" },
      { word: "die", part: "objekt" },
      { word: "Katze", part: "objekt" },
      { word: "durch", part: null },
      { word: "den", part: null },
      { word: "Garten.", part: null },
    ]
  },
  {
    id: 30,
    text: "Fina zeigt dem Opa Roland ihr Turnvideo.",
    words: [
      { word: "Fina", part: "subjekt" },
      { word: "zeigt", part: "prädikat" },
      { word: "dem", part: "objekt" },
      { word: "Opa", part: "objekt" },
      { word: "Roland", part: "objekt" },
      { word: "ihr", part: "objekt" },
      { word: "Turnvideo.", part: "objekt" },
    ]
  },
];

/**
 * Satzglieder-Konfiguration
 */
const PART_CONFIG = {
  subjekt: {
    label: 'Subjekt',
    question: 'Wer oder was?',
    color: 'blue',
    bgLight: 'bg-blue-200',
    textDark: 'text-blue-900',
    bgButton: 'bg-blue-500',
    hoverButton: 'hover:bg-blue-600',
    ring: 'ring-blue-400',
    lightCard: 'bg-blue-100 text-blue-700',
  },
  prädikat: {
    label: 'Prädikat',
    question: 'Was tut?',
    color: 'red',
    bgLight: 'bg-red-200',
    textDark: 'text-red-900',
    bgButton: 'bg-red-500',
    hoverButton: 'hover:bg-red-600',
    ring: 'ring-red-400',
    lightCard: 'bg-red-100 text-red-700',
  },
  objekt: {
    label: 'Objekt',
    question: 'Wen oder was? / Wem?',
    color: 'green',
    bgLight: 'bg-green-200',
    textDark: 'text-green-900',
    bgButton: 'bg-green-500',
    hoverButton: 'hover:bg-green-600',
    ring: 'ring-green-400',
    lightCard: 'bg-green-100 text-green-700',
  },
};

const PART_KEYS = ['subjekt', 'prädikat', 'objekt'];

/**
 * Generiert eine zufällige Session aus dem Pool
 */
const generateSession = (count = 10) => {
  const pool = [...SENTENCES].sort(() => Math.random() - 0.5);
  return pool.slice(0, Math.min(count, pool.length));
};

/**
 * Seite: Deutsch - Satzglieder
 */
export default function Satzglieder() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('satzglieder');
  const { addError } = useErrors();

  // Session State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBrush, setSelectedBrush] = useState(null);
  const [userMarks, setUserMarks] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const currentSentence = questions[currentIndex];

  const startNewSession = () => {
    setQuestions(generateSession(10));
    setCurrentIndex(0);
    setUserMarks([]);
    setSelectedBrush(null);
    setIsChecked(false);
    setSessionResults([]);
    setCorrectStreak(0);
    setIsSessionComplete(false);
  };

  useEffect(() => {
    startNewSession();
  }, []);

  // Keyboard shortcuts: 1=Subjekt, 2=Prädikat, 3=Objekt
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isChecked || isSessionComplete) return;
      if (e.key === '1') setSelectedBrush('subjekt');
      if (e.key === '2') setSelectedBrush('prädikat');
      if (e.key === '3') setSelectedBrush('objekt');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChecked, isSessionComplete]);

  /**
   * Handler: Wort anklicken
   */
  const handleWordClick = (wordIndex) => {
    if (isChecked) return;
    if (!selectedBrush) return;

    const newMarks = [...userMarks];

    // Gleicher Pinsel auf gleiches Wort = entfernen
    if (newMarks[wordIndex] === selectedBrush) {
      newMarks[wordIndex] = null;
    } else {
      newMarks[wordIndex] = selectedBrush;
    }

    setUserMarks(newMarks);
  };

  /**
   * Prüft die Antwort
   */
  const handleCheck = () => {
    if (!currentSentence) return;

    const results = currentSentence.words.map((wordData, index) => {
      const userPart = userMarks[index] || null;
      const correctPart = wordData.part;

      return {
        correct: userPart === correctPart,
        correctPart,
        userPart,
        shouldBeMarked: correctPart !== null,
      };
    });

    const allCorrect = results.every(r => r.correct);

    if (allCorrect) {
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
      setCorrectStreak(0);
      addError('satzglieder', currentSentence.text);
    }

    setIsChecked(true);
    setSessionResults(prev => [...prev, {
      sentenceId: currentSentence.id,
      text: currentSentence.text,
      correct: allCorrect,
      results,
    }]);

    // Auto-advance on correct
    if (allCorrect) {
      setTimeout(() => {
        advanceToNext();
      }, 1200);
    }
  };

  /**
   * Weiter zum nächsten Satz
   */
  const advanceToNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      setIsSessionComplete(true);
      increment();
      updateStreak();
    } else {
      setCurrentIndex(nextIndex);
      setUserMarks([]);
      setIsChecked(false);
      setSelectedBrush(null);
    }
  };

  const handleNext = () => {
    advanceToNext();
  };

  /**
   * Session-Statistiken berechnen
   */
  const calculateStats = () => {
    if (sessionResults.length === 0) return null;

    const sentencesCorrect = sessionResults.filter(r => r.correct).length;

    let totalWords = 0;
    let correctWords = 0;
    const byPart = {
      subjekt: { correct: 0, total: 0 },
      prädikat: { correct: 0, total: 0 },
      objekt: { correct: 0, total: 0 },
    };

    sessionResults.forEach(result => {
      result.results.forEach(r => {
        if (r.shouldBeMarked && r.correctPart) {
          totalWords++;
          if (r.correct) correctWords++;

          if (byPart[r.correctPart]) {
            byPart[r.correctPart].total++;
            if (r.correct) byPart[r.correctPart].correct++;
          }
        }
      });
    });

    // Calculate per-part percentages
    PART_KEYS.forEach(key => {
      if (byPart[key].total > 0) {
        byPart[key].percentage = Math.round((byPart[key].correct / byPart[key].total) * 100);
      } else {
        byPart[key].percentage = null;
      }
    });

    const percentage = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;

    const mistakes = sessionResults.filter(r => !r.correct);

    return {
      sentencesCorrect,
      sentencesTotal: sessionResults.length,
      correctWords,
      totalWords,
      percentage,
      byPart,
      mistakes,
    };
  };

  const stats = isSessionComplete ? calculateStats() : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-800">Satzglieder</h1>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full"
                aria-label="Hilfe anzeigen"
              >
                <HelpCircle className="w-6 h-6" />
              </button>
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

          {/* Help Legend */}
          {showHelp && (
            <div className="bg-gray-50 border rounded-lg p-4 mb-2">
              <p className="text-sm font-semibold text-gray-700 mb-2">Satzglieder bestimmen:</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-blue-500" />
                  <span><strong>Subjekt</strong> = Wer oder was?</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-red-500" />
                  <span><strong>Prädikat</strong> = Was tut?</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-green-500" />
                  <span><strong>Objekt</strong> = Wen oder was? / Wem?</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Manche Wörter gehören zu keinem Satzglied (z.B. "im Garten", "am Morgen") — lass sie einfach ohne Farbe.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <TheoryPanel title="Satzglieder bestimmen">
          <ul>
            <li><strong>Subjekt (blau):</strong> Wer oder was tut etwas? → "Fina spielt." Wer spielt? Fina!</li>
            <li><strong>Prädikat (rot):</strong> Was tut das Subjekt? → "Fina spielt." Was tut Fina? Spielt!</li>
            <li><strong>Objekt (grün):</strong> Wen oder was? / Wem? → "Fina streichelt den Hund." Wen streichelt sie? Den Hund!</li>
          </ul>
          <p>Manche Wörter gehören zu keinem Satzglied (Orts- und Zeitangaben wie "im Garten", "am Montag").</p>
        </TheoryPanel>

        {!isSessionComplete && currentSentence ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Satz {currentIndex + 1}/{questions.length}
                </span>
                <span className="text-xs text-gray-400">
                  Tasten: 1=Subjekt  2=Prädikat  3=Objekt
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Instruction */}
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-700">
                Bestimme die Satzglieder:
              </p>
            </div>

            {/* Brush Selection */}
            <div className="flex gap-3 mb-8 justify-center flex-wrap">
              {PART_KEYS.map((key, idx) => {
                const config = PART_CONFIG[key];
                return (
                  <button
                    key={key}
                    onClick={() => !isChecked && setSelectedBrush(key)}
                    disabled={isChecked}
                    className={`min-h-14 px-6 text-lg font-semibold rounded-lg transition-all text-white
                      ${config.bgButton} ${config.hoverButton}
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      ${selectedBrush === key ? `ring-4 ${config.ring} scale-105` : ''}
                      ${isChecked ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    aria-label={`${config.label}-Pinsel: ${config.question}`}
                  >
                    {config.label}
                    <div className="text-xs opacity-70">{idx + 1}</div>
                  </button>
                );
              })}
            </div>

            {/* Sentence Words */}
            <div className="mb-8 min-h-32">
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {currentSentence.words.map((wordData, index) => {
                  const userMark = userMarks[index] || null;
                  const partConfig = userMark ? PART_CONFIG[userMark] : null;

                  // Feedback after check
                  let feedbackIcon = null;
                  let showCorrection = false;
                  let lastResult = null;

                  if (isChecked && sessionResults.length > 0) {
                    lastResult = sessionResults[sessionResults.length - 1]?.results[index];
                    if (lastResult) {
                      if (lastResult.correct) {
                        feedbackIcon = <Check className="w-4 h-4 text-green-600" />;
                      } else {
                        feedbackIcon = <X className="w-4 h-4 text-red-600" />;
                        showCorrection = true;
                      }
                    }
                  }

                  return (
                    <div key={index} className="relative">
                      <button
                        onClick={() => handleWordClick(index)}
                        disabled={isChecked}
                        className={`text-2xl font-medium px-4 py-2 rounded-lg transition-all
                          ${partConfig
                            ? `${partConfig.bgLight} ${partConfig.textDark}`
                            : 'bg-transparent hover:bg-gray-100'
                          }
                          ${isChecked ? 'cursor-default' : 'cursor-pointer'}
                          focus:outline-none focus:ring-2 focus:ring-blue-400
                        `}
                        aria-label={`${wordData.word}${userMark ? `, markiert als ${PART_CONFIG[userMark].label}` : ''}`}
                      >
                        {wordData.word}
                        {feedbackIcon && (
                          <span className="ml-1 inline-block">{feedbackIcon}</span>
                        )}
                      </button>

                      {/* Correction tooltip */}
                      {showCorrection && lastResult && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-xs text-gray-600 whitespace-nowrap bg-white px-2 py-1 rounded shadow-md border border-gray-300 z-10">
                          {lastResult.correctPart ? (
                            <>Richtig: {PART_CONFIG[lastResult.correctPart].label}</>
                          ) : (
                            <>Nicht markieren</>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Check / Next Buttons */}
            {!isChecked ? (
              <div className="flex justify-center">
                <button
                  onClick={handleCheck}
                  className="px-12 py-4 bg-green-600 text-white text-xl font-semibold rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Prüfen
                </button>
              </div>
            ) : (
              <div className="text-center">
                {sessionResults[sessionResults.length - 1]?.correct ? (
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-green-600">
                      Alles richtig!
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="text-xl font-semibold text-gray-700 mb-2">
                      {(() => {
                        const result = sessionResults[sessionResults.length - 1];
                        const correctCount = result.results.filter(r => r.correct).length;
                        const totalCount = result.results.length;
                        return `${correctCount} von ${totalCount} Wörtern richtig`;
                      })()}
                    </div>
                    <p className="text-sm text-gray-500">Schau dir die richtige Lösung oben an.</p>
                  </div>
                )}

                {/* Only show "Weiter" button on wrong answers (correct auto-advances) */}
                {!sessionResults[sessionResults.length - 1]?.correct && (
                  <button
                    onClick={handleNext}
                    className="px-12 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {currentIndex + 1 >= questions.length ? 'Zusammenfassung ansehen' : 'Nächster Satz'}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : isSessionComplete && stats ? (
          /* Session Summary */
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Satzglieder-Training beendet!
              </h2>

              {/* Overall Score */}
              <div className="mb-8">
                <div className="text-5xl font-bold text-gray-800 mb-2">
                  {stats.sentencesCorrect} von {stats.sentencesTotal} Sätzen
                </div>
                <div className="text-2xl text-gray-600 mb-1">
                  {stats.percentage >= 80 ? 'Super gemacht!' : stats.percentage >= 60 ? 'Gut gemacht!' : 'Weiter üben!'}
                </div>
                <div className="text-lg text-gray-500">
                  {stats.correctWords} von {stats.totalWords} Wörtern richtig ({stats.percentage}%)
                </div>
              </div>

              {/* Per-Part Breakdown */}
              <div className="flex gap-4 justify-center mb-8 flex-wrap">
                {PART_KEYS.map((key) => {
                  const config = PART_CONFIG[key];
                  const partStats = stats.byPart[key];
                  return (
                    <div key={key} className={`rounded-lg px-5 py-3 ${config.lightCard}`}>
                      <div className="text-lg font-bold">{config.label}</div>
                      <div className="text-xs mb-1">{config.question}</div>
                      <div className="text-sm font-semibold">
                        {partStats.percentage !== null
                          ? `${partStats.percentage}%`
                          : '—'}
                      </div>
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
                        <span className="font-medium">{m.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <SessionRating />

              {/* New Session Button */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={startNewSession}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Neue Session
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 10-Streak Modal */}
      {showStreakModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              10 Sätze ohne Fehler!
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Du bist ein Satzglieder-Profi!
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

      {/* Screen Reader */}
      {isChecked && sessionResults.length > 0 && (
        <div className="sr-only" aria-live="polite" role="status">
          {sessionResults[sessionResults.length - 1]?.correct
            ? 'Alle Satzglieder richtig bestimmt!'
            : 'Nicht alle Satzglieder waren richtig. Schau dir die Lösung an.'}
        </div>
      )}
    </div>
  );
}
