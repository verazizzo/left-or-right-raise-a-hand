import React, { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';

import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import UpdatePassword from './pages/UpdatePassword';
import About from './pages/About';
import GlobalAnalysis from './pages/GlobalAnalysis';
import Home from './pages/Home';
import Patients from './pages/Patients';
import Comparison from './pages/Comparison';
import Profile from './pages/Profile';
import Help from './pages/Help';
import ScrollToTop from './components/ScrollToTop';

import { SettingsProvider, useSettings } from './context/SettingsContext';

// 1. CREAZIONE DELLE DUE CACHE CSS
const cacheLtr = createCache({
  key: 'mui',
});

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin], 
});

// 2. CREIAMO UN COMPONENTE INTERNO PER POTER USARE "useSettings"
function AppContent() {
  const { language, mode } = useSettings();
  const isRtl = language === 'ar';

  const theme = useMemo(() => createTheme({
    direction: isRtl ? 'rtl' : 'ltr',
    palette: {
      mode: mode,
    },
  }), [isRtl, mode]);

  return (
    <CacheProvider value={isRtl ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> 
        
        <div className="app-container" dir={isRtl ? 'rtl' : 'ltr'}>
          <ScrollToTop />
          <Routes>
            <Route path="/register" element={<SignUp />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/homepage" element={<Home />} />
            <Route path="/about" element={<About />} /> 
            <Route path="/global-analysis" element={<GlobalAnalysis />} /> 
            <Route path="/patients" element={<Patients />} /> 
            <Route path="/comparison" element={<Comparison />} /> 
            <Route path="/help" element={<Help />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}

// 3. APP PRINCIPALE CHE WRAPPA TUTTO
export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}