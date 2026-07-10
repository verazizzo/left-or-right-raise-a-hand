import React, { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import per Tema e RTL di Material UI
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
// import { prefixer } from 'stylis';
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

const cacheLtr = createCache({
  key: 'mui',
});

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin], 
});

function AppContent() {
  const { language, mode } = useSettings();
  const isRtl = language === 'ar';

  const theme = useMemo(() => createTheme({
    direction: isRtl ? 'rtl' : 'ltr',
    palette: {
      mode: mode,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            overflowX: 'hidden', 
            width: '100%',       
            overflowY: 'scroll', 
          },
          '#root': {
            overflowX: 'hidden', 
            width: '100%',
          }
        },
      },
    },


  }), [isRtl, mode]);

  return (
    <CacheProvider value={isRtl ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> 
        
        <div className="app-container" dir={isRtl ? 'rtl' : 'ltr'} style={{ overflowX: 'hidden', width: '100%' }}>
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

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}