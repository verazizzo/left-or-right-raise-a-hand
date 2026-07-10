import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSizeOption = 'small' | 'medium' | 'large';
export type LanguageOption = 'it' | 'en' | 'es' | 'ar';
export type ViewModeOption = 'web' | 'mobile';
export type ModeOption = 'light' | 'dark';

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
  const [language, setLang] = useState<LanguageOption>(() => {
    const saved = localStorage.getItem('app_lang');
    if (saved) return saved as LanguageOption;

    const browserLang = navigator.language.split('-')[0];
    
    if (['it', 'en', 'es', 'ar'].includes(browserLang)) {
      return browserLang as LanguageOption;
    }

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

  const [mode, setMode] = useState<ModeOption>(() => {
    const saved = localStorage.getItem('theme_mode');
    if (saved) return saved as ModeOption;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme_mode', next);
      return next;
    });
  };

  useEffect(() => {
    const isRtl = language === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (fontSize === 'small') {
      htmlElement.style.fontSize = '14px';
    } else if (fontSize === 'large') {
      htmlElement.style.fontSize = '18px'; 
    } else {
      htmlElement.style.fontSize = '16px'; 
    }
  }, [fontSize]);

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

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve essere usato all\'interno di un SettingsProvider');
  }
  return context;
};