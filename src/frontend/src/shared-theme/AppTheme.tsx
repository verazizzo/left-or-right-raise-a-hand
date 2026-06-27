import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import { inputsCustomizations } from './customizations/inputs';
import { dataDisplayCustomizations } from './customizations/dataDisplay';
import { feedbackCustomizations } from './customizations/feedback';
import { navigationCustomizations } from './customizations/navigation';
import { surfacesCustomizations } from './customizations/surfaces';
import { colorSchemes, typography, shadows, shape } from './themePrimitives';
import { useSettings } from '../context/SettingsContext';

interface AppThemeProps {
  children: React.ReactNode;
  disableCustomTheme?: boolean;
  themeComponents?: ThemeOptions['components'];
}

export default function AppTheme(props: AppThemeProps) {
  const { children, disableCustomTheme, themeComponents } = props;
  
  // ESTRAIAMO LA LINGUA PER APPLICARE LA MATEMATICA PERFETTA
  const { forceMobile, mode, language } = useSettings();
  const isRtl = language === 'ar';

  const theme = React.useMemo(() => {
    return disableCustomTheme
      ? {}
      : createTheme({
          colorSchemes: {
            light: colorSchemes.light,
            dark: colorSchemes.dark,
          },
          defaultColorScheme: mode,
          breakpoints: {
            values: forceMobile
              ? { xs: 0, sm: 600, md: 10000, lg: 10000, xl: 10000 }
              : { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
          },
          cssVariables: {
            colorSchemeSelector: 'data-mui-color-scheme',
            cssVarPrefix: 'template',
          },
          typography,
          shadows,
          shape,
          components: {

          MuiCssBaseline: {
            styleOverrides: forceMobile ? `
              body { background-color: #8d9498 !important;
              overflow-y: scroll !important; /* La barra non sparirà mai, niente salti! */
              margin: 0 !important;
              padding: 0 !important;}

              #root {
                width: 100%;
                max-width: 430px; 
                min-height: 100vh;
                margin: 0 auto;
                background-color: var(--template-palette-background-default, #ffffff);
                box-shadow: 0px 0px 50px rgba(0,0,0,0.5); 
                clip-path: inset(0) !important;
                scrollbar-gutter: stable !important;
              }

              /* === AGGIUNGI QUI IL TRUCCO PER NASCONDERE LA BARRA === */
              #root, main {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important; 
              }
              #root::-webkit-scrollbar, main::-webkit-scrollbar {
                display: none !important;
              }

              @media (min-width: 431px) {
                
                #root {
                  /* @noflip */
                  margin-left: calc(50vw - 215px) !important;
                  /* @noflip */
                  margin-right: auto !important;
                }

                .MuiAppBar-root {
                  max-width: 430px !important;
                  /* @noflip */
                  left: calc(50vw - 215px) !important;
                  /* @noflip */
                  right: auto !important;
                }

                .MuiDrawer-root.MuiModal-root {
                  /* La maschera calcolata rigorosamente sulle distanze assolute:
                     inset(top right bottom left) */
                  /* @noflip */
                  clip-path: inset(0 calc(100% - 50vw - 215px) 0 calc(50vw - 215px)) !important;
                }

                .MuiDrawer-paper {
                  /* LA MATEMATICA PERFETTA:
                     In Arabo (RTL) il menu si attacca a sinistra: 50vw - 215px.
                     In Italiano (LTR) il menu si attacca a destra: 50vw - 45px.
                     Ignoriamo completamente il lato "right" per non subire l'influenza della scrollbar! */
                  /* @noflip */
                  left: ${isRtl ? 'calc(50vw - 215px)' : 'calc(50vw - 45px)'} !important;
                  /* @noflip */
                  right: auto !important;
                }
              }
            ` : ``, 
          },
            ...inputsCustomizations,
            ...dataDisplayCustomizations,
            ...feedbackCustomizations,
            ...navigationCustomizations,
            ...surfacesCustomizations,
            ...themeComponents,
          },
        });
  }, [disableCustomTheme, themeComponents, forceMobile, mode, isRtl]); // Ricalcola in tempo reale se cambi lingua

  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}