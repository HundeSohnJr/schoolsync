import { useState, useRef, useEffect } from 'react';
import { useStreak, useProgress, useErrors } from '../context/AppContext';
import { Flame, RefreshCw, Check, X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';
import SessionRating from '../components/SessionRating';

/**
 * Schwierigkeitsgrad-Konfiguration
 */
const DIFFICULTY_RANGES = {
  leicht: [1, 2, 3, 4, 5],
  mittel: [6, 7, 8],
  schwer: [9, 10],
  alle: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

/**
 * Generiert eine zufällige 1×1 Aufgabe (gefiltert nach Schwierigkeit)
 */
const generateRandomQuestion = (difficulty = 'alle') => {
  const range = DIFFICULTY_RANGES[difficulty] || DIFFICULTY_RANGES.alle;
  const num1 = range[Math.floor(Math.random() * range.length)];
  const num2 = Math.floor(Math.random() * 10) + 1;
  return { num1, num2 };
};

/**
 * Generiert Aufgaben für eine spezifische Reihe
 */
const generateFocusQuestions = (row) => {
  const questions = [];
  for (let i = 1; i <= 10; i++) {
    questions.push({ num1: row, num2: i });
  }
  // Mische die Reihenfolge
  return questions.sort(() => Math.random() - 0.5);
};

/**
 * Seite: Mathe - 1×1 Training
 */
export default function Einmaleins() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('einmaleins');
  const { errors, addError } = useErrors();
  
  // Session State
  const [mode, setMode] = useState('random'); // 'random' | 'focus' | 'mistakes'
  const [difficulty, setDifficulty] = useState('alle'); // 'leicht' | 'mittel' | 'schwer' | 'alle'
  const [focusRow, setFocusRow] = useState(7);
  const [currentQuestion, setCurrentQuestion] = useState(generateRandomQuestion());
  const [userAnswer, setUserAnswer] = useState('');
  const [sessionProgress, setSessionProgress] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [questionQueue, setQuestionQueue] = useState([]);
  
  // Feedback State
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  
  // Streak Modal
  const [showStreakModal, setShowStreakModal] = useState(false);
  
  // Refs
  const inputRef = useRef(null);

  /**
   * Startet eine neue Session
   */
  const startNewSession = (newMode = mode, mistakeQuestions = []) => {
    setMode(newMode);
    setSessionProgress(0);
    setSessionResults([]);
    setIsSessionComplete(false);
    setCorrectStreak(0);

    let queue = [];
    if (newMode === 'focus') {
      queue = generateFocusQuestions(focusRow);
    } else if (newMode === 'mistakes' && mistakeQuestions.length > 0) {
      // Wiederhole Fehler-Aufgaben mehrfach bis 10 Aufgaben
      while (queue.length < 10) {
        queue.push(...mistakeQuestions);
      }
      queue = queue.slice(0, 10).sort(() => Math.random() - 0.5);
    } else {
      // Random mode: 10 unique questions filtered by difficulty
      const used = new Set();
      let attempts = 0;
      while (queue.length < 10 && attempts < 200) {
        const q = generateRandomQuestion(difficulty);
        const key = `${q.num1}×${q.num2}`;
        if (!used.has(key)) {
          used.add(key);
          queue.push(q);
        }
        attempts++;
      }
    }
    
    setQuestionQueue(queue);
    setCurrentQuestion(queue[0]);
    setStartTime(Date.now());
    setUserAnswer('');
    setShowFeedback(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  /**
   * Prüft die Antwort
   */
  const handleCheck = () => {
    if (!userAnswer) return;
    
    const timeTaken = (Date.now() - startTime) / 1000;
    const expected = currentQuestion.num1 * currentQuestion.num2;
    const userNum = parseInt(userAnswer);
    const correct = userNum === expected;
    
    const result = {
      question: `${currentQuestion.num1} × ${currentQuestion.num2}`,
      userAnswer: userNum,
      correctAnswer: expected,
      correct,
      time: timeTaken,
    };
    
    setSessionResults([...sessionResults, result]);
    setIsCorrect(correct);
    setCorrectAnswer(expected);
    setShowFeedback(true);
    
    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      
      // 10er-Streak erreicht!
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
      
      // Automatisch weiter nach 1 Sekunde
      setTimeout(() => {
        handleNext();
      }, 1000);
    } else {
      // Speichere Fehler
      addError('multiplication', `${currentQuestion.num1} × ${currentQuestion.num2}`);
      setCorrectStreak(0);
    }
  };

  /**
   * Nächste Aufgabe
   */
  const handleNext = () => {
    const nextProgress = sessionProgress + 1;
    setSessionProgress(nextProgress);
    
    if (nextProgress >= 10) {
      // Session beendet
      setIsSessionComplete(true);
      increment();
      updateStreak();
    } else {
      // Nächste Frage
      setCurrentQuestion(questionQueue[nextProgress]);
      setUserAnswer('');
      setShowFeedback(false);
      setStartTime(Date.now());
    }
  };

  /**
   * Fokussiere Input-Feld automatisch bei neuer Frage
   */
  useEffect(() => {
    if (!showFeedback && !isSessionComplete && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showFeedback, isSessionComplete, currentQuestion]);

  /**
   * Handler für Input-Änderungen
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Nur Zahlen, max 3 Ziffern
    if (/^\d{0,3}$/.test(value)) {
      setUserAnswer(value);
    }
  };

  /**
   * Handler für Enter-Taste
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (showFeedback && !isCorrect) {
        handleNext();
      } else if (!showFeedback) {
        handleCheck();
      }
    }
  };

  /**
   * Berechne Statistiken
   */
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

  /**
   * Berechne laufende Durchschnittszeit
   */
  const getCurrentAvgTime = () => {
    if (sessionResults.length === 0) return '0.0';
    const total = sessionResults.reduce((sum, r) => sum + r.time, 0);
    return (total / sessionResults.length).toFixed(1);
  };

  /**
   * Filtere Einmaleins-Fehler aus Context
   */
  const getMultiplicationErrors = () => {
    return errors
      .filter(e => e.type === 'multiplication')
      .slice(-20) // Letzte 20
      .map(e => {
        const match = e.question.match(/(\d+)\s*×\s*(\d+)/);
        if (match) {
          return { num1: parseInt(match[1]), num2: parseInt(match[2]) };
        }
        return null;
      })
      .filter(Boolean);
  };

  // Initiale Session beim Laden
  useEffect(() => {
    startNewSession('random');
  }, []);

  const stats = calculateStats();
  const multiplicationErrors = getMultiplicationErrors();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">1×1 Training</h1>
            
            <div className="flex items-center gap-4">
              {/* Correct Streak Anzeige */}
              {correctStreak > 0 && (
                <div className={`text-sm font-semibold ${correctStreak >= 5 ? 'text-green-600' : 'text-gray-600'}`}>
                  ✓ {correctStreak}/10 richtig
                </div>
              )}
              
              {/* Tages-Streak */}
              <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg">
                <Flame className="w-5 h-5" aria-hidden="true" />
                <span className="font-semibold">{streak} Tage</span>
              </div>
            </div>
          </div>

          {/* Schwierigkeitsgrad */}
          {!isSessionComplete && (
            <div className="flex gap-2 items-center flex-wrap mb-3">
              <span className="text-sm font-semibold text-gray-500">Schwierigkeit:</span>
              {[
                { key: 'leicht', label: 'Leicht (1-5)', color: 'green' },
                { key: 'mittel', label: 'Mittel (6-8)', color: 'yellow' },
                { key: 'schwer', label: 'Schwer (9-10)', color: 'red' },
                { key: 'alle', label: 'Alle', color: 'blue' },
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => {
                    setDifficulty(key);
                    if (mode === 'random') startNewSession('random');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    difficulty === key
                      ? `bg-${color}-500 text-white`
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={difficulty === key ? {
                    backgroundColor: color === 'green' ? '#22c55e' : color === 'yellow' ? '#eab308' : color === 'red' ? '#ef4444' : '#3b82f6',
                    color: 'white'
                  } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Modus-Auswahl */}
          {!isSessionComplete && (
            <div className="flex gap-2 items-center flex-wrap">
              <button
                onClick={() => startNewSession('random')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  mode === 'random'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Zufällig gemischt
              </button>
              
              <button
                onClick={() => startNewSession('focus')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  mode === 'focus'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Fokus-Reihe
              </button>
              
              {mode === 'focus' && (
                <select
                  value={focusRow}
                  onChange={(e) => {
                    setFocusRow(parseInt(e.target.value));
                    startNewSession('focus');
                  }}
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 font-semibold focus:border-purple-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}er-Reihe
                    </option>
                  ))}
                </select>
              )}
              
              {multiplicationErrors.length > 0 && (
                <button
                  onClick={() => startNewSession('mistakes', multiplicationErrors)}
                  className="px-4 py-2 rounded-lg font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  Schwierige Aufgaben wiederholen ({multiplicationErrors.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <TheoryPanel title="1×1 Tipps">
          <p>Die <strong>2er-Reihe</strong>: immer verdoppeln. Die <strong>5er-Reihe</strong>: endet immer auf 0 oder 5. Die <strong>9er-Reihe</strong>: Quersumme ist immer 9 (z.B. 27 → 2+7=9). <strong>Tauschaufgaben</strong> helfen: 3×7 = 7×3.</p>
        </TheoryPanel>

        {!isSessionComplete ? (
          /* Session läuft */
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Fortschrittsanzeige */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Aufgabe {sessionProgress + 1}/10
                </span>
                <span className="text-sm text-gray-500">
                  Ø {getCurrentAvgTime()}s
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((sessionProgress + 1) / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Aufgabe */}
            <div className="text-center mb-8">
              <div className="text-4xl sm:text-6xl font-bold text-gray-800 mb-8">
                {currentQuestion.num1} × {currentQuestion.num2} = ?
              </div>

              {/* Input-Feld */}
              <div className="flex justify-center mb-6">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={userAnswer}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={showFeedback}
                  className="w-24 h-16 sm:w-32 sm:h-20 text-center text-4xl sm:text-5xl font-bold border-4 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                  maxLength={3}
                  autoFocus
                />
              </div>

              {/* Feedback */}
              {showFeedback && (
                <div className={`mb-6 text-xl font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? (
                    <div className="flex items-center justify-center gap-2">
                      <Check className="w-6 h-6" />
                      Richtig! ✓
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <X className="w-6 h-6" />
                        Nicht ganz.
                      </div>
                      <div className="text-gray-700">
                        Die richtige Antwort ist: <span className="text-red-600">{correctAnswer}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Button */}
              {!showFeedback ? (
                <button
                  onClick={handleCheck}
                  disabled={!userAnswer}
                  className="px-12 py-4 bg-green-600 text-white text-xl font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Prüfen
                </button>
              ) : !isCorrect && (
                <button
                  onClick={handleNext}
                  className="px-12 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Weiter →
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
        ) : (
          /* Session beendet - Zusammenfassung */
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Session beendet! ✓
              </h2>

              {/* Statistiken */}
              {stats && (
                <div className="mb-8">
                  <div className="text-6xl font-bold mb-2">
                    {stats.percentage >= 80 ? '🎉' : stats.percentage >= 60 ? '✓' : '💪'}
                  </div>
                  <div className="text-4xl font-bold text-gray-800 mb-2">
                    {stats.score} richtig ({stats.percentage}%)
                  </div>
                  <div className="text-lg text-gray-600">
                    Durchschnittszeit: {stats.avgTime}s
                  </div>
                </div>
              )}

              {/* Fehler-Liste */}
              {stats && stats.mistakes.length > 0 && (
                <div className="mb-8 text-left bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Schwierige Aufgaben:
                  </h3>
                  <ul className="space-y-2">
                    {stats.mistakes.slice(0, 5).map((mistake, idx) => (
                      <li key={idx} className="text-gray-700">
                        • {mistake.question} = {mistake.correctAnswer} 
                        <span className="text-red-600 ml-2">(du: {mistake.userAnswer})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <SessionRating />

              {/* Buttons */}
              <div className="flex gap-4 justify-center">
                {stats && stats.mistakes.length > 0 && (
                  <button
                    onClick={() => {
                      const mistakeQuestions = stats.mistakes.map(m => {
                        const match = m.question.match(/(\d+)\s*×\s*(\d+)/);
                        return { num1: parseInt(match[1]), num2: parseInt(match[2]) };
                      });
                      startNewSession('mistakes', mistakeQuestions);
                    }}
                    className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Nochmal diese üben
                  </button>
                )}

                <button
                  onClick={() => startNewSession('random')}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Neue Session starten
                </button>
              </div>
            </div>
          </div>
        )}
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
              Großartig! Du bist ein 1×1 Champion! 🏆
            </p>
            <button
              onClick={() => setShowStreakModal(false)}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Weiter trainieren!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
