import { Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import About from './pages/About';
import GlobalAnalysis from './pages/GlobalAnalysis';
import Home from './pages/Home';
import Patients from './pages/Patients';
import Comparison from './pages/Comparison';
import Settings from './pages/Setting';

// 1. IMPORTA IL PROVIDER DELLE IMPOSTAZIONI
import { SettingsProvider } from './context/SettingsContext';



export default function App() {
  return (
    // 2. AVVOLGI L'INTERA APP CON IL PROVIDER
    <SettingsProvider>
      <div className="app-container">
        <Routes>
          <Route path="/register" element={<SignUp />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/homepage" element={<Home />} />
          <Route path="/about" element={<About />} /> 
          <Route path="/global-analysis" element={<GlobalAnalysis />} /> 
          <Route path="/patients" element={<Patients />} /> 
          <Route path="/comparison" element={<Comparison />} /> 
          <Route path="/settings" element={<Settings />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </SettingsProvider>
  );
}