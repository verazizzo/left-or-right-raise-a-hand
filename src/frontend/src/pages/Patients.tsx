import React, { useState, useEffect } from 'react';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { FormControl, InputLabel, Select, MenuItem, CircularProgress, Typography } from '@mui/material';
import type {SelectChangeEvent} from '@mui/material';
import Grid from '@mui/material/Grid';

import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';


import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
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



export default function Patients(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  // Stati
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

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

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      localStorage.clear();
      navigate('/login');
      return;
    }

  }, [navigate]);

  // Gestisce il cambio utente
  const handleChange = (newUserId: string) => {
  setSelectedUser(newUserId);
  };

  // Carica il JSON
  useEffect(() => {
    if (!selectedUser) {
      setUserData(null);
      return;
    }

    const loadUserData = async () => {
      setLoading(true);
      try {
        const module = await import(`../data/${selectedUser}.json`);
        setUserData(module.default || module);
      } catch (error) {
        console.error("Errore durante il caricamento del file JSON:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [selectedUser]);


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
          <Stack
            spacing={3}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 1, md: 0 },
            }}
          >
            <Header />

            <Box sx={{ mt: 4, mb: 2, width: '100%', textAlign: 'left' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {t.titoloPaziente}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t.titoloPazienteDesc}   
              </Typography>
            </Box>

            {/* SEZIONE 1: MENU A TENDINA CON RICERCA (AUTOCOMPLETE) */}
            <Autocomplete
              sx={{ 
                minWidth: 300, 
                mt: 4,
                // Questa è la regola definitiva che dice: "Qualsiasi bottone (freccia o X) 
                // dentro la parte destra di questo Autocomplete NON deve avere bordi o sfondi"
                '& .MuiAutocomplete-endAdornment .MuiIconButton-root': {
                  border: 'none !important',
                  backgroundColor: 'transparent !important',
                  boxShadow: 'none !important',
                }
              }}
              options={usersList}
              getOptionLabel={(option) => option.name}
              value={usersList.find((user) => user.id === selectedUser) || null}
              
              // Ho tolto "disableClearable" così ti riappare la X per cancellare la selezione
              
              onChange={(_event, newValue) => {
                handleChange(newValue ? newValue.id : ''); 
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder={t.selectUser} 
                  variant="outlined" 
                />
              )}

              // 1. Disattiviamo i noiosi tooltip nativi del browser
              clearText=""
              openText=""
              closeText=""
              
              // 2. Avvolgiamo le icone nei nostri Tooltip di Material UI
              clearIcon={
                <Tooltip title={t.cancellaSelezione} arrow placement="top">
                  <CloseIcon fontSize="small" />
                </Tooltip>
              }
              popupIcon={
                <Tooltip title={t.apriElenco} arrow placement="top">
                  <ArrowDropDownIcon />
                </Tooltip>
              }

            />


            {/* SEZIONE 2: LOADER O MESSAGGIO VUOTO */}
            {loading && <CircularProgress sx={{ mt: 4 }} />}

            {!loading && !userData && !selectedUser && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 4 }}>
                {t.selectUserPlaceholder}
              </Typography>
            )}

            {/* SEZIONE 3: GRAFICI (Mostrati solo se i dati ci sono) */}
            {!loading && userData && (
                <Metrics userData={userData} />
            )}

          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}