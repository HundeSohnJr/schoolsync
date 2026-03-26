import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SchriftlichRechnen from './pages/SchriftlichRechnen';
import Einmaleins from './pages/Einmaleins';
import Wortarten from './pages/Wortarten';
import Einstellungen from './pages/Einstellungen';
import DerDieDas from './pages/DerDieDas';
import Satzglieder from './pages/Satzglieder';
import Rechtschreibung from './pages/Rechtschreibung';
import Kopfrechnen from './pages/Kopfrechnen';
import Uhrzeit from './pages/Uhrzeit';
import EinzahlMehrzahl from './pages/EinzahlMehrzahl';
import Satzarten from './pages/Satzarten';
import Silbentrennung from './pages/Silbentrennung';
import Zeitformen from './pages/Zeitformen';
import Steigerung from './pages/Steigerung';

/**
 * Haupt-App-Komponente mit React Router
 * Definiert alle Routen und das Layout
 */
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Standardroute: Umleitung zur ersten Seite */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Hauptrouten */}
          <Route path="/schriftlich-rechnen" element={<SchriftlichRechnen />} />
          <Route path="/einmaleins" element={<Einmaleins />} />
          <Route path="/wortarten" element={<Wortarten />} />
          <Route path="/der-die-das" element={<DerDieDas />} />
          <Route path="/satzglieder" element={<Satzglieder />} />
          <Route path="/rechtschreibung" element={<Rechtschreibung />} />
          <Route path="/kopfrechnen" element={<Kopfrechnen />} />
          <Route path="/uhrzeit" element={<Uhrzeit />} />
          <Route path="/einzahl-mehrzahl" element={<EinzahlMehrzahl />} />
          <Route path="/satzarten" element={<Satzarten />} />
          <Route path="/silbentrennung" element={<Silbentrennung />} />
          <Route path="/zeitformen" element={<Zeitformen />} />
          <Route path="/steigerung" element={<Steigerung />} />
          <Route path="/einstellungen" element={<Einstellungen />} />
          
          {/* Fallback für unbekannte Routen */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
