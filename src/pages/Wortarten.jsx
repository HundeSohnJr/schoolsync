import { useState, useEffect } from 'react';
import { useStreak, useProgress } from '../context/AppContext';
import { Flame, Check, X, Circle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * Satz-Datenbank für Klasse 3
 */
const SENTENCES = [
  {
    id: 1,
    text: "Der schnelle Hund läuft über die Wiese.",
    words: [
      { word: "Der", type: null },
      { word: "schnelle", type: "adjektiv" },
      { word: "Hund", type: "nomen" },
      { word: "läuft", type: "verb" },
      { word: "über", type: null },
      { word: "die", type: null },
      { word: "Wiese", type: "nomen" }
    ]
  },
  {
    id: 2,
    text: "Das kleine Mädchen singt ein fröhliches Lied.",
    words: [
      { word: "Das", type: null },
      { word: "kleine", type: "adjektiv" },
      { word: "Mädchen", type: "nomen" },
      { word: "singt", type: "verb" },
      { word: "ein", type: null },
      { word: "fröhliches", type: "adjektiv" },
      { word: "Lied", type: "nomen" }
    ]
  },
  {
    id: 3,
    text: "Der mutige Junge klettert auf den hohen Baum.",
    words: [
      { word: "Der", type: null },
      { word: "mutige", type: "adjektiv" },
      { word: "Junge", type: "nomen" },
      { word: "klettert", type: "verb" },
      { word: "auf", type: null },
      { word: "den", type: null },
      { word: "hohen", type: "adjektiv" },
      { word: "Baum", type: "nomen" }
    ]
  },
  {
    id: 4,
    text: "Die rote Blume wächst im bunten Garten.",
    words: [
      { word: "Die", type: null },
      { word: "rote", type: "adjektiv" },
      { word: "Blume", type: "nomen" },
      { word: "wächst", type: "verb" },
      { word: "im", type: null },
      { word: "bunten", type: "adjektiv" },
      { word: "Garten", type: "nomen" }
    ]
  },
  {
    id: 5,
    text: "Ein großer Vogel fliegt über den blauen Himmel.",
    words: [
      { word: "Ein", type: null },
      { word: "großer", type: "adjektiv" },
      { word: "Vogel", type: "nomen" },
      { word: "fliegt", type: "verb" },
      { word: "über", type: null },
      { word: "den", type: null },
      { word: "blauen", type: "adjektiv" },
      { word: "Himmel", type: "nomen" }
    ]
  },
  {
    id: 6,
    text: "Das lustige Kind spielt mit dem neuen Ball.",
    words: [
      { word: "Das", type: null },
      { word: "lustige", type: "adjektiv" },
      { word: "Kind", type: "nomen" },
      { word: "spielt", type: "verb" },
      { word: "mit", type: null },
      { word: "dem", type: null },
      { word: "neuen", type: "adjektiv" },
      { word: "Ball", type: "nomen" }
    ]
  },
  {
    id: 7,
    text: "Der alte Lehrer erklärt die schwierige Aufgabe.",
    words: [
      { word: "Der", type: null },
      { word: "alte", type: "adjektiv" },
      { word: "Lehrer", type: "nomen" },
      { word: "erklärt", type: "verb" },
      { word: "die", type: null },
      { word: "schwierige", type: "adjektiv" },
      { word: "Aufgabe", type: "nomen" }
    ]
  },
  {
    id: 8,
    text: "Eine kleine Katze schläft auf dem weichen Kissen.",
    words: [
      { word: "Eine", type: null },
      { word: "kleine", type: "adjektiv" },
      { word: "Katze", type: "nomen" },
      { word: "schläft", type: "verb" },
      { word: "auf", type: null },
      { word: "dem", type: null },
      { word: "weichen", type: "adjektiv" },
      { word: "Kissen", type: "nomen" }
    ]
  },
  {
    id: 9,
    text: "Der starke Wind weht durch die dunklen Wolken.",
    words: [
      { word: "Der", type: null },
      { word: "starke", type: "adjektiv" },
      { word: "Wind", type: "nomen" },
      { word: "weht", type: "verb" },
      { word: "durch", type: null },
      { word: "die", type: null },
      { word: "dunklen", type: "adjektiv" },
      { word: "Wolken", type: "nomen" }
    ]
  },
  {
    id: 10,
    text: "Die freundliche Lehrerin liest eine spannende Geschichte.",
    words: [
      { word: "Die", type: null },
      { word: "freundliche", type: "adjektiv" },
      { word: "Lehrerin", type: "nomen" },
      { word: "liest", type: "verb" },
      { word: "eine", type: null },
      { word: "spannende", type: "adjektiv" },
      { word: "Geschichte", type: "nomen" }
    ]
  },
  {
    id: 11,
    text: "Die hungrige Katze frisst den frischen Fisch.",
    words: [
      { word: "Die", type: null },
      { word: "hungrige", type: "adjektiv" },
      { word: "Katze", type: "nomen" },
      { word: "frisst", type: "verb" },
      { word: "den", type: null },
      { word: "frischen", type: "adjektiv" },
      { word: "Fisch", type: "nomen" }
    ]
  },
  {
    id: 12,
    text: "Ein fleißiger Schüler schreibt in das dicke Heft.",
    words: [
      { word: "Ein", type: null },
      { word: "fleißiger", type: "adjektiv" },
      { word: "Schüler", type: "nomen" },
      { word: "schreibt", type: "verb" },
      { word: "in", type: null },
      { word: "das", type: null },
      { word: "dicke", type: "adjektiv" },
      { word: "Heft", type: "nomen" }
    ]
  },
  {
    id: 13,
    text: "Der braune Hase hüpft über den niedrigen Zaun.",
    words: [
      { word: "Der", type: null },
      { word: "braune", type: "adjektiv" },
      { word: "Hase", type: "nomen" },
      { word: "hüpft", type: "verb" },
      { word: "über", type: null },
      { word: "den", type: null },
      { word: "niedrigen", type: "adjektiv" },
      { word: "Zaun", type: "nomen" }
    ]
  },
  {
    id: 14,
    text: "Die nette Mutter backt einen leckeren Kuchen.",
    words: [
      { word: "Die", type: null },
      { word: "nette", type: "adjektiv" },
      { word: "Mutter", type: "nomen" },
      { word: "backt", type: "verb" },
      { word: "einen", type: null },
      { word: "leckeren", type: "adjektiv" },
      { word: "Kuchen", type: "nomen" }
    ]
  },
  {
    id: 15,
    text: "Das bunte Pferd galoppiert über die grüne Wiese.",
    words: [
      { word: "Das", type: null },
      { word: "bunte", type: "adjektiv" },
      { word: "Pferd", type: "nomen" },
      { word: "galoppiert", type: "verb" },
      { word: "über", type: null },
      { word: "die", type: null },
      { word: "grüne", type: "adjektiv" },
      { word: "Wiese", type: "nomen" }
    ]
  },
  {
    id: 16,
    text: "Der liebe Opa erzählt eine lustige Geschichte.",
    words: [
      { word: "Der", type: null },
      { word: "liebe", type: "adjektiv" },
      { word: "Opa", type: "nomen" },
      { word: "erzählt", type: "verb" },
      { word: "eine", type: null },
      { word: "lustige", type: "adjektiv" },
      { word: "Geschichte", type: "nomen" }
    ]
  },
  {
    id: 17,
    text: "Ein schneller Läufer gewinnt den goldenen Pokal.",
    words: [
      { word: "Ein", type: null },
      { word: "schneller", type: "adjektiv" },
      { word: "Läufer", type: "nomen" },
      { word: "gewinnt", type: "verb" },
      { word: "den", type: null },
      { word: "goldenen", type: "adjektiv" },
      { word: "Pokal", type: "nomen" }
    ]
  },
  {
    id: 18,
    text: "Die warme Sonne scheint auf den stillen See.",
    words: [
      { word: "Die", type: null },
      { word: "warme", type: "adjektiv" },
      { word: "Sonne", type: "nomen" },
      { word: "scheint", type: "verb" },
      { word: "auf", type: null },
      { word: "den", type: null },
      { word: "stillen", type: "adjektiv" },
      { word: "See", type: "nomen" }
    ]
  },
  {
    id: 19,
    text: "Das wilde Eichhörnchen sammelt die braunen Nüsse.",
    words: [
      { word: "Das", type: null },
      { word: "wilde", type: "adjektiv" },
      { word: "Eichhörnchen", type: "nomen" },
      { word: "sammelt", type: "verb" },
      { word: "die", type: null },
      { word: "braunen", type: "adjektiv" },
      { word: "Nüsse", type: "nomen" }
    ]
  },
  {
    id: 20,
    text: "Der große Bruder hilft bei der schweren Aufgabe.",
    words: [
      { word: "Der", type: null },
      { word: "große", type: "adjektiv" },
      { word: "Bruder", type: "nomen" },
      { word: "hilft", type: "verb" },
      { word: "bei", type: null },
      { word: "der", type: null },
      { word: "schweren", type: "adjektiv" },
      { word: "Aufgabe", type: "nomen" }
    ]
  },
  {
    id: 21,
    text: "Eine schlaue Füchsin versteckt die kleinen Jungen.",
    words: [
      { word: "Eine", type: null },
      { word: "schlaue", type: "adjektiv" },
      { word: "Füchsin", type: "nomen" },
      { word: "versteckt", type: "verb" },
      { word: "die", type: null },
      { word: "kleinen", type: "adjektiv" },
      { word: "Jungen", type: "nomen" }
    ]
  },
  {
    id: 22,
    text: "Der kalte Regen tropft auf das nasse Dach.",
    words: [
      { word: "Der", type: null },
      { word: "kalte", type: "adjektiv" },
      { word: "Regen", type: "nomen" },
      { word: "tropft", type: "verb" },
      { word: "auf", type: null },
      { word: "das", type: null },
      { word: "nasse", type: "adjektiv" },
      { word: "Dach", type: "nomen" }
    ]
  },
  {
    id: 23,
    text: "Die junge Schwester malt ein buntes Bild.",
    words: [
      { word: "Die", type: null },
      { word: "junge", type: "adjektiv" },
      { word: "Schwester", type: "nomen" },
      { word: "malt", type: "verb" },
      { word: "ein", type: null },
      { word: "buntes", type: "adjektiv" },
      { word: "Bild", type: "nomen" }
    ]
  },
  {
    id: 24,
    text: "Das zahme Kaninchen knabbert an der frischen Möhre.",
    words: [
      { word: "Das", type: null },
      { word: "zahme", type: "adjektiv" },
      { word: "Kaninchen", type: "nomen" },
      { word: "knabbert", type: "verb" },
      { word: "an", type: null },
      { word: "der", type: null },
      { word: "frischen", type: "adjektiv" },
      { word: "Möhre", type: "nomen" }
    ]
  },
  {
    id: 25,
    text: "Der laute Donner erschreckt den kleinen Hund.",
    words: [
      { word: "Der", type: null },
      { word: "laute", type: "adjektiv" },
      { word: "Donner", type: "nomen" },
      { word: "erschreckt", type: "verb" },
      { word: "den", type: null },
      { word: "kleinen", type: "adjektiv" },
      { word: "Hund", type: "nomen" }
    ]
  },
  {
    id: 26,
    text: "Ein lustiger Clown zeigt einen tollen Trick.",
    words: [
      { word: "Ein", type: null },
      { word: "lustiger", type: "adjektiv" },
      { word: "Clown", type: "nomen" },
      { word: "zeigt", type: "verb" },
      { word: "einen", type: null },
      { word: "tollen", type: "adjektiv" },
      { word: "Trick", type: "nomen" }
    ]
  },
  {
    id: 27,
    text: "Die kluge Eule sitzt auf dem alten Ast.",
    words: [
      { word: "Die", type: null },
      { word: "kluge", type: "adjektiv" },
      { word: "Eule", type: "nomen" },
      { word: "sitzt", type: "verb" },
      { word: "auf", type: null },
      { word: "dem", type: null },
      { word: "alten", type: "adjektiv" },
      { word: "Ast", type: "nomen" }
    ]
  },
  {
    id: 28,
    text: "Der nette Vater kocht eine heiße Suppe.",
    words: [
      { word: "Der", type: null },
      { word: "nette", type: "adjektiv" },
      { word: "Vater", type: "nomen" },
      { word: "kocht", type: "verb" },
      { word: "eine", type: null },
      { word: "heiße", type: "adjektiv" },
      { word: "Suppe", type: "nomen" }
    ]
  },
  {
    id: 29,
    text: "Das flinke Reh springt über den breiten Bach.",
    words: [
      { word: "Das", type: null },
      { word: "flinke", type: "adjektiv" },
      { word: "Reh", type: "nomen" },
      { word: "springt", type: "verb" },
      { word: "über", type: null },
      { word: "den", type: null },
      { word: "breiten", type: "adjektiv" },
      { word: "Bach", type: "nomen" }
    ]
  },
  {
    id: 30,
    text: "Die hellen Sterne leuchten am dunklen Himmel.",
    words: [
      { word: "Die", type: null },
      { word: "hellen", type: "adjektiv" },
      { word: "Sterne", type: "nomen" },
      { word: "leuchten", type: "verb" },
      { word: "am", type: null },
      { word: "dunklen", type: "adjektiv" },
      { word: "Himmel", type: "nomen" }
    ]
  },
  {
    id: 31,
    text: "Ein frecher Papagei ruft durch das offene Fenster.",
    words: [
      { word: "Ein", type: null },
      { word: "frecher", type: "adjektiv" },
      { word: "Papagei", type: "nomen" },
      { word: "ruft", type: "verb" },
      { word: "durch", type: null },
      { word: "das", type: null },
      { word: "offene", type: "adjektiv" },
      { word: "Fenster", type: "nomen" }
    ]
  },
  {
    id: 32,
    text: "Die süße Erdbeere wächst im sonnigen Beet.",
    words: [
      { word: "Die", type: null },
      { word: "süße", type: "adjektiv" },
      { word: "Erdbeere", type: "nomen" },
      { word: "wächst", type: "verb" },
      { word: "im", type: null },
      { word: "sonnigen", type: "adjektiv" },
      { word: "Beet", type: "nomen" }
    ]
  },
  {
    id: 33,
    text: "Der tapfere Ritter reitet auf dem schwarzen Pferd.",
    words: [
      { word: "Der", type: null },
      { word: "tapfere", type: "adjektiv" },
      { word: "Ritter", type: "nomen" },
      { word: "reitet", type: "verb" },
      { word: "auf", type: null },
      { word: "dem", type: null },
      { word: "schwarzen", type: "adjektiv" },
      { word: "Pferd", type: "nomen" }
    ]
  },
  {
    id: 34,
    text: "Das schüchterne Mädchen bastelt eine schöne Karte.",
    words: [
      { word: "Das", type: null },
      { word: "schüchterne", type: "adjektiv" },
      { word: "Mädchen", type: "nomen" },
      { word: "bastelt", type: "verb" },
      { word: "eine", type: null },
      { word: "schöne", type: "adjektiv" },
      { word: "Karte", type: "nomen" }
    ]
  },
  {
    id: 35,
    text: "Der weiße Schneemann steht in dem kalten Garten.",
    words: [
      { word: "Der", type: null },
      { word: "weiße", type: "adjektiv" },
      { word: "Schneemann", type: "nomen" },
      { word: "steht", type: "verb" },
      { word: "in", type: null },
      { word: "dem", type: null },
      { word: "kalten", type: "adjektiv" },
      { word: "Garten", type: "nomen" }
    ]
  },
  {
    id: 36,
    text: "Die neugierige Maus knabbert an dem harten Käse.",
    words: [
      { word: "Die", type: null },
      { word: "neugierige", type: "adjektiv" },
      { word: "Maus", type: "nomen" },
      { word: "knabbert", type: "verb" },
      { word: "an", type: null },
      { word: "dem", type: null },
      { word: "harten", type: "adjektiv" },
      { word: "Käse", type: "nomen" }
    ]
  },
  {
    id: 37,
    text: "Ein langsamer Igel wandert durch den dichten Wald.",
    words: [
      { word: "Ein", type: null },
      { word: "langsamer", type: "adjektiv" },
      { word: "Igel", type: "nomen" },
      { word: "wandert", type: "verb" },
      { word: "durch", type: null },
      { word: "den", type: null },
      { word: "dichten", type: "adjektiv" },
      { word: "Wald", type: "nomen" }
    ]
  },
  {
    id: 38,
    text: "Der beste Freund bringt ein tolles Geschenk.",
    words: [
      { word: "Der", type: null },
      { word: "beste", type: "adjektiv" },
      { word: "Freund", type: "nomen" },
      { word: "bringt", type: "verb" },
      { word: "ein", type: null },
      { word: "tolles", type: "adjektiv" },
      { word: "Geschenk", type: "nomen" }
    ]
  },
  {
    id: 39,
    text: "Die gelbe Ente schwimmt auf dem ruhigen Teich.",
    words: [
      { word: "Die", type: null },
      { word: "gelbe", type: "adjektiv" },
      { word: "Ente", type: "nomen" },
      { word: "schwimmt", type: "verb" },
      { word: "auf", type: null },
      { word: "dem", type: null },
      { word: "ruhigen", type: "adjektiv" },
      { word: "Teich", type: "nomen" }
    ]
  },
  {
    id: 40,
    text: "Das müde Baby trinkt die warme Milch.",
    words: [
      { word: "Das", type: null },
      { word: "müde", type: "adjektiv" },
      { word: "Baby", type: "nomen" },
      { word: "trinkt", type: "verb" },
      { word: "die", type: null },
      { word: "warme", type: "adjektiv" },
      { word: "Milch", type: "nomen" }
    ]
  }
];

/**
 * Wortarten-Konfiguration
 */
const WORD_TYPES = {
  nomen: { 
    label: 'Nomen', 
    color: 'blue', 
    bgLight: 'bg-blue-200', 
    textDark: 'text-blue-900',
    bgButton: 'bg-blue-500',
    emoji: '🔵'
  },
  verb: { 
    label: 'Verben', 
    color: 'red', 
    bgLight: 'bg-red-200', 
    textDark: 'text-red-900',
    bgButton: 'bg-red-500',
    emoji: '🔴'
  },
  adjektiv: { 
    label: 'Adjektive', 
    color: 'green', 
    bgLight: 'bg-green-200', 
    textDark: 'text-green-900',
    bgButton: 'bg-green-500',
    emoji: '🟢'
  }
};

/**
 * Seite: Deutsch - Wortarten
 */
export default function Wortarten() {
  const { streak, updateStreak } = useStreak();
  const { increment } = useProgress('wortarten');
  
  // Session State
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [selectedBrush, setSelectedBrush] = useState(null);
  const [userMarks, setUserMarks] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  
  // Streak Modal
  const [showStreakModal, setShowStreakModal] = useState(false);
  
  const currentSentence = SENTENCES[currentSentenceIndex];

  /**
   * Handler für Wort-Klick
   */
  const handleWordClick = (wordIndex) => {
    if (isChecked) return; // Keine Änderungen nach Prüfung
    
    if (!selectedBrush) {
      // Zeige Hinweis: Bitte Pinsel wählen
      return;
    }
    
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
    const results = currentSentence.words.map((wordData, index) => {
      const userType = userMarks[index];
      const correctType = wordData.type;
      
      // Artikel/Präpositionen müssen NICHT markiert werden
      if (correctType === null) {
        return { correct: userType === null, shouldBeMarked: false, correctType: null };
      }
      
      // Wortarten müssen korrekt markiert sein
      return { 
        correct: userType === correctType, 
        shouldBeMarked: true, 
        correctType,
        userType 
      };
    });
    
    const allCorrect = results.every(r => r.correct);
    
    if (allCorrect) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      
      // 10 perfekte Sätze!
      if (newStreak === 10) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#ef4444', '#10b981'],
        });
        setShowStreakModal(true);
        setCorrectStreak(0);
      }
    } else {
      setCorrectStreak(0);
    }
    
    setIsChecked(true);
    setSessionResults([...sessionResults, { 
      sentenceIndex: currentSentenceIndex, 
      correct: allCorrect,
      results
    }]);
    
    const nextProgress = sessionProgress + 1;
    setSessionProgress(nextProgress);
    
    if (nextProgress >= 10) {
      setIsSessionComplete(true);
      increment();
      updateStreak();
    }
  };

  /**
   * Nächster Satz
   */
  const handleNext = () => {
    if (isSessionComplete) {
      // Neue Session starten
      setCurrentSentenceIndex(0);
      setSessionProgress(0);
      setSessionResults([]);
      setIsSessionComplete(false);
      setCorrectStreak(0);
    } else {
      // Nächster Satz in aktueller Session
      setCurrentSentenceIndex((currentSentenceIndex + 1) % SENTENCES.length);
    }
    
    setUserMarks([]);
    setIsChecked(false);
    setSelectedBrush(null);
  };

  /**
   * Berechne Statistiken
   */
  const calculateStats = () => {
    if (sessionResults.length === 0) return null;
    
    let total = 0;
    let correct = 0;
    const byType = {
      nomen: { correct: 0, total: 0 },
      verb: { correct: 0, total: 0 },
      adjektiv: { correct: 0, total: 0 }
    };
    
    sessionResults.forEach(result => {
      result.results.forEach(r => {
        if (r.shouldBeMarked) {
          total++;
          if (r.correct) correct++;
          
          // Pro Wortart
          if (r.correctType && byType[r.correctType]) {
            byType[r.correctType].total++;
            if (r.correct) byType[r.correctType].correct++;
          }
        }
      });
    });
    
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    // Beste und schwächste Wortart
    let best = null;
    let weakest = null;
    Object.keys(byType).forEach(type => {
      if (byType[type].total > 0) {
        const perc = Math.round((byType[type].correct / byType[type].total) * 100);
        byType[type].percentage = perc;
        
        if (!best || perc > byType[best].percentage) best = type;
        if (!weakest || perc < byType[weakest].percentage) weakest = type;
      }
    });
    
    return { total, correct, percentage, byType, best, weakest };
  };

  /**
   * Keyboard Navigation
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '1') setSelectedBrush('nomen');
      if (e.key === '2') setSelectedBrush('verb');
      if (e.key === '3') setSelectedBrush('adjektiv');
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const stats = isSessionComplete ? calculateStats() : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Wortarten</h1>
            
            <div className="flex items-center gap-4">
              {/* Correct Streak */}
              {correctStreak > 0 && (
                <div className="text-sm font-semibold text-green-600">
                  ✓ {correctStreak}/10 Sätze perfekt
                </div>
              )}
              
              {/* Tages-Streak */}
              <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg">
                <Flame className="w-5 h-5" aria-hidden="true" />
                <span className="font-semibold">{streak} Tage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {!isSessionComplete ? (
          /* Session läuft */
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Fortschrittsanzeige */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Aufgabe {sessionProgress + 1}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((sessionProgress + 1) / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Aufgabentext */}
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-700 mb-4">
                Markiere die Wortarten:
              </p>
            </div>

            {/* Pinsel-Auswahl */}
            <div className="flex gap-3 mb-8 justify-center">
              {Object.entries(WORD_TYPES).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => !isChecked && setSelectedBrush(type)}
                  disabled={isChecked}
                  className={`min-h-14 px-8 text-lg font-semibold rounded-lg transition-all ${
                    config.bgButton
                  } text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    selectedBrush === type ? 'ring-4 ring-gray-400 scale-105' : ''
                  } ${isChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={`${config.label}-Pinsel (${config.color})`}
                >
                  {config.emoji} {config.label}
                </button>
              ))}
            </div>

            {/* Satz mit Wörtern */}
            <div className="mb-8 min-h-32">
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {currentSentence.words.map((wordData, index) => {
                  const userMark = userMarks[index];
                  const wordConfig = userMark ? WORD_TYPES[userMark] : null;
                  
                  // Feedback nach Prüfung
                  let feedbackIcon = null;
                  let showFeedback = false;
                  if (isChecked) {
                    const result = sessionResults[sessionResults.length - 1]?.results[index];
                    if (result) {
                      if (result.shouldBeMarked) {
                        feedbackIcon = result.correct ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />;
                        showFeedback = !result.correct;
                      } else if (result.correct && !userMark) {
                        // Korrekt nicht markiert (Artikel/Präposition)
                        feedbackIcon = <Check className="w-4 h-4 text-green-600" />;
                      } else if (!result.correct && userMark) {
                        // Falsch markiert (sollte nicht markiert sein)
                        feedbackIcon = <X className="w-4 h-4 text-red-600" />;
                        showFeedback = true;
                      }
                    }
                  }
                  
                  return (
                    <div key={index} className="relative">
                      <button
                        onClick={() => handleWordClick(index)}
                        disabled={isChecked}
                        className={`text-2xl font-medium px-4 py-2 rounded-lg transition-all ${
                          wordConfig
                            ? `${wordConfig.bgLight} ${wordConfig.textDark}`
                            : 'bg-transparent hover:bg-gray-100'
                        } ${isChecked ? 'cursor-default' : 'cursor-pointer'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                        aria-label={`${wordData.word}${userMark ? `, markiert als ${WORD_TYPES[userMark].label}` : ''}`}
                      >
                        {wordData.word}
                        {feedbackIcon && (
                          <span className="ml-2 inline-block">{feedbackIcon}</span>
                        )}
                      </button>
                      
                      {/* Fehler-Hinweis (ÜBER dem Wort, um Überlappung zu vermeiden) */}
                      {showFeedback && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-xs text-gray-600 whitespace-nowrap bg-white px-2 py-1 rounded shadow-md border border-gray-300">
                          {sessionResults[sessionResults.length - 1]?.results[index]?.correctType ? (
                            <>Richtig: {WORD_TYPES[sessionResults[sessionResults.length - 1].results[index].correctType].label}</>
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

            {/* Feedback & Button */}
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
                  <div className="mb-6">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      Alles richtig! ✓
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="text-xl font-semibold text-gray-700">
                      {(() => {
                        const result = sessionResults[sessionResults.length - 1];
                        const correctCount = result.results.filter(r => r.correct && r.shouldBeMarked).length;
                        const totalCount = result.results.filter(r => r.shouldBeMarked).length;
                        return `${correctCount} von ${totalCount} richtig`;
                      })()}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleNext}
                  className="px-12 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {sessionProgress >= 10 ? 'Zusammenfassung ansehen →' : 'Nächster Satz →'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Session beendet - Zusammenfassung */
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Wortarten-Training beendet
              </h2>

              {stats && (
                <>
                  {/* Gesamt-Score */}
                  <div className="mb-8">
                    <div className="text-5xl font-bold text-gray-800 mb-2">
                      {stats.correct} von {stats.total}
                    </div>
                    <div className="text-2xl text-gray-600 mb-4">
                      Das sind {stats.percentage}% ✓
                    </div>
                  </div>

                  {/* Pro Wortart */}
                  {stats.best && stats.weakest && (
                    <div className="mb-8 space-y-3">
                      <div className="text-lg">
                        <span className="font-semibold text-green-600">Am besten:</span>{' '}
                        {WORD_TYPES[stats.best].label} ({stats.byType[stats.best].percentage}%)
                      </div>
                      <div className="text-lg">
                        <span className="font-semibold text-orange-600">Üben:</span>{' '}
                        {WORD_TYPES[stats.weakest].label} ({stats.byType[stats.weakest].percentage}%)
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Button */}
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Neue Session
              </button>
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
              10 Sätze ohne Fehler!
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Wahnsinn! Du bist ein Wortarten-Profi! 🎉
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
