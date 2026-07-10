import React from 'react';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';

import Metrics from '../components/Metrics';

import shapGlobale from '../data/shap_GLOBALE.json';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function GlobalAnalysis(props: { disableCustomTheme?: boolean }) {
  const { language } = useSettings();
  const t = translations[language];

  // Prepariamo l'oggetto per il componente Metrics.
  // Uniamo i dati del JSON e inseriamo a mano 'user_id: "global"' 
  const globalData = {
    ...shapGlobale,
    user_id: 'global'
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            minHeight: '100vh',
          })}
        >
          <Stack spacing={3} sx={{ mx: 3, pb: 5, mt: { xs: 1, md: 0 } }}>
            <Header />

            <Box sx={{ mt: 4, mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {t.titoloPopo}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t.titoloPopoDesc}   
              </Typography>
            </Box>

            {/* Invochiamo Metrics passandogli i dati globali. */}
            <Metrics userData={globalData} />

          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}