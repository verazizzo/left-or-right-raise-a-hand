import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipi di font e impostazioni supportate
export type FontSizeOption = 'small' | 'medium' | 'large';
export type LanguageOption = 'it' | 'en' | 'es';
export type ViewModeOption = 'web' | 'mobile';

// Struttura dei dati del Context (TypeScript ora sa che esistono tutte queste variabili)
interface SettingsContextType {
  language: LanguageOption;
  fontSize: FontSizeOption;
  viewMode: ViewModeOption;
  setLanguage: (lang: LanguageOption) => void;
  setFontSize: (size: FontSizeOption) => void;
  setViewMode: (mode: ViewModeOption) => void;
  forceMobile: boolean;
  toggleForceMobile: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Carica le impostazioni iniziali dal localStorage o usa i default
  const [language, setLang] = useState<LanguageOption>(() => {
    return (localStorage.getItem('app_lang') as LanguageOption) || 'it';
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
        setLanguage, 
        setFontSize, 
        setViewMode,
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