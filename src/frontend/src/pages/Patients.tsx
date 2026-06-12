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


import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import UserMetrics from '../components/MetricsUser';

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



export default function Patients(props: { disableCustomTheme?: boolean }) {
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

  // Gestisce il cambio utente
  const handleChange = (event: SelectChangeEvent) => {
    setSelectedUser(event.target.value as string);
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

  // Ordina i dati per importanza SHAP
  const getSortedData = (dataArray: any[]) => {
    return [...dataArray].sort((a, b) => b.shap_absolute - a.shap_absolute);
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
          })}
        >
          <Stack
            spacing={3}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />

            {/* SEZIONE 1: MENU A TENDINA */}
            <FormControl sx={{ minWidth: 300, mt: 4 }}>
              <Select
                labelId="user-select-label"
                id="user-select"
                value={selectedUser}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="" disabled sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  {t.selectUser}
                </MenuItem>
                {usersList.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* SEZIONE 2: LOADER O MESSAGGIO VUOTO */}
            {loading && <CircularProgress sx={{ mt: 4 }} />}

            {!loading && !userData && !selectedUser && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 4 }}>
                {t.selectUserPlaceholder}
              </Typography>
            )}

            {/* SEZIONE 3: GRAFICI (Mostrati solo se i dati ci sono) */}
            {!loading && userData && (
                <UserMetrics userData={userData} />
            )}

          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}