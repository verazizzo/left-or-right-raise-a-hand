import React, { useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { FormControl, InputLabel, Select, MenuItem, CircularProgress, Typography, Divider } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import Grid from '@mui/material/Grid';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import MetricsUser from '../components/MetricsUser'; // Usiamo il componente generico creato prima

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



export default function Comparison(props: { disableCustomTheme?: boolean }) {
    const { language } = useSettings();
    const t = translations[language];

    // Generiamo una lista di 30 utenti
    // Usiamo useMemo per calcolare la lista solo quando cambia t.utenteElenco
    const usersList = React.useMemo(() => {
      return Array.from({ length: 30 }, (_, i) => ({
        id: `user_${i + 1}`,
        name: `${t.utenteElenco} ${i + 1}`,
      }));
    }, [t.utenteElenco]);


  // --- STATI PER UTENTE A (SINISTRA) ---
  const [userAId, setUserAId] = useState<string>('');
  const [userAData, setUserAData] = useState<any>(null);
  const [loadingA, setLoadingA] = useState<boolean>(false);

  // --- STATI PER UTENTE B (DESTRA) ---
  const [userBId, setUserBId] = useState<string>('');
  const [userBData, setUserBData] = useState<any>(null);
  const [loadingB, setLoadingB] = useState<boolean>(false);

  // Caricamento dati Utente A
  useEffect(() => {
    if (!userAId) {
      setUserAData(null); // <--- QUESTA È LA RIGA MAGICA CHE SVUOTA I GRAFICI A!
      return;
    }
    const load = async () => {
      setLoadingA(true);
      try {
        const module = await import(`../data/${userAId}.json`);
        setUserAData(module.default || module);
      } catch (e) { console.error(e); }
      finally { setLoadingA(false); }
    };
    load();
  }, [userAId]);

  // Caricamento dati Utente B
  useEffect(() => {
    if (!userBId) {
      setUserBData(null); // <--- QUESTA È LA RIGA MAGICA CHE SVUOTA I GRAFICI B!
      return;
    }
    const load = async () => {
      setLoadingB(true);
      try {
        const module = await import(`../data/${userBId}.json`);
        setUserBData(module.default || module);
      } catch (e) { console.error(e); }
      finally { setLoadingB(false); }
    };
    load();
  }, [userBId]);

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
          })}
        >
          <Stack spacing={3} sx={{ mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
            <Header />

            <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 2 }}>
              {t.confrontoTitle}
            </Typography>

            {/* SEZIONE SELEZIONE: Due menu a tendina affiancati */}
            <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
              {/* AUTOCOMPLETE PAZIENTE A */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Autocomplete
                sx={{ 
                  minWidth: 300, 
                  mt: 4,
                  '& .MuiAutocomplete-endAdornment .MuiIconButton-root': {
                    border: 'none !important',
                    backgroundColor: 'transparent !important',
                    boxShadow: 'none !important',
                  }
                }}
                options={usersList}
                getOptionLabel={(option) => option.name}
                // Corretto: Usa userAId
                value={usersList.find((user) => user.id === userAId) || null} 
                onChange={(_event, newValue) => {
                  setUserAId(newValue ? newValue.id : ''); // Corretto: Imposta l'Id di A
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    placeholder={`${t.selectUser} A`} // Aggiunta "A" per distinguerli
                    variant="outlined" 
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* AUTOCOMPLETE PAZIENTE B */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Autocomplete
                sx={{ 
                  minWidth: 300, 
                  mt: 4,
                  '& .MuiAutocomplete-endAdornment .MuiIconButton-root': {
                    border: 'none !important',
                    backgroundColor: 'transparent !important',
                    boxShadow: 'none !important',
                  }
                }}
                options={usersList}
                getOptionLabel={(option) => option.name}
                // Corretto: Usa userBId
                value={usersList.find((user) => user.id === userBId) || null}
                onChange={(_event, newValue) => {
                  setUserBId(newValue ? newValue.id : ''); // Corretto: Imposta l'Id di B
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    placeholder={`${t.selectUser} B`} // Aggiunta "B" per distinguerli
                    variant="outlined" 
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

            {/* SEZIONE RISULTATI: Due colonne con i grafici */}
            <Grid container spacing={4}>
              
              {/* COLONNA SINISTRA: PAZIENTE A */}
              <Grid size={{ xs: 12, lg: 6 }} sx={{ borderRight: { lg: '1px solid #ddd' }, pr: { lg: 4 } }}>
                {loadingA && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                  </Box>
                )}
                {!loadingA && userAData ? (
                  <MetricsUser userData={userAData} stacked={true} />
                ) : (
                  !loadingA && <Typography color="text.secondary" align="center">{t.confrontoSubtitleA}</Typography>
                )}
              </Grid>

              {/* COLONNA DESTRA: PAZIENTE B */}
              <Grid size={{ xs: 12, lg: 6 }} sx={{ pl: { lg: 4 } }}>
                {loadingB && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                  </Box>
                )}
                {!loadingB && userBData ? (
                  <MetricsUser userData={userBData} stacked={true} />
                ) : (
                  !loadingB && <Typography color="text.secondary" align="center">{t.confrontoSubtitleB}</Typography>
                )}
              </Grid>

            </Grid>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}