import { useState, useEffect, useRef } from 'react';
import { useStreak, useProgress, useErrors } from '../context/AppContext';
import { Flame, Check, X, Trophy, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';
import SessionRating from '../components/SessionRating';

/**
 * Silbentrennung-Datenbank für Klasse 2-3
 * Kategorisiert nach Trennmuster
 */
const WORDS = [
  // === 2-silbig einfach ===
  { word: "Hose", syllables: "Ho-se", category: "2-silbig", distractors: ["Hos-e", "H-ose", "Ho-se"] },
  { word: "Blume", syllables: "Blu-me", category: "2-silbig", distractors: ["Bl-ume", "Blum-e", "B-lume"] },
  { word: "Schule", syllables: "Schu-le", category: "2-silbig", distractors: ["Sch-ule", "Schul-e", "S-chule"] },
  { word: "Garten", syllables: "Gar-ten", category: "2-silbig", distractors: ["G-arten", "Ga-rten", "Gart-en"] },
  { word: "Nase", syllables: "Na-se", category: "2-silbig", distractors: ["Nas-e", "N-ase", "Na-s-e"] },
  { word: "Dose", syllables: "Do-se", category: "2-silbig", distractors: ["Dos-e", "D-ose", "Do-s-e"] },
  { word: "Regen", syllables: "Re-gen", category: "2-silbig", distractors: ["Reg-en", "R-egen", "Rege-n"] },
  { word: "Ofen", syllables: "Ofen", category: "2-silbig", distractors: ["O-fen", "Of-en", "Ofe-n"] },
  { word: "Vogel", syllables: "Vo-gel", category: "2-silbig", distractors: ["Vog-el", "V-ogel", "Voge-l"] },
  { word: "Nagel", syllables: "Na-gel", category: "2-silbig", distractors: ["Nag-el", "N-agel", "Nage-l"] },
  { word: "Hafen", syllables: "Ha-fen", category: "2-silbig", distractors: ["Haf-en", "H-afen", "Hafe-n"] },
  { word: "Esel", syllables: "Esel", category: "2-silbig", distractors: ["E-sel", "Es-el", "Ese-l"] },
  { word: "Tiger", syllables: "Ti-ger", category: "2-silbig", distractors: ["Tig-er", "T-iger", "Tige-r"] },
  { word: "Sofa", syllables: "So-fa", category: "2-silbig", distractors: ["Sof-a", "S-ofa", "Sof-a"] },
  { word: "Name", syllables: "Na-me", category: "2-silbig", distractors: ["Nam-e", "N-ame", "Na-m-e"] },
  { word: "Besen", syllables: "Be-sen", category: "2-silbig", distractors: ["Bes-en", "B-esen", "Bese-n"] },

  // === Doppelkonsonanten (split between them) ===
  { word: "Sonne", syllables: "Son-ne", category: "Doppelkonsonant", distractors: ["So-nne", "Sonn-e", "S-onne"] },
  { word: "Wasser", syllables: "Was-ser", category: "Doppelkonsonant", distractors: ["Wa-sser", "Wass-er", "W-asser"] },
  { word: "Mutter", syllables: "Mut-ter", category: "Doppelkonsonant", distractors: ["Mu-tter", "Mutt-er", "M-utter"] },
  { word: "Butter", syllables: "But-ter", category: "Doppelkonsonant", distractors: ["Bu-tter", "Butt-er", "B-utter"] },
  { word: "Puppe", syllables: "Pup-pe", category: "Doppelkonsonant", distractors: ["Pu-ppe", "Pupp-e", "P-uppe"] },
  { word: "Teller", syllables: "Tel-ler", category: "Doppelkonsonant", distractors: ["Te-ller", "Tell-er", "T-eller"] },
  { word: "Kanne", syllables: "Kan-ne", category: "Doppelkonsonant", distractors: ["Ka-nne", "Kann-e", "K-anne"] },
  { word: "Tasse", syllables: "Tas-se", category: "Doppelkonsonant", distractors: ["Ta-sse", "Tass-e", "T-asse"] },
  { word: "Suppe", syllables: "Sup-pe", category: "Doppelkonsonant", distractors: ["Su-ppe", "Supp-e", "S-uppe"] },
  { word: "Himmel", syllables: "Him-mel", category: "Doppelkonsonant", distractors: ["Hi-mmel", "Himm-el", "H-immel"] },
  { word: "Brille", syllables: "Bril-le", category: "Doppelkonsonant", distractors: ["Bri-lle", "Brill-e", "B-rille"] },
  { word: "Wolle", syllables: "Wol-le", category: "Doppelkonsonant", distractors: ["Wo-lle", "Woll-e", "W-olle"] },
  { word: "Nuss", syllables: "Nuss", category: "Doppelkonsonant", distractors: ["Nu-ss", "Nus-s", "N-uss"] },
  { word: "Fluss", syllables: "Fluss", category: "Doppelkonsonant", distractors: ["Flu-ss", "Flus-s", "Fl-uss"] },

  // === ch bleibt zusammen ===
  { word: "Küche", syllables: "Kü-che", category: "ch zusammen", distractors: ["Küc-he", "Küch-e", "K-üche"] },
  { word: "Kuchen", syllables: "Ku-chen", category: "ch zusammen", distractors: ["Kuc-hen", "Kuch-en", "K-uchen"] },
  { word: "Drache", syllables: "Dra-che", category: "ch zusammen", distractors: ["Drac-he", "Drach-e", "Dr-ache"] },
  { word: "Woche", syllables: "Wo-che", category: "ch zusammen", distractors: ["Woc-he", "Woch-e", "W-oche"] },
  { word: "Fläche", syllables: "Flä-che", category: "ch zusammen", distractors: ["Fläc-he", "Fläch-e", "Fl-äche"] },
  { word: "Rechen", syllables: "Re-chen", category: "ch zusammen", distractors: ["Rec-hen", "Rech-en", "R-echen"] },

  // === sch bleibt zusammen ===
  { word: "Fische", syllables: "Fi-sche", category: "sch zusammen", distractors: ["Fis-che", "Fisc-he", "Fisch-e"] },
  { word: "Tasche", syllables: "Ta-sche", category: "sch zusammen", distractors: ["Tas-che", "Tasc-he", "Tasch-e"] },
  { word: "Dusche", syllables: "Du-sche", category: "sch zusammen", distractors: ["Dus-che", "Dusc-he", "Dusch-e"] },
  { word: "Flasche", syllables: "Fla-sche", category: "sch zusammen", distractors: ["Flas-che", "Flasc-he", "Flasch-e"] },
  { word: "Masche", syllables: "Ma-sche", category: "sch zusammen", distractors: ["Mas-che", "Masc-he", "Masch-e"] },
  { word: "Kirsche", syllables: "Kir-sche", category: "sch zusammen", distractors: ["Kirs-che", "Kirsc-he", "Kirsch-e"] },

  // === ck bleibt zusammen (neue Regel!) ===
  { word: "Zucker", syllables: "Zu-cker", category: "ck zusammen", distractors: ["Zuc-ker", "Zuck-er", "Z-ucker"] },
  { word: "Decke", syllables: "De-cke", category: "ck zusammen", distractors: ["Dec-ke", "Deck-e", "D-ecke"] },
  { word: "Jacke", syllables: "Ja-cke", category: "ck zusammen", distractors: ["Jac-ke", "Jack-e", "J-acke"] },
  { word: "Brücke", syllables: "Brü-cke", category: "ck zusammen", distractors: ["Brüc-ke", "Brück-e", "Br-ücke"] },
  { word: "Hecke", syllables: "He-cke", category: "ck zusammen", distractors: ["Hec-ke", "Heck-e", "H-ecke"] },
  { word: "Schnecke", syllables: "Schne-cke", category: "ck zusammen", distractors: ["Schnec-ke", "Schneck-e", "Schn-ecke"] },
  { word: "Strecke", syllables: "Stre-cke", category: "ck zusammen", distractors: ["Strec-ke", "Streck-e", "Str-ecke"] },

  // === st bleibt zusammen ===
  { word: "Fenster", syllables: "Fens-ter", category: "st zusammen", distractors: ["Fen-ster", "Fenst-er", "Fe-nster"] },
  { word: "Schwester", syllables: "Schwes-ter", category: "st zusammen", distractors: ["Schwe-ster", "Schwest-er", "Schw-ester"] },
  { word: "Hamster", syllables: "Hams-ter", category: "st zusammen", distractors: ["Ham-ster", "Hamst-er", "Ha-mster"] },
  { word: "Monster", syllables: "Mons-ter", category: "st zusammen", distractors: ["Mon-ster", "Monst-er", "Mo-nster"] },
  { word: "Meister", syllables: "Meis-ter", category: "st zusammen", distractors: ["Mei-ster", "Meist-er", "Me-ister"] },
  { word: "Pflaster", syllables: "Pflas-ter", category: "st zusammen", distractors: ["Pfla-ster", "Pflast-er", "Pfl-aster"] },

  // === 3-silbig ===
  { word: "Schmetterling", syllables: "Schmet-ter-ling", category: "3-silbig", distractors: ["Schme-tter-ling", "Schmett-er-ling", "Schmet-terl-ing"] },
  { word: "Schokolade", syllables: "Scho-ko-la-de", category: "3-silbig", distractors: ["Schok-ol-a-de", "Scho-kol-ade", "Sch-oko-lade"] },
  { word: "Kartoffel", syllables: "Kar-tof-fel", category: "3-silbig", distractors: ["Ka-rtof-fel", "Kart-off-el", "Kar-to-ffel"] },
  { word: "Erdbeere", syllables: "Erd-bee-re", category: "3-silbig", distractors: ["Er-dbee-re", "Erd-be-ere", "Erdbe-e-re"] },
  { word: "Banane", syllables: "Ba-na-ne", category: "3-silbig", distractors: ["Ban-a-ne", "Ba-nan-e", "B-ana-ne"] },
  { word: "Tomate", syllables: "To-ma-te", category: "3-silbig", distractors: ["Tom-a-te", "To-mat-e", "T-oma-te"] },
  { word: "Krokodil", syllables: "Kro-ko-dil", category: "3-silbig", distractors: ["Krok-o-dil", "Kro-kod-il", "Kr-oko-dil"] },
  { word: "Elefant", syllables: "Ele-fant", category: "3-silbig", distractors: ["El-ef-ant", "E-le-fant", "Elef-ant"] },
  { word: "Papagei", syllables: "Pa-pa-gei", category: "3-silbig", distractors: ["Pap-a-gei", "Pa-pag-ei", "P-apa-gei"] },
  { word: "Telefon", syllables: "Te-le-fon", category: "3-silbig", distractors: ["Tel-ef-on", "Te-lef-on", "Tel-e-fon"] },
  { word: "Ananas", syllables: "Ana-nas", category: "3-silbig", distractors: ["An-an-as", "A-na-nas", "Anan-as"] },
  { word: "Laterne", syllables: "La-ter-ne", category: "3-silbig", distractors: ["Lat-er-ne", "La-tern-e", "Late-rn-e"] },
  { word: "Kalender", syllables: "Ka-len-der", category: "3-silbig", distractors: ["Kal-en-der", "Ka-lend-er", "Kale-nd-er"] },

  // === Zusammengesetzte Wörter ===
  { word: "Haustür", syllables: "Haus-tür", category: "Zusammensetzung", distractors: ["Ha-ustür", "Hau-stür", "Haus-t-ür"] },
  { word: "Schultasche", syllables: "Schul-ta-sche", category: "Zusammensetzung", distractors: ["Schu-lta-sche", "Schult-a-sche", "Schul-tas-che"] },
  { word: "Handschuh", syllables: "Hand-schuh", category: "Zusammensetzung", distractors: ["Han-dschuh", "Hands-chuh", "Ha-ndschuh"] },
  { word: "Fußball", syllables: "Fuß-ball", category: "Zusammensetzung", distractors: ["Fu-ßball", "Fuß-ba-ll", "Fußb-all"] },
  { word: "Apfelbaum", syllables: "Ap-fel-baum", category: "Zusammensetzung", distractors: ["Apf-el-baum", "Ap-felb-aum", "A-pfel-baum"] },
  { word: "Kinderzimmer", syllables: "Kin-der-zim-mer", category: "Zusammensetzung", distractors: ["Kind-er-zi-mmer", "Ki-nder-zimm-er", "Kind-erz-imm-er"] },
  { word: "Sonnenschein", syllables: "Son-nen-schein", category: "Zusammensetzung", distractors: ["So-nnen-schein", "Sonn-en-schein", "Son-nens-chein"] },
  { word: "Regenschirm", syllables: "Re-gen-schirm", category: "Zusammensetzung", distractors: ["Reg-en-schirm", "Re-gens-chirm", "Regen-sch-irm"] },
  { word: "Spielplatz", syllables: "Spiel-platz", category: "Zusammensetzung", distractors: ["Spi-elplatz", "Spie-lplatz", "Spielp-latz"] },
  { word: "Schneemann", syllables: "Schnee-mann", category: "Zusammensetzung", distractors: ["Schn-eemann", "Schne-emann", "Schneem-ann"] },
  { word: "Blumentopf", syllables: "Blu-men-topf", category: "Zusammensetzung", distractors: ["Blum-en-topf", "Blu-ment-opf", "B-lumen-topf"] },
  { word: "Turnhalle", syllables: "Turn-hal-le", category: "Zusammensetzung", distractors: ["Tur-nhal-le", "Turnh-al-le", "Turn-ha-lle"] },
];

const CATEGORIES = [
  'Alle',
  '2-silbig',
  'Doppelkonsonant',
  'ch zusammen',
  'sch zusammen',
  'ck zusammen',
  'st zusammen',
  '3-silbig',
  'Zusammensetzung',
];

/**
 * Erzeugt Antwortoptionen: korrekte Silbentrennung + 3 Distraktoren, gemischt
 */
const buildOptions = (entry) => {
  const correct = entry.syllables;
  // Take up to 3 distractors, filter any accidental duplicates of the correct answer
  const wrongs = entry.distractors.filter(d => d !== correct).slice(0, 3);
  // Pad if fewer than 3 (should not happen with our data)
  const options = [correct, ...wrongs];
  // Shuffle
  return options.sort(() => Math.random() - 0.5);
};

/**
 * Generiert eine zufällige Session
 */
const generateSession = (count = 10, filterCategory = null) => {
  let pool = filterCategory
    ? WORDS.filter(w => w.category === filterCategory)
    : [...WORDS];

  pool = pool.sort(() => Math.random() - 0.5);
  return pool.slice(0, Math.min(count, pool.length));
};

/**
 * Seite: Deutsch - Silbentrennung Training (Klasse 2-3)
 */
export default function Silbentrennung() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('silbentrennung');
  const { addError } = useErrors();

  const [category, setCategory] = useState('Alle');
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([]);
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
    const newQuestions = generateSession(10, filter);
    setQuestions(newQuestions);
    setOptions(newQuestions.length > 0 ? buildOptions(newQuestions[0]) : []);
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

  // Rebuild options when currentIndex changes
  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      setOptions(buildOptions(questions[currentIndex]));
    }
  }, [currentIndex, questions]);

  // Keyboard support: 1-4
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSessionComplete || showFeedback) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= options.length) {
        handleAnswer(options[num - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isSessionComplete, showFeedback, questions, options]);

  const handleAnswer = (answer) => {
    if (showFeedback || isSessionComplete || questions.length === 0) return;

    const current = questions[currentIndex];
    const correct = answer === current.syllables;
    const timeTaken = (Date.now() - startTime) / 1000;

    const result = {
      word: current.word,
      correctSplit: current.syllables,
      userSplit: answer,
      correct,
      time: timeTaken,
      category: current.category,
    };

    setSessionResults(prev => [...prev, result]);
    setLastAnswer({ correct, correctSplit: current.syllables });
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
      addError('silben', `${current.syllables}`);
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

    // Per-category accuracy
    const byCategory = {};
    for (const cat of CATEGORIES.filter(c => c !== 'Alle')) {
      const relevant = sessionResults.filter(r => r.category === cat);
      const correctCount = relevant.filter(r => r.correct).length;
      byCategory[cat] = relevant.length > 0
        ? { pct: Math.round((correctCount / relevant.length) * 100), count: relevant.length }
        : null;
    }

    return {
      score: `${correct}/${sessionResults.length}`,
      percentage: Math.round((correct / sessionResults.length) * 100),
      avgTime: avgTime.toFixed(1),
      mistakes,
      byCategory,
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
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Silbentrennung</h1>
              <p className="text-sm text-gray-500 mt-1">Klasse 2-3</p>
            </div>

            <div className="flex items-center gap-4">
              {correctStreak > 0 && (
                <div className={`text-sm font-semibold flex items-center gap-1 ${correctStreak >= 5 ? 'text-purple-600' : 'text-gray-600'}`}>
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
                      ? 'bg-purple-500 text-white'
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
        <TheoryPanel title="Silben trennen">
          <ul>
            <li>Sprich das Wort langsam und klatsche mit: <strong>Son-ne</strong> (2 Klatscher)</li>
            <li>Doppelte Buchstaben werden getrennt: <strong>Was-ser</strong>, <strong>Mut-ter</strong>, <strong>Son-ne</strong></li>
            <li><strong>ch</strong>, <strong>sch</strong>, <strong>ck</strong> bleiben IMMER zusammen: Kü-che, Fi-sche, Zu-cker</li>
            <li><strong>st</strong> bleibt zusammen: Fens-ter, Schwes-ter</li>
            <li>Zusammengesetzte Wörter: an der Wortgrenze trennen: <strong>Haus-tür</strong>, <strong>Schul-ta-sche</strong></li>
          </ul>
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
                  Tasten: 1-{options.length}
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
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                {current.category}
              </div>
              <div className={`text-5xl sm:text-6xl font-bold mb-4 transition-colors duration-200 ${
                showFeedback
                  ? lastAnswer?.correct
                    ? 'text-green-600'
                    : 'text-red-600'
                  : 'text-gray-800'
              }`}>
                {current.word}
              </div>

              <p className="text-gray-500 text-sm mb-2">Wie wird dieses Wort getrennt?</p>

              {showFeedback && (
                <div className={`text-xl font-semibold ${lastAnswer?.correct ? 'text-green-600' : 'text-red-600'}`}>
                  {lastAnswer?.correct ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" /> Richtig!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <X className="w-5 h-5" /> Richtig ist: {lastAnswer?.correctSplit}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((option, idx) => {
                const isCorrectOption = showFeedback && option === current.syllables;
                const isWrongPick = showFeedback && lastAnswer && !lastAnswer.correct && option === sessionResults[sessionResults.length - 1]?.userSplit;

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={showFeedback}
                    className={`relative px-6 py-4 text-lg font-semibold rounded-xl transition-all duration-150
                      focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2
                      active:scale-95
                      ${showFeedback
                        ? isCorrectOption
                          ? 'bg-green-100 text-green-800 border-2 border-green-500'
                          : isWrongPick
                            ? 'bg-red-100 text-red-800 border-2 border-red-500'
                            : 'bg-gray-100 text-gray-400 border-2 border-transparent'
                        : 'bg-purple-50 text-purple-900 border-2 border-purple-200 hover:bg-purple-100 hover:border-purple-400'
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
                  ? `Richtig! ${current.syllables}`
                  : `Falsch. Richtig ist ${current.syllables}`}
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

              {/* Per-category breakdown */}
              <div className="flex gap-3 justify-center flex-wrap mb-8">
                {Object.entries(stats.byCategory)
                  .filter(([, val]) => val !== null)
                  .map(([cat, val]) => (
                    <div key={cat} className="rounded-lg px-4 py-3 bg-purple-50 text-purple-800">
                      <div className="text-sm font-bold">{cat}</div>
                      <div className="text-xs">{val.pct}% ({val.count})</div>
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
                        <span className="font-bold">{m.word}</span>
                        {' → '}
                        <span className="text-green-700 font-semibold">{m.correctSplit}</span>
                        <span className="text-red-600 ml-2">(du: {m.userSplit})</span>
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
              Du bist ein Silben-Profi!
            </p>
            <button
              onClick={() => setShowStreakModal(false)}
              className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Weiter trennen!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
