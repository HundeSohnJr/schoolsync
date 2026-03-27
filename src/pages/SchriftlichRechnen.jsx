import { useState, useRef, useEffect } from 'react';
import { useStreak, useSettings, useProgress, useErrors } from '../context/AppContext';
import { Flame, RefreshCw, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';

/**
 * Generiert eine Zufallszahl zwischen min und max (inklusive)
 */
const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Wandelt eine Zahl in ein Array um (mit gewünschter Stellenanzahl)
 */
const numberToDigits = (num, columns) => {
  const str = num.toString().padStart(columns, '0');
  return str.split('').map(Number);
};

/**
 * Operationen
 */
const OPERATIONS = {
  ADDITION: 'addition',
  SUBTRACTION: 'subtraction',
  MULTIPLICATION: 'multiplication',
  DIVISION: 'division',
};

/**
 * Konfiguration pro Schwierigkeitsgrad
 */
const DIFFICULTY_CONFIG = {
  leicht: {
    columns: 2,
    labels: ['Z', 'E'],
    addition: { min: 10, max: 99 },
    subtraction: { min: 20, max: 99, subMin: 10, subMax: 49 },
    multiplication: { num1: [2, 9], num2: [2, 9] },
    division: { quotient: [2, 9], divisor: [2, 9] },
  },
  mittel: {
    columns: 4,
    labels: ['T', 'H', 'Z', 'E'],
    addition: { min: 100, max: 999 },
    subtraction: { min: 200, max: 999, subMin: 100, subMax: 499 },
    multiplication: { num1: [10, 99], num2: [2, 9] },
    division: { quotient: [10, 99], divisor: [2, 9] },
  },
  schwer: {
    columns: 5,
    labels: ['ZT', 'T', 'H', 'Z', 'E'],
    addition: { min: 1000, max: 9999 },
    subtraction: { min: 2000, max: 9999, subMin: 1000, subMax: 4999 },
    multiplication: { num1: [10, 99], num2: [10, 99] },
    division: { quotient: [10, 99], divisor: [10, 99] },
  },
};

/**
 * Seite: Mathe - Schriftlich Rechnen (mit vollständiger Validierung)
 */
export default function SchriftlichRechnen() {
  const { streak, updateStreak } = useStreak();
  const { mathMethod, difficulty, updateSettings } = useSettings();
  const { increment } = useProgress('schriftlich');
  const { addError } = useErrors();
  
  const config = DIFFICULTY_CONFIG[difficulty];
  const numColumns = config.columns;
  
  // State
  const [activeOperation, setActiveOperation] = useState(OPERATIONS.SUBTRACTION);
  const [number1, setNumber1] = useState(542);
  const [number2, setNumber2] = useState(178);
  const [userAnswer, setUserAnswer] = useState(Array(numColumns).fill(''));
  const [carryOver, setCarryOver] = useState(Array(numColumns).fill(''));
  
  // Validierungs-State
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [wrongIndices, setWrongIndices] = useState([]);
  const [wrongCarryIndices, setWrongCarryIndices] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [correctCarries, setCorrectCarries] = useState(null);
  const [correctStreak, setCorrectStreak] = useState(0);
  
  // Refs
  const carryRefs = useRef([]);
  const answerRefs = useRef([]);

  // Initialisiere Refs
  useEffect(() => {
    carryRefs.current = Array(numColumns).fill(null).map((_, i) => carryRefs.current[i] || { current: null });
    answerRefs.current = Array(numColumns).fill(null).map((_, i) => answerRefs.current[i] || { current: null });
  }, [numColumns]);

  /**
   * Berechnet die korrekte Lösung
   */
  const calculateCorrectAnswer = () => {
    let result;
    
    switch (activeOperation) {
      case OPERATIONS.ADDITION:
        result = number1 + number2;
        break;
      case OPERATIONS.SUBTRACTION:
        result = number1 - number2;
        break;
      case OPERATIONS.MULTIPLICATION:
        result = number1 * number2;
        break;
      case OPERATIONS.DIVISION:
        result = Math.floor(number1 / number2);
        break;
      default:
        result = 0;
    }
    
    return numberToDigits(result, numColumns);
  };

  /**
   * Berechnet die korrekten Überträge für die jeweilige Operation
   */
  const calculateCorrectCarries = () => {
    const num1Digits = numberToDigits(number1, numColumns);
    const num2Digits = numberToDigits(number2, numColumns);
    const carries = Array(numColumns).fill('');
    
    if (activeOperation === OPERATIONS.ADDITION) {
      // Addition: Überträge von rechts nach links
      let carry = 0;
      for (let i = numColumns - 1; i >= 0; i--) {
        const sum = num1Digits[i] + num2Digits[i] + carry;
        carry = Math.floor(sum / 10);
        if (carry > 0 && i > 0) {
          carries[i - 1] = carry.toString();
        }
      }
    } else if (activeOperation === OPERATIONS.SUBTRACTION && mathMethod === 'Entbündeln') {
      // Subtraktion mit Entbündeln: Zeige neue Werte nach Entbündeln
      const tempNum1 = [...num1Digits];
      for (let i = numColumns - 1; i >= 0; i--) {
        if (tempNum1[i] < num2Digits[i]) {
          // Borgen von links
          let j = i - 1;
          while (j >= 0 && tempNum1[j] === 0) {
            tempNum1[j] = 9;
            j--;
          }
          if (j >= 0) {
            tempNum1[j]--;
            tempNum1[i] += 10;
          }
        }
      }
      // Speichere nur die geänderten Werte
      for (let i = 0; i < numColumns; i++) {
        if (tempNum1[i] !== num1Digits[i]) {
          carries[i] = tempNum1[i].toString();
        }
      }
    } else if (activeOperation === OPERATIONS.SUBTRACTION && mathMethod === 'Ergänzen') {
      // Subtraktion mit Ergänzen: Zeige Ergänzungswerte
      for (let i = numColumns - 1; i >= 1; i--) {
        if (num1Digits[i] < num2Digits[i]) {
          carries[i - 1] = '1'; // Übertrag für nächste Stelle
        }
      }
    } else if (activeOperation === OPERATIONS.MULTIPLICATION) {
      // Multiplikation: Überträge wie bei Addition
      let carry = 0;
      const num2Value = parseInt(num2Digits.join(''));
      for (let i = numColumns - 1; i >= 0; i--) {
        const product = num1Digits[i] * num2Value + carry;
        carry = Math.floor(product / 10);
        if (carry > 0 && i > 0) {
          carries[i - 1] = carry.toString();
        }
      }
    }
    
    return carries;
  };

  /**
   * Generiert eine neue Aufgabe
   */
  const generateProblem = (operation) => {
    let num1, num2;
    
    switch (operation) {
      case OPERATIONS.ADDITION:
        num1 = randomNumber(config.addition.min, config.addition.max);
        num2 = randomNumber(config.addition.min, config.addition.max);
        // On leicht: ensure no carrying is needed (each column sums to < 10)
        if (difficulty === 'leicht') {
          for (let attempt = 0; attempt < 20; attempt++) {
            const d1 = numberToDigits(num1, numColumns);
            const d2 = numberToDigits(num2, numColumns);
            let needsCarry = false;
            for (let i = 0; i < numColumns; i++) {
              if (d1[i] + d2[i] >= 10) { needsCarry = true; break; }
            }
            if (!needsCarry) break;
            num1 = randomNumber(config.addition.min, config.addition.max);
            num2 = randomNumber(config.addition.min, config.addition.max);
          }
        }
        break;
        
      case OPERATIONS.SUBTRACTION:
        num1 = randomNumber(config.subtraction.min, config.subtraction.max);
        num2 = randomNumber(config.subtraction.subMin, Math.min(num1 - 1, config.subtraction.subMax));
        // On leicht: ensure no borrowing is needed (ones digit of num1 >= ones digit of num2)
        if (difficulty === 'leicht') {
          for (let attempt = 0; attempt < 20; attempt++) {
            const d1 = numberToDigits(num1, numColumns);
            const d2 = numberToDigits(num2, numColumns);
            let needsBorrow = false;
            for (let i = numColumns - 1; i >= 0; i--) {
              if (d1[i] < d2[i]) { needsBorrow = true; break; }
            }
            if (!needsBorrow) break;
            num1 = randomNumber(config.subtraction.min, config.subtraction.max);
            num2 = randomNumber(config.subtraction.subMin, Math.min(num1 - 1, config.subtraction.subMax));
          }
        }
        break;
        
      case OPERATIONS.MULTIPLICATION:
        num1 = randomNumber(...config.multiplication.num1);
        num2 = randomNumber(...config.multiplication.num2);
        break;
        
      case OPERATIONS.DIVISION:
        const divisor = randomNumber(...config.division.divisor);
        const quotient = randomNumber(...config.division.quotient);
        num1 = quotient * divisor;
        num2 = divisor;
        break;
        
      default:
        num1 = 100;
        num2 = 50;
    }
    
    setNumber1(num1);
    setNumber2(num2);
    resetValidation();
    
    setTimeout(() => answerRefs.current[0]?.current?.focus(), 0);
  };

  /**
   * Reset Validierungs-State
   */
  const resetValidation = () => {
    setUserAnswer(Array(numColumns).fill(''));
    setCarryOver(Array(numColumns).fill(''));
    setIsChecked(false);
    setIsCorrect(null);
    setAttemptCount(0);
    setWrongIndices([]);
    setWrongCarryIndices([]);
    setCorrectAnswer(null);
    setCorrectCarries(null);
  };

  /**
   * Handler für Tab-Wechsel
   */
  const handleTabChange = (operation) => {
    setActiveOperation(operation);
    generateProblem(operation);
  };

  /**
   * Handler für Schwierigkeitsgrad-Wechsel
   */
  const handleDifficultyChange = (newDifficulty) => {
    updateSettings('difficulty', newDifficulty);
    setTimeout(() => {
      const newConfig = DIFFICULTY_CONFIG[newDifficulty];
      setUserAnswer(Array(newConfig.columns).fill(''));
      setCarryOver(Array(newConfig.columns).fill(''));
      resetValidation();
      generateProblem(activeOperation);
    }, 0);
  };

  /**
   * Handler für Methoden-Toggle
   */
  const handleMethodToggle = () => {
    const newMethod = mathMethod === 'Entbündeln' ? 'Ergänzen' : 'Entbündeln';
    updateSettings('mathMethod', newMethod);
  };

  /**
   * Handler für Carry-Input (erlaubt 1-2 Ziffern für Entbündeln-Methode)
   */
  const handleCarryChange = (index, value) => {
    // Erlaube 1-2 Ziffern für zweistellige Überträge (z.B. "12" bei Entbündeln)
    if (value && !/^[0-9]{1,2}$/.test(value)) return;

    const newCarry = [...carryOver];
    newCarry[index] = value;
    setCarryOver(newCarry);

    // Bei 2 Ziffern oder wenn letztes Feld: Springe zum nächsten Feld
    if (value && (value.length === 2 || index >= numColumns - 1)) {
      if (index < numColumns - 1 && carryRefs.current[index + 1]?.current) {
        carryRefs.current[index + 1].current.focus();
      } else {
        answerRefs.current[0]?.current?.focus();
      }
    }
  };

  /**
   * Handler für Answer-Input
   */
  const handleAnswerChange = (index, value) => {
    if (value && !/^[0-9]$/.test(value)) return;

    const newAnswer = [...userAnswer];
    newAnswer[index] = value;
    setUserAnswer(newAnswer);

    if (value && index < numColumns - 1) {
      answerRefs.current[index + 1]?.current?.focus();
    }
  };

  /**
   * Handler für Backspace
   */
  const handleKeyDown = (index, e, isCarry = false) => {
    const refs = isCarry ? carryRefs.current : answerRefs.current;
    const values = isCarry ? carryOver : userAnswer;
    
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      refs[index - 1]?.current?.focus();
    }
    
    if (e.key === 'Enter' && !isCarry && index === numColumns - 1) {
      if (isCorrect || attemptCount >= 3) {
        handleNextProblem();
      } else {
        handleCheck();
      }
    }
  };

  /**
   * Validiert die Antwort (Ergebnis + Überträge)
   */
  const handleCheck = () => {
    // Prüfe ob mindestens ein Feld ausgefüllt ist
    const hasAnyInput = userAnswer.some(val => val !== '');
    if (!hasAnyInput) {
      return;
    }

    const correct = calculateCorrectAnswer();
    const correctCarriesArray = calculateCorrectCarries();
    
    // Leere Felder werden als 0 behandelt (für führende Nullen)
    const userAnswerNumbers = userAnswer.map(n => parseInt(n) || 0);
    
    // Vergleiche Ergebnis
    const isResultCorrect = correct.every((digit, i) => digit === userAnswerNumbers[i]);
    
    // Vergleiche Überträge (nur wenn Übertrag-Felder relevant sind)
    const shouldCheckCarries = activeOperation !== OPERATIONS.DIVISION;
    let areCarriesCorrect = true;
    const wrongCarryIdx = [];
    
    if (shouldCheckCarries) {
      correctCarriesArray.forEach((expectedCarry, i) => {
        const userCarry = carryOver[i] || '';
        if (expectedCarry !== userCarry) {
          areCarriesCorrect = false;
          wrongCarryIdx.push(i);
        }
      });
    }
    
    // Finde falsche Ergebnis-Indizes
    const wrongIdx = [];
    correct.forEach((digit, i) => {
      if (digit !== userAnswerNumbers[i]) {
        wrongIdx.push(i);
      }
    });
    
    setIsChecked(true);
    setWrongIndices(wrongIdx);
    setWrongCarryIndices(wrongCarryIdx);
    setCorrectAnswer(correct);
    setCorrectCarries(correctCarriesArray);
    
    // Aufgabe ist nur richtig wenn BEIDE (Ergebnis UND Überträge) korrekt sind
    const isCompletelyCorrect = isResultCorrect && areCarriesCorrect;
    
    if (isCompletelyCorrect) {
      // Richtig!
      setIsCorrect(true);

      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);

      // Konfetti nur bei jedem 5. richtigen hintereinander
      if (newStreak % 5 === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981'],
        });
      }

      // Update Context
      updateStreak();
      increment();
    } else {
      // Falsch
      setIsCorrect(false);
      setAttemptCount(prev => prev + 1);
      setCorrectStreak(0);
      
      // Speichere Fehler
      const operatorSymbol = {
        [OPERATIONS.ADDITION]: '+',
        [OPERATIONS.SUBTRACTION]: '−',
        [OPERATIONS.MULTIPLICATION]: '×',
        [OPERATIONS.DIVISION]: '÷',
      }[activeOperation];
      
      addError(activeOperation, `${number1} ${operatorSymbol} ${number2}`);
    }
  };

  /**
   * Handler für "Nächste Aufgabe"
   */
  const handleNextProblem = () => {
    generateProblem(activeOperation);
  };

  // Initiale Aufgabe beim Laden
  useEffect(() => {
    generateProblem(activeOperation);
  }, []);

  // Konvertiere Zahlen zu Digits
  const number1Digits = numberToDigits(number1, numColumns);
  const number2Digits = numberToDigits(number2, numColumns);

  // Operator-Symbol
  const operatorSymbol = {
    [OPERATIONS.ADDITION]: '+',
    [OPERATIONS.SUBTRACTION]: '−',
    [OPERATIONS.MULTIPLICATION]: '×',
    [OPERATIONS.DIVISION]: '÷',
  }[activeOperation];

  // Tabs (Klasse 3: Nur Addition und Subtraktion aktiv)
  const tabs = [
    { id: OPERATIONS.ADDITION, label: 'Addition', symbol: '+', available: true },
    { id: OPERATIONS.SUBTRACTION, label: 'Subtraktion', symbol: '−', available: true },
    { id: OPERATIONS.MULTIPLICATION, label: 'Multiplikation', symbol: '×', available: false },
    { id: OPERATIONS.DIVISION, label: 'Division', symbol: '÷', available: false },
  ];

  // Schwierigkeitsgrade
  const difficulties = [
    { id: 'leicht', label: 'Leicht' },
    { id: 'mittel', label: 'Mittel' },
    { id: 'schwer', label: 'Schwer' },
  ];

  // Spezialfall: Multiplikation Schwer
  const isMultiplicationHard = activeOperation === OPERATIONS.MULTIPLICATION && difficulty === 'schwer';

  // Button-Text und -Funktion
  const showNextButton = isCorrect || attemptCount >= 3;
  // Button nur disabled wenn ALLE Felder leer sind
  const isButtonDisabled = userAnswer.every(val => val === '');

  return (
    <div>
      {/* Header mit Streak */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Schriftlich Rechnen</h1>
        <div className="flex items-center gap-4">
          {/* Versuchs-Counter */}
          {isChecked && !isCorrect && attemptCount < 3 && (
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
              Versuch {attemptCount}/3
            </div>
          )}
          
          {/* Streak Counter */}
          <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg">
            <Flame className="w-5 h-5" aria-hidden="true" />
            <span className="font-semibold">{streak} Tage</span>
          </div>
        </div>
      </div>

      {/* Tab-Navigation */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <div key={tab.id} className="relative group">
            <button
              onClick={() => tab.available && handleTabChange(tab.id)}
              disabled={!tab.available}
              className={`min-h-12 px-8 text-lg font-semibold rounded-t-lg transition-colors focus:outline-none ${
                !tab.available
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                  : activeOperation === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
              aria-current={activeOperation === tab.id ? 'page' : undefined}
              title={!tab.available ? 'Kommt in Klasse 4' : ''}
            >
              {tab.label} ({tab.symbol})
            </button>
            
            {/* Tooltip für disabled Tabs */}
            {!tab.available && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded whitespace-nowrap">
                  Kommt in Klasse 4
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Schwierigkeitsgrad-Selector */}
      <div className="flex gap-2 mb-6">
        {difficulties.map((diff) => (
          <button
            key={diff.id}
            onClick={() => handleDifficultyChange(diff.id)}
            className={`px-4 py-1 text-sm font-semibold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 ${
              difficulty === diff.id
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-current={difficulty === diff.id ? 'true' : undefined}
          >
            {diff.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto">
        <TheoryPanel title="Wie geht schriftliches Rechnen?">
          <p><strong>Bei der Addition:</strong> Schreibe die Zahlen untereinander. Rechne von rechts nach links. Wenn eine Spalte mehr als 9 ergibt, schreibe den Übertrag in die nächste Spalte.</p>
          <p><strong>Bei der Subtraktion (Entbündeln):</strong> Wenn die obere Zahl kleiner ist, hole dir einen Zehner von der nächsten Stelle. Schreibe die neue Zahl oben hin.</p>
        </TheoryPanel>

        {/* Action-Buttons */}
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={() => generateProblem(activeOperation)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Neue Aufgabe generieren"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Neue Aufgabe
          </button>
        </div>

        {/* Rechen-Grid */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {isMultiplicationHard ? (
            /* Platzhalter für Multiplikation Schwer */
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 mb-4">
                Zweistellige Multiplikation ({number1} × {number2})
              </p>
              <p className="text-sm text-gray-500">
                Zwischenprodukte kommen bald!
              </p>
            </div>
          ) : (
            <>
              {/* Spalten-Überschriften */}
              <div className={`grid gap-4 mb-4`} style={{ gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` }}>
                {config.labels.map((label) => (
                  <div key={label} className="text-center text-sm font-semibold text-gray-500">
                    {label}
                  </div>
                ))}
              </div>

              {/* Übertrag-Felder ÜBER erster Zahl */}
              {(activeOperation === OPERATIONS.ADDITION || 
                activeOperation === OPERATIONS.MULTIPLICATION ||
                (activeOperation === OPERATIONS.SUBTRACTION && mathMethod === 'Entbündeln')) && (
                <div className={`grid gap-4 mb-2`} style={{ gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` }}>
                  {carryOver.map((value, index) => {
                    const isCarryWrong = isChecked && wrongCarryIndices.includes(index);
                    const isCarryRight = isChecked && !wrongCarryIndices.includes(index) && value !== '';
                    
                    return (
                      <div key={`carry-top-${index}`} className="flex justify-center">
                        <input
                          ref={(el) => { if (carryRefs.current[index]) carryRefs.current[index].current = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={2}
                          pattern="[0-9]{1,2}"
                          value={value}
                          onChange={(e) => handleCarryChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e, true)}
                          disabled={isChecked}
                          className={`w-12 h-10 text-center text-xs rounded focus:outline-none transition-colors ${
                            isCarryWrong
                              ? 'border-2 border-red-500 ring-1 ring-red-200 bg-red-50'
                              : isCarryRight
                              ? 'border border-green-500 bg-green-50'
                              : 'border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
                          } ${isChecked ? 'disabled:bg-opacity-100' : 'disabled:bg-gray-50'}`}
                          placeholder=""
                          aria-label={`Übertrag ${config.labels[index]}`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Erste Zahl */}
              <div className={`grid gap-4 mb-2`} style={{ gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` }}>
                {number1Digits.map((digit, index) => (
                  <div key={`num1-${index}`} className="text-center text-5xl font-bold text-gray-800 p-4">
                    {digit === 0 && index === 0 ? '' : digit}
                  </div>
                ))}
              </div>

              {/* Zweite Zahl mit Operator */}
              <div className="relative mb-4">
                <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-800">
                  {operatorSymbol}
                </span>
                <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` }}>
                  {number2Digits.map((digit, index) => (
                    <div key={`num2-${index}`} className="text-center text-5xl font-bold text-gray-800 p-4">
                      {digit === 0 && index === 0 ? '' : digit}
                    </div>
                  ))}
                </div>
              </div>

              {/* Übertrag-Felder UNTER zweiter Zahl (Subtraktion-Ergänzen) */}
              {activeOperation === OPERATIONS.SUBTRACTION && mathMethod === 'Ergänzen' && (
                <div className={`grid gap-4 mb-2`} style={{ gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` }}>
                  {carryOver.map((value, index) => {
                    const isCarryWrong = isChecked && wrongCarryIndices.includes(index);
                    const isCarryRight = isChecked && !wrongCarryIndices.includes(index) && value !== '';
                    
                    return (
                      <div key={`carry-bottom-${index}`} className="flex justify-center">
                        <input
                          ref={(el) => { if (carryRefs.current[index]) carryRefs.current[index].current = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          pattern="[0-9]"
                          value={value}
                          onChange={(e) => handleCarryChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e, true)}
                          disabled={isChecked}
                          className={`w-10 h-10 text-center text-xs rounded focus:outline-none transition-colors ${
                            isCarryWrong
                              ? 'border-2 border-red-500 ring-1 ring-red-200 bg-red-50'
                              : isCarryRight
                              ? 'border border-green-500 bg-green-50'
                              : 'border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
                          } ${isChecked ? 'disabled:bg-opacity-100' : 'disabled:bg-gray-50'}`}
                          placeholder=""
                          aria-label={`Ergänzung ${config.labels[index]}`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Horizontale Linie */}
              <div className="border-t-4 border-gray-800 mb-4"></div>

              {/* Ergebnis-Zeile */}
              <div className="relative">
                <div className={`grid gap-4 mb-2`} style={{ gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` }}>
                  {userAnswer.map((value, index) => {
                    const isWrong = isChecked && wrongIndices.includes(index);
                    const isRight = isChecked && !wrongIndices.includes(index) && value !== '';
                    
                    return (
                      <input
                        key={`answer-${index}`}
                        ref={(el) => { if (answerRefs.current[index]) answerRefs.current[index].current = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        pattern="[0-9]"
                        value={value}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e, false)}
                        disabled={isChecked}
                        className={`text-center text-4xl font-bold min-h-16 w-16 mx-auto rounded-lg p-4 focus:outline-none transition-colors ${
                          isWrong
                            ? 'border-2 border-red-500 ring-2 ring-red-200 bg-red-50'
                            : isRight
                            ? 'border-2 border-green-500 bg-green-50'
                            : 'border-2 border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                        } ${isChecked ? 'disabled:bg-opacity-100' : ''}`}
                        aria-label={`Ergebnis ${config.labels[index]}`}
                      />
                    );
                  })}
                </div>
                
                {/* Feedback-Icon */}
                {isChecked && (
                  <div className="absolute -right-16 top-1/2 -translate-y-1/2">
                    {isCorrect ? (
                      <Check className="text-green-600 w-12 h-12" aria-label="Richtig" />
                    ) : (
                      <X className="text-red-600 w-12 h-12" aria-label="Falsch" />
                    )}
                  </div>
                )}
              </div>

              {/* Korrekte Lösung anzeigen (nach 3 Versuchen) */}
              {attemptCount >= 3 && !isCorrect && correctAnswer && correctCarries && (
                <div className="text-center mb-4 space-y-2">
                  <p className="text-sm text-gray-500">
                    Richtige Lösung (Ergebnis): <span className="font-semibold text-gray-700">{correctAnswer.join(' ')}</span>
                  </p>
                  {activeOperation !== OPERATIONS.DIVISION && correctCarries.some(c => c !== '') && (
                    <p className="text-sm text-gray-500">
                      Richtige Überträge: <span className="font-semibold text-gray-700">
                        {correctCarries.map((c, i) => c || '–').join(' ')}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Prüfen / Nächste Aufgabe Button */}
              <div className="flex justify-center mt-6">
                {showNextButton ? (
                  <button
                    onClick={handleNextProblem}
                    className="px-12 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Nächste Aufgabe →
                  </button>
                ) : (
                  <button
                    onClick={handleCheck}
                    disabled={isButtonDisabled}
                    className="px-12 py-4 bg-green-600 text-white text-xl font-semibold rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prüfen
                  </button>
                )}
              </div>

              {/* Screen Reader Feedback */}
              {isChecked && (
                <div className="sr-only" aria-live="polite" role="status">
                  {isCorrect ? 'Richtig! Gut gemacht!' : `Versuch ${attemptCount} von 3`}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
