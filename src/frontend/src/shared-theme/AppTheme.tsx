import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import { inputsCustomizations } from './customizations/inputs';
import { dataDisplayCustomizations } from './customizations/dataDisplay';
import { feedbackCustomizations } from './customizations/feedback';
import { navigationCustomizations } from './customizations/navigation';
import { surfacesCustomizations } from './customizations/surfaces';
import { colorSchemes, typography, shadows, shape } from './themePrimitives';

// IMPORTA IL CONTESTO! (Assicurati che il percorso sia giusto in base alle tue cartelle)
import { useSettings } from '../context/SettingsContext';

interface AppThemeProps {
  children: React.ReactNode;
  /**
   * This is for the docs site. You can ignore it or remove it.
   */
  disableCustomTheme?: boolean;
  themeComponents?: ThemeOptions['components'];
}

export default function AppTheme(props: AppThemeProps) {
  const { children, disableCustomTheme, themeComponents } = props;

  // PRENDI LA VARIABILE DAL CONTESTO
  const { forceMobile } = useSettings();

  const theme = React.useMemo(() => {
    return disableCustomTheme
      ? {}
      : createTheme({
        // --- ECCO IL TRUCCO DEI BREAKPOINTS ---
          breakpoints: {
            values: forceMobile
              ? { xs: 0, sm: 600, md: 10000, lg: 10000, xl: 10000 } // Tutto diventa "xs" (mobile)
              : { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },    // Misure standard MUI
          },
          // --------------------------------------
          // For more details about CSS variables configuration, see https://mui.com/material-ui/customization/css-theme-variables/configuration/
          cssVariables: {
            colorSchemeSelector: 'data-mui-color-scheme',
            cssVarPrefix: 'template',
          },
          colorSchemes, // Recently added in v6 for building light & dark mode app, see https://mui.com/material-ui/customization/palette/#color-schemes
          typography,
          shadows,
          shape,
          components: {

          
          // ------ VISIONE TELEFONO

          MuiCssBaseline: {
            styleOverrides: forceMobile ? `
              body {
                background-color: #8d9498 !important; 
              }

              #root {
                width: 100%;
                max-width: 430px; 
                min-height: 100vh;
                margin: 0 auto;
                background-color: var(--template-palette-background-default, #ffffff);
                box-shadow: 0px 0px 50px rgba(0,0,0,0.5); 
                clip-path: inset(0) !important;
              }

              /* REGOLE MATEMATICHE E OTTICHE SOLO PER PC */
              @media (min-width: 431px) {
                
                #root {
                  /* Ancoriamo il telefono alle misure fisiche del monitor (vw).
                     Quando la barra di scorrimento scompare, IL TELEFONO NON SI SPOSTA DI 1 MILLIMETRO! */
                  margin-left: calc(50vw - 215px) !important;
                }

                .MuiAppBar-root {
                  /* Agganciamo la AppNavbar esattamente sopra il finto telefono */
                  max-width: 430px !important;
                  left: calc(50vw - 215px) !important;
                  right: auto !important;
                }

                /* LA MAGIA OTTICA: Una "maschera" che taglia via l'eccesso del monitor! 
                   Il menu e lo sfondo nero sono letteralmente INVISIBILI fuori dal telefono. */
                .MuiDrawer-root.MuiModal-root {
                  clip-path: inset(0 calc(50vw - 215px) 0 calc(50vw - 215px)) !important;
                }

                /* Il pannello bianco si aggancia esattamente al bordo destro del finto telefono.
                   Da qui inizierà la sua animazione! */
                .MuiDrawer-paper {
                  right: calc(50vw - 215px) !important;
                  left: auto !important;
                }
              }
            ` : ``, 
          },
            // ---------------- FINO QUA LA VISIONE TELEFONO ------------------------------------
            ...inputsCustomizations,
            ...dataDisplayCustomizations,
            ...feedbackCustomizations,
            ...navigationCustomizations,
            ...surfacesCustomizations,
            ...themeComponents,
          },
        });
  }, [disableCustomTheme, themeComponents, forceMobile]);
  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
