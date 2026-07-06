import React, { useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { CircularProgress, Typography, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';

// Importiamo SOLO il nuovo componente unificato!
import Metrics from '../components/Metrics'; 

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../theme/customizations';
import { useNavigate } from 'react-router-dom';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Comparison(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const { language } = useSettings();
  const t = translations[language];

  const [dropdownOpenA, setDropdownOpenA] = React.useState(false);
  const [dropdownOpenB, setDropdownOpenB] = React.useState(false);

  // Generiamo la lista degli utenti
  const usersList = React.useMemo(() => {
    // 1. Creiamo i 30 pazienti standard
    const list = Array.from({ length: 30 }, (_, i) => ({
      id: `user_${i + 1}`,
      name: `${t.utenteElenco} ${i + 1}`,
    }));

    // 2. AGGIUNGIAMO L'UTENTE GLOBALE CON L'ID IDENTICO AL NOME DEL FILE
    list.unshift({
      id: 'shap_GLOBALE', // <--- CORRETTO: Ora combacia esattamente con shap_GLOBALE.json!
      name: t.menuPopulation || 'Popolazione Globale', 
    });

    return list;
  }, [t.utenteElenco, t.menuPopulation]);


  // --- STATI PER UTENTE A (SINISTRA) ---
  const [userAId, setUserAId] = useState<string>('');
  const [userAData, setUserAData] = useState<any>(null);
  const [loadingA, setLoadingA] = useState<boolean>(false);

  // --- STATI PER UTENTE B (DESTRA) ---
  const [userBId, setUserBId] = useState<string>('');
  const [userBData, setUserBData] = useState<any>(null);
  const [loadingB, setLoadingB] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      localStorage.clear();
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Caricamento dati Utente A
  useEffect(() => {
    if (!userAId) {
      setUserAData(null); 
      return;
    }
    const load = async () => {
      setLoadingA(true);
      try {
        const module = await import(`../data/${userAId}.json`);
        const data = module.default || module;
        
        // Se stiamo caricando il globale, iniettiamo la proprietà per far attivare la logica globale a Metrics.tsx
        if (userAId === 'shap_GLOBALE') {
          data.user_id = 'global';
        }
        
        setUserAData(data);
      } catch (e) { 
        console.error("Errore nel caricamento del file JSON per A:", e); 
      }
      finally { setLoadingA(false); }
    };
    load();
  }, [userAId]);

  // Caricamento dati Utente B
  useEffect(() => {
    if (!userBId) {
      setUserBData(null); 
      return;
    }
    const load = async () => {
      setLoadingB(true);
      try {
        const module = await import(`../data/${userBId}.json`);
        const data = module.default || module;
        
        // Se stiamo caricando il globale, iniettiamo la proprietà per far attivare la logica globale a Metrics.tsx
        if (userBId === 'shap_GLOBALE') {
          data.user_id = 'global';
        }
        
        setUserBData(data);
      } catch (e) { 
        console.error("Errore nel caricamento del file JSON per B:", e); 
      }
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
          <Stack spacing={3} sx={{ mx: 3, pb: 5, mt: { xs: 1, md: 0 } }}>
            <Header />

            <Box sx={{ mt: 4, mb: 2, width: '100%', textAlign: 'left' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {t.confrontoTitle}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t.confrontoTitleDesc}   
              </Typography>
            </Box>

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
                  value={usersList.find((user) => user.id === userAId) || null} 
                  
                  open={dropdownOpenA}
                  onOpen={() => setDropdownOpenA(true)}
                  onClose={() => setDropdownOpenA(false)}
                  
                  onChange={(_event, newValue) => {
                    setUserAId(newValue ? newValue.id : ''); 
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      placeholder={`${t.selectUser} A`} 
                      variant="outlined" 
                      fullWidth
                    />
                  )}
                  clearText=""
                  openText=""
                  closeText=""
                  
                  clearIcon={
                    <Tooltip title={t.cancellaSelezione || "Cancella"} arrow placement="top">
                      <CloseIcon fontSize="small" />
                    </Tooltip>
                  }
                  popupIcon={
                    <Tooltip 
                      key={dropdownOpenA ? "chiudi" : "apri"} 
                      title={dropdownOpenA ? t.chiudiElenco : t.apriElenco} 
                      arrow 
                      placement="top"
                    >
                      <ArrowDropDownIcon />
                    </Tooltip>
                  }
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
                  value={usersList.find((user) => user.id === userBId) || null}
                  
                  open={dropdownOpenB}
                  onOpen={() => setDropdownOpenB(true)}
                  onClose={() => setDropdownOpenB(false)}
                  
                  onChange={(_event, newValue) => {
                    setUserBId(newValue ? newValue.id : ''); 
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      placeholder={`${t.selectUser} B`} 
                      variant="outlined" 
                      fullWidth
                    />
                  )}
                  clearText=""
                  openText=""
                  closeText=""
                  
                  clearIcon={
                    <Tooltip title={t.cancellaSelezione || "Cancella"} arrow placement="top">
                      <CloseIcon fontSize="small" />
                    </Tooltip>
                  }
                  popupIcon={
                    <Tooltip 
                      key={dropdownOpenB ? "chiudi" : "apri"} 
                      title={dropdownOpenB ? t.chiudiElenco : t.apriElenco} 
                      arrow 
                      placement="top"
                    >
                      <ArrowDropDownIcon />
                    </Tooltip>
                  }
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
                  <Metrics userData={userAData} stacked={true} />
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
                  <Metrics userData={userBData} stacked={true} />
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