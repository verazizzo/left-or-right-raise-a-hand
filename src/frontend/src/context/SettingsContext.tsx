import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipi di font e impostazioni supportate
export type FontSizeOption = 'small' | 'medium' | 'large';
export type LanguageOption = 'it' | 'en' | 'es' | 'ar';
export type ViewModeOption = 'web' | 'mobile';
export type ModeOption = 'light' | 'dark';

// Struttura dei dati del Context (TypeScript ora sa che esistono tutte queste variabili)
interface SettingsContextType {
  language: LanguageOption;
  fontSize: FontSizeOption;
  viewMode: ViewModeOption;
  mode: ModeOption;
  setLanguage: (lang: LanguageOption) => void;
  setFontSize: (size: FontSizeOption) => void;
  setViewMode: (mode: ViewModeOption) => void;
  toggleColorMode: () => void;
  forceMobile: boolean;
  toggleForceMobile: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Carica le impostazioni iniziali dal localStorage o usa i default
  const [language, setLang] = useState<LanguageOption>(() => {
    // 1. Prova a vedere se c'è una scelta salvata
    const saved = localStorage.getItem('app_lang');
    if (saved) return saved as LanguageOption;

    // 2. Se non c'è, guarda la lingua del browser (es. "it-IT" -> "it")
    const browserLang = navigator.language.split('-')[0];
    
    // Verifica se la lingua del browser è supportata (it, en, es)
    if (['it', 'en', 'es', 'ar'].includes(browserLang)) {
      return browserLang as LanguageOption;
    }

    // 3. Default finale
    return 'it';
  });

  const [fontSize, setFont] = useState<FontSizeOption>(() => {
    return (localStorage.getItem('app_fontsize') as FontSizeOption) || 'medium';
  });

  const [viewMode, setViewModeState] = useState<ViewModeOption>(() => {
    return (localStorage.getItem('app_view_mode') as ViewModeOption) || 'web';
  });

  const [forceMobile, setForceMobile] = useState<boolean>(() => {
    const saved = localStorage.getItem('force_mobile');
    return saved === 'true';
  });

  const setLanguage = (lang: LanguageOption) => {
    setLang(lang);
    localStorage.setItem('app_lang', lang);
  };

  const setFontSize = (size: FontSizeOption) => {
    setFont(size);
    localStorage.setItem('app_fontsize', size);
  };

  const setViewMode = (mode: ViewModeOption) => {
    setViewModeState(mode);
    localStorage.setItem('app_view_mode', mode);
  };

  const toggleForceMobile = () => {
    setForceMobile(prev => {
      const newVal = !prev;
      localStorage.setItem('force_mobile', newVal.toString());
      return newVal;
    });
  };

  // --- MAGIA PER IL TEMA ---
  // AL PRIMO ACCESSO USO IL TEMA DI SISTEMA, POI ACCEDO, SCELGO IL TEMA, E SE FACCIO IL LOGOUT SI MANTIENE QUEL TEMA
  // Stato del tema con logica "sistema o salvato"
  const [mode, setMode] = useState<ModeOption>(() => {
    const saved = localStorage.getItem('theme_mode');
    if (saved) return saved as ModeOption;
    // Se non salvato, controlla il sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Funzione per cambiare tema
  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme_mode', next);
      return next;
    });
  };

  // --- NUOVA MAGIA PER RTL (ARABO) ---
  // Imposta la direzione dell'HTML in base alla lingua
  useEffect(() => {
    const isRtl = language === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // --- LA MAGIA PER IL FONT SIZE ---
  // Questo useEffect "ascolta" ogni volta che cambia fontSize e aggiorna la radice dell'HTML.
  // Material UI usa i "rem", quindi cambiando la radice scaliamo tutta l'app istantaneamente!
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (fontSize === 'small') {
      htmlElement.style.fontSize = '14px'; // ~87.5% della grandezza normale
    } else if (fontSize === 'large') {
      htmlElement.style.fontSize = '18px'; // ~112.5% della grandezza normale
    } else {
      htmlElement.style.fontSize = '16px'; // 100% (Default di sistema)
    }
  }, [fontSize]);
  // ---------------------------------

  return (
    <SettingsContext.Provider 
      value={{ 
        language, 
        fontSize, 
        viewMode, 
        forceMobile, 
        mode,
        setLanguage, 
        setFontSize, 
        setViewMode,
        toggleColorMode,
        toggleForceMobile
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// Hook pronto all'uso nei componenti
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve essere usato all\'interno di un SettingsProvider');
  }
  return context;
};