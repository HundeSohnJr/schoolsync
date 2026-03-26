import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SchriftlichRechnen from './pages/SchriftlichRechnen';
import Einmaleins from './pages/Einmaleins';
import Wortarten from './pages/Wortarten';
import Einstellungen from './pages/Einstellungen';

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
          <Route path="/" element={<Navigate to="/schriftlich-rechnen" replace />} />
          
          {/* Hauptrouten */}
          <Route path="/schriftlich-rechnen" element={<SchriftlichRechnen />} />
          <Route path="/einmaleins" element={<Einmaleins />} />
          <Route path="/wortarten" element={<Wortarten />} />
          <Route path="/einstellungen" element={<Einstellungen />} />
          
          {/* Fallback für unbekannte Routen */}
          <Route path="*" element={<Navigate to="/schriftlich-rechnen" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
