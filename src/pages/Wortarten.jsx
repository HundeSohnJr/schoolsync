import { useState, useEffect } from 'react';
import { useStreak, useProgress } from '../context/AppContext';
import { Flame, Check, X, Circle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import TheoryPanel from '../components/TheoryPanel';

/**
 * Satz-Datenbank für Klasse 3
 */
const SENTENCES = [
  {
    id: 1,
    text: "Der lustige Loki rennt durch den großen Garten.",
    words: [
      { word: "Der", type: null },
      { word: "lustige", type: "adjektiv" },
      { word: "Loki", type: "nomen" },
      { word: "rennt", type: "verb" },
      { word: "durch", type: null },
      { word: "den", type: null },
      { word: "großen", type: "adjektiv" },
      { word: "Garten", type: "nomen" }
    ]
  },
  {
    id: 2,
    text: "Fina turnt an dem hohen Reck bei der TSG Bürstadt.",
    words: [
      { word: "Fina", type: "nomen" },
      { word: "turnt", type: "verb" },
      { word: "an", type: null },
      { word: "dem", type: null },
      { word: "hohen", type: "adjektiv" },
      { word: "Reck", type: "nomen" },
      { word: "bei", type: null },
      { word: "der", type: null },
      { word: "TSG", type: "nomen" },
      { word: "Bürstadt", type: "nomen" }
    ]
  },
  {
    id: 3,
    text: "Mama Anastasia kocht eine leckere Suppe.",
    words: [
      { word: "Mama", type: "nomen" },
      { word: "Anastasia", type: "nomen" },
      { word: "kocht", type: "verb" },
      { word: "eine", type: null },
      { word: "leckere", type: "adjektiv" },
      { word: "Suppe", type: "nomen" }
    ]
  },
  {
    id: 4,
    text: "Der kleine Elvis schläft auf dem weichen Sofa.",
    words: [
      { word: "Der", type: null },
      { word: "kleine", type: "adjektiv" },
      { word: "Elvis", type: "nomen" },
      { word: "schläft", type: "verb" },
      { word: "auf", type: null },
      { word: "dem", type: null },
      { word: "weichen", type: "adjektiv" },
      { word: "Sofa", type: "nomen" }
    ]
  },
  {
    id: 5,
    text: "Papa Philipp liest ein spannendes Buch.",
    words: [
      { word: "Papa", type: "nomen" },
      { word: "Philipp", type: "nomen" },
      { word: "liest", type: "verb" },
      { word: "ein", type: null },
      { word: "spannendes", type: "adjektiv" },
      { word: "Buch", type: "nomen" }
    ]
  },
  {
    id: 6,
    text: "Fina und Loki spielen im sonnigen Garten.",
    words: [
      { word: "Fina", type: "nomen" },
      { word: "und", type: null },
      { word: "Loki", type: "nomen" },
      { word: "spielen", type: "verb" },
      { word: "im", type: null },
      { word: "sonnigen", type: "adjektiv" },
      { word: "Garten", type: "nomen" }
    ]
  },
  {
    id: 7,
    text: "Oma Angelika backt einen süßen Kuchen.",
    words: [
      { word: "Oma", type: "nomen" },
      { word: "Angelika", type: "nomen" },
      { word: "backt", type: "verb" },
      { word: "einen", type: null },
      { word: "süßen", type: "adjektiv" },
      { word: "Kuchen", type: "nomen" }
    ]
  },
  {
    id: 8,
    text: "Der starke Wind weht über die Dächer von Bürstadt.",
    words: [
      { word: "Der", type: null },
      { word: "starke", type: "adjektiv" },
      { word: "Wind", type: "nomen" },
      { word: "weht", type: "verb" },
      { word: "über", type: null },
      { word: "die", type: null },
      { word: "Dächer", type: "nomen" },
      { word: "von", type: null },
      { word: "Bürstadt", type: "nomen" }
    ]
  },
  {
    id: 9,
    text: "Tante Kathi bringt ein tolles Geschenk.",
    words: [
      { word: "Tante", type: "nomen" },
      { word: "Kathi", type: "nomen" },
      { word: "bringt", type: "verb" },
      { word: "ein", type: null },
      { word: "tolles", type: "adjektiv" },
      { word: "Geschenk", type: "nomen" }
    ]
  },
  {
    id: 10,
    text: "Fina macht einen schönen Handstand in der Turnhalle.",
    words: [
      { word: "Fina", type: "nomen" },
      { word: "macht", type: "verb" },
      { word: "einen", type: null },
      { word: "schönen", type: "adjektiv" },
      { word: "Handstand", type: "nomen" },
      { word: "in", type: null },
      { word: "der", type: null },
      { word: "Turnhalle", type: "nomen" }
    ]
  },
  {
    id: 11,
    text: "Opa Roland erzählt eine lustige Geschichte.",
    words: [
      { word: "Opa", type: "nomen" },
      { word: "Roland", type: "nomen" },
      { word: "erzählt", type: "verb" },
      { word: "eine", type: null },
      { word: "lustige", type: "adjektiv" },
      { word: "Geschichte", type: "nomen" }
    ]
  },
  {
    id: 12,
    text: "Die beiden Hunde fressen das leckere Futter.",
    words: [
      { word: "Die", type: null },
      { word: "beiden", type: "adjektiv" },
      { word: "Hunde", type: "nomen" },
      { word: "fressen", type: "verb" },
      { word: "das", type: null },
      { word: "leckere", type: "adjektiv" },
      { word: "Futter", type: "nomen" }
    ]
  },
  {
    id: 13,
    text: "Fina schreibt einen langen Text in das neue Heft.",
    words: [
      { word: "Fina", type: "nomen" },
      { word: "schreibt", type: "verb" },
      { word: "einen", type: null },
      { word: "langen", type: "adjektiv" },
      { word: "Text", type: "nomen" },
      { word: "in", type: null },
      { word: "das", type: null },
      { word: "neue", type: "adjektiv" },
      { word: "Heft", type: "nomen" }
    ]
  },
  {
    id: 14,
    text: "Oma Katja singt ein fröhliches Lied.",
    words: [
      { word: "Oma", type: "nomen" },
      { word: "Katja", type: "nomen" },
      { word: "singt", type: "verb" },
      { word: "ein", type: null },
      { word: "fröhliches", type: "adjektiv" },
      { word: "Lied", type: "nomen" }
    ]
  },
  {
    id: 15,
    text: "Loki und Elvis jagen den bunten Ball.",
    words: [
      { word: "Loki", type: "nomen" },
      { word: "und", type: null },
      { word: "Elvis", type: "nomen" },
      { word: "jagen", type: "verb" },
      { word: "den", type: null },
      { word: "bunten", type: "adjektiv" },
      { word: "Ball", type: "nomen" }
    ]
  },
  {
    id: 16,
    text: "Onkel Robin spielt ein lustiges Spiel mit Fina.",
    words: [
      { word: "Onkel", type: "nomen" },
      { word: "Robin", type: "nomen" },
      { word: "spielt", type: "verb" },
      { word: "ein", type: null },
      { word: "lustiges", type: "adjektiv" },
      { word: "Spiel", type: "nomen" },
      { word: "mit", type: null },
      { word: "Fina", type: "nomen" }
    ]
  },
  {
    id: 17,
    text: "Die warme Sonne scheint auf den Spielplatz in Bürstadt.",
    words: [
      { word: "Die", type: null },
      { word: "warme", type: "adjektiv" },
      { word: "Sonne", type: "nomen" },
      { word: "scheint", type: "verb" },
      { word: "auf", type: null },
      { word: "den", type: null },
      { word: "Spielplatz", type: "nomen" },
      { word: "in", type: null },
      { word: "Bürstadt", type: "nomen" }
    ]
  },
  {
    id: 18,
    text: "Fina malt ein buntes Bild von Loki.",
    words: [
      { word: "Fina", type: "nomen" },
      { word: "malt", type: "verb" },
      { word: "ein", type: null },
      { word: "buntes", type: "adjektiv" },
      { word: "Bild", type: "nomen" },
      { word: "von", type: null },
      { word: "Loki", type: "nomen" }
    ]
  },
  {
    id: 19,
    text: "Papa Philipp kocht eine heiße Suppe im Winter.",
    words: [
      { word: "Papa", type: "nomen" },
      { word: "Philipp", type: "nomen" },
      { word: "kocht", type: "verb" },
      { word: "eine", type: null },
      { word: "heiße", type: "adjektiv" },
      { word: "Suppe", type: "nomen" },
      { word: "im", type: null },
      { word: "Winter", type: "nomen" }
    ]
  },
  {
    id: 20,
    text: "Der freche Loki klaut den alten Schuh.",
    words: [
      { word: "Der", type: null },
      { word: "freche", type: "adjektiv" },
      { word: "Loki", type: "nomen" },
      { word: "klaut", type: "verb" },
      { word: "den", type: null },
      { word: "alten", type: "adjektiv" },
      { word: "Schuh", type: "nomen" }
    ]
  },
  {
    id: 21,
    text: "Fina springt über den hohen Kasten beim Turnen.",
    words: [
      { word: "Fina", type: "nomen" },
      { word: "springt", type: "verb" },
      { word: "über", type: null },
      { word: "den", type: null },
      { word: "hohen", type: "adjektiv" },
      { word: "Kasten", type: "nomen" },
      { word: "beim", type: null },
      { word: "Turnen", type: "nomen" }
    ]
  },
  {
    id: 22,
    text: "Opa Dima zeigt Fina ein altes Foto.",
    words: [
      { word: "Opa", type: "nomen" },
      { word: "Dima", type: "nomen" },
      { word: "zeigt", type: "verb" },
      { word: "Fina", type: "nomen" },
      { word: "ein", type: null },
      { word: "altes", type: "adjektiv" },
      { word: "Foto", type: "nomen" }
    ]
  },
  {
    id: 23,
    text: "Der müde Elvis liegt auf der warmen Decke.",
    words: [
      { word: "Der", type: null },
      { word: "müde", type: "adjektiv" },
      { word: "Elvis", type: "nomen" },
      { word: "liegt", type: "verb" },
      { word: "auf", type: null },
      { word: "der", type: null },
      { word: "warmen", type: "adjektiv" },
      { word: "Decke", type: "nomen" }
    ]
  },
  {
    id: 24,
    text: "Mama Anastasia liest eine spannende Geschichte.",
    words: [
      { word: "Mama", type: "nomen" },
      { word: "Anastasia", type: "nomen" },
      { word: "liest", type: "verb" },
      { word: "eine", type: null },
      { word: "spannende", type: "adjektiv" },
      { word: "Geschichte", type: "nomen" }
    ]
  },
  {
    id: 25,
    text: "Fina fährt mit dem schnellen Fahrrad durch Bürstadt.",
    words: [
      { word: "Fina", type: "nomen" },
      { word: "fährt", type: "verb" },
      { word: "mit", type: null },
      { word: "dem", type: null },
      { word: "schnellen", type: "adjektiv" },
      { word: "Fahrrad", type: "nomen" },
      { word: "durch", type: null },
      { word: "Bürstadt", type: "nomen" }
    ]
  },
  {
    id: 26,
    text: "Der kalte Regen fällt auf die Straßen von Bürstadt.",
    words: [
      { word: "Der", type: null },
      { word: "kalte", type: "adjektiv" },
      { word: "Regen", type: "nomen" },
      { word: "fällt", type: "verb" },
      { word: "auf", type: null },
      { word: "die", type: null },
      { word: "Straßen", type: "nomen" },
      { word: "von", type: null },
      { word: "Bürstadt", type: "nomen" }
    ]
  },
  {
    id: 27,
    text: "Fina und Mama backen die kleinen Plätzchen.",
    words: [
      { word: "Fina", type: "nomen" },
      { word: "und", type: null },
      { word: "Mama", type: "nomen" },
      { word: "backen", type: "verb" },
      { word: "die", type: null },
      { word: "kleinen", type: "adjektiv" },
      { word: "Plätzchen", type: "nomen" }
    ]
  },
  {
    id: 28,
    text: "Loki bellt den neugierigen Briefträger an.",
    words: [
      { word: "Loki", type: "nomen" },
      { word: "bellt", type: "verb" },
      { word: "den", type: null },
      { word: "neugierigen", type: "adjektiv" },
      { word: "Briefträger", type: "nomen" },
      { word: "an", type: null }
    ]
  },
  {
    id: 29,
    text: "Tante Kathi und Onkel Robin besuchen die fröhliche Familie.",
    words: [
      { word: "Tante", type: "nomen" },
      { word: "Kathi", type: "nomen" },
      { word: "und", type: null },
      { word: "Onkel", type: "nomen" },
      { word: "Robin", type: "nomen" },
      { word: "besuchen", type: "verb" },
      { word: "die", type: null },
      { word: "fröhliche", type: "adjektiv" },
      { word: "Familie", type: "nomen" }
    ]
  },
  {
    id: 30,
    text: "Die hellen Sterne leuchten über dem Haus in Bürstadt.",
    words: [
      { word: "Die", type: null },
      { word: "hellen", type: "adjektiv" },
      { word: "Sterne", type: "nomen" },
      { word: "leuchten", type: "verb" },
      { word: "über", type: null },
      { word: "dem", type: null },
      { word: "Haus", type: "nomen" },
      { word: "in", type: null },
      { word: "Bürstadt", type: "nomen" }
    ]
  },
  {
    id: 31,
    text: "Fina streichelt den braven Elvis auf dem Kopf.",
    words: [
      { word: "Fina", type: "nomen" },
      { word: "streichelt", type: "verb" },
      { word: "den", type: null },
      { word: "braven", type: "adjektiv" },
      { word: "Elvis", type: "nomen" },
      { word: "auf", type: null },
      { word: "dem", type: null },
      { word: "Kopf", type: "nomen" }
    ]
  },
  {
    id: 32,
    text: "Oma Angelika und Opa Roland kommen zu Besuch nach Bürstadt.",
    words: [
      { word: "Oma", type: "nomen" },
      { word: "Angelika", type: "nomen" },
      { word: "und", type: null },
      { word: "Opa", type: "nomen" },
      { word: "Roland", type: "nomen" },
      { word: "kommen", type: "verb" },
      { word: "zu", type: null },
      { word: "Besuch", type: "nomen" },
      { word: "nach", type: null },
      { word: "Bürstadt", type: "nomen" }
    ]
  },
  {
    id: 33,
    text: "Papa baut ein stabiles Regal im Zimmer.",
    words: [
      { word: "Papa", type: "nomen" },
      { word: "baut", type: "verb" },
      { word: "ein", type: null },
      { word: "stabiles", type: "adjektiv" },
      { word: "Regal", type: "nomen" },
      { word: "im", type: null },
      { word: "Zimmer", type: "nomen" }
    ]
  },
  {
    id: 34,
    text: "Der weiße Schnee bedeckt den ganzen Garten.",
    words: [
      { word: "Der", type: null },
      { word: "weiße", type: "adjektiv" },
      { word: "Schnee", type: "nomen" },
      { word: "bedeckt", type: "verb" },
      { word: "den", type: null },
      { word: "ganzen", type: "adjektiv" },
      { word: "Garten", type: "nomen" }
    ]
  },
  {
    id: 35,
    text: "Fina lernt eine neue Übung am niedrigen Schwebebalken.",
    words: [
      { word: "Fina", type: "nomen" },
      { word: "lernt", type: "verb" },
      { word: "eine", type: null },
      { word: "neue", type: "adjektiv" },
      { word: "Übung", type: "nomen" },
      { word: "am", type: null },
      { word: "niedrigen", type: "adjektiv" },
      { word: "Schwebebalken", type: "nomen" }
    ]
  },
  {
    id: 36,
    text: "Loki und Elvis trinken das frische Wasser.",
    words: [
      { word: "Loki", type: "nomen" },
      { word: "und", type: null },
      { word: "Elvis", type: "nomen" },
      { word: "trinken", type: "verb" },
      { word: "das", type: null },
      { word: "frische", type: "adjektiv" },
      { word: "Wasser", type: "nomen" }
    ]
  },
  {
    id: 37,
    text: "Fina bastelt eine bunte Karte für Oma Katja.",
    words: [
      { word: "Fina", type: "nomen" },
      { word: "bastelt", type: "verb" },
      { word: "eine", type: null },
      { word: "bunte", type: "adjektiv" },
      { word: "Karte", type: "nomen" },
      { word: "für", type: null },
      { word: "Oma", type: "nomen" },
      { word: "Katja", type: "nomen" }
    ]
  },
  {
    id: 38,
    text: "Die fleißige Fina löst die schwierige Aufgabe in der Schule.",
    words: [
      { word: "Die", type: null },
      { word: "fleißige", type: "adjektiv" },
      { word: "Fina", type: "nomen" },
      { word: "löst", type: "verb" },
      { word: "die", type: null },
      { word: "schwierige", type: "adjektiv" },
      { word: "Aufgabe", type: "nomen" },
      { word: "in", type: null },
      { word: "der", type: null },
      { word: "Schule", type: "nomen" }
    ]
  },
  {
    id: 39,
    text: "Der wilde Loki springt über den breiten Bach.",
    words: [
      { word: "Der", type: null },
      { word: "wilde", type: "adjektiv" },
      { word: "Loki", type: "nomen" },
      { word: "springt", type: "verb" },
      { word: "über", type: null },
      { word: "den", type: null },
      { word: "breiten", type: "adjektiv" },
      { word: "Bach", type: "nomen" }
    ]
  },
  {
    id: 40,
    text: "Die ganze Familie geht an den schönen See im Sommer.",
    words: [
      { word: "Die", type: null },
      { word: "ganze", type: "adjektiv" },
      { word: "Familie", type: "nomen" },
      { word: "geht", type: "verb" },
      { word: "an", type: null },
      { word: "den", type: null },
      { word: "schönen", type: "adjektiv" },
      { word: "See", type: "nomen" },
      { word: "im", type: null },
      { word: "Sommer", type: "nomen" }
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
  
  // Shuffle sentences into a session queue
  const generateQueue = () => {
    return [...SENTENCES].sort(() => Math.random() - 0.5).slice(0, 10);
  };

  // Session State
  const [sessionQueue, setSessionQueue] = useState(generateQueue);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [selectedBrush, setSelectedBrush] = useState(null);
  const [userMarks, setUserMarks] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Streak Modal
  const [showStreakModal, setShowStreakModal] = useState(false);

  const currentSentence = sessionQueue[currentQueueIndex];

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
      setSessionQueue(generateQueue());
      setCurrentQueueIndex(0);
      setSessionProgress(0);
      setSessionResults([]);
      setIsSessionComplete(false);
      setCorrectStreak(0);
    } else {
      // Nächster Satz in aktueller Session
      setCurrentQueueIndex(currentQueueIndex + 1);
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
        <TheoryPanel title="Wortarten erkennen">
          <ul>
            <li><strong>Nomen (blau):</strong> Menschen, Tiere, Dinge, Gefühle. Immer großgeschrieben! Test: Kann man "der/die/das" davor setzen?</li>
            <li><strong>Verben (rot):</strong> Was man tun kann. Test: Kann man "ich..." davor setzen? (ich laufe, ich spiele)</li>
            <li><strong>Adjektive (grün):</strong> Wie etwas ist. Test: Wie ist es? (schnell, groß, lustig)</li>
            <li><strong>Artikel und Präpositionen</strong> werden NICHT markiert!</li>
          </ul>
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
