import { useState, useEffect, useRef } from 'react';
import { useStreak, useProgress, useErrors } from '../context/AppContext';
import { Flame, Check, X, Trophy, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';
import SessionRating from '../components/SessionRating';

/**
 * Rechtschreibung-Datenbank für Klasse 3
 * Kategorisiert nach häufigen Fehlerschwerpunkten
 */

// ── Gap-Fill Daten ──────────────────────────────────────────────────────────

const GAP_WORDS = [
  // ie vs ei
  { word: "Biene", display: "B___ne", gap: "ie", options: ["ie", "ei", "i"], category: "ie-ei", hint: "Das Insekt summt" },
  { word: "Stein", display: "St___n", gap: "ei", options: ["ei", "ie", "e"], category: "ie-ei", hint: "Liegt auf dem Boden" },
  { word: "spielen", display: "sp___len", gap: "ie", options: ["ie", "ei", "i"], category: "ie-ei", hint: "Was du gerne machst" },
  { word: "reisen", display: "r___sen", gap: "ei", options: ["ei", "ie", "e"], category: "ie-ei", hint: "In den Urlaub ..." },
  { word: "Tier", display: "T___r", gap: "ie", options: ["ie", "ei", "i"], category: "ie-ei", hint: "Hund, Katze, ..." },
  { word: "Kleid", display: "Kl___d", gap: "ei", options: ["ei", "ie", "e"], category: "ie-ei", hint: "Ein Kleidungsstück" },
  { word: "Spiegel", display: "Sp___gel", gap: "ie", options: ["ie", "ei", "i"], category: "ie-ei", hint: "Damit siehst du dich" },
  { word: "Reis", display: "R___s", gap: "ei", options: ["ei", "ie", "e"], category: "ie-ei", hint: "Ein Lebensmittel" },

  // ä vs e
  { word: "Bäcker", display: "B___cker", gap: "ä", options: ["ä", "e", "a"], category: "ae-e", hint: "Denke an: backen" },
  { word: "Deckel", display: "D___ckel", gap: "e", options: ["e", "ä", "a"], category: "ae-e", hint: "Kein verwandtes Wort mit a" },
  { word: "Märchen", display: "M___rchen", gap: "ä", options: ["ä", "e", "a"], category: "ae-e", hint: "Denke an: Mär (alte Geschichte)" },
  { word: "Herz", display: "H___rz", gap: "e", options: ["e", "ä", "a"], category: "ae-e", hint: "Kein verwandtes Wort mit a" },
  { word: "Räder", display: "R___der", gap: "ä", options: ["ä", "e", "a"], category: "ae-e", hint: "Denke an: Rad" },
  { word: "Feder", display: "F___der", gap: "e", options: ["e", "ä", "a"], category: "ae-e", hint: "Kein verwandtes Wort mit a" },
  { word: "Käfer", display: "K___fer", gap: "ä", options: ["ä", "e", "a"], category: "ae-e", hint: "Denke an: krabben? Nein — einfach merken!" },
  { word: "Gärten", display: "G___rten", gap: "ä", options: ["ä", "e", "a"], category: "ae-e", hint: "Denke an: Garten" },

  // äu vs eu
  { word: "Bäume", display: "B___me", gap: "äu", options: ["äu", "eu", "au"], category: "aeu-eu", hint: "Denke an: Baum" },
  { word: "Freund", display: "Fr___nd", gap: "eu", options: ["eu", "äu", "au"], category: "aeu-eu", hint: "Kein verwandtes Wort mit au" },
  { word: "Häuser", display: "H___ser", gap: "äu", options: ["äu", "eu", "au"], category: "aeu-eu", hint: "Denke an: Haus" },
  { word: "Kreuz", display: "Kr___z", gap: "eu", options: ["eu", "äu", "au"], category: "aeu-eu", hint: "Kein verwandtes Wort mit au" },
  { word: "träumen", display: "tr___men", gap: "äu", options: ["äu", "eu", "au"], category: "aeu-eu", hint: "Denke an: Traum" },
  { word: "freuen", display: "fr___en", gap: "eu", options: ["eu", "äu", "au"], category: "aeu-eu", hint: "Kein verwandtes Wort mit au" },
  { word: "Räuber", display: "R___ber", gap: "äu", options: ["äu", "eu", "au"], category: "aeu-eu", hint: "Denke an: rauben" },
  { word: "Leute", display: "L___te", gap: "eu", options: ["eu", "äu", "au"], category: "aeu-eu", hint: "Kein verwandtes Wort mit au" },

  // Doppelkonsonanten
  { word: "Sonne", display: "So___e", gap: "nn", options: ["nn", "n", "mm"], category: "doppel", hint: "Kurzer Vokal → doppelter Konsonant" },
  { word: "Wasser", display: "Wa___er", gap: "ss", options: ["ss", "s", "ß"], category: "doppel", hint: "Kurzer Vokal → doppelter Konsonant" },
  { word: "Klasse", display: "Kla___e", gap: "ss", options: ["ss", "s", "ß"], category: "doppel", hint: "Kurzer Vokal → doppelter Konsonant" },
  { word: "rennen", display: "re___en", gap: "nn", options: ["nn", "n", "mm"], category: "doppel", hint: "Kurzer Vokal → doppelter Konsonant" },
  { word: "Sommer", display: "So___er", gap: "mm", options: ["mm", "m", "nn"], category: "doppel", hint: "Kurzer Vokal → doppelter Konsonant" },
  { word: "Tonne", display: "To___e", gap: "nn", options: ["nn", "n", "mm"], category: "doppel", hint: "Kurzer Vokal → doppelter Konsonant" },
  { word: "Butter", display: "Bu___er", gap: "tt", options: ["tt", "t", "dd"], category: "doppel", hint: "Kurzer Vokal → doppelter Konsonant" },

  // Dehnungs-h
  { word: "Fahrrad", display: "F___rad", gap: "ah", options: ["ah", "a", "ar"], category: "dehnungs-h", hint: "Denke an: fahren" },
  { word: "Uhr", display: "___r", gap: "Uh", options: ["Uh", "U", "Ur"], category: "dehnungs-h", hint: "Zeigt die Zeit" },
  { word: "Zahn", display: "Z___n", gap: "ah", options: ["ah", "a", "an"], category: "dehnungs-h", hint: "Im Mund, langer Vokal" },
  { word: "Schuh", display: "Sch___", gap: "uh", options: ["uh", "u", "uch"], category: "dehnungs-h", hint: "Am Fuß, langer Vokal" },
  { word: "fahren", display: "f___ren", gap: "ah", options: ["ah", "a", "ar"], category: "dehnungs-h", hint: "Mit dem Auto ..." },
  { word: "wohnen", display: "w___nen", gap: "oh", options: ["oh", "o", "on"], category: "dehnungs-h", hint: "Zu Hause ..." },
  { word: "Bohne", display: "B___ne", gap: "oh", options: ["oh", "o", "on"], category: "dehnungs-h", hint: "Ein Gemüse, langer Vokal" },

  // Auslautverhärtung (b/d/g am Ende)
  { word: "Hund", display: "Hun___", gap: "d", options: ["d", "t", "dt"], category: "auslaut", hint: "Denke an: Hunde" },
  { word: "Rad", display: "Ra___", gap: "d", options: ["d", "t", "dt"], category: "auslaut", hint: "Denke an: Räder" },
  { word: "Berg", display: "Ber___", gap: "g", options: ["g", "k", "ck"], category: "auslaut", hint: "Denke an: Berge" },
  { word: "gelb", display: "gel___", gap: "b", options: ["b", "p", "pp"], category: "auslaut", hint: "Denke an: gelbe" },
  { word: "Wald", display: "Wal___", gap: "d", options: ["d", "t", "dt"], category: "auslaut", hint: "Denke an: Wälder" },
  { word: "Zwerg", display: "Zwer___", gap: "g", options: ["g", "k", "ck"], category: "auslaut", hint: "Denke an: Zwerge" },
  { word: "Korb", display: "Kor___", gap: "b", options: ["b", "p", "pp"], category: "auslaut", hint: "Denke an: Körbe" },

  // ck vs k, tz vs z
  { word: "Zucker", display: "Zu___er", gap: "ck", options: ["ck", "k", "kk"], category: "ck-tz", hint: "Nach kurzem Vokal: ck" },
  { word: "Katze", display: "Ka___e", gap: "tz", options: ["tz", "z", "zz"], category: "ck-tz", hint: "Nach kurzem Vokal: tz" },
  { word: "Brücke", display: "Brü___e", gap: "ck", options: ["ck", "k", "kk"], category: "ck-tz", hint: "Nach kurzem Vokal: ck" },
  { word: "Stück", display: "Stü___", gap: "ck", options: ["ck", "k", "kk"], category: "ck-tz", hint: "Nach kurzem Vokal: ck" },
  { word: "Platz", display: "Pla___", gap: "tz", options: ["tz", "z", "zz"], category: "ck-tz", hint: "Nach kurzem Vokal: tz" },
  { word: "Decke", display: "De___e", gap: "ck", options: ["ck", "k", "kk"], category: "ck-tz", hint: "Nach kurzem Vokal: ck" },
  { word: "Mütze", display: "Mü___e", gap: "tz", options: ["tz", "z", "zz"], category: "ck-tz", hint: "Nach kurzem Vokal: tz" },

  // ß vs ss
  { word: "Straße", display: "Stra___e", gap: "ß", options: ["ß", "ss", "s"], category: "ss-sz", hint: "Nach langem Vokal: ß" },
  { word: "Wasser", display: "Wa___er", gap: "ss", options: ["ss", "ß", "s"], category: "ss-sz", hint: "Nach kurzem Vokal: ss" },
  { word: "groß", display: "gro___", gap: "ß", options: ["ß", "ss", "s"], category: "ss-sz", hint: "Nach langem Vokal: ß" },
  { word: "Schloss", display: "Schlo___", gap: "ss", options: ["ss", "ß", "s"], category: "ss-sz", hint: "Nach kurzem Vokal: ss" },
  { word: "Fuß", display: "Fu___", gap: "ß", options: ["ß", "ss", "s"], category: "ss-sz", hint: "Nach langem Vokal: ß" },
  { word: "Fluss", display: "Flu___", gap: "ss", options: ["ss", "ß", "s"], category: "ss-sz", hint: "Nach kurzem Vokal: ss" },
  { word: "Spaß", display: "Spa___", gap: "ß", options: ["ß", "ss", "s"], category: "ss-sz", hint: "Nach langem Vokal: ß" },

  // V-Wörter
  { word: "Vogel", display: "___ogel", gap: "V", options: ["V", "F", "W"], category: "v-woerter", hint: "V klingt wie F — einfach merken!" },
  { word: "Vater", display: "___ater", gap: "V", options: ["V", "F", "W"], category: "v-woerter", hint: "V klingt wie F — einfach merken!" },
  { word: "viel", display: "___iel", gap: "v", options: ["v", "f", "w"], category: "v-woerter", hint: "V klingt wie F — einfach merken!" },
  { word: "voll", display: "___oll", gap: "v", options: ["v", "f", "w"], category: "v-woerter", hint: "V klingt wie F — einfach merken!" },
  { word: "vier", display: "___ier", gap: "v", options: ["v", "f", "w"], category: "v-woerter", hint: "Die Zahl 4" },
  { word: "Verein", display: "___erein", gap: "V", options: ["V", "F", "W"], category: "v-woerter", hint: "V klingt wie F — einfach merken!" },
  { word: "vergessen", display: "___ergessen", gap: "v", options: ["v", "f", "w"], category: "v-woerter", hint: "Vorsilbe ver-" },
];

// ── Richtig-oder-Falsch Daten ───────────────────────────────────────────────

const RICHTIG_FALSCH_WORDS = [
  // ie vs ei
  { word: "Biene", correct: true, wrongVersion: "Beine", category: "ie-ei" },
  { word: "Stien", correct: false, wrongVersion: "Stien", correctVersion: "Stein", category: "ie-ei" },
  { word: "spielen", correct: true, wrongVersion: "speilen", category: "ie-ei" },
  { word: "reisen", correct: true, wrongVersion: "riesen", category: "ie-ei" },
  { word: "Teir", correct: false, wrongVersion: "Teir", correctVersion: "Tier", category: "ie-ei" },
  { word: "Kleid", correct: true, wrongVersion: "Klied", category: "ie-ei" },

  // ä vs e
  { word: "Bäcker", correct: true, wrongVersion: "Becker", category: "ae-e" },
  { word: "Merchen", correct: false, wrongVersion: "Merchen", correctVersion: "Märchen", category: "ae-e" },
  { word: "Räder", correct: true, wrongVersion: "Reder", category: "ae-e" },
  { word: "Fäder", correct: false, wrongVersion: "Fäder", correctVersion: "Feder", category: "ae-e" },
  { word: "Gärten", correct: true, wrongVersion: "Gerten", category: "ae-e" },

  // äu vs eu
  { word: "Bäume", correct: true, wrongVersion: "Beume", category: "aeu-eu" },
  { word: "Fräund", correct: false, wrongVersion: "Fräund", correctVersion: "Freund", category: "aeu-eu" },
  { word: "Häuser", correct: true, wrongVersion: "Heuser", category: "aeu-eu" },
  { word: "Kreuz", correct: true, wrongVersion: "Kräuz", category: "aeu-eu" },
  { word: "Räuber", correct: true, wrongVersion: "Reuber", category: "aeu-eu" },

  // Doppelkonsonanten
  { word: "Sonne", correct: true, wrongVersion: "Sone", category: "doppel" },
  { word: "Waßer", correct: false, wrongVersion: "Waßer", correctVersion: "Wasser", category: "doppel" },
  { word: "Klase", correct: false, wrongVersion: "Klase", correctVersion: "Klasse", category: "doppel" },
  { word: "rennen", correct: true, wrongVersion: "renen", category: "doppel" },
  { word: "Somer", correct: false, wrongVersion: "Somer", correctVersion: "Sommer", category: "doppel" },
  { word: "Butter", correct: true, wrongVersion: "Buter", category: "doppel" },

  // Dehnungs-h
  { word: "Fahrrad", correct: true, wrongVersion: "Farrad", category: "dehnungs-h" },
  { word: "Farrad", correct: false, wrongVersion: "Farrad", correctVersion: "Fahrrad", category: "dehnungs-h" },
  { word: "Zahn", correct: true, wrongVersion: "Zan", category: "dehnungs-h" },
  { word: "Schuh", correct: true, wrongVersion: "Schu", category: "dehnungs-h" },
  { word: "wonen", correct: false, wrongVersion: "wonen", correctVersion: "wohnen", category: "dehnungs-h" },
  { word: "Bohne", correct: true, wrongVersion: "Bone", category: "dehnungs-h" },

  // Auslautverhärtung
  { word: "Hund", correct: true, wrongVersion: "Hunt", category: "auslaut" },
  { word: "Rat", correct: false, wrongVersion: "Rat", correctVersion: "Rad", category: "auslaut" },
  { word: "Berg", correct: true, wrongVersion: "Berk", category: "auslaut" },
  { word: "gelp", correct: false, wrongVersion: "gelp", correctVersion: "gelb", category: "auslaut" },
  { word: "Wald", correct: true, wrongVersion: "Walt", category: "auslaut" },

  // ck/tz
  { word: "Zucker", correct: true, wrongVersion: "Zuker", category: "ck-tz" },
  { word: "Kaze", correct: false, wrongVersion: "Kaze", correctVersion: "Katze", category: "ck-tz" },
  { word: "Brücke", correct: true, wrongVersion: "Brüke", category: "ck-tz" },
  { word: "Plaz", correct: false, wrongVersion: "Plaz", correctVersion: "Platz", category: "ck-tz" },
  { word: "Mütze", correct: true, wrongVersion: "Müze", category: "ck-tz" },

  // ß vs ss
  { word: "Straße", correct: true, wrongVersion: "Strasse", category: "ss-sz" },
  { word: "Strasse", correct: false, wrongVersion: "Strasse", correctVersion: "Straße", category: "ss-sz" },
  { word: "groß", correct: true, wrongVersion: "gross", category: "ss-sz" },
  { word: "Schloss", correct: true, wrongVersion: "Schloß", category: "ss-sz" },
  { word: "Fus", correct: false, wrongVersion: "Fus", correctVersion: "Fuß", category: "ss-sz" },
  { word: "Fluss", correct: true, wrongVersion: "Fluß", category: "ss-sz" },

  // V-Wörter
  { word: "Vogel", correct: true, wrongVersion: "Fogel", category: "v-woerter" },
  { word: "Fater", correct: false, wrongVersion: "Fater", correctVersion: "Vater", category: "v-woerter" },
  { word: "viel", correct: true, wrongVersion: "fiel", category: "v-woerter" },
  { word: "foll", correct: false, wrongVersion: "foll", correctVersion: "voll", category: "v-woerter" },
  { word: "vier", correct: true, wrongVersion: "fier", category: "v-woerter" },
];

// ── Kategorien ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'alle', label: 'Alle' },
  { key: 'ie-ei', label: 'ie / ei' },
  { key: 'ae-e', label: 'ä / e' },
  { key: 'aeu-eu', label: 'äu / eu' },
  { key: 'doppel', label: 'Doppelkonsonanten' },
  { key: 'dehnungs-h', label: 'Dehnungs-h' },
  { key: 'auslaut', label: 'Auslautverhärtung' },
  { key: 'ck-tz', label: 'ck / tz' },
  { key: 'ss-sz', label: 'ß / ss' },
  { key: 'v-woerter', label: 'V-Wörter' },
];

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map(c => [c.key, c.label]));

// ── Hilfsfunktionen ─────────────────────────────────────────────────────────

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

/**
 * Generiert eine Session für Lückenwörter
 * Wenn errorWords vorhanden, werden bis zu 3 davon bevorzugt eingemischt
 */
const generateGapSession = (count = 10, filterCategory = null, errorWords = []) => {
  let pool = filterCategory && filterCategory !== 'alle'
    ? GAP_WORDS.filter(w => w.category === filterCategory)
    : [...GAP_WORDS];

  // Include up to 3 previously-wrong words
  const prioritized = [];
  if (errorWords.length > 0) {
    const shuffledErrors = shuffle(errorWords);
    for (const errWord of shuffledErrors) {
      if (prioritized.length >= 3) break;
      const match = pool.find(w => w.word === errWord);
      if (match && !prioritized.some(p => p.word === match.word)) {
        prioritized.push(match);
      }
    }
  }

  // Fill the rest randomly (excluding already picked)
  const prioritizedWords = new Set(prioritized.map(w => w.word));
  const remaining = shuffle(pool.filter(w => !prioritizedWords.has(w.word)))
    .slice(0, count - prioritized.length);

  return shuffle([...prioritized, ...remaining]).map(item => ({
    ...item,
    options: shuffle(item.options),
  }));
};

/**
 * Generiert eine Session für Richtig/Falsch
 */
const generateRFSession = (count = 10, filterCategory = null) => {
  let pool = filterCategory && filterCategory !== 'alle'
    ? RICHTIG_FALSCH_WORDS.filter(w => w.category === filterCategory)
    : [...RICHTIG_FALSCH_WORDS];
  pool = shuffle(pool);
  return pool.slice(0, Math.min(count, pool.length));
};

/**
 * Seite: Deutsch - Rechtschreibung Training
 */
export default function Rechtschreibung() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('rechtschreibung');
  const { errors, addError } = useErrors();

  // Session State
  const [mode, setMode] = useState('gap'); // 'gap' | 'rf' | 'mistakes'
  const [category, setCategory] = useState('alle');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  // Feedback State
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);

  // Streak Modal
  const [showStreakModal, setShowStreakModal] = useState(false);

  const containerRef = useRef(null);

  /**
   * Startet eine neue Session
   */
  const startNewSession = (newMode = mode, cat = category) => {
    setMode(newMode);
    setCategory(cat);

    let q = [];
    if (newMode === 'gap') {
      const spellingErrorWords = errors
        .filter(e => e.type === 'spelling')
        .map(e => e.question);
      q = generateGapSession(10, cat, spellingErrorWords);
    } else if (newMode === 'rf') {
      q = generateRFSession(10, cat);
    } else if (newMode === 'mistakes') {
      const spellingErrors = getSpellingErrors();
      if (spellingErrors.length === 0) return;
      // Build a queue from error words — match them back to GAP_WORDS
      let pool = [];
      for (const errWord of spellingErrors) {
        const match = GAP_WORDS.find(w => w.word === errWord);
        if (match) pool.push(match);
      }
      // If we found fewer than needed, repeat
      if (pool.length === 0) return;
      while (pool.length < 10) {
        pool = [...pool, ...pool];
      }
      q = shuffle(pool).slice(0, 10);
    }

    setQuestions(q);
    setCurrentIndex(0);
    setSessionResults([]);
    setIsSessionComplete(false);
    setCorrectStreak(0);
    setShowFeedback(false);
    setLastAnswer(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    startNewSession('gap', 'alle');
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSessionComplete || showFeedback) return;
      if (!questions[currentIndex]) return;

      if (mode === 'gap' || mode === 'mistakes') {
        const q = questions[currentIndex];
        if (e.key === '1' && q.options?.[0]) handleGapAnswer(q.options[0]);
        if (e.key === '2' && q.options?.[1]) handleGapAnswer(q.options[1]);
        if (e.key === '3' && q.options?.[2]) handleGapAnswer(q.options[2]);
      } else if (mode === 'rf') {
        if (e.key === 'r' || e.key === 'R') handleRFAnswer(true);
        if (e.key === 'f' || e.key === 'F') handleRFAnswer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isSessionComplete, showFeedback, questions, mode]);

  /**
   * Verarbeitet eine Lückenwort-Antwort
   */
  const handleGapAnswer = (chosen) => {
    if (showFeedback || isSessionComplete || questions.length === 0) return;

    const current = questions[currentIndex];
    const correct = chosen === current.gap;
    const timeTaken = (Date.now() - startTime) / 1000;

    const result = {
      type: 'gap',
      word: current.word,
      display: current.display,
      correctAnswer: current.gap,
      userAnswer: chosen,
      correct,
      time: timeTaken,
      category: current.category,
      hint: current.hint,
    };

    setSessionResults(prev => [...prev, result]);
    setLastAnswer({ correct, correctAnswer: current.gap, word: current.word, hint: current.hint, type: 'gap' });
    setShowFeedback(true);

    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
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
    } else {
      addError('spelling', current.word);
      setCorrectStreak(0);
    }

    setTimeout(() => {
      advanceToNext();
    }, correct ? 800 : 2000);
  };

  /**
   * Verarbeitet eine Richtig/Falsch-Antwort
   */
  const handleRFAnswer = (userSaysCorrect) => {
    if (showFeedback || isSessionComplete || questions.length === 0) return;

    const current = questions[currentIndex];
    const correct = userSaysCorrect === current.correct;
    const timeTaken = (Date.now() - startTime) / 1000;

    const shownWord = current.correct ? current.word : current.wrongVersion;
    const rightWord = current.correct ? current.word : (current.correctVersion || current.word);

    const result = {
      type: 'rf',
      word: rightWord,
      shownWord,
      userSaysCorrect,
      wasActuallyCorrect: current.correct,
      correct,
      time: timeTaken,
      category: current.category,
    };

    setSessionResults(prev => [...prev, result]);
    setLastAnswer({
      correct,
      type: 'rf',
      shownWord,
      rightWord,
      wasActuallyCorrect: current.correct,
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
          colors: ['#3b82f6', '#10b981', '#f59e0b'],
        });
        setShowStreakModal(true);
        setCorrectStreak(0);
      }
    } else {
      addError('spelling', rightWord);
      setCorrectStreak(0);
    }

    setTimeout(() => {
      advanceToNext();
    }, correct ? 800 : 2000);
  };

  /**
   * Geht zur nächsten Frage oder beendet die Session
   */
  const advanceToNext = () => {
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
  };

  /**
   * Hole bisherige Rechtschreib-Fehler aus dem Error-Context
   */
  const getSpellingErrors = () => {
    const seen = new Set();
    return errors
      .filter(e => e.type === 'spelling')
      .map(e => e.question)
      .filter(w => {
        if (seen.has(w)) return false;
        seen.add(w);
        return true;
      });
  };

  /**
   * Berechne Statistiken mit Kategorie-Aufschlüsselung
   */
  const calculateStats = () => {
    if (sessionResults.length === 0) return null;

    const correctCount = sessionResults.filter(r => r.correct).length;
    const avgTime = sessionResults.reduce((sum, r) => sum + r.time, 0) / sessionResults.length;
    const mistakes = sessionResults.filter(r => !r.correct);

    // Per-category accuracy
    const byCategory = {};
    for (const result of sessionResults) {
      if (!byCategory[result.category]) {
        byCategory[result.category] = { total: 0, correct: 0 };
      }
      byCategory[result.category].total++;
      if (result.correct) byCategory[result.category].correct++;
    }

    const categoryStats = Object.entries(byCategory).map(([key, val]) => ({
      key,
      label: CATEGORY_LABELS[key] || key,
      percentage: Math.round((val.correct / val.total) * 100),
      correct: val.correct,
      total: val.total,
    }));

    return {
      score: `${correctCount}/${sessionResults.length}`,
      percentage: Math.round((correctCount / sessionResults.length) * 100),
      avgTime: avgTime.toFixed(1),
      mistakes,
      categoryStats,
    };
  };

  const current = questions[currentIndex];
  const stats = calculateStats();
  const spellingErrors = getSpellingErrors();
  const isGapMode = mode === 'gap' || mode === 'mistakes';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Rechtschreibung</h1>

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
            <div className="flex gap-2 items-center flex-wrap mb-3">
              <button
                onClick={() => startNewSession('gap', category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  mode === 'gap'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Lückenwörter
              </button>

              <button
                onClick={() => startNewSession('rf', category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  mode === 'rf'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Richtig oder Falsch
              </button>

              {spellingErrors.length > 0 && (
                <button
                  onClick={() => startNewSession('mistakes', category)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    mode === 'mistakes'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  Fehlerwörter ({spellingErrors.length})
                </button>
              )}
            </div>
          )}

          {/* Kategorie-Auswahl */}
          {!isSessionComplete && (
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => startNewSession(mode, cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    category === cat.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12" ref={containerRef}>
        <TheoryPanel title="Rechtschreib-Regeln">
          <ul>
            <li><strong>Kurzer Vokal</strong> → danach Doppelkonsonant: Sonne, Wasser, Klasse</li>
            <li><strong>Langer Vokal</strong> → oft Dehnungs-h: fahren, Zahn, Uhr</li>
            <li><strong>Langes i</strong> → meistens "ie": Biene, spielen, Tier</li>
            <li><strong>ß</strong> nach langem Vokal: Straße, groß, Fuß</li>
            <li><strong>ss</strong> nach kurzem Vokal: Wasser, Schloss, Fluss</li>
          </ul>
        </TheoryPanel>

        {!isSessionComplete && current ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Wort {currentIndex + 1}/{questions.length}
                </span>
                <span className="text-xs text-gray-400">
                  {isGapMode ? 'Tasten: 1 / 2 / 3' : 'Tasten: R = Richtig, F = Falsch'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* ── Gap Fill Mode ── */}
            {isGapMode && (
              <div className="text-center mb-8">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  {CATEGORY_LABELS[current.category] || current.category}
                </div>

                {/* Word with gap */}
                <div className={`text-5xl sm:text-6xl font-bold mb-6 tracking-wide transition-colors duration-200 ${
                  showFeedback
                    ? lastAnswer?.correct ? 'text-green-600' : 'text-red-600'
                    : 'text-gray-800'
                }`}>
                  {showFeedback && lastAnswer?.correct ? (
                    current.word
                  ) : showFeedback && !lastAnswer?.correct ? (
                    <span>
                      {current.word}
                    </span>
                  ) : (
                    <span>
                      {current.display.split('___').map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="inline-block mx-1 border-b-4 border-blue-400 w-12 sm:w-16" />
                          )}
                        </span>
                      ))}
                    </span>
                  )}
                </div>

                {/* Feedback */}
                {showFeedback && (
                  <div className={`text-xl font-semibold mb-4 ${lastAnswer?.correct ? 'text-green-600' : 'text-red-600'}`}>
                    {lastAnswer?.correct ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" /> Richtig!
                      </span>
                    ) : (
                      <div>
                        <span className="flex items-center justify-center gap-2 mb-1">
                          <X className="w-5 h-5" /> Falsch — richtig ist: <span className="font-bold">{lastAnswer?.correctAnswer}</span>
                        </span>
                        {lastAnswer?.hint && (
                          <div className="text-sm text-gray-500 mt-2">
                            Tipp: {lastAnswer.hint}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Option Buttons */}
                <div className="flex gap-4 justify-center">
                  {current.options.map((option, idx) => (
                    <button
                      key={option}
                      onClick={() => handleGapAnswer(option)}
                      disabled={showFeedback}
                      className={`min-w-[5rem] px-6 py-4 text-xl font-bold rounded-xl transition-all duration-150
                        ${showFeedback && option === current.gap
                          ? 'bg-green-500 text-white ring-4 ring-green-300'
                          : showFeedback && option === lastAnswer?.userAnswer && !lastAnswer?.correct
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }
                        disabled:cursor-not-allowed
                        focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2
                        active:scale-95`}
                    >
                      {option}
                      <div className="text-xs opacity-70 mt-1">{idx + 1}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Richtig oder Falsch Mode ── */}
            {mode === 'rf' && (
              <div className="text-center mb-8">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  {CATEGORY_LABELS[current.category] || current.category}
                </div>

                {/* Shown word */}
                <div className={`text-5xl sm:text-6xl font-bold mb-2 tracking-wide transition-colors duration-200 ${
                  showFeedback
                    ? lastAnswer?.correct ? 'text-green-600' : 'text-red-600'
                    : 'text-gray-800'
                }`}>
                  {current.correct ? current.word : current.wrongVersion}
                </div>

                <div className="text-lg text-gray-500 mb-8">
                  Ist dieses Wort richtig geschrieben?
                </div>

                {/* Feedback */}
                {showFeedback && (
                  <div className={`text-xl font-semibold mb-6 ${lastAnswer?.correct ? 'text-green-600' : 'text-red-600'}`}>
                    {lastAnswer?.correct ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" /> Richtig erkannt!
                      </span>
                    ) : (
                      <div>
                        <span className="flex items-center justify-center gap-2 mb-1">
                          <X className="w-5 h-5" /> Leider falsch.
                        </span>
                        <div className="text-gray-700 mt-1">
                          {lastAnswer?.wasActuallyCorrect
                            ? <span>Das Wort <span className="font-bold">{lastAnswer.shownWord}</span> ist richtig geschrieben.</span>
                            : <span>Richtig wäre: <span className="font-bold">{lastAnswer.rightWord}</span></span>
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Richtig / Falsch Buttons */}
                <div className="flex gap-6 justify-center">
                  <button
                    onClick={() => handleRFAnswer(true)}
                    disabled={showFeedback}
                    className={`flex items-center gap-2 px-8 py-5 text-xl font-bold rounded-xl transition-all duration-150
                      ${showFeedback && current.correct
                        ? 'bg-green-500 text-white ring-4 ring-green-300'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                      }
                      disabled:cursor-not-allowed
                      focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2
                      active:scale-95`}
                  >
                    <Check className="w-6 h-6" />
                    Richtig
                    <span className="text-xs opacity-70 ml-1">(R)</span>
                  </button>

                  <button
                    onClick={() => handleRFAnswer(false)}
                    disabled={showFeedback}
                    className={`flex items-center gap-2 px-8 py-5 text-xl font-bold rounded-xl transition-all duration-150
                      ${showFeedback && !current.correct
                        ? 'bg-green-500 text-white ring-4 ring-green-300'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                      }
                      disabled:cursor-not-allowed
                      focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-offset-2
                      active:scale-95`}
                  >
                    <X className="w-6 h-6" />
                    Falsch
                    <span className="text-xs opacity-70 ml-1">(F)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Screen Reader */}
            {showFeedback && (
              <div className="sr-only" aria-live="polite" role="status">
                {lastAnswer?.correct
                  ? 'Richtig!'
                  : `Falsch. Die richtige Antwort ist ${lastAnswer?.correctAnswer || lastAnswer?.rightWord}`}
              </div>
            )}
          </div>
        ) : isSessionComplete && stats ? (
          /* ── Session Summary ── */
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
              <div className="text-lg text-gray-600 mb-8">
                Durchschnittszeit: {stats.avgTime}s
              </div>

              {/* Per-category breakdown */}
              {stats.categoryStats.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Ergebnis nach Kategorie:
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {stats.categoryStats.map((cat) => (
                      <div
                        key={cat.key}
                        className={`rounded-lg px-4 py-3 ${
                          cat.percentage >= 80
                            ? 'bg-green-100 text-green-700'
                            : cat.percentage >= 50
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <div className="text-sm font-semibold">{cat.label}</div>
                        <div className="text-xl font-bold">{cat.percentage}%</div>
                        <div className="text-xs">{cat.correct}/{cat.total}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mistakes list */}
              {stats.mistakes.length > 0 && (
                <div className="mb-8 text-left bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Zum Merken:
                  </h3>
                  <ul className="space-y-2">
                    {stats.mistakes.map((m, idx) => (
                      <li key={idx} className="text-gray-700">
                        {m.type === 'gap' ? (
                          <span>
                            • <span className="font-bold">{m.word}</span>
                            {' '}<span className="text-red-600">(du: {m.userAnswer}, richtig: {m.correctAnswer})</span>
                            {m.hint && <span className="text-gray-400 text-sm ml-2">— {m.hint}</span>}
                          </span>
                        ) : (
                          <span>
                            • <span className="font-bold">{m.word}</span>
                            {' '}<span className="text-red-600">
                              ({m.userSaysCorrect ? 'du: richtig' : 'du: falsch'}, war: {m.wasActuallyCorrect ? 'richtig' : 'falsch'})
                            </span>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <SessionRating />

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center flex-wrap">
                {stats.mistakes.length > 0 && (
                  <button
                    onClick={() => startNewSession('mistakes', category)}
                    className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Fehlerwörter üben
                  </button>
                )}

                <button
                  onClick={() => startNewSession('gap', category)}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Neue Session
                </button>
              </div>
            </div>
          </div>
        ) : null}
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
              Du bist ein Rechtschreib-Profi!
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
